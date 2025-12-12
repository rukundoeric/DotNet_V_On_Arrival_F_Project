import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container" style={{ marginTop: '50px' }}>
      <div className="form-card">
        <div className="form-header">
          <h3>Officer Dashboard</h3>
          <p>Welcome, {user?.firstName} {user?.lastName}!</p>
        </div>
        <div className="form-body">
          <div className="info-card">
            <h5>Your Information</h5>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Permissions:</strong> {user?.permissions?.length || 0} permissions</p>
          </div>

          <div className="benefits-section" style={{ marginTop: '30px' }}>
            <h5>Officer Features</h5>
            <div className="benefit-item" onClick={() => navigate('/officer/applications')} style={{ cursor: 'pointer' }}>
              <span className="benefit-icon">✅</span>
              <div>
                <strong>Manage Applications</strong><br />
                <small>Approve or reject visa applications</small>
              </div>
            </div>
            <div className="benefit-item" onClick={() => navigate('/officer/arrivals-exits')} style={{ cursor: 'pointer' }}>
              <span className="benefit-icon">✈️</span>
              <div>
                <strong>Arrivals & Exits</strong><br />
                <small>Process arrival and departure records</small>
              </div>
            </div>
            <div className="benefit-item" onClick={() => navigate('/officer/applications')} style={{ cursor: 'pointer' }}>
              <span className="benefit-icon">🔍</span>
              <div>
                <strong>Search Applications</strong><br />
                <small>Find applications by reference number</small>
              </div>
            </div>
          </div>

          <button className="btn-rwanda" onClick={handleLogout} style={{ marginTop: '30px' }}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
