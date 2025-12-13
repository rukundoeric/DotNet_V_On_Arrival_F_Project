import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import VisaApplicationForm from './components/VisaApplicationForm';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import UserDashboard from './pages/UserDashboard';
import ManageCountries from './pages/ManageCountries';
import ManageUsers from './pages/ManageUsers';
import ManageApplications from './pages/ManageApplications';
import ArrivalsExits from './pages/ArrivalsExits';
import VerifyVisa from './pages/VerifyVisa';
import QuickAction from './pages/QuickAction';
import Reports from './pages/Reports';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'Officer') return <Navigate to="/officer/dashboard" replace />;
    if (user?.role === 'User') return <Navigate to="/user/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Home page component
const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  // Auto-redirect admins and officers to their dashboards
  React.useEffect(() => {
    if (isAuthenticated && user?.role) {
      if (user.role === 'Admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'Officer') {
        navigate('/officer/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDashboard = () => {
    if (user?.role === 'Admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'Officer') {
      navigate('/officer/dashboard');
    } else if (user?.role === 'User') {
      navigate('/user/dashboard');
    }
  };

  return (
    <div className="App">
      <div className="hero-section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px', gap: '12px' }}>
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-rwanda"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#fff',
                    border: '2px solid #fff',
                    padding: '10px 25px',
                    width: 'auto',
                    marginTop: 0,
                    boxShadow: 'none'
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="btn-rwanda"
                  style={{
                    backgroundColor: '#fff',
                    color: '#004892',
                    border: '2px solid #fff',
                    padding: '10px 25px',
                    width: 'auto',
                    marginTop: 0
                  }}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <span style={{
                  color: '#fff',
                  alignSelf: 'center',
                  marginRight: '10px',
                  fontSize: '1.05rem',
                  fontWeight: '500'
                }}>
                  Welcome, {user?.firstName}!
                </span>
                <button
                  onClick={handleDashboard}
                  className="btn-rwanda"
                  style={{
                    backgroundColor: '#fff',
                    color: '#004892',
                    border: '2px solid #fff',
                    padding: '10px 25px',
                    width: 'auto',
                    marginTop: 0
                  }}
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-rwanda"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#fff',
                    border: '2px solid #fff',
                    padding: '10px 25px',
                    width: 'auto',
                    marginTop: 0,
                    boxShadow: 'none'
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
          <h1 className="hero-title">Welcome to Rwanda</h1>
          <p className="hero-subtitle">Land of a Thousand Hills | Visa On Arrival Portal</p>
        </div>
      </div>
      <VisaApplicationForm />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<VerifyVisa />} />
          <Route path="/verify/:refNumber" element={<VerifyVisa />} />
          <Route path="/officer/quick-action/:refNumber" element={<QuickAction />} />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/countries"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ManageCountries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/reports"
            element={
              <ProtectedRoute allowedRoles={['Officer', 'Admin']}>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Officer */}
          <Route
            path="/officer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Officer']}>
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/applications"
            element={
              <ProtectedRoute allowedRoles={['Officer', 'Admin']}>
                <ManageApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/arrivals-exits"
            element={
              <ProtectedRoute allowedRoles={['Officer', 'Admin']}>
                <ArrivalsExits />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - User */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={['User']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
