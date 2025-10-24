import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const type = localStorage.getItem('userType');
    setUserType(type);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Sample match data - TODO: Replace with actual API call
  const matches = [
    {
      shelter: 'Downtown Shelter',
      item: 'Food Items',
      detail: '20 cans of soup',
      time: '2 days ago'
    },
    {
      shelter: 'Downtown Shelter',
      item: 'Food Items',
      detail: '20 cans of soup',
      time: '2 days ago'
    },
    {
      shelter: 'Downtown Shelter',
      item: 'Food Items',
      detail: '20 cans of soup',
      time: '2 days ago'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Navigation Bar */}
      <nav style={{
        backgroundColor: 'black',
        color: 'white',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>❤️</span>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>ShelterLink</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            Dashboard
          </button>
          <button style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          onClick={() => navigate('/profile')}
          >
            Profile
          </button>
          <span style={{ fontSize: '20px', cursor: 'pointer' }}>🔔</span>
          <span style={{ fontSize: '20px', cursor: 'pointer' }}>👤</span>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            Dashboard
          </h1>
          <button
            onClick={() => navigate('/form')}
            style={{
              backgroundColor: 'black',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {userType === 'donor' ? '+ New Donation' : '+ New Request'}
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {/* Total Donations */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '2px solid black'
          }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              {userType === 'donor' ? 'Total Donations' : 'Total Requests'}
            </p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937' }}>
              12
            </p>
          </div>

          {/* Active Matches */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '2px solid black'
          }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              Active Matches
            </p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937' }}>
              3
            </p>
          </div>

          {/* Completed */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            border: '2px solid black'
          }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              Completed
            </p>
            <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937' }}>
              9
            </p>
          </div>
        </div>

        {/* Active Matches List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '2px solid black',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              Active Matches
            </h2>
          </div>

          {/* Matches List */}
          <div>
            {matches.map((match, index) => (
              <div
                key={index}
                style={{
                  padding: '24px',
                  borderBottom: index < matches.length - 1 ? '1px solid #e5e7eb' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                    {match.shelter}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                    {match.item} • {match.detail}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Matched {match.time}
                  </p>
                </div>

                <button style={{
                  backgroundColor: 'white',
                  color: 'black',
                  padding: '10px 20px',
                  border: '2px solid black',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Schedule Drop-off
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'white',
              color: '#6b7280',
              padding: '12px 32px',
              border: '2px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
