import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://visaonarrival-c6fec5dtfwb2hwcc.southafricanorth-01.azurewebsites.net/api';

const ManageApplications = () => {
  const navigate = useNavigate();
  const { logout, token } = useAuth();

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

      // Approve the application
      await axios.post(`${API_URL}/VisaApplications/${selectedApplication.id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // If user wants to record arrival automatically
      if (recordArrivalOnApprove) {
        try {
          await axios.post(
            `${API_URL}/ArrivalRecords`,
            {
              visaApplicationId: selectedApplication.id,
              actualArrivalDate: new Date().toISOString(),
              entryStatus: 1 // Arrived
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

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold'
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
    <div className="container" style={{ marginTop: '50px' }}>
      <div className="form-card">
        <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Manage Visa Applications</h3>
            <p>Review and process visa applications</p>
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
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by reference, name, or passport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1 }}
            />
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Reference</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Passport</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Nationality</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Arrival Date</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications && filteredApplications.length > 0 ? filteredApplications.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{app.referenceNumber}</td>
                    <td style={{ padding: '12px' }}>{app.firstName} {app.lastName}</td>
                    <td style={{ padding: '12px' }}>{app.passportNumber}</td>
                    <td style={{ padding: '12px' }}>{app.nationality}</td>
                    <td style={{ padding: '12px' }}>
                      {new Date(app.arrivalDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={getStatusBadgeStyle(app.applicationStatus)}>
                        {app.applicationStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleViewDetails(app)}
                        style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px' }}
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
                            style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', backgroundColor: '#10b981', color: 'white', border: 'none' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowRejectModal(true);
                            }}
                            style={{ padding: '5px 10px', cursor: 'pointer', fontSize: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>
                      No applications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
            <strong>Statistics:</strong> {filteredApplications.length} applications found
            {statusFilter && ` (filtered by ${statusFilter})`}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
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
            <h3>Application Details</h3>
            <div style={{ marginTop: '20px' }}>
              <p><strong>Reference Number:</strong> {selectedApplication.referenceNumber}</p>
              <p><strong>Status:</strong> <span style={getStatusBadgeStyle(selectedApplication.applicationStatus)}>{selectedApplication.applicationStatus}</span></p>
              <p><strong>Application Date:</strong> {new Date(selectedApplication.applicationDate).toLocaleString()}</p>

              <h5 style={{ marginTop: '20px', color: '#1a56db' }}>Personal Information</h5>
              <p><strong>Name:</strong> {selectedApplication.firstName} {selectedApplication.lastName}</p>
              <p><strong>Email:</strong> {selectedApplication.email}</p>
              <p><strong>Contact:</strong> {selectedApplication.contactNumber}</p>
              <p><strong>Date of Birth:</strong> {new Date(selectedApplication.dateOfBirth).toLocaleDateString()}</p>

              <h5 style={{ marginTop: '20px', color: '#1a56db' }}>Travel Document</h5>
              <p><strong>Passport Number:</strong> {selectedApplication.passportNumber}</p>
              <p><strong>Nationality:</strong> {selectedApplication.nationality}</p>

              <h5 style={{ marginTop: '20px', color: '#1a56db' }}>Travel Details</h5>
              <p><strong>Arrival Date:</strong> {new Date(selectedApplication.arrivalDate).toLocaleDateString()}</p>
              <p><strong>Departure Date:</strong> {new Date(selectedApplication.expectedDepartureDate).toLocaleDateString()}</p>
              <p><strong>Purpose of Visit:</strong> {selectedApplication.purposeOfVisit}</p>
              <p><strong>Accommodation:</strong> {selectedApplication.accommodationAddress}</p>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="btn-rwanda"
              style={{ marginTop: '20px', width: '100%' }}
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
            <h3>Approve Application</h3>
            <p style={{ marginTop: '10px', color: '#666' }}>
              Reference: <strong>{selectedApplication.referenceNumber}</strong>
            </p>
            <p style={{ color: '#666' }}>
              Applicant: <strong>{selectedApplication.firstName} {selectedApplication.lastName}</strong>
            </p>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={recordArrivalOnApprove}
                  onChange={(e) => setRecordArrivalOnApprove(e.target.checked)}
                  style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>Record arrival automatically upon approval</span>
              </label>
              <p style={{ marginTop: '5px', fontSize: '12px', color: '#666', marginLeft: '28px' }}>
                Check this if the traveler has already arrived
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
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
            <h3>Reject Application</h3>
            <p style={{ marginTop: '10px', color: '#666' }}>
              Reference: <strong>{selectedApplication.referenceNumber}</strong>
            </p>
            <p style={{ color: '#666' }}>
              Applicant: <strong>{selectedApplication.firstName} {selectedApplication.lastName}</strong>
            </p>

            <div className="form-group" style={{ marginTop: '20px' }}>
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

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
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
