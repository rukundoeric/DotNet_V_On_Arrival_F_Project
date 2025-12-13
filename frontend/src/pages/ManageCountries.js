import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://visaonarrival-c6fec5dtfwb2hwcc.southafricanorth-01.azurewebsites.net/api';

const ManageCountries = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    code2: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCountries = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/Countries`, {
        params: { search: searchTerm, page, pageSize: 15 },
        headers: { Authorization: `Bearer ${token}` }
      });
      setCountries(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch (err) {
      setError('Failed to load countries');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, token]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleCreateNew = () => {
    setEditingCountry(null);
    setFormData({ name: '', code: '', code2: '', isActive: true });
    setShowModal(true);
  };

  const handleEdit = (country) => {
    setEditingCountry(country);
    setFormData({
      name: country.name,
      code: country.code,
      code2: country.code2 || '',
      isActive: country.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingCountry) {
        await axios.put(
          `${API_URL}/Countries/${editingCountry.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Country updated successfully');
      } else {
        await axios.post(
          `${API_URL}/Countries`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Country created successfully');
      }
      setShowModal(false);
      fetchCountries();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this country?')) return;

    try {
      await axios.delete(`${API_URL}/Countries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Country deleted successfully');
      fetchCountries();
    } catch (err) {
      setError('Failed to delete country');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(`${API_URL}/Countries/${id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCountries();
    } catch (err) {
      setError('Failed to toggle status');
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

  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <nav className="dashboard-nav">
        <div className="dashboard-nav-content">
          <div className="dashboard-logo">
            <h1>Rwanda Visa Portal</h1>
            <span>Manage Countries</span>
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
          <h2>Manage Countries</h2>
          <p>Configure countries allowed for visa on arrival</p>
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

        {/* Search and Actions */}
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
                placeholder="🔍 Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-rwanda" style={{ width: 'auto', marginTop: 0 }}>
                Search
              </button>
            </form>
            <button onClick={handleCreateNew} className="btn-rwanda" style={{ width: 'auto', marginTop: 0, backgroundColor: '#10b981' }}>
              ➕ Add New Country
            </button>
          </div>
        </div>

        {/* Countries Table */}
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
                <p>Loading countries...</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #CFE3F7' }}>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Country Name</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700', fontSize: '14px' }}>ISO Code</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700', fontSize: '14px' }}>ISO Code2</th>
                    <th style={{ padding: '15px', textAlign: 'center', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'center', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {countries && countries.length > 0 ? countries.map(country => (
                    <tr key={country.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '15px', fontWeight: '600' }}>{country.name}</td>
                      <td style={{ padding: '15px', color: '#004892', fontWeight: '600' }}>{country.code}</td>
                      <td style={{ padding: '15px' }}>{country.code2 || '-'}</td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          backgroundColor: country.isActive ? '#10b981' : '#ef4444',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          {country.isActive ? '✓ Active' : '✕ Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleEdit(country)}
                            style={{
                              padding: '8px 16px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              backgroundColor: '#004892',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: '600'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(country.id)}
                            style={{
                              padding: '8px 16px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              backgroundColor: country.isActive ? '#fbbf24' : '#10b981',
                              color: country.isActive ? '#000' : 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: '600'
                            }}
                          >
                            {country.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(country.id)}
                            style={{
                              padding: '8px 16px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
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
                      <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                        No countries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div style={{
              padding: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '15px',
              borderTop: '1px solid #CFE3F7',
              backgroundColor: '#f8f9fa'
            }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-rwanda"
                style={{
                  width: 'auto',
                  marginTop: 0,
                  padding: '10px 20px',
                  opacity: page === 1 ? 0.5 : 1,
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  backgroundColor: '#6b7280'
                }}
              >
                ← Previous
              </button>
              <span style={{ fontWeight: '600', color: '#004892' }}>
                Page {page} of {totalPages} ({totalCount} countries)
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-rwanda"
                style={{
                  width: 'auto',
                  marginTop: 0,
                  padding: '10px 20px',
                  opacity: page === totalPages ? 0.5 : 1,
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  backgroundColor: '#6b7280'
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
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
            maxWidth: '550px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 72, 146, 0.3)'
          }}>
            <h3 style={{ color: '#004892', marginBottom: '25px', fontSize: '1.5rem' }}>
              {editingCountry ? '✏️ Edit Country' : '➕ Add New Country'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Country Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Rwanda"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">ISO Code (3 letters) *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., RWA"
                  maxLength="3"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">ISO Code2 (2 letters)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.code2}
                  onChange={(e) => setFormData({ ...formData, code2: e.target.value.toUpperCase() })}
                  placeholder="e.g., RW"
                  maxLength="2"
                />
              </div>
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '600' }}>Active (Allowed for visa on arrival)</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                <button type="submit" className="btn-rwanda" style={{ flex: 1, backgroundColor: '#10b981' }}>
                  {editingCountry ? 'Update Country' : 'Create Country'}
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
    </div>
  );
};

export default ManageCountries;
