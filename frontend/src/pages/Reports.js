import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://visaonarrival-c6fec5dtfwb2hwcc.southafricanorth-01.azurewebsites.net/api';

const Reports = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();

  const [dashboardStats, setDashboardStats] = useState(null);
  const [nationalityStats, setNationalityStats] = useState([]);
  const [purposeStats, setPurposeStats] = useState([]);
  const [processingTime, setProcessingTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsRes, nationalityRes, purposeRes, timeRes] = await Promise.all([
        axios.get(`${API_URL}/Reports/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/Reports/applications-by-nationality?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/Reports/applications-by-purpose`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/Reports/average-processing-time`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setDashboardStats(statsRes.data);
      setNationalityStats(nationalityRes.data);
      setPurposeStats(purposeRes.data.slice(0, 5));
      setProcessingTime(timeRes.data);
    } catch (err) {
      setError('Failed to load reports data');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleExportApplications = async () => {
    try {
      const response = await axios.get(`${API_URL}/Reports/export/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Convert to CSV
      const data = response.data;
      if (data.length === 0) {
        alert('No data to export');
        return;
      }

      const csv = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `visa-applications-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting:', err);
      alert('Failed to export data');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <nav className="dashboard-nav">
        <div className="dashboard-nav-content">
          <div className="dashboard-logo">
            <h1>Rwanda Visa Portal</h1>
            <span>Reports & Analytics</span>
          </div>
          <div className="dashboard-user-info">
            <div className="user-profile">
              <div className="user-avatar">{getUserInitials()}</div>
              <div className="user-details">
                <div className="user-name">{user?.firstName} {user?.lastName}</div>
                <div className="user-role">{user?.role}</div>
              </div>
            </div>
            <button onClick={() => navigate(user?.role === 'Admin' ? '/admin/dashboard' : '/officer/dashboard')} className="logout-btn" style={{ marginRight: '10px' }}>
              ← Dashboard
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h2>Reports & Analytics</h2>
          <p>Comprehensive system statistics and insights</p>
        </div>

        {error && (
          <div className="error-alert" style={{ marginBottom: '20px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            <p>Loading reports data...</p>
          </div>
        ) : (
          <>
            {/* Export Button */}
            <div style={{ marginBottom: '25px', textAlign: 'right' }}>
              <button
                onClick={handleExportApplications}
                className="btn-rwanda"
                style={{ width: 'auto', marginTop: 0, backgroundColor: '#10b981' }}
              >
                📥 Export Applications to CSV
              </button>
            </div>

            {/* Overview Stats */}
            {dashboardStats && (
              <>
                <h3 style={{ color: '#004892', fontSize: '1.3rem', marginBottom: '15px', fontWeight: '700' }}>📊 Overview</h3>
                <div className="stats-grid" style={{ marginBottom: '30px' }}>
                  <div className="stat-card">
                    <div className="stat-card-header">
                      <div>
                        <div className="stat-label">Total Applications</div>
                        <h3 className="stat-value">{dashboardStats.totalApplications}</h3>
                      </div>
                      <div className="stat-icon">📋</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-header">
                      <div>
                        <div className="stat-label">Pending</div>
                        <h3 className="stat-value">{dashboardStats.pendingApplications}</h3>
                      </div>
                      <div className="stat-icon">⏳</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-header">
                      <div>
                        <div className="stat-label">Approved</div>
                        <h3 className="stat-value">{dashboardStats.approvedApplications}</h3>
                      </div>
                      <div className="stat-icon">✅</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-header">
                      <div>
                        <div className="stat-label">Rejected</div>
                        <h3 className="stat-value">{dashboardStats.rejectedApplications}</h3>
                      </div>
                      <div className="stat-icon">❌</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-header">
                      <div>
                        <div className="stat-label">Total Arrivals</div>
                        <h3 className="stat-value">{dashboardStats.totalArrivals}</h3>
                      </div>
                      <div className="stat-icon">✈️</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-header">
                      <div>
                        <div className="stat-label">Currently in Country</div>
                        <h3 className="stat-value">{dashboardStats.currentlyInCountry}</h3>
                      </div>
                      <div className="stat-icon">🌍</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-header">
                      <div>
                        <div className="stat-label">Total Users</div>
                        <h3 className="stat-value">{dashboardStats.totalUsers}</h3>
                      </div>
                      <div className="stat-icon">👥</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-header">
                      <div>
                        <div className="stat-label">Active Countries</div>
                        <h3 className="stat-value">{dashboardStats.totalCountries}</h3>
                      </div>
                      <div className="stat-icon">🗺️</div>
                    </div>
                  </div>
                </div>

                {/* Time-based Stats */}
                <h3 style={{ color: '#004892', fontSize: '1.3rem', marginBottom: '15px', fontWeight: '700' }}>📅 Time-Based Statistics</h3>
                <div className="stats-grid" style={{ marginBottom: '30px' }}>
                  <div className="stat-card">
                    <div className="stat-card-header">
                      <div>
                        <div className="stat-label">Applications Today</div>
                        <h3 className="stat-value">{dashboardStats.applicationsToday}</h3>
                      </div>
                      <div className="stat-icon">📆</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-header">
                      <div>
                        <div className="stat-label">Applications This Month</div>
                        <h3 className="stat-value">{dashboardStats.applicationsThisMonth}</h3>
                      </div>
                      <div className="stat-icon">📅</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-header">
                      <div>
                        <div className="stat-label">Applications This Year</div>
                        <h3 className="stat-value">{dashboardStats.applicationsThisYear}</h3>
                      </div>
                      <div className="stat-icon">🗓️</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-card-header">
                      <div>
                        <div className="stat-label">Arrivals This Month</div>
                        <h3 className="stat-value">{dashboardStats.arrivalsThisMonth}</h3>
                      </div>
                      <div className="stat-icon">✈️</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Processing Time */}
            {processingTime && (
              <>
                <h3 style={{ color: '#004892', fontSize: '1.3rem', marginBottom: '15px', fontWeight: '700' }}>⏱️ Processing Performance</h3>
                <div style={{
                  background: 'white',
                  padding: '25px',
                  borderRadius: '12px',
                  marginBottom: '30px',
                  boxShadow: '0 2px 10px rgba(0, 72, 146, 0.08)',
                  border: '1px solid #CFE3F7'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '5px' }}>Average Processing Time</div>
                      <div style={{ fontSize: '2rem', fontWeight: '700', color: '#004892' }}>
                        {processingTime.averageDays.toFixed(1)} days
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '3px' }}>
                        ({processingTime.averageHours.toFixed(1)} hours)
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '5px' }}>Total Processed</div>
                      <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
                        {processingTime.totalProcessed}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '3px' }}>applications</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Top Nationalities */}
            {nationalityStats.length > 0 && (
              <>
                <h3 style={{ color: '#004892', fontSize: '1.3rem', marginBottom: '15px', fontWeight: '700' }}>🌍 Top Nationalities</h3>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0, 72, 146, 0.08)',
                  border: '1px solid #CFE3F7',
                  overflow: 'hidden',
                  marginBottom: '30px'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #CFE3F7' }}>
                        <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700' }}>Nationality</th>
                        <th style={{ padding: '15px', textAlign: 'center', color: '#004892', fontWeight: '700' }}>Total</th>
                        <th style={{ padding: '15px', textAlign: 'center', color: '#004892', fontWeight: '700' }}>Pending</th>
                        <th style={{ padding: '15px', textAlign: 'center', color: '#004892', fontWeight: '700' }}>Approved</th>
                        <th style={{ padding: '15px', textAlign: 'center', color: '#004892', fontWeight: '700' }}>Rejected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nationalityStats.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '15px', fontWeight: '600' }}>{item.nationality}</td>
                          <td style={{ padding: '15px', textAlign: 'center', fontWeight: '700', color: '#004892' }}>{item.count}</td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>{item.pending}</td>
                          <td style={{ padding: '15px', textAlign: 'center', color: '#10b981' }}>{item.approved}</td>
                          <td style={{ padding: '15px', textAlign: 'center', color: '#ef4444' }}>{item.rejected}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Purpose of Visit */}
            {purposeStats.length > 0 && (
              <>
                <h3 style={{ color: '#004892', fontSize: '1.3rem', marginBottom: '15px', fontWeight: '700' }}>🎯 Top Purposes of Visit</h3>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0, 72, 146, 0.08)',
                  border: '1px solid #CFE3F7',
                  overflow: 'hidden',
                  marginBottom: '30px'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #CFE3F7' }}>
                        <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700' }}>Purpose</th>
                        <th style={{ padding: '15px', textAlign: 'center', color: '#004892', fontWeight: '700' }}>Count</th>
                        <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700' }}>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purposeStats.map((item, index) => {
                        const total = purposeStats.reduce((sum, p) => sum + p.count, 0);
                        const percentage = ((item.count / total) * 100).toFixed(1);
                        return (
                          <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '15px', fontWeight: '600' }}>{item.purpose}</td>
                            <td style={{ padding: '15px', textAlign: 'center', fontWeight: '700', color: '#004892' }}>{item.count}</td>
                            <td style={{ padding: '15px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  flex: 1,
                                  height: '8px',
                                  backgroundColor: '#e5e7eb',
                                  borderRadius: '4px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    width: `${percentage}%`,
                                    height: '100%',
                                    backgroundColor: '#004892',
                                    borderRadius: '4px'
                                  }} />
                                </div>
                                <span style={{ fontWeight: '600', minWidth: '50px' }}>{percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;
