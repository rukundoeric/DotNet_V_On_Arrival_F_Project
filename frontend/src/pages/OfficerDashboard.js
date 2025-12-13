import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://visaonarrival-c6fec5dtfwb2hwcc.southafricanorth-01.azurewebsites.net/api';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [stats, setStats] = useState({
    pendingApplications: 0,
    approvedToday: 0,
    arrivalsToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const statsRes = await axios.get(`${API_URL}/Reports/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = statsRes.data;
      setStats({
        pendingApplications: data.pendingApplications || 0,
        approvedToday: data.applicationsToday || 0,
        arrivalsToday: data.arrivalsThisMonth || 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <nav className="dashboard-nav">
        <div className="dashboard-nav-content">
          <div className="dashboard-logo">
            <h1>Rwanda Visa Portal</h1>
            <span>Officer Dashboard</span>
          </div>
          <div className="dashboard-user-info">
            <div className="user-profile">
              <div className="user-avatar">{getUserInitials()}</div>
              <div className="user-details">
                <div className="user-name">{user?.firstName} {user?.lastName}</div>
                <div className="user-role">{user?.role}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h2>Welcome back, {user?.firstName}!</h2>
          <p>Manage visa applications and track arrivals & exits</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            <p>Loading statistics...</p>
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <div>
                  <div className="stat-label">Pending Applications</div>
                  <h3 className="stat-value">{stats.pendingApplications}</h3>
                </div>
                <div className="stat-icon">📋</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <div>
                  <div className="stat-label">Approved Today</div>
                  <h3 className="stat-value">{stats.approvedToday}</h3>
                </div>
                <div className="stat-icon">✅</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <div>
                  <div className="stat-label">Arrivals This Month</div>
                  <h3 className="stat-value">{stats.arrivalsToday}</h3>
                </div>
                <div className="stat-icon">✈️</div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Cards */}
        <div className="features-grid">
          <div className="feature-card" onClick={() => navigate('/officer/applications')}>
            <div className="feature-icon">✅</div>
            <h3>Manage Applications</h3>
            <p>Review, approve, or reject visa on arrival applications. Search and filter applications by status, date, or reference number.</p>
          </div>

          <div className="feature-card" onClick={() => navigate('/officer/arrivals-exits')}>
            <div className="feature-icon">✈️</div>
            <h3>Arrivals & Exits</h3>
            <p>Process arrival records for travelers entering Rwanda and manage departure records for those leaving the country.</p>
          </div>

          <div className="feature-card" onClick={() => navigate('/officer/reports')}>
            <div className="feature-icon">📊</div>
            <h3>View Reports</h3>
            <p>Access comprehensive analytics and reports on visa applications, user activity, and system performance metrics.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OfficerDashboard;
