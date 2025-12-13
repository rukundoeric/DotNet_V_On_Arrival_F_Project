import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://visaonarrival-c6fec5dtfwb2hwcc.southafricanorth-01.azurewebsites.net/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeOfficers: 0,
    allowedCountries: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, countriesRes] = await Promise.all([
        axios.get(`${API_URL}/Users?pageSize=1000`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/Countries?pageSize=1000`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Users API returns array directly, Countries API returns { data: [], totalCount: N }
      const users = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data.data || []);
      const officers = users.filter(u => u.role === 'Officer');
      const countries = countriesRes.data.data || [];

      setStats({
        totalUsers: users.length,
        activeOfficers: officers.length,
        allowedCountries: countries.filter(c => c.isActive).length
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      console.error('Error details:', err.response?.data);
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
            <span>Admin Dashboard</span>
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
          <p>System administration and user management</p>
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
                  <div className="stat-label">Total Users</div>
                  <h3 className="stat-value">{stats.totalUsers}</h3>
                </div>
                <div className="stat-icon">👥</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <div>
                  <div className="stat-label">Active Officers</div>
                  <h3 className="stat-value">{stats.activeOfficers}</h3>
                </div>
                <div className="stat-icon">👮</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <div>
                  <div className="stat-label">Allowed Countries</div>
                  <h3 className="stat-value">{stats.allowedCountries}</h3>
                </div>
                <div className="stat-icon">🌍</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <div>
                  <div className="stat-label">System Health</div>
                  <h3 className="stat-value">✓</h3>
                </div>
                <div className="stat-icon">💚</div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Cards */}
        <div className="features-grid">
          <div className="feature-card" onClick={() => navigate('/officer/applications')}>
            <div className="feature-icon">📋</div>
            <h3>Manage Applications</h3>
            <p>Review, approve, or reject visa applications. Process pending applications and manage application workflow.</p>
          </div>

          <div className="feature-card" onClick={() => navigate('/officer/arrivals-exits')}>
            <div className="feature-icon">✈️</div>
            <h3>Arrivals & Exits</h3>
            <p>Record traveler arrivals and exits. Track who is currently in the country and manage entry/exit records.</p>
          </div>

          <div className="feature-card" onClick={() => navigate('/admin/users')}>
            <div className="feature-icon">👥</div>
            <h3>Manage Users</h3>
            <p>Create, update, and manage user accounts. Assign roles and permissions to officers and other users in the system.</p>
          </div>

          <div className="feature-card" onClick={() => navigate('/admin/countries')}>
            <div className="feature-icon">🌍</div>
            <h3>Manage Countries</h3>
            <p>Configure the list of countries eligible for visa on arrival. Add, remove, or update country information and status.</p>
          </div>

          <div className="feature-card" onClick={() => navigate('/admin/users')}>
            <div className="feature-icon">🔐</div>
            <h3>Manage Permissions</h3>
            <p>Grant and revoke specific permissions to users and officers. Fine-tune access control for different features.</p>
          </div>

          <div className="feature-card" onClick={() => navigate('/admin/reports')}>
            <div className="feature-icon">📊</div>
            <h3>View Reports</h3>
            <p>Access comprehensive analytics and reports on visa applications, user activity, and system performance metrics.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
