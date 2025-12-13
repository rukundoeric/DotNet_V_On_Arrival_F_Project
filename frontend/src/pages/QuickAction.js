import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './QuickAction.css';

const QuickAction = () => {
  const { refNumber } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

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

    if (window.confirm('Are you sure you want to approve this application?')) {
      try {
        setActionLoading(true);
        await axios.put(
          `${API_URL}/VisaApplications/${application.id}/approve`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setActionSuccess(true);
        setTimeout(() => {
          navigate('/officer/dashboard');
        }, 2000);
      } catch (err) {
        console.error('Error approving application:', err);
        alert(err.response?.data?.error || 'Failed to approve application');
      } finally {
        setActionLoading(false);
      }
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

    if (window.confirm('Are you sure you want to reject this application?')) {
      try {
        setActionLoading(true);
        await axios.put(
          `${API_URL}/VisaApplications/${application.id}/reject`,
          { reason: rejectionReason },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setActionSuccess(true);
        setTimeout(() => {
          navigate('/officer/dashboard');
        }, 2000);
      } catch (err) {
        console.error('Error rejecting application:', err);
        alert(err.response?.data?.error || 'Failed to reject application');
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="quick-action-container">
        <div className="loading">Loading application...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quick-action-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="quick-action-container">
        <div className="error-message">
          <h2>Application Not Found</h2>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (actionSuccess) {
    return (
      <div className="quick-action-container">
        <div className="success-message">
          <h2>✓ Action Completed</h2>
          <p>The application has been processed successfully.</p>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quick-action-container">
      <div className="quick-action-header">
        <h1>Immigration Officer Quick Action</h1>
        <p className="ref-number">Reference: {refNumber}</p>
      </div>

      <div className="application-details">
        <div className="detail-section">
          <h2>Applicant Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Name:</label>
              <span>{application.firstName} {application.lastName}</span>
            </div>
            <div className="detail-item">
              <label>Nationality:</label>
              <span>{application.nationality}</span>
            </div>
            <div className="detail-item">
              <label>Passport Number:</label>
              <span>{application.passportNumber}</span>
            </div>
            <div className="detail-item">
              <label>Date of Birth:</label>
              <span>{new Date(application.dateOfBirth).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <label>Email:</label>
              <span>{application.email}</span>
            </div>
            <div className="detail-item">
              <label>Contact:</label>
              <span>{application.contactNumber}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Travel Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Arrival Date:</label>
              <span>{new Date(application.arrivalDate).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <label>Departure Date:</label>
              <span>{new Date(application.expectedDepartureDate).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <label>Purpose:</label>
              <span>{application.purposeOfVisit}</span>
            </div>
            <div className="detail-item">
              <label>Accommodation:</label>
              <span>{application.accommodationAddress}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h2>Application Status</h2>
          <div className="status-badge status-{application.status?.toLowerCase()}">
            {application.status}
          </div>
          <p className="submission-date">
            Submitted: {new Date(application.applicationDate).toLocaleString()}
          </p>
        </div>
      </div>

      {!token && (
        <div className="auth-warning">
          <p>⚠️ You must be logged in as an officer to take action on this application.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Login
          </button>
        </div>
      )}

      {token && user?.role === 'Officer' && application.status === 'Pending' && (
        <div className="action-buttons">
          {!showRejectForm ? (
            <>
              <button
                onClick={handleApprove}
                className="btn-approve"
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : '✓ Approve Application'}
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                className="btn-reject"
                disabled={actionLoading}
              >
                ✗ Reject Application
              </button>
            </>
          ) : (
            <div className="reject-form">
              <h3>Rejection Reason</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a detailed reason for rejection..."
                rows="4"
                className="rejection-textarea"
              />
              <div className="reject-form-buttons">
                <button
                  onClick={handleReject}
                  className="btn-reject"
                  disabled={actionLoading || !rejectionReason.trim()}
                >
                  {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                </button>
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason('');
                  }}
                  className="btn-secondary"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {token && user?.role !== 'Officer' && (
        <div className="auth-warning">
          <p>⚠️ Only officers can take action on applications.</p>
        </div>
      )}

      {application.status !== 'Pending' && (
        <div className="status-info">
          <p>This application has already been processed.</p>
          {application.status === 'Approved' && (
            <p className="status-approved">✓ Application was approved</p>
          )}
          {application.status === 'Rejected' && (
            <p className="status-rejected">✗ Application was rejected</p>
          )}
        </div>
      )}

      <div className="action-footer">
        <button onClick={() => navigate('/')} className="btn-secondary">
          ← Back to Home
        </button>
        {token && (
          <button onClick={() => navigate('/officer/dashboard')} className="btn-secondary">
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickAction;
