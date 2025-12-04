import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthNavBar from '../components/AuthNavBar';
import { register } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const [userType, setUserType] = useState<'donor' | 'shelter'>('donor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [shelterName, setShelterName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { fetchUserInfo } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await register({
        email,
        password,
        confirmPassword,
        name,
        userName,
        phoneNumber,
        userType,
        shelterName,
      });

      if (result.success && result.userId) {
        // Fetch user info before navigating to dashboard
        await fetchUserInfo(result.userId);
        navigate('/dashboard');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      {/* Navigation Bar */}
      <AuthNavBar />

      {/* Sign Up Content */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '64px 32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '16px'
          }}>
            Create Account
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>
            Choose how you want to make an impact
          </p>
        </div>

        {/* User Type Selection */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '48px'
        }}>
          {/* Donor Card */}
          <button
            onClick={() => setUserType('donor')}
            style={{
              padding: '32px',
              border: userType === 'donor' ? '3px solid black' : '2px solid #e5e7eb',
              borderRadius: '16px',
              backgroundColor: userType === 'donor' ? '#fef2f2' : 'white',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>❤️</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              I'm a Donor
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              I want to donate items to shelters
            </p>
          </button>

          {/* Shelter Card */}
          <button
            onClick={() => setUserType('shelter')}
            style={{
              padding: '32px',
              border: userType === 'shelter' ? '3px solid black' : '2px solid #e5e7eb',
              borderRadius: '16px',
              backgroundColor: userType === 'shelter' ? '#eff6ff' : 'white',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏠</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              I'm a Shelter
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              I represent a homeless shelter
            </p>
          </button>
        </div>

        {/* Form (only shows after user type is selected) */}
        {userType && (
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>
              Complete Your Profile
            </h3>

            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {userType === 'donor' && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    placeholder="Choose a unique username"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {userType === 'shelter' && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                    Shelter Name
                  </label>
                  <input
                    type="text"
                    value={shelterName}
                    onChange={(e) => setShelterName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  placeholder="(123) 456-7890"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {error && (
                <p style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: 'black',
                  color: 'white',
                  padding: '16px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  marginTop: '8px'
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '8px' }}>
                Already have an account?{' '}
                <a href="/login" style={{ textDecoration: 'underline', color: 'black', fontWeight: 'bold' }}>
                  Log in
                </a>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
    