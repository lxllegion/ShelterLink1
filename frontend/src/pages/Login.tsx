import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import AuthNavBar from '../components/AuthNavBar';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      
      // Store userId in localStorage for API calls
      localStorage.setItem('userId', userId);
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFF5EE' }}>
      {/* Navigation Bar */}
      <AuthNavBar />

      {/* Login Form */}
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: '96px 32px'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '48px',
          color: '#8B4513'
        }}>
          Welcome Back
        </h1>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #FFB366',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #FFB366',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#CC2900', fontSize: '14px' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#FF6B35',
              color: 'white',
              padding: '16px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(255, 107, 53, 0.3)'
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#E85A2A')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = '#FF6B35')}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <p style={{ textAlign: 'center', color: '#A0522D' }}>
            Don't have an account?{' '}
            <a href="/register" style={{ textDecoration: 'underline', color: '#FF6B35', fontWeight: 'bold' }}>
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;