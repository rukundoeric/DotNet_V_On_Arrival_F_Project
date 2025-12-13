import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://visaonarrival-c6fec5dtfwb2hwcc.southafricanorth-01.azurewebsites.net/api';

const ManageCountries = () => {
  const navigate = useNavigate();
  const { logout, token } = useAuth();

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
    setPage(1); // Reset to first page when searching
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

  return (
    <div className="container" style={{ marginTop: '50px' }}>
      <div className="form-card">
        <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Manage Countries</h3>
            <p>Manage countries allowed for visa on arrival</p>
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
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-rwanda">Search</button>
            </form>
            <button onClick={handleCreateNew} className="btn-rwanda">
              Add New Country
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Code</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Code2</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {countries && countries.length > 0 ? countries.map(country => (
                  <tr key={country.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{country.name}</td>
                    <td style={{ padding: '12px' }}>{country.code}</td>
                    <td style={{ padding: '12px' }}>{country.code2 || '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: country.isActive ? '#10b981' : '#ef4444',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {country.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(country)}
                        style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(country.id)}
                        style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}
                      >
                        {country.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(country.id)}
                        style={{ padding: '5px 10px', cursor: 'pointer', color: 'red' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>
                      No countries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {!loading && totalPages > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 16px',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages} (Total: {totalCount} countries)
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '8px 16px',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

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
            maxWidth: '500px',
            width: '100%'
          }}>
            <h3>{editingCountry ? 'Edit Country' : 'Add New Country'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Country Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  maxLength="2"
                />
              </div>
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
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn-rwanda" style={{ flex: 1 }}>
                  {editingCountry ? 'Update' : 'Create'}
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
