import React from 'react';
import { Link } from 'react-router-dom';
import AuthNavBar from '../components/AuthNavBar';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      {/* Navigation Bar */}
      <AuthNavBar />

      {/* Hero Section */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ maxWidth: '896px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            marginBottom: '24px' 
          }}>
            Connecting People with Shelter Resources
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: '#4b5563',
            marginBottom: '32px',
            maxWidth: '672px',
            margin: '0 auto 32px auto'
          }}>
            ShelterLink helps connect individuals and families in need with available shelter resources, 
            making it easier to find safe housing and support services.
          </p>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '16px', 
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link 
                to="/register" 
                style={{ 
                  padding: '12px 32px',
                  backgroundColor: 'black',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'black'}
              >
                Get Started
              </Link>
              <Link 
                to="/login" 
                style={{ 
                  padding: '12px 32px',
                  backgroundColor: 'transparent',
                  border: '1px solid black',
                  color: 'black',
                  borderRadius: '8px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'black';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'black';
                }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ 
          marginTop: '80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px'
        }}>
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏠</div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '8px' 
            }}>
              Shelter Management
            </h3>
            <p style={{ color: '#4b5563' }}>
              Manage shelter listings and track availability in real-time
            </p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '8px' 
            }}>
              Resource Tracking
            </h3>
            <p style={{ color: '#4b5563' }}>
              Monitor capacity and resources to help those in need
            </p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤝</div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#1f2937',
              marginBottom: '8px' 
            }}>
              Community Support
            </h3>
            <p style={{ color: '#4b5563' }}>
              Connect with local organizations and support services
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
