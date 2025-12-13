import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://visaonarrival-c6fec5dtfwb2hwcc.southafricanorth-01.azurewebsites.net/api';

const ArrivalsExits = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [arrivalRecords, setArrivalRecords] = useState([]);
  const [recordsSearchTerm, setRecordsSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('search');

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a reference number or passport number');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setSearchResult(null);

    try {
      const response = await axios.get(`${API_URL}/VisaApplications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const applications = response.data || [];
      const found = applications.find(app =>
        (app.referenceNumber?.toLowerCase() === searchTerm.toLowerCase() ||
         app.passportNumber?.toLowerCase() === searchTerm.toLowerCase()) &&
        app.applicationStatus === 'Approved'
      );

      if (found) {
        setSearchResult(found);
      } else {
        setError('No approved application found with this reference or passport number');
      }
    } catch (err) {
      setError('Failed to search applications');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArrivalRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/ArrivalRecords`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setArrivalRecords(response.data || []);
    } catch (err) {
      setError('Failed to load arrival records');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleRecordArrival = async () => {
    if (!searchResult) return;

    try {
      setLoading(true);
      setError('');

      const existingRecordsResponse = await axios.get(`${API_URL}/ArrivalRecords`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const existingRecord = existingRecordsResponse.data?.find(
        record => record.visaApplicationId === searchResult.id
      );

      if (existingRecord && existingRecord.actualArrivalDate) {
        setError('Arrival already recorded for this application');
        return;
      }

      if (existingRecord) {
        await axios.put(
          `${API_URL}/ArrivalRecords/${existingRecord.id}`,
          {
            actualArrivalDate: new Date().toISOString(),
            actualDepartureDate: null,
            entryStatus: 1
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/ArrivalRecords`,
          {
            visaApplicationId: searchResult.id,
            actualArrivalDate: new Date().toISOString(),
            entryStatus: 1
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setSuccess('Arrival recorded successfully');
      setSearchResult(null);
      setSearchTerm('');
      fetchArrivalRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record arrival');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordDeparture = async (recordId) => {
    if (!window.confirm('Are you sure you want to record this departure?')) return;

    try {
      const record = arrivalRecords.find(r => r.id === recordId);
      if (!record) return;

      await axios.put(
        `${API_URL}/ArrivalRecords/${recordId}`,
        {
          actualArrivalDate: record.actualArrivalDate,
          actualDepartureDate: new Date().toISOString(),
          entryStatus: 2
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Departure recorded successfully');
      fetchArrivalRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record departure');
    }
  };

  const handleDownloadVisa = async (applicationId, referenceNumber) => {
    try {
      const response = await axios.get(
        `${API_URL}/VisaApplications/${applicationId}/visa-document`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rwanda-Visa-${referenceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Visa document downloaded successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download visa document');
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

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: '6px 14px',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600'
    };

    switch (status) {
      case 0:
      case 'Pending':
        return { ...baseStyle, backgroundColor: '#fbbf24', color: '#000' };
      case 1:
      case 'Arrived':
        return { ...baseStyle, backgroundColor: '#10b981', color: '#fff' };
      case 2:
      case 'Departed':
        return { ...baseStyle, backgroundColor: '#6b7280', color: '#fff' };
      default:
        return { ...baseStyle, backgroundColor: '#6b7280', color: '#fff' };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Arrived';
      case 2: return 'Departed';
      default: return 'Unknown';
    }
  };

  React.useEffect(() => {
    if (activeTab === 'records') {
      fetchArrivalRecords();
    }
  }, [activeTab, fetchArrivalRecords]);

  const filteredRecords = arrivalRecords.filter(record => {
    if (!recordsSearchTerm.trim()) return true;
    const searchLower = recordsSearchTerm.toLowerCase();
    return (
      record.visaApplication?.referenceNumber?.toLowerCase().includes(searchLower) ||
      record.visaApplication?.firstName?.toLowerCase().includes(searchLower) ||
      record.visaApplication?.lastName?.toLowerCase().includes(searchLower) ||
      record.visaApplication?.passportNumber?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <nav className="dashboard-nav">
        <div className="dashboard-nav-content">
          <div className="dashboard-logo">
            <h1>Rwanda Visa Portal</h1>
            <span>Arrivals & Exits</span>
          </div>
          <div className="dashboard-user-info">
            <div className="user-profile">
              <div className="user-avatar">{getUserInitials()}</div>
              <div className="user-details">
                <div className="user-name">{user?.firstName} {user?.lastName}</div>
                <div className="user-role">{user?.role}</div>
              </div>
            </div>
            <button onClick={() => navigate('/officer/dashboard')} className="logout-btn" style={{ marginRight: '10px' }}>
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
          <h2>Arrivals & Exits Management</h2>
          <p>Record traveler arrivals and departures</p>
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

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '25px',
          background: 'white',
          padding: '10px 25px',
          borderRadius: '12px 12px 0 0',
          boxShadow: '0 2px 10px rgba(0, 72, 146, 0.08)',
          border: '1px solid #CFE3F7',
          borderBottom: 'none'
        }}>
          <button
            onClick={() => setActiveTab('search')}
            style={{
              padding: '12px 25px',
              border: 'none',
              background: activeTab === 'search' ? '#004892' : 'transparent',
              color: activeTab === 'search' ? 'white' : '#6b7280',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '15px'
            }}
          >
            📝 Record Arrival
          </button>
          <button
            onClick={() => setActiveTab('records')}
            style={{
              padding: '12px 25px',
              border: 'none',
              background: activeTab === 'records' ? '#004892' : 'transparent',
              color: activeTab === 'records' ? 'white' : '#6b7280',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '15px'
            }}
          >
            📋 All Records
          </button>
        </div>

        {/* Tab Content Container */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '0 12px 12px 12px',
          boxShadow: '0 2px 10px rgba(0, 72, 146, 0.08)',
          border: '1px solid #CFE3F7'
        }}>
          {/* Search Tab */}
          {activeTab === 'search' && (
            <div>
              <div style={{ marginBottom: '25px' }}>
                <label className="form-label" style={{ fontSize: '16px', marginBottom: '12px', display: 'block' }}>
                  Search by Reference Number or Passport Number
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter reference number or passport number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={handleSearch}
                    className="btn-rwanda"
                    disabled={loading}
                    style={{ width: 'auto', marginTop: 0 }}
                  >
                    {loading ? 'Searching...' : '🔍 Search'}
                  </button>
                </div>
              </div>

              {searchResult && (
                <div className="info-card" style={{ marginTop: '25px', border: '2px solid #10b981' }}>
                  <h5 style={{ color: '#10b981', marginBottom: '20px', fontSize: '1.2rem' }}>✓ Application Found</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                    <p><strong>Reference:</strong> {searchResult.referenceNumber}</p>
                    <p><strong>Name:</strong> {searchResult.firstName} {searchResult.lastName}</p>
                    <p><strong>Passport:</strong> {searchResult.passportNumber}</p>
                    <p><strong>Nationality:</strong> {searchResult.nationality}</p>
                    <p><strong>Expected Arrival:</strong> {new Date(searchResult.arrivalDate).toLocaleDateString()}</p>
                    <p><strong>Expected Departure:</strong> {new Date(searchResult.expectedDepartureDate).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={handleRecordArrival}
                    className="btn-rwanda"
                    style={{ width: '100%', backgroundColor: '#10b981' }}
                    disabled={loading}
                  >
                    {loading ? 'Recording...' : '✓ Record Arrival Now'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Records Tab */}
          {activeTab === 'records' && (
            <div>
              <div style={{ marginBottom: '25px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="🔍 Search by reference number, name, or passport number..."
                  value={recordsSearchTerm}
                  onChange={(e) => setRecordsSearchTerm(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  <p>Loading records...</p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="info-card">
                  <p>No arrival records found</p>
                </div>
              ) : (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #CFE3F7' }}>
                          <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Reference</th>
                          <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Name</th>
                          <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Passport</th>
                          <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Arrival Date</th>
                          <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Departure Date</th>
                          <th style={{ padding: '15px', textAlign: 'center', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Status</th>
                          <th style={{ padding: '15px', textAlign: 'center', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map(record => (
                          <tr key={record.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '15px', fontWeight: '600', color: '#004892' }}>
                              {record.visaApplication?.referenceNumber || 'N/A'}
                            </td>
                            <td style={{ padding: '15px' }}>
                              {record.visaApplication?.firstName && record.visaApplication?.lastName
                                ? `${record.visaApplication.firstName} ${record.visaApplication.lastName}`
                                : 'N/A'
                              }
                            </td>
                            <td style={{ padding: '15px' }}>
                              {record.visaApplication?.passportNumber || 'N/A'}
                            </td>
                            <td style={{ padding: '15px' }}>
                              {record.actualArrivalDate
                                ? new Date(record.actualArrivalDate).toLocaleString()
                                : 'Not recorded'
                              }
                            </td>
                            <td style={{ padding: '15px' }}>
                              {record.actualDepartureDate
                                ? new Date(record.actualDepartureDate).toLocaleString()
                                : 'Not recorded'
                              }
                            </td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                              <span style={getStatusBadgeStyle(record.entryStatus)}>
                                {getStatusText(record.entryStatus)}
                              </span>
                            </td>
                            <td style={{ padding: '15px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {record.entryStatus === 1 && !record.actualDepartureDate && (
                                  <button
                                    onClick={() => handleRecordDeparture(record.id)}
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
                                    Record Departure
                                  </button>
                                )}
                                {record.visaApplication?.id && (
                                  <button
                                    onClick={() => handleDownloadVisa(record.visaApplication.id, record.visaApplication.referenceNumber)}
                                    style={{
                                      padding: '8px 16px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      backgroundColor: '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontWeight: '600'
                                    }}
                                    title="Download Visa Document"
                                  >
                                    📄 Download
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: '20px', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
                    📊 {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} found
                    {recordsSearchTerm && ` (filtered from ${arrivalRecords.length} total)`}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ArrivalsExits;
