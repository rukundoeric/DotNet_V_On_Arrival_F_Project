import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import VisaApplicationForm from '../components/VisaApplicationForm';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5262/api';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
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
    navigate('/login');
  };

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold'
    };

    switch (status?.toLowerCase()) {
      case 'pending':
        return { ...baseStyle, backgroundColor: '#fbbf24', color: '#000' };
      case 'approved':
        return { ...baseStyle, backgroundColor: '#10b981', color: '#fff' };
      case 'rejected':
        return { ...baseStyle, backgroundColor: '#ef4444', color: '#fff' };
      default:
        return { ...baseStyle, backgroundColor: '#6b7280', color: '#fff' };
    }
  };

  const renderDashboard = () => (
    <div className="form-body">
      <div className="info-card">
        <h5>Your Information</h5>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Account Type:</strong> Standard User</p>
      </div>

      <div className="benefits-section" style={{ marginTop: '30px' }}>
        <h5>Quick Actions</h5>
        <div className="benefit-item" onClick={() => setActiveView('applications')} style={{ cursor: 'pointer' }}>
          <span className="benefit-icon">📝</span>
          <div>
            <strong>My Applications</strong><br />
            <small>View all your visa applications</small>
          </div>
        </div>
        <div className="benefit-item" onClick={() => setActiveView('new')} style={{ cursor: 'pointer' }}>
          <span className="benefit-icon">➕</span>
          <div>
            <strong>New Application</strong><br />
            <small>Submit a new visa application</small>
          </div>
        </div>
      </div>

      <button className="btn-rwanda" onClick={handleLogout} style={{ marginTop: '30px' }}>
        Logout
      </button>
    </div>
  );

  const renderMyApplications = () => (
    <div className="form-body">
      <button
        className="btn-rwanda"
        onClick={() => setActiveView('dashboard')}
        style={{ marginBottom: '20px', backgroundColor: '#6b7280' }}
      >
        ← Back to Dashboard
      </button>

      {error && <div className="error-alert">{error}</div>}

      {loading ? (
        <p>Loading applications...</p>
      ) : applications.length === 0 ? (
        <div className="info-card">
          <p>You haven't submitted any applications yet.</p>
          <button className="btn-rwanda" onClick={() => setActiveView('new')} style={{ marginTop: '10px' }}>
            Submit Your First Application
          </button>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Reference</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Passport</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Arrival Date</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{app.referenceNumber}</td>
                <td style={{ padding: '12px' }}>{app.firstName} {app.lastName}</td>
                <td style={{ padding: '12px' }}>{app.passportNumber}</td>
                <td style={{ padding: '12px' }}>
                  {new Date(app.arrivalDate).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={getStatusBadgeStyle(app.applicationStatus)}>
                    {app.applicationStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderNewApplication = () => (
    <div className="form-body">
      <button
        className="btn-rwanda"
        onClick={() => setActiveView('dashboard')}
        style={{ marginBottom: '20px', backgroundColor: '#6b7280' }}
      >
        ← Back to Dashboard
      </button>
      <VisaApplicationForm />
    </div>
  );

  return (
    <div className="container" style={{ marginTop: '50px' }}>
      <div className="form-card">
        <div className="form-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>
                {activeView === 'dashboard' && 'My Dashboard'}
                {activeView === 'applications' && 'My Applications'}
                {activeView === 'new' && 'New Application'}
              </h3>
              {activeView === 'dashboard' && <p>Welcome, {user?.firstName} {user?.lastName}!</p>}
            </div>
            {activeView !== 'dashboard' && (
              <button className="btn-rwanda" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </div>

        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'applications' && renderMyApplications()}
        {activeView === 'new' && renderNewApplication()}
      </div>
    </div>
  );
};

export default UserDashboard;
