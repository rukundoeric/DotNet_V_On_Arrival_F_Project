import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5262/api';

const ArrivalsExits = () => {
  const navigate = useNavigate();
  const { logout, token } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [arrivalRecords, setArrivalRecords] = useState([]);
  const [recordsSearchTerm, setRecordsSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'records'

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
      // Search for approved applications
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

      // Check if arrival record already exists
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
        // Update existing record with arrival date
        await axios.put(
          `${API_URL}/ArrivalRecords/${existingRecord.id}`,
          {
            actualArrivalDate: new Date().toISOString(),
            actualDepartureDate: null,
            entryStatus: 1 // Arrived
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new arrival record
        await axios.post(
          `${API_URL}/ArrivalRecords`,
          {
            visaApplicationId: searchResult.id,
            actualArrivalDate: new Date().toISOString(),
            entryStatus: 1 // Arrived
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
          entryStatus: 2 // Departed
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

      // Create download link
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

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold'
    };

    switch (status) {
      case 0: // Pending
      case 'Pending':
        return { ...baseStyle, backgroundColor: '#fbbf24', color: '#000' };
      case 1: // Arrived
      case 'Arrived':
        return { ...baseStyle, backgroundColor: '#10b981', color: '#fff' };
      case 2: // Departed
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

  return (
    <div className="container" style={{ marginTop: '50px' }}>
      <div className="form-card">
        <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Arrivals & Exits Management</h3>
            <p>Record traveler arrivals and departures</p>
          </div>
          <div>
            <button onClick={() => navigate('/officer/dashboard')} className="btn-rwanda" style={{ marginRight: '10px' }}>
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
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
            <button
              onClick={() => setActiveTab('search')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'search' ? '3px solid #1a56db' : 'none',
                fontWeight: activeTab === 'search' ? 'bold' : 'normal',
                cursor: 'pointer',
                color: activeTab === 'search' ? '#1a56db' : '#666'
              }}
            >
              Record Arrival
            </button>
            <button
              onClick={() => setActiveTab('records')}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'records' ? '3px solid #1a56db' : 'none',
                fontWeight: activeTab === 'records' ? 'bold' : 'normal',
                cursor: 'pointer',
                color: activeTab === 'records' ? '#1a56db' : '#666'
              }}
            >
              All Records
            </button>
          </div>

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Search by Reference Number or Passport Number</label>
                <div style={{ display: 'flex', gap: '10px' }}>
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
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>

              {searchResult && (
                <div className="info-card" style={{ marginTop: '20px' }}>
                  <h5 style={{ color: '#1a56db', marginBottom: '15px' }}>Application Found</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                    style={{ marginTop: '15px', width: '100%' }}
                    disabled={loading}
                  >
                    {loading ? 'Recording...' : 'Record Arrival Now'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Records Tab */}
          {activeTab === 'records' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by reference number, name, or passport number..."
                  value={recordsSearchTerm}
                  onChange={(e) => setRecordsSearchTerm(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {loading ? (
                <p>Loading records...</p>
              ) : arrivalRecords.filter(record => {
                if (!recordsSearchTerm.trim()) return true;
                const searchLower = recordsSearchTerm.toLowerCase();
                return (
                  record.visaApplication?.referenceNumber?.toLowerCase().includes(searchLower) ||
                  record.visaApplication?.firstName?.toLowerCase().includes(searchLower) ||
                  record.visaApplication?.lastName?.toLowerCase().includes(searchLower) ||
                  record.visaApplication?.passportNumber?.toLowerCase().includes(searchLower)
                );
              }).length === 0 ? (
                <div className="info-card">
                  <p>No arrival records found</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Reference</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Passport</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Arrival Date</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Departure Date</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arrivalRecords.filter(record => {
                      if (!recordsSearchTerm.trim()) return true;
                      const searchLower = recordsSearchTerm.toLowerCase();
                      return (
                        record.visaApplication?.referenceNumber?.toLowerCase().includes(searchLower) ||
                        record.visaApplication?.firstName?.toLowerCase().includes(searchLower) ||
                        record.visaApplication?.lastName?.toLowerCase().includes(searchLower) ||
                        record.visaApplication?.passportNumber?.toLowerCase().includes(searchLower)
                      );
                    }).map(record => (
                      <tr key={record.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>
                          {record.visaApplication?.referenceNumber || 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {record.visaApplication?.firstName && record.visaApplication?.lastName
                            ? `${record.visaApplication.firstName} ${record.visaApplication.lastName}`
                            : 'N/A'
                          }
                        </td>
                        <td style={{ padding: '12px' }}>
                          {record.visaApplication?.passportNumber || 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {record.actualArrivalDate
                            ? new Date(record.actualArrivalDate).toLocaleString()
                            : 'Not recorded'
                          }
                        </td>
                        <td style={{ padding: '12px' }}>
                          {record.actualDepartureDate
                            ? new Date(record.actualDepartureDate).toLocaleString()
                            : 'Not recorded'
                          }
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={getStatusBadgeStyle(record.entryStatus)}>
                            {getStatusText(record.entryStatus)}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {record.entryStatus === 1 && !record.actualDepartureDate && (
                              <button
                                onClick={() => handleRecordDeparture(record.id)}
                                style={{
                                  padding: '5px 10px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  backgroundColor: '#1a56db',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px'
                                }}
                              >
                                Record Departure
                              </button>
                            )}
                            {record.visaApplication?.id && (
                              <button
                                onClick={() => handleDownloadVisa(record.visaApplication.id, record.visaApplication.referenceNumber)}
                                style={{
                                  padding: '5px 10px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  backgroundColor: '#20603D',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px'
                                }}
                                title="Download Visa Document"
                              >
                                📄 Download Visa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
                <strong>Statistics:</strong> {
                  arrivalRecords.filter(record => {
                    if (!recordsSearchTerm.trim()) return true;
                    const searchLower = recordsSearchTerm.toLowerCase();
                    return (
                      record.visaApplication?.referenceNumber?.toLowerCase().includes(searchLower) ||
                      record.visaApplication?.firstName?.toLowerCase().includes(searchLower) ||
                      record.visaApplication?.lastName?.toLowerCase().includes(searchLower) ||
                      record.visaApplication?.passportNumber?.toLowerCase().includes(searchLower)
                    );
                  }).length
                } records found{recordsSearchTerm && ` (filtered from ${arrivalRecords.length} total)`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArrivalsExits;
