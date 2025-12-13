import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncSelect from 'react-select/async';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://visaonarrival-c6fec5dtfwb2hwcc.southafricanorth-01.azurewebsites.net/api';

const VisaApplicationForm = () => {
  const { token, user } = useAuth() || {};

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    contactNumber: '',
    dateOfBirth: '',
    passportNumber: '',
    nationality: '',
    arrivalDate: getTodayDate(),
    expectedDepartureDate: getTodayDate(),
    purposeOfVisit: '',
    accommodationAddress: ''
  });

  // Update email when user logs in
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user]);

  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Fetch countries with search query
  const fetchCountries = async (searchQuery = '') => {
    setLoadingCountries(true);
    try {
      const params = {
        activeOnly: true,
        pageSize: searchQuery ? 50 : 20
      };
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response = await axios.get(`${API_URL}/Countries`, { params });
      // Extract countries from paginated response
      return (response.data.data || []).map(country => ({
        value: country.name,
        label: country.name
      }));
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    } finally {
      setLoadingCountries(false);
    }
  };

  // Load initial countries
  useEffect(() => {
    fetchCountries().then(setCountries);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{12}$/.test(formData.contactNumber.replace(/\s/g, ''))) {
      newErrors.contactNumber = 'Contact number must be exactly 12 digits';
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.passportNumber.trim()) newErrors.passportNumber = 'Passport number is required';
    if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
    if (!formData.arrivalDate) newErrors.arrivalDate = 'Arrival date is required';
    if (!formData.expectedDepartureDate) newErrors.expectedDepartureDate = 'Departure date is required';
    if (!formData.purposeOfVisit.trim()) newErrors.purposeOfVisit = 'Purpose of visit is required';
    if (!formData.accommodationAddress.trim()) newErrors.accommodationAddress = 'Accommodation address is required';

    // Date validations
    if (formData.arrivalDate && formData.expectedDepartureDate) {
      const arrival = new Date(formData.arrivalDate);
      const departure = new Date(formData.expectedDepartureDate);
      if (departure <= arrival) {
        newErrors.expectedDepartureDate = 'Departure date must be after arrival date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting application to:', process.env.REACT_APP_API_URL || 'http://localhost:7127/api');
      console.log('Form data:', formData);

      // Convert dates to ISO format for the API
      const submitData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        arrivalDate: formData.arrivalDate ? new Date(formData.arrivalDate).toISOString() : null,
        expectedDepartureDate: formData.expectedDepartureDate ? new Date(formData.expectedDepartureDate).toISOString() : null,
      };

      console.log('Converted data:', submitData);

      // Prepare headers - include Authorization if user is authenticated
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Including auth token in request');
      }

      const response = await axios.post(`${API_URL}/VisaApplications`, submitData, { headers });
      console.log('Response:', response);

      setReferenceNumber(response.data.referenceNumber);
      setSubmitSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        dateOfBirth: '',
        passportNumber: '',
        nationality: '',
        arrivalDate: '',
        expectedDepartureDate: '',
        purposeOfVisit: '',
        accommodationAddress: ''
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);

      let errorMessage = 'An error occurred while submitting your application. Please try again.';

      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to the server. Please ensure the backend API is running.';
      } else if (error.response) {
        // Server responded with error
        const responseData = error.response.data;
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData?.error) {
          // Handle {error: "message"} format from API
          errorMessage = responseData.error;
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        } else {
          errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'No response from server. Please check if the backend is running.';
      }

      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {submitSuccess && (
        <div className="success-alert">
          <h3>✓ Application Submitted Successfully!</h3>
          <p>Your visa application has been received. Please save your reference number:</p>
          <div className="reference-number">{referenceNumber}</div>
          <p>
            <small>Present this reference number to the immigration officer upon arrival at Kigali International Airport.</small>
          </p>
        </div>
      )}

      {submitError && (
        <div className="error-alert">
          <strong>Error:</strong> {submitError}
        </div>
      )}

      <div className="info-card">
        <h5>About Rwanda Visa On Arrival</h5>
        <p>
          Rwanda offers visa on arrival for eligible travelers from all countries. Simply complete your pre-registration
          online before traveling to expedite your entry process at the airport.
        </p>
      </div>

      <div className="benefits-section">
        <div className="benefit-item">
          <span className="benefit-icon">✓</span>
          <div>
            <strong>Fast Processing</strong><br />
            <small>Pre-registration speeds up immigration clearance</small>
          </div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">✓</span>
          <div>
            <strong>30 Days Validity</strong><br />
            <small>Stay up to 30 days for tourism or business</small>
          </div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">✓</span>
          <div>
            <strong>USD $50 Fee</strong><br />
            <small>Payable at the airport upon arrival</small>
          </div>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">✓</span>
          <div>
            <strong>All Nationalities</strong><br />
            <small>Available to travelers from all countries</small>
          </div>
        </div>
      </div>

      <div className="form-card">
        <div className="form-header">
          <h3>Visa On Arrival Application</h3>
          <p>Please fill in all required information</p>
        </div>
        <div className="form-body">
          <form onSubmit={handleSubmit}>
            <h5 className="form-section-title">Personal Information</h5>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className={`form-control ${errors.firstName ? 'error' : ''}`}
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className={`form-control ${errors.lastName ? 'error' : ''}`}
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Contact Number *</label>
                <input
                  type="tel"
                  name="contactNumber"
                  className={`form-control ${errors.contactNumber ? 'error' : ''}`}
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter 12-digit phone number"
                  maxLength="12"
                />
                {errors.contactNumber && <span className="error-message">{errors.contactNumber}</span>}
                <small style={{ color: '#6b7280', fontSize: '0.85rem' }}>Must be 12 numeric digits</small>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                className={`form-control ${errors.dateOfBirth ? 'error' : ''}`}
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
            </div>

            <h5 className="form-section-title">Travel Document</h5>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Passport Number *</label>
                <input
                  type="text"
                  name="passportNumber"
                  className={`form-control ${errors.passportNumber ? 'error' : ''}`}
                  value={formData.passportNumber}
                  onChange={handleChange}
                />
                {errors.passportNumber && <span className="error-message">{errors.passportNumber}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Nationality *</label>
                <AsyncSelect
                  name="nationality"
                  cacheOptions
                  defaultOptions={countries}
                  loadOptions={fetchCountries}
                  value={formData.nationality ? { value: formData.nationality, label: formData.nationality } : null}
                  onChange={(selectedOption) => {
                    setFormData(prev => ({
                      ...prev,
                      nationality: selectedOption ? selectedOption.value : ''
                    }));
                    if (errors.nationality) {
                      setErrors(prev => ({
                        ...prev,
                        nationality: ''
                      }));
                    }
                  }}
                  placeholder="Type to search for your nationality..."
                  isClearable
                  noOptionsMessage={({ inputValue }) =>
                    inputValue ? `No countries found matching "${inputValue}"` : 'Start typing to search countries'
                  }
                  loadingMessage={() => 'Searching countries...'}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: errors.nationality ? '#ef4444' : (state.isFocused ? '#004892' : '#CFE3F7'),
                      borderWidth: '2px',
                      boxShadow: state.isFocused ? '0 0 0 1px #004892' : 'none',
                      '&:hover': {
                        borderColor: '#004892'
                      },
                      minHeight: '48px',
                      fontSize: '1rem'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#004892' : state.isFocused ? '#CFE3F7' : 'white',
                      color: state.isSelected ? 'white' : '#333',
                      cursor: 'pointer',
                      padding: '10px 12px'
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999
                    })
                  }}
                />
                {errors.nationality && <span className="error-message">{errors.nationality}</span>}
                <small style={{ color: '#6b7280', fontSize: '0.85rem' }}>Type to search from all available countries</small>
              </div>
            </div>

            <h5 className="form-section-title">Travel Details</h5>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Expected Arrival Date *</label>
                <input
                  type="date"
                  name="arrivalDate"
                  className={`form-control ${errors.arrivalDate ? 'error' : ''}`}
                  value={formData.arrivalDate}
                  onChange={handleChange}
                  min={getTodayDate()}
                />
                {errors.arrivalDate && <span className="error-message">{errors.arrivalDate}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Expected Departure Date *</label>
                <input
                  type="date"
                  name="expectedDepartureDate"
                  className={`form-control ${errors.expectedDepartureDate ? 'error' : ''}`}
                  value={formData.expectedDepartureDate}
                  onChange={handleChange}
                  min={getTodayDate()}
                />
                {errors.expectedDepartureDate && <span className="error-message">{errors.expectedDepartureDate}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Purpose of Visit *</label>
              <textarea
                name="purposeOfVisit"
                className={`form-control ${errors.purposeOfVisit ? 'error' : ''}`}
                rows="3"
                placeholder="e.g., Tourism, Business, Conference, Family Visit"
                value={formData.purposeOfVisit}
                onChange={handleChange}
              />
              {errors.purposeOfVisit && <span className="error-message">{errors.purposeOfVisit}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Accommodation Address in Rwanda *</label>
              <textarea
                name="accommodationAddress"
                className={`form-control ${errors.accommodationAddress ? 'error' : ''}`}
                rows="3"
                placeholder="Hotel name and address or host address"
                value={formData.accommodationAddress}
                onChange={handleChange}
              />
              {errors.accommodationAddress && <span className="error-message">{errors.accommodationAddress}</span>}
            </div>

            <button type="submit" className="btn-rwanda" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>

            <p className="form-footer">
              By submitting this form, you agree to provide accurate information for visa processing.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VisaApplicationForm;
