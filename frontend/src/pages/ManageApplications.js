import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://visaonarrival-c6fec5dtfwb2hwcc.southafricanorth-01.azurewebsites.net/api';

const ManageApplications = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [recordArrivalOnApprove, setRecordArrivalOnApprove] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchApplications = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/VisaApplications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data || []);
    } catch (err) {
      setError('Failed to load applications');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApprove = async () => {
    if (!selectedApplication) return;

    try {
      setLoading(true);
      setError('');

      await axios.post(`${API_URL}/VisaApplications/${selectedApplication.id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (recordArrivalOnApprove) {
        try {
          await axios.post(
            `${API_URL}/ArrivalRecords`,
            {
              visaApplicationId: selectedApplication.id,
              actualArrivalDate: new Date().toISOString(),
              entryStatus: 1
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setSuccess('Application approved and arrival recorded successfully');
        } catch (arrivalErr) {
          setSuccess('Application approved successfully, but failed to record arrival');
          console.error('Arrival recording error:', arrivalErr);
        }
      } else {
        setSuccess('Application approved successfully');
      }

      setShowApproveModal(false);
      setRecordArrivalOnApprove(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve application');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;

    try {
      await axios.post(`${API_URL}/VisaApplications/${selectedApplication.id}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Application rejected successfully');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedApplication(null);
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject application');
    }
  };

  const handleViewDetails = (app) => {
    setSelectedApplication(app);
    setShowDetailsModal(true);
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

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm ||
      app.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.passportNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || app.applicationStatus?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <nav className="dashboard-nav">
        <div className="dashboard-nav-content">
          <div className="dashboard-logo">
            <h1>Rwanda Visa Portal</h1>
            <span>Manage Applications</span>
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
          <h2>Visa Applications</h2>
          <p>Review and process visa on arrival applications</p>
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

        {/* Search and Filter Section */}
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          marginBottom: '25px',
          boxShadow: '0 2px 10px rgba(0, 72, 146, 0.08)',
          border: '1px solid #CFE3F7'
        }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search by reference, name, or passport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: '250px' }}
            />
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '180px' }}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div style={{ marginTop: '15px', color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
            📊 {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} found
            {statusFilter && ` (filtered by ${statusFilter})`}
          </div>
        </div>

        {/* Applications Table */}
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
                <p>Loading applications...</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #CFE3F7' }}>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Reference</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Name</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Passport</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Nationality</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Arrival Date</th>
                    <th style={{ padding: '15px', textAlign: 'center', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'center', color: '#004892', fontWeight: '700', fontSize: '14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications && filteredApplications.length > 0 ? filteredApplications.map(app => (
                    <tr key={app.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '15px', fontWeight: '600', color: '#004892' }}>{app.referenceNumber}</td>
                      <td style={{ padding: '15px' }}>{app.firstName} {app.lastName}</td>
                      <td style={{ padding: '15px' }}>{app.passportNumber}</td>
                      <td style={{ padding: '15px' }}>{app.nationality}</td>
                      <td style={{ padding: '15px' }}>
                        {new Date(app.arrivalDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <span style={getStatusBadgeStyle(app.applicationStatus)}>
                          {app.applicationStatus}
                        </span>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleViewDetails(app)}
                            style={{
                              padding: '8px 16px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              backgroundColor: '#004892',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: '600',
                              transition: 'all 0.3s'
                            }}
                          >
                            Details
                          </button>
                          {app.applicationStatus === 'Pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setShowApproveModal(true);
                                }}
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
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedApplication(app);
                                  setShowRejectModal(true);
                                }}
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
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                        No applications found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
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
            <h3 style={{ color: '#004892', marginBottom: '20px', fontSize: '1.5rem' }}>Application Details</h3>
            <div style={{ marginTop: '20px', lineHeight: '1.8' }}>
              <p><strong>Reference Number:</strong> {selectedApplication.referenceNumber}</p>
              <p><strong>Status:</strong> <span style={getStatusBadgeStyle(selectedApplication.applicationStatus)}>{selectedApplication.applicationStatus}</span></p>
              <p><strong>Application Date:</strong> {new Date(selectedApplication.applicationDate).toLocaleString()}</p>

              <h5 style={{ marginTop: '25px', color: '#004892', fontSize: '1.1rem' }}>Personal Information</h5>
              <p><strong>Name:</strong> {selectedApplication.firstName} {selectedApplication.lastName}</p>
              <p><strong>Email:</strong> {selectedApplication.email}</p>
              <p><strong>Contact:</strong> {selectedApplication.contactNumber}</p>
              <p><strong>Date of Birth:</strong> {new Date(selectedApplication.dateOfBirth).toLocaleDateString()}</p>

              <h5 style={{ marginTop: '25px', color: '#004892', fontSize: '1.1rem' }}>Travel Document</h5>
              <p><strong>Passport Number:</strong> {selectedApplication.passportNumber}</p>
              <p><strong>Nationality:</strong> {selectedApplication.nationality}</p>

              <h5 style={{ marginTop: '25px', color: '#004892', fontSize: '1.1rem' }}>Travel Details</h5>
              <p><strong>Arrival Date:</strong> {new Date(selectedApplication.arrivalDate).toLocaleDateString()}</p>
              <p><strong>Departure Date:</strong> {new Date(selectedApplication.expectedDepartureDate).toLocaleDateString()}</p>
              <p><strong>Purpose of Visit:</strong> {selectedApplication.purposeOfVisit}</p>
              <p><strong>Accommodation:</strong> {selectedApplication.accommodationAddress}</p>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="btn-rwanda"
              style={{ marginTop: '25px', width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedApplication && (
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
            <h3 style={{ color: '#10b981', fontSize: '1.5rem' }}>Approve Application</h3>
            <p style={{ marginTop: '15px', color: '#666' }}>
              Reference: <strong>{selectedApplication.referenceNumber}</strong>
            </p>
            <p style={{ color: '#666' }}>
              Applicant: <strong>{selectedApplication.firstName} {selectedApplication.lastName}</strong>
            </p>

            <div className="form-group" style={{ marginTop: '25px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={recordArrivalOnApprove}
                  onChange={(e) => setRecordArrivalOnApprove(e.target.checked)}
                  style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>Record arrival automatically upon approval</span>
              </label>
              <p style={{ marginTop: '8px', fontSize: '13px', color: '#666', marginLeft: '28px' }}>
                Check this if the traveler has already arrived
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '25px' }}>
              <button
                onClick={handleApprove}
                className="btn-rwanda"
                style={{ flex: 1, backgroundColor: '#10b981' }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Approval'}
              </button>
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setRecordArrivalOnApprove(false);
                  setSelectedApplication(null);
                }}
                className="btn-rwanda"
                style={{ flex: 1, backgroundColor: '#6b7280' }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApplication && (
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
            <h3 style={{ color: '#ef4444', fontSize: '1.5rem' }}>Reject Application</h3>
            <p style={{ marginTop: '15px', color: '#666' }}>
              Reference: <strong>{selectedApplication.referenceNumber}</strong>
            </p>
            <p style={{ color: '#666' }}>
              Applicant: <strong>{selectedApplication.firstName} {selectedApplication.lastName}</strong>
            </p>

            <div className="form-group" style={{ marginTop: '25px' }}>
              <label className="form-label">Rejection Reason *</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '25px' }}>
              <button
                onClick={handleReject}
                className="btn-rwanda"
                style={{ flex: 1, backgroundColor: '#ef4444' }}
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedApplication(null);
                }}
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

export default ManageApplications;
