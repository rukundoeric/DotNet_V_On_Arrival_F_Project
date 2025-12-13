import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const QuickAction = () => {
  const { refNumber } = useParams();
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [recordArrivalOnApprove, setRecordArrivalOnApprove] = useState(false);
  const [success, setSuccess] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'https://visaonarrival-c6fec5dtfwb2hwcc.southafricanorth-01.azurewebsites.net/api';

  useEffect(() => {
    fetchApplication();
  }, [refNumber]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API_URL}/VisaApplications/reference/${refNumber}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setApplication(response.data);
    } catch (err) {
      console.error('Error fetching application:', err);
      setError(err.response?.data?.error || 'Application not found');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!token) {
      alert('You must be logged in as an officer to approve applications');
      navigate('/login');
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      await axios.post(`${API_URL}/VisaApplications/${application.id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (recordArrivalOnApprove) {
        try {
          await axios.post(
            `${API_URL}/ArrivalRecords`,
            {
              visaApplicationId: application.id,
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
      setActionSuccess(true);
      setTimeout(() => {
        if (user?.role === 'Admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/officer/dashboard');
        }
      }, 2000);
    } catch (err) {
      console.error('Error approving application:', err);
      setError(err.response?.data?.message || 'Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!token) {
      alert('You must be logged in as an officer to reject applications');
      navigate('/login');
      return;
    }

    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      await axios.post(`${API_URL}/VisaApplications/${application.id}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Application rejected successfully');
      setShowRejectForm(false);
      setRejectionReason('');
      setActionSuccess(true);
      setTimeout(() => {
        if (user?.role === 'Admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/officer/dashboard');
        }
      }, 2000);
    } catch (err) {
      console.error('Error rejecting application:', err);
      setError(err.response?.data?.message || 'Failed to reject application');
    } finally {
      setActionLoading(false);
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
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      display: 'inline-block'
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

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⏳</div>
          <p style={{ fontSize: '1.2rem' }}>Loading application...</p>
        </div>
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <div className="dashboard-nav-content">
            <div className="dashboard-logo">
              <h1>Rwanda Visa Portal</h1>
              <span>Quick Action</span>
            </div>
          </div>
        </nav>
        <main className="dashboard-main">
          <div style={{
            background: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>❌</div>
            <h2 style={{ color: '#991b1b', marginBottom: '10px' }}>Error</h2>
            <p style={{ color: '#991b1b', marginBottom: '20px' }}>{error}</p>
            <button onClick={() => navigate('/')} className="action-btn secondary">
              Go to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (actionSuccess) {
    return (
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <div className="dashboard-nav-content">
            <div className="dashboard-logo">
              <h1>Rwanda Visa Portal</h1>
              <span>Quick Action</span>
            </div>
          </div>
        </nav>
        <main className="dashboard-main">
          <div style={{
            background: '#d1fae5',
            border: '2px solid #10b981',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✓</div>
            <h2 style={{ color: '#065f46', marginBottom: '10px' }}>Action Completed</h2>
            <p style={{ color: '#065f46', marginBottom: '10px' }}>{success || 'The application has been processed successfully.'}</p>
            <p style={{ color: '#6b7280' }}>Redirecting to dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Top Navigation */}
      <nav className="dashboard-nav">
        <div className="dashboard-nav-content">
          <div className="dashboard-logo">
            <h1>Rwanda Visa Portal</h1>
            <span>Immigration Officer Quick Action</span>
          </div>
          {user && (
            <div className="dashboard-user-info">
              <div className="user-profile">
                <div className="user-avatar">{getUserInitials()}</div>
                <div className="user-details">
                  <div className="user-name">{user.firstName} {user.lastName}</div>
                  <div className="user-role">{user.role}</div>
                </div>
              </div>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h2>Quick Action - Application Review</h2>
          <p>Reference Number: <strong style={{ color: '#004892' }}>{refNumber}</strong></p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '15px 20px',
            marginBottom: '20px',
            color: '#991b1b'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && !actionSuccess && (
          <div style={{
            background: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '15px 20px',
            marginBottom: '20px',
            color: '#065f46'
          }}>
            <strong>Success:</strong> {success}
          </div>
        )}

        {/* Application Details */}
        {application && (
          <>
            {/* Applicant Information */}
            <div className="dashboard-card">
              <h3 style={{
                color: '#004892',
                marginBottom: '20px',
                fontSize: '1.3rem',
                borderBottom: '2px solid #CFE3F7',
                paddingBottom: '10px'
              }}>
                👤 Applicant Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>Full Name</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>
                    {application.firstName} {application.lastName}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>Nationality</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>{application.nationality}</div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>Passport Number</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', fontFamily: 'monospace' }}>
                    {application.passportNumber}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>Date of Birth</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>
                    {new Date(application.dateOfBirth).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>Email</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>{application.email}</div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>Contact Number</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>{application.contactNumber}</div>
                </div>
              </div>
            </div>

            {/* Travel Information */}
            <div className="dashboard-card">
              <h3 style={{
                color: '#004892',
                marginBottom: '20px',
                fontSize: '1.3rem',
                borderBottom: '2px solid #CFE3F7',
                paddingBottom: '10px'
              }}>
                ✈️ Travel Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>Arrival Date</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>
                    {new Date(application.arrivalDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>Departure Date</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>
                    {new Date(application.expectedDepartureDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>Purpose of Visit</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>{application.purposeOfVisit}</div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '5px' }}>Accommodation</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>{application.accommodationAddress}</div>
                </div>
              </div>
            </div>

            {/* Application Status */}
            <div className="dashboard-card">
              <h3 style={{
                color: '#004892',
                marginBottom: '20px',
                fontSize: '1.3rem',
                borderBottom: '2px solid #CFE3F7',
                paddingBottom: '10px'
              }}>
                📋 Application Status
              </h3>
              <div style={{ marginBottom: '15px' }}>
                <span style={getStatusBadgeStyle(application.applicationStatus)}>
                  {application.applicationStatus}
                </span>
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                Submitted: {new Date(application.applicationDate).toLocaleString()}
              </div>
            </div>

            {/* Authentication Warning */}
            {!token && (
              <div style={{
                background: '#fef3c7',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <p style={{ color: '#92400e', marginBottom: '15px', fontSize: '1.1rem' }}>
                  ⚠️ You must be logged in as an officer to take action on this application.
                </p>
                <button onClick={() => navigate('/login')} className="action-btn">
                  Login
                </button>
              </div>
            )}

            {/* Action Buttons for Pending Applications */}
            {token && (user?.role === 'Officer' || user?.role === 'Admin') && application.applicationStatus?.toLowerCase() === 'pending' && (
              <div className="dashboard-card">
                {!showRejectForm && !showApproveModal ? (
                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setShowApproveModal(true)}
                      className="action-btn"
                      disabled={actionLoading}
                      style={{
                        background: '#10b981',
                        padding: '14px 40px',
                        fontSize: '1rem',
                        minWidth: '200px'
                      }}
                    >
                      ✓ Approve Application
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="action-btn"
                      disabled={actionLoading}
                      style={{
                        background: '#ef4444',
                        padding: '14px 40px',
                        fontSize: '1rem',
                        minWidth: '200px'
                      }}
                    >
                      ✗ Reject Application
                    </button>
                  </div>
                ) : showApproveModal ? (
                  <div>
                    <h3 style={{ color: '#004892', marginBottom: '20px', fontSize: '1.2rem' }}>Approve Application</h3>
                    <div style={{
                      background: '#f0f9ff',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '20px'
                    }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={recordArrivalOnApprove}
                          onChange={(e) => setRecordArrivalOnApprove(e.target.checked)}
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '1rem', color: '#1f2937' }}>
                          Record arrival immediately (traveler is at the airport)
                        </span>
                      </label>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={handleApprove}
                        className="action-btn"
                        disabled={actionLoading}
                        style={{
                          background: '#10b981',
                          padding: '14px 40px',
                          fontSize: '1rem'
                        }}
                      >
                        {actionLoading ? 'Processing...' : 'Confirm Approval'}
                      </button>
                      <button
                        onClick={() => {
                          setShowApproveModal(false);
                          setRecordArrivalOnApprove(false);
                        }}
                        className="action-btn secondary"
                        disabled={actionLoading}
                        style={{
                          padding: '14px 40px',
                          fontSize: '1rem'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 style={{ color: '#004892', marginBottom: '20px', fontSize: '1.2rem' }}>Rejection Reason</h3>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a detailed reason for rejection..."
                      rows="5"
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '1rem',
                        border: '2px solid #CFE3F7',
                        borderRadius: '8px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        marginBottom: '20px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={handleReject}
                        className="action-btn"
                        disabled={actionLoading || !rejectionReason.trim()}
                        style={{
                          background: actionLoading || !rejectionReason.trim() ? '#9ca3af' : '#ef4444',
                          padding: '14px 40px',
                          fontSize: '1rem',
                          cursor: actionLoading || !rejectionReason.trim() ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                      </button>
                      <button
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectionReason('');
                        }}
                        className="action-btn secondary"
                        disabled={actionLoading}
                        style={{
                          padding: '14px 40px',
                          fontSize: '1rem'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Role Warning */}
            {token && user?.role !== 'Officer' && user?.role !== 'Admin' && (
              <div style={{
                background: '#fef3c7',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#92400e', fontSize: '1.1rem' }}>
                  ⚠️ Only officers and administrators can take action on applications.
                </p>
              </div>
            )}

            {/* Already Processed Status */}
            {application.applicationStatus?.toLowerCase() !== 'pending' && (
              <div style={{
                background: application.applicationStatus?.toLowerCase() === 'approved' ? '#d1fae5' : '#fee2e2',
                border: `2px solid ${application.applicationStatus?.toLowerCase() === 'approved' ? '#10b981' : '#ef4444'}`,
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>
                  {application.applicationStatus?.toLowerCase() === 'approved' ? '✓' : '✗'}
                </div>
                <p style={{
                  color: application.applicationStatus?.toLowerCase() === 'approved' ? '#065f46' : '#991b1b',
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}>
                  This application has already been {application.applicationStatus?.toLowerCase()}.
                </p>
              </div>
            )}

            {/* Footer Navigation */}
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              marginTop: '30px',
              flexWrap: 'wrap'
            }}>
              <button onClick={() => navigate('/')} className="action-btn secondary">
                ← Back to Home
              </button>
              {token && (
                <button
                  onClick={() => navigate(user?.role === 'Admin' ? '/admin/dashboard' : '/officer/dashboard')}
                  className="action-btn secondary"
                >
                  Go to Dashboard
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default QuickAction;
