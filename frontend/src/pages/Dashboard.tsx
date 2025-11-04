import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DonationForm, RequestForm, Match, getDonations, getRequests, getMatches, getUserInfo } from '../api/backend';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';

const RETRY_DELAY = 1500;
const MAX_RETRIES = 3;

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);

  const [donations, setDonations] = useState<DonationForm[]>([]);
  const [requests, setRequests] = useState<RequestForm[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserTypeAndData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userId = currentUser.uid;

        // Fetch user type from backend with retry logic
        let userInfo;
        let retries = MAX_RETRIES;
        while (retries > 0) {
          try {
            userInfo = await getUserInfo(userId);
            if (!userInfo.error && userInfo.userType) {
              break;
            }
          } catch (err) {
            console.log('Error fetching user info, retrying...', err);
          }
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          }
        }
        
        if (userInfo?.error || !userInfo?.userType) {
          setError('User not found in system. Please try logging out and back in.');
          setLoading(false);
          return;
        }

        setUserType(userInfo.userType);
        localStorage.setItem('userType', userInfo.userType);

        // Fetch matches for all users
        const matchesData = await getMatches();
        
        if (userInfo.userType === 'donor') {
          // Fetch donations for this donor
          const donationsData = await getDonations();
          const userDonations = donationsData.filter(d => d.donor_id === userId);
          setDonations(userDonations);
          
          // Filter matches for this donor
          const userMatches = matchesData.filter(m => m.donor_id === userId);
          setMatches(userMatches);
        } else if (userInfo.userType === 'shelter') {
          // Fetch requests for this shelter
          const requestsData = await getRequests();
          const userRequests = requestsData.filter(r => r.shelter_id === userId); // Note: using donor_id field for shelter_id
          setRequests(userRequests);
          
          // Filter matches for this shelter
          const userMatches = matchesData.filter(m => m.shelter_id === userId);
          setMatches(userMatches);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTypeAndData();
  }, [currentUser]);

  // Calculate stats
  const totalItems = userType === 'donor' ? donations.length : requests.length;
  const activeMatches = matches.filter(m => m.status === 'active').length;
  const completedMatches = matches.filter(m => m.status === 'completed').length;

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Navigation Bar */}
      <NavBar />

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
            {loading ? '+' : userType === 'donor' ? '+ New Donation' : '+ New Request'}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '32px'
          }}>
            <p style={{ color: '#991b1b', fontWeight: '600' }}>Error: {error}</p>
          </div>
        )}

        {/* Stats Cards */}
        {!loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {/* Total Donations/Requests */}
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
                {totalItems}
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
                {activeMatches}
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
                {completedMatches}
              </p>
            </div>
          </div>
        )}

        {/* Active Matches List */}
        {!loading && !error && (
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
              {matches.filter(m => m.status === 'active').length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center' }}>
                  <p style={{ fontSize: '16px', color: '#6b7280' }}>
                    No active matches yet. {userType === 'donor' ? 'Create a donation' : 'Create a request'} to get started!
                  </p>
                </div>
              ) : (
                matches.filter(m => m.status === 'active').map((match, index) => (
                  <div
                    key={match.id}
                    style={{
                      padding: '24px',
                      borderBottom: index < matches.filter(m => m.status === 'active').length - 1 ? '1px solid #e5e7eb' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                        {userType === 'donor' 
                          ? `Match with ${match.shelter_name}`
                          : `Match with ${match.donor_username}`
                        }
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                        {match.category} • {match.item_name} • Quantity: {match.quantity}
                      </p>
                      <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                        Matched {formatTimeAgo(match.matched_at)}
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
                      Resolve Match
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
