import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://visaonarrival-c6fec5dtfwb2hwcc.southafricanorth-01.azurewebsites.net/api';

const VerifyVisa = () => {
  const { refNumber } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(refNumber || '');
  const [visaData, setVisaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (refNumber) {
      handleVerify(refNumber);
    }
  }, [refNumber]);

  const handleVerify = async (reference = searchTerm) => {
    if (!reference.trim()) {
      setError('Please enter a reference number');
      return;
    }

    setLoading(true);
    setError('');
    setVisaData(null);
    setSearched(true);

    try {
      const response = await axios.get(`${API_URL}/VisaApplications/verify/${reference}`);
      setVisaData(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No visa application found with this reference number');
      } else {
        setError(err.response?.data?.message || 'Failed to verify visa');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!visaData || !visaData.found) return '#6b7280';

    if (visaData.isValid && visaData.validityStatus === 'Valid') {
      return '#10b981'; // Green
    } else if (visaData.validityStatus === 'Not Yet Active') {
      return '#f59e0b'; // Orange
    } else if (visaData.validityStatus === 'Expired') {
      return '#ef4444'; // Red
    } else if (visaData.validityStatus === 'Departed - No Longer Valid') {
      return '#9ca3af'; // Gray
    } else if (visaData.validityStatus === 'Pending Approval') {
      return '#fbbf24'; // Yellow
    } else if (visaData.validityStatus === 'Rejected') {
      return '#dc2626'; // Dark Red
    }
    return '#6b7280'; // Gray
  };

  const getStatusIcon = () => {
    if (!visaData || !visaData.found) return '❌';

    if (visaData.isValid && visaData.validityStatus === 'Valid') {
      return '✅';
    } else if (visaData.validityStatus === 'Not Yet Active') {
      return '🕐';
    } else if (visaData.validityStatus === 'Expired') {
      return '⛔';
    } else if (visaData.validityStatus === 'Departed - No Longer Valid') {
      return '✈️';
    } else if (visaData.validityStatus === 'Pending Approval') {
      return '⏳';
    } else if (visaData.validityStatus === 'Rejected') {
      return '❌';
    }
    return '❓';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #00A1DE 0%, #20603D 100%)',
      padding: '20px'
    }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', marginTop: '50px' }}>
        <div className="form-card">
          <div className="form-header" style={{ textAlign: 'center' }}>
            <h2>Rwanda Visa Verification</h2>
            <p>Verify the authenticity and validity of a Rwanda visa</p>
          </div>

          <div className="form-body">
            {/* Search Section */}
            {!refNumber && (
              <div style={{ marginBottom: '30px' }}>
                <label className="form-label">Enter Reference Number</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., RW24347123"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                    style={{ flex: 1, textTransform: 'uppercase' }}
                  />
                  <button
                    onClick={() => handleVerify()}
                    className="btn-rwanda"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="error-alert" style={{ marginBottom: '20px' }}>
                {error}
              </div>
            )}

            {/* Verification Result */}
            {searched && visaData && visaData.found && (
              <div>
                {/* Status Banner */}
                <div style={{
                  backgroundColor: getStatusColor(),
                  color: 'white',
                  padding: '30px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  marginBottom: '30px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                    {getStatusIcon()}
                  </div>
                  <h2 style={{ margin: '10px 0', fontSize: '28px' }}>
                    {visaData.validityStatus}
                  </h2>
                  <p style={{ fontSize: '16px', opacity: 0.9 }}>
                    Reference Number: {visaData.referenceNumber}
                  </p>
                </div>

                {/* Visa Details */}
                <div className="info-card" style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#1a56db', marginBottom: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
                    Visa Holder Information
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <strong style={{ color: '#6b7280', fontSize: '14px' }}>Full Name</strong>
                      <p style={{ margin: '5px 0', fontSize: '16px' }}>
                        {visaData.firstName} {visaData.lastName}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: '#6b7280', fontSize: '14px' }}>Nationality</strong>
                      <p style={{ margin: '5px 0', fontSize: '16px' }}>{visaData.nationality}</p>
                    </div>
                    <div>
                      <strong style={{ color: '#6b7280', fontSize: '14px' }}>Passport Number</strong>
                      <p style={{ margin: '5px 0', fontSize: '16px' }}>{visaData.passportNumber}</p>
                    </div>
                    <div>
                      <strong style={{ color: '#6b7280', fontSize: '14px' }}>Application Status</strong>
                      <p style={{ margin: '5px 0', fontSize: '16px' }}>{visaData.applicationStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Validity Period */}
                <div className="info-card" style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#1a56db', marginBottom: '15px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
                    Validity Period
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <strong style={{ color: '#6b7280', fontSize: '14px' }}>Valid From</strong>
                      <p style={{ margin: '5px 0', fontSize: '16px' }}>
                        {new Date(visaData.arrivalDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: '#6b7280', fontSize: '14px' }}>Valid Until</strong>
                      <p style={{ margin: '5px 0', fontSize: '16px' }}>
                        {new Date(visaData.expectedDepartureDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <strong style={{ color: '#6b7280', fontSize: '14px' }}>Purpose of Visit</strong>
                      <p style={{ margin: '5px 0', fontSize: '16px' }}>{visaData.purposeOfVisit}</p>
                    </div>
                    <div>
                      <strong style={{ color: '#6b7280', fontSize: '14px' }}>Travel Status</strong>
                      <p style={{ margin: '5px 0', fontSize: '16px' }}>
                        {visaData.hasDeparted ? 'Departed' : visaData.hasArrived ? 'In Rwanda' : 'Not Yet Arrived'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div style={{
                  backgroundColor: '#f3f4f6',
                  padding: '15px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #1a56db'
                }}>
                  <p style={{ margin: '0', fontSize: '14px', color: '#4b5563' }}>
                    <strong>Note:</strong> This is an official verification from the Republic of Rwanda Immigration Services.
                    Always verify the visa document against the information provided in this verification.
                  </p>
                </div>
              </div>
            )}

            {/* Not Found Message */}
            {searched && !loading && !visaData?.found && !error && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
                <h3>No Results Found</h3>
                <p>Please check the reference number and try again</p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setVisaData(null);
                  setError('');
                  setSearched(false);
                  navigate('/verify');
                }}
                className="btn-rwanda"
              >
                Verify Another
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn-rwanda"
                style={{ backgroundColor: '#6b7280' }}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyVisa;
