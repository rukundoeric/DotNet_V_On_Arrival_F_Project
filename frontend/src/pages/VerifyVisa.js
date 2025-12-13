import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

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
      return '#10b981';
    } else if (visaData.validityStatus === 'Not Yet Active') {
      return '#f59e0b';
    } else if (visaData.validityStatus === 'Expired') {
      return '#ef4444';
    } else if (visaData.validityStatus === 'Departed - No Longer Valid') {
      return '#9ca3af';
    } else if (visaData.validityStatus === 'Pending Approval') {
      return '#fbbf24';
    } else if (visaData.validityStatus === 'Rejected') {
      return '#dc2626';
    }
    return '#6b7280';
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
    <div className="dashboard-container">
      {/* Top Navigation */}
      <nav className="dashboard-nav">
        <div className="dashboard-nav-content">
          <div className="dashboard-logo">
            <h1>Rwanda Visa Portal</h1>
            <span>Visa Verification</span>
          </div>
          <div className="dashboard-user-info">
            <button onClick={() => navigate('/')} className="logout-btn">
              ← Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h2>Verify Rwanda Visa</h2>
          <p>Check the authenticity and validity of a Rwanda visa on arrival</p>
        </div>

        {/* Search Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: 'clamp(20px, 4vw, 30px)',
          boxShadow: '0 2px 10px rgba(0, 72, 146, 0.08)',
          border: '1px solid #CFE3F7',
          marginBottom: 'clamp(20px, 4vw, 30px)'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            color: '#004892',
            fontWeight: '600',
            fontSize: 'clamp(1rem, 2vw, 1.1rem)'
          }}>
            Enter Reference Number
          </label>
          <div style={{ display: 'flex', flexDirection: window.innerWidth < 640 ? 'column' : 'row', gap: '12px' }}>
            <input
              type="text"
              placeholder="e.g., RW24347123"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              style={{
                flex: 1,
                textTransform: 'uppercase',
                padding: '14px 16px',
                fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                border: '2px solid #CFE3F7',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.3s',
                width: '100%'
              }}
              onFocus={(e) => e.target.style.borderColor = '#004892'}
              onBlur={(e) => e.target.style.borderColor = '#CFE3F7'}
            />
            <button
              onClick={() => handleVerify()}
              disabled={loading}
              style={{
                padding: '14px 40px',
                backgroundColor: loading ? '#9ca3af' : '#004892',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: 'clamp(0.95rem, 2vw, 1rem)',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s',
                whiteSpace: 'nowrap',
                width: window.innerWidth < 640 ? '100%' : 'auto'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#003a75')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#004892')}
            >
              {loading ? 'Verifying...' : 'Verify Visa'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: 'clamp(12px 15px, 3vw, 15px 20px)',
            marginBottom: 'clamp(15px, 3vw, 20px)',
            color: '#991b1b',
            fontSize: 'clamp(0.9rem, 2vw, 1rem)'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ padding: 'clamp(40px, 8vw, 60px)', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: 'clamp(2.5rem, 6vw, 3rem)', marginBottom: '15px' }}>🔍</div>
            <p style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)' }}>Verifying visa...</p>
          </div>
        )}

        {/* Verification Result */}
        {searched && visaData && visaData.found && !loading && (
          <>
            {/* Status Banner */}
            <div style={{
              backgroundColor: getStatusColor(),
              color: 'white',
              padding: 'clamp(25px, 5vw, 40px)',
              borderRadius: '12px',
              textAlign: 'center',
              marginBottom: 'clamp(20px, 4vw, 30px)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
            }}>
              <div style={{ fontSize: 'clamp(48px, 10vw, 64px)', marginBottom: '15px' }}>
                {getStatusIcon()}
              </div>
              <h2 style={{ margin: '10px 0', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '700' }}>
                {visaData.validityStatus}
              </h2>
              <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', opacity: 0.95, marginTop: '10px' }}>
                Reference: <strong>{visaData.referenceNumber}</strong>
              </p>
            </div>

            {/* Visa Holder Information */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: 'clamp(20px, 4vw, 30px)',
              boxShadow: '0 2px 10px rgba(0, 72, 146, 0.08)',
              border: '1px solid #CFE3F7',
              marginBottom: 'clamp(20px, 3vw, 25px)'
            }}>
              <h3 style={{
                color: '#004892',
                marginBottom: 'clamp(15px, 3vw, 20px)',
                fontSize: 'clamp(1.2rem, 3vw, 1.4rem)',
                borderBottom: '2px solid #CFE3F7',
                paddingBottom: '12px'
              }}>
                👤 Visa Holder Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(15px, 3vw, 20px)' }}>
                <div>
                  <div style={{ color: '#6b7280', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', marginBottom: '5px' }}>Full Name</div>
                  <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', fontWeight: '600', color: '#1f2937', wordBreak: 'break-word' }}>
                    {visaData.firstName} {visaData.lastName}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', marginBottom: '5px' }}>Nationality</div>
                  <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', fontWeight: '600', color: '#1f2937' }}>{visaData.nationality}</div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', marginBottom: '5px' }}>Passport Number</div>
                  <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', fontWeight: '600', color: '#1f2937', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {visaData.passportNumber}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', marginBottom: '5px' }}>Application Status</div>
                  <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', fontWeight: '600', color: '#1f2937' }}>{visaData.applicationStatus}</div>
                </div>
              </div>
            </div>

            {/* Validity Period */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: 'clamp(20px, 4vw, 30px)',
              boxShadow: '0 2px 10px rgba(0, 72, 146, 0.08)',
              border: '1px solid #CFE3F7',
              marginBottom: 'clamp(20px, 3vw, 25px)'
            }}>
              <h3 style={{
                color: '#004892',
                marginBottom: 'clamp(15px, 3vw, 20px)',
                fontSize: 'clamp(1.2rem, 3vw, 1.4rem)',
                borderBottom: '2px solid #CFE3F7',
                paddingBottom: '12px'
              }}>
                📅 Validity Period
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(15px, 3vw, 20px)' }}>
                <div>
                  <div style={{ color: '#6b7280', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', marginBottom: '5px' }}>Valid From</div>
                  <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', fontWeight: '600', color: '#1f2937' }}>
                    {new Date(visaData.arrivalDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', marginBottom: '5px' }}>Valid Until</div>
                  <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', fontWeight: '600', color: '#1f2937' }}>
                    {new Date(visaData.expectedDepartureDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', marginBottom: '5px' }}>Purpose of Visit</div>
                  <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', fontWeight: '600', color: '#1f2937' }}>{visaData.purposeOfVisit}</div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', marginBottom: '5px' }}>Travel Status</div>
                  <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', fontWeight: '600', color: '#1f2937' }}>
                    {visaData.hasDeparted ? '✈️ Departed' : visaData.hasArrived ? '🇷🇼 In Rwanda' : '⏳ Not Yet Arrived'}
                  </div>
                </div>
              </div>
            </div>

            {/* Official Notice */}
            <div style={{
              background: '#f0f9ff',
              border: '2px solid #004892',
              borderRadius: '8px',
              padding: 'clamp(15px, 3vw, 20px)',
              display: 'flex',
              gap: '15px',
              alignItems: 'start',
              flexDirection: window.innerWidth < 640 ? 'column' : 'row'
            }}>
              <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>ℹ️</div>
              <div>
                <p style={{ margin: '0', color: '#1e40af', lineHeight: '1.6', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                  <strong>Official Verification:</strong> This information has been verified against the Republic of Rwanda Immigration Services database.
                  Always cross-check the visa document details with the information displayed here.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Not Found Message */}
        {searched && !loading && !visaData?.found && !error && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: 'clamp(40px 20px, 8vw, 60px 40px)',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0, 72, 146, 0.08)',
            border: '1px solid #CFE3F7'
          }}>
            <div style={{ fontSize: 'clamp(60px, 12vw, 80px)', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ color: '#004892', fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: '10px' }}>No Results Found</h3>
            <p style={{ color: '#6b7280', fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', wordBreak: 'break-word' }}>
              No visa application found with reference number: <strong>{searchTerm}</strong>
            </p>
            <p style={{ color: '#6b7280', marginTop: '10px', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Please check the reference number and try again</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default VerifyVisa;
