import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://visaonarrival-c6fec5dtfwb2hwcc.southafricanorth-01.azurewebsites.net/api';

const ManageUsers = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();

  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [managingPermissionsUser, setManagingPermissionsUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'User',
    permissionIds: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;

      const response = await axios.get(`${API_URL}/Users`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data || []);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, token]);

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/Permissions`);
      setPermissions(response.data || []);
    } catch (err) {
      console.error('Error fetching permissions:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchPermissions();
  }, [fetchUsers, fetchPermissions]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCreateNew = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      role: 'User',
      permissionIds: []
    });
    setShowModal(true);
  };

  const handleEdit = (usr) => {
    setEditingUser(usr);
    setFormData({
      firstName: usr.firstName,
      lastName: usr.lastName,
      email: usr.email,
      phoneNumber: usr.phoneNumber || '',
      role: usr.role,
      isActive: usr.isActive,
      permissionIds: usr.permissions?.map(p => p.id) || []
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        const roleMap = { 'User': 0, 'Officer': 1, 'Admin': 2 };
        await axios.put(
          `${API_URL}/Users/${editingUser.id}`,
          {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            role: roleMap[formData.role] ?? 0,
            isActive: formData.isActive
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('User updated successfully');
      } else {
        const roleMap = { 'User': 0, 'Officer': 1, 'Admin': 2 };
        const submitData = {
          ...formData,
          role: roleMap[formData.role] ?? 0
        };
        await axios.post(
          `${API_URL}/Users`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('User created successfully');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`${API_URL}/Users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(`${API_URL}/Users/${id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      setError('Failed to toggle status');
    }
  };

  const handleManagePermissions = (usr) => {
    setManagingPermissionsUser(usr);
    setSelectedPermissions(usr.permissions?.map(p => p.id) || []);
    setShowPermissionsModal(true);
  };

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = async () => {
    setError('');
    setSuccess('');

    try {
      await axios.post(
        `${API_URL}/Users/${managingPermissionsUser.id}/permissions`,
        { permissionIds: selectedPermissions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Permissions updated successfully');
      setShowPermissionsModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update permissions');
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

  const getRoleBadgeStyle = (role) => {
    const baseStyle = {
      padding: '6px 14px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600'
    };

    switch (role?.toLowerCase()) {
      case 'admin':
        return { ...baseStyle, backgroundColor: '#ef4444', color: '#fff' };
      case 'officer':
        return { ...baseStyle, backgroundColor: '#3b82f6', color: '#fff' };
      case 'user':
        return { ...baseStyle, backgroundColor: '#10b981', color: '#fff' };
      default:
        return { ...baseStyle, backgroundColor: '#6b7280', color: '#fff' };
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {});

  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <nav className="dashboard-nav">
        <div className="dashboard-nav-content">
          <div className="dashboard-logo">
            <h1>Rwanda Visa Portal</h1>
            <span>Manage Users</span>
          </div>
          <div className="dashboard-user-info">
            <div className="user-profile">
              <div className="user-avatar">{getUserInitials()}</div>
              <div className="user-details">
                <div className="user-name">{user?.firstName} {user?.lastName}</div>
                <div className="user-role">{user?.role}</div>
              </div>
            </div>
            <button onClick={() => navigate('/admin/dashboard')} className="logout-btn" style={{ marginRight: '10px' }}>
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
          <h2>User Management</h2>
          <p>Create and manage system users and officers</p>
        </div>

        {error && (
          <div className="error-alert" style={{ marginBottom: '20px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        {success && (
          <div className="success-alert" style={{ marginBottom: '20px' }}>
            <strong>Success:</strong> {success}
          </div>
        )}

        {/* Search and Filter */}
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          marginBottom: '25px',
          boxShadow: '0 2px 10px rgba(0, 72, 146, 0.08)',
          border: '1px solid #CFE3F7'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '12px', minWidth: '300px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1 }}
              />
              <select
                className="form-control"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Officer">Officer</option>
                <option value="User">User</option>
              </select>
              <button type="submit" className="btn-rwanda" style={{ width: 'auto', marginTop: 0 }}>
                Search
              </button>
            </form>
            <button onClick={handleCreateNew} className="btn-rwanda" style={{ width: 'auto', marginTop: 0, backgroundColor: '#10b981' }}>
              ➕ Add New User
            </button>
          </div>
          <div style={{ marginTop: '15px', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
            📊 {users.length} user{users.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Users Table */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 72, 146, 0.08)',
          border: '1px solid #CFE3F7',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                <p>Loading users...</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #CFE3F7' }}>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Name</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Email</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Phone</th>
                    <th style={{ padding: '15px', textAlign: 'center', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Role</th>
                    <th style={{ padding: '15px', textAlign: 'center', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Permissions</th>
                    <th style={{ padding: '15px', textAlign: 'center', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'center', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users && users.length > 0 ? users.map(usr => (
                    <tr key={usr.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '15px', fontWeight: '600' }}>{usr.firstName} {usr.lastName}</td>
                      <td style={{ padding: '15px' }}>{usr.email}</td>
                      <td style={{ padding: '15px' }}>{usr.phoneNumber || '-'}</td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <span style={getRoleBadgeStyle(usr.role)}>
                          {usr.role}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                          {usr.permissions?.length || 0} permission{usr.permissions?.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          backgroundColor: usr.isActive ? '#10b981' : '#ef4444',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          {usr.isActive ? '✓ Active' : '✕ Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleEdit(usr)}
                            style={{
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              backgroundColor: '#004892',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              fontWeight: '600'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleManagePermissions(usr)}
                            style={{
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              fontWeight: '600'
                            }}
                          >
                            Permissions
                          </button>
                          <button
                            onClick={() => handleToggleStatus(usr.id)}
                            style={{
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              backgroundColor: usr.isActive ? '#fbbf24' : '#10b981',
                              color: usr.isActive ? '#000' : 'white',
                              border: 'none',
                              borderRadius: '5px',
                              fontWeight: '600'
                            }}
                          >
                            {usr.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(usr.id)}
                            style={{
                              padding: '6px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              fontWeight: '600'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Create/Edit User Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '35px',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 72, 146, 0.3)'
          }}>
            <h3 style={{ color: '#004892', marginBottom: '25px', fontSize: '1.5rem' }}>
              {editingUser ? '✏️ Edit User' : '➕ Create New User'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+250 XXX XXX XXX"
                />
              </div>
              {!editingUser && (
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="User">User</option>
                  <option value="Officer">Officer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              {editingUser && (
                <div className="form-group" style={{ marginTop: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: '600' }}>Active</span>
                  </label>
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                <button type="submit" className="btn-rwanda" style={{ flex: 1, backgroundColor: '#10b981' }}>
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-rwanda"
                  style={{ flex: 1, backgroundColor: '#6b7280' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Permissions Modal */}
      {showPermissionsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '35px',
            borderRadius: '16px',
            maxWidth: '750px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 72, 146, 0.3)'
          }}>
            <h3 style={{ color: '#004892', marginBottom: '15px', fontSize: '1.5rem' }}>
              🔐 Manage Permissions
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '25px', fontSize: '15px' }}>
              User: <strong>{managingPermissionsUser?.firstName} {managingPermissionsUser?.lastName}</strong> |
              Role: <strong style={{ color: '#004892' }}>{managingPermissionsUser?.role}</strong>
            </p>

            {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
              <div key={category} style={{ marginBottom: '25px' }}>
                <h5 style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#004892',
                  marginBottom: '12px',
                  textTransform: 'capitalize',
                  paddingBottom: '8px',
                  borderBottom: '2px solid #CFE3F7'
                }}>
                  {category}
                </h5>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '12px'
                }}>
                  {categoryPermissions.map(permission => (
                    <label
                      key={permission.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        cursor: 'pointer',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: selectedPermissions.includes(permission.id) ? '#CFE3F7' : '#f9fafb',
                        border: selectedPermissions.includes(permission.id) ? '2px solid #004892' : '1px solid #e5e7eb',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        style={{ marginTop: '3px', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                          {permission.name}
                        </div>
                        {permission.description && (
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                            {permission.description}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
              <button
                onClick={handleSavePermissions}
                className="btn-rwanda"
                style={{ flex: 1, backgroundColor: '#10b981' }}
              >
                Save Permissions
              </button>
              <button
                type="button"
                onClick={() => setShowPermissionsModal(false)}
                className="btn-rwanda"
                style={{ flex: 1, backgroundColor: '#6b7280' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
