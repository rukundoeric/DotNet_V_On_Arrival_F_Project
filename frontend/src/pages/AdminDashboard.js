import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
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
          <h3>Admin Dashboard</h3>
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
            <h5>Admin Features</h5>
            <div className="benefit-item" onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
              <span className="benefit-icon">👥</span>
              <div>
                <strong>Manage Users</strong><br />
                <small>Create, update, and delete users and officers</small>
              </div>
            </div>
            <div className="benefit-item" style={{ opacity: 0.5 }}>
              <span className="benefit-icon">🔐</span>
              <div>
                <strong>Manage Permissions</strong><br />
                <small>Grant and revoke permissions to users (Coming Soon)</small>
              </div>
            </div>
            <div className="benefit-item" onClick={() => navigate('/admin/countries')} style={{ cursor: 'pointer' }}>
              <span className="benefit-icon">🌍</span>
              <div>
                <strong>Manage Countries</strong><br />
                <small>Configure allowed countries for visa on arrival</small>
              </div>
            </div>
            <div className="benefit-item" style={{ opacity: 0.5 }}>
              <span className="benefit-icon">📊</span>
              <div>
                <strong>View Reports</strong><br />
                <small>Access system analytics and reports (Coming Soon)</small>
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

export default AdminDashboard;
