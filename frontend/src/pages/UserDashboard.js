import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import VisaApplicationForm from '../components/VisaApplicationForm';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://visaonarrival-c6fec5dtfwb2hwcc.southafricanorth-01.azurewebsites.net/api';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [activeView, setActiveView] = useState('home');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMyApplications = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/VisaApplications/my-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data || []);
    } catch (err) {
      setError('Failed to load applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeView === 'applications') {
      fetchMyApplications();
    }
  }, [activeView, fetchMyApplications]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: '6px 14px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600'
    };

    switch (status?.toLowerCase()) {
      case 'pending':
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fbbf24' };
      case 'approved':
        return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #10b981' };
      case 'rejected':
        return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #ef4444' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #9ca3af' };
    }
  };

  // Render Home View (Submit New Application)
  const renderHome = () => (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="dashboard-nav-content">
          <div className="dashboard-logo">
            <h1>Rwanda Visa Portal</h1>
            <span>Apply for Visa on Arrival</span>
          </div>
          <div className="dashboard-user-info">
            <div className="user-profile">
              <div className="user-avatar">{getUserInitials()}</div>
              <div className="user-details">
                <div className="user-name">{user?.firstName} {user?.lastName}</div>
                <div className="user-role">{user?.email}</div>
              </div>
            </div>
            <button onClick={() => setActiveView('applications')} className="logout-btn" style={{ marginRight: '10px' }}>
              My Applications
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h2>Welcome to Rwanda</h2>
          <p>Land of a Thousand Hills - Apply for your Visa on Arrival</p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 2px 10px rgba(0, 72, 146, 0.08)',
          border: '1px solid #CFE3F7'
        }}>
          <VisaApplicationForm />
        </div>
      </main>
    </div>
  );

  // Render My Applications View
  const renderMyApplications = () => (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="dashboard-nav-content">
          <div className="dashboard-logo">
            <h1>Rwanda Visa Portal</h1>
            <span>My Applications</span>
          </div>
          <div className="dashboard-user-info">
            <div className="user-profile">
              <div className="user-avatar">{getUserInitials()}</div>
              <div className="user-details">
                <div className="user-name">{user?.firstName} {user?.lastName}</div>
                <div className="user-role">{user?.email}</div>
              </div>
            </div>
            <button onClick={() => setActiveView('home')} className="logout-btn" style={{ marginRight: '10px' }}>
              ← New Application
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h2>My Applications</h2>
          <p>Track your visa application status</p>
        </div>

        {error && (
          <div className="error-alert" style={{ marginBottom: '20px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            <p>Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0, 72, 146, 0.08)',
            border: '1px solid #CFE3F7'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📋</div>
            <h3 style={{ color: '#004892', marginBottom: '10px' }}>No Applications Found</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>You haven't submitted any visa applications yet.</p>
            <button className="btn-rwanda" onClick={() => setActiveView('home')} style={{ width: 'auto', marginTop: 0 }}>
              Submit Your First Application
            </button>
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0, 72, 146, 0.08)',
            border: '1px solid #CFE3F7',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 25px',
              borderBottom: '2px solid #CFE3F7',
              backgroundColor: '#f8f9fa'
            }}>
              <h3 style={{ color: '#004892', margin: 0, fontSize: '1.3rem' }}>Application History</h3>
              <p style={{ color: '#6b7280', margin: '5px 0 0 0', fontSize: '0.95rem' }}>
                Total Applications: <strong>{applications.length}</strong>
              </p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #CFE3F7' }}>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700' }}>Reference</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700' }}>Name</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700' }}>Passport</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700' }}>Arrival Date</th>
                    <th style={{ padding: '15px', textAlign: 'center', color: '#004892', fontWeight: '700' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '15px', fontWeight: '600', color: '#004892' }}>{app.referenceNumber}</td>
                      <td style={{ padding: '15px' }}>{app.firstName} {app.lastName}</td>
                      <td style={{ padding: '15px', fontFamily: 'monospace' }}>{app.passportNumber}</td>
                      <td style={{ padding: '15px' }}>
                        {new Date(app.arrivalDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <span style={getStatusBadgeStyle(app.applicationStatus)}>
                          {app.applicationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );

  return (
    <>
      {activeView === 'home' && renderHome()}
      {activeView === 'applications' && renderMyApplications()}
    </>
  );
};

export default UserDashboard;
