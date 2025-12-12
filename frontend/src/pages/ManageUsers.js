import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5262/api';

const ManageUsers = () => {
  const navigate = useNavigate();
  const { logout, token } = useAuth();

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

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      isActive: user.isActive,
      permissionIds: user.permissions?.map(p => p.id) || []
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        // Map role string to enum value (0=User, 1=Officer, 2=Admin)
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
        // Map role string to enum value (0=User, 1=Officer, 2=Admin)
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

  const handleManagePermissions = (user) => {
    setManagingPermissionsUser(user);
    setSelectedPermissions(user.permissions?.map(p => p.id) || []);
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

  const getRoleBadgeStyle = (role) => {
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold'
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

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {});

  return (
    <div className="container" style={{ marginTop: '50px' }}>
      <div className="form-card">
        <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Manage Users</h3>
            <p>Create and manage system users and officers</p>
          </div>
          <div>
            <button onClick={() => navigate('/admin/dashboard')} className="btn-rwanda" style={{ marginRight: '10px' }}>
              Back to Dashboard
            </button>
            <button onClick={handleLogout} className="btn-rwanda">
              Logout
            </button>
          </div>
        </div>

        {error && <div className="error-alert">{error}</div>}
        {success && <div className="success-alert">{success}</div>}

        <div className="form-body">
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search users..."
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
              <button type="submit" className="btn-rwanda">Search</button>
            </form>
            <button onClick={handleCreateNew} className="btn-rwanda">
              Add New User
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Permissions</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users && users.length > 0 ? users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{user.firstName} {user.lastName}</td>
                    <td style={{ padding: '12px' }}>{user.email}</td>
                    <td style={{ padding: '12px' }}>{user.phoneNumber || '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={getRoleBadgeStyle(user.role)}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {user.permissions?.length || 0} permissions
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: user.isActive ? '#10b981' : '#ef4444',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(user)}
                        style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleManagePermissions(user)}
                        style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Permissions
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{ padding: '5px 10px', cursor: 'pointer', color: 'red', fontSize: '12px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit User Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn-rwanda" style={{ flex: 1 }}>
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
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3>Manage Permissions for {managingPermissionsUser?.firstName} {managingPermissionsUser?.lastName}</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Role: <strong>{managingPermissionsUser?.role}</strong>
            </p>

            {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
              <div key={category} style={{ marginBottom: '20px' }}>
                <h5 style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#1a56db',
                  marginBottom: '10px',
                  textTransform: 'capitalize'
                }}>
                  {category}
                </h5>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '10px',
                  marginBottom: '15px'
                }}>
                  {categoryPermissions.map(permission => (
                    <label
                      key={permission.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '4px',
                        backgroundColor: selectedPermissions.includes(permission.id) ? '#e0f2fe' : '#f9fafb'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        style={{ marginTop: '3px' }}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500' }}>{permission.name}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>{permission.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={handleSavePermissions}
                className="btn-rwanda"
                style={{ flex: 1 }}
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
