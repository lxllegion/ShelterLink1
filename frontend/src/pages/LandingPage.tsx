import React from 'react';
import { Link } from 'react-router-dom';
import AuthNavBar from '../components/AuthNavBar';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFF5EE' }}>
      {/* Navigation Bar */}
      <AuthNavBar />

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#8B4513', marginBottom: '1.5rem' }}>
            Connecting People with Shelter Resources
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#A0522D', marginBottom: '2rem', maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto' }}>
            ShelterLink helps connect individuals and families in need with available shelter resources,
            making it easier to find safe housing and support services.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#FF6B35',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px rgba(255, 107, 53, 0.3)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E85A2A'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FF6B35'}
            >
              Get Started
            </Link>
            <Link
              to="/login"
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: 'white',
                color: '#FF6B35',
                border: '2px solid #FF6B35',
                borderRadius: '8px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#FF6B35';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#FF6B35';
              }}
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div style={{
            textAlign: 'center',
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px solid #FFB366',
            boxShadow: '0 4px 6px rgba(255, 107, 53, 0.1)'
          }}>
            <div className="text-4xl mb-4">🏠</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#8B4513', marginBottom: '0.5rem' }}>
              Shelter Management
            </h3>
            <p style={{ color: '#A0522D' }}>
              Manage shelter listings and track availability in real-time
            </p>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px solid #FFB366',
            boxShadow: '0 4px 6px rgba(255, 107, 53, 0.1)'
          }}>
            <div className="text-4xl mb-4">📊</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#8B4513', marginBottom: '0.5rem' }}>
              Resource Tracking
            </h3>
            <p style={{ color: '#A0522D' }}>
              Monitor capacity and resources to help those in need
            </p>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px solid #FFB366',
            boxShadow: '0 4px 6px rgba(255, 107, 53, 0.1)'
          }}>
            <div className="text-4xl mb-4">🤝</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#8B4513', marginBottom: '0.5rem' }}>
              Community Support
            </h3>
            <p style={{ color: '#A0522D' }}>
              Connect with local organizations and support services
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}