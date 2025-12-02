import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Donation, Request, Match, UserInfo, getDonations, getRequests, getMatches, getUserInfo, deleteDonation, deleteRequest, updateDonation, updateRequest } from '../api/backend';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';
import ItemList from '../components/ItemList';
import MatchList from '../components/MatchList';
import EditItemModal, { ItemData } from '../components/EditItemModal';
import ResolveMatchModal from '../components/ResolveMatchModal';

const RETRY_DELAY = 1500;
const MAX_RETRIES = 3;

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);

  const [donations, setDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state for editing items
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<'donation' | 'request'>('donation');

  // Modal state for resolving matches
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolvingMatch, setResolvingMatch] = useState<Match | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!currentUser) return;
      
      try {
        const userId = currentUser.uid;

        // Fetch user type from backend with retry logic
        let userInfo: UserInfo | undefined;
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
        
        if (!userInfo || userInfo.error || !userInfo.userType) {
          setError('User not found in system. Please try logging out and back in.');
          setLoadingMatches(false);
          setLoadingItems(false);
          return;
        }

        const fetchedUserType = userInfo.userType;
        setUserType(fetchedUserType);
        localStorage.setItem('userType', fetchedUserType);

        // Fetch matches and items in parallel
        getMatches(userId, fetchedUserType)
          .then(matchesData => {
            const userMatches = fetchedUserType === 'donor'
              ? matchesData.filter(m => m.donor_id === userId)
              : matchesData.filter(m => m.shelter_id === userId);
            setMatches(userMatches);
            setLoadingMatches(false);
          })
          .catch(error => {
            console.error('Error fetching matches:', error);
            setLoadingMatches(false);
          });

        (async () => {
          if (fetchedUserType === 'donor') {
            const donationsData = await getDonations(userId);
            setDonations(donationsData);
          } else if (fetchedUserType === 'shelter') {
            const requestsData = await getRequests(userId);
            setRequests(requestsData);
          }
          setLoadingItems(false);
        })().catch(error => {
          console.error('Error fetching items:', error);
          setLoadingItems(false);
        });
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoadingMatches(false);
        setLoadingItems(false);
      }
    };

    fetchAllData();
  }, [currentUser]);

  // Calculate stats
  const activeMatches = matches.filter(m => m.status === 'pending').length;

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

  // Handler functions for ItemList
  const handleDeleteItem = async (index: number, type: 'donation' | 'request') => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (type === 'donation') {
          await deleteDonation(donations[index].donation_id, currentUser?.uid || '');
          setDonations(donations.filter((_, i) => i !== index));
        } else if (type === 'request') {
          await deleteRequest(requests[index].request_id, currentUser?.uid || '');
          setRequests(requests.filter((_, i) => i !== index));
        }
      } catch (error) {
        alert('Error deleting item: ' + error);
      }
    }
  };

  const handleEditItem = (index: number, type: 'donation' | 'request') => {
    setEditingIndex(index);
    setEditingType(type);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (itemData: ItemData) => {
    if (editingIndex === null) return;
    try {
      if (editingType === 'donation') {
        const result = await updateDonation(donations[editingIndex].donation_id, {
          donor_id: donations[editingIndex].donor_id,
          item_name: itemData.item_name,
          quantity: itemData.quantity,
          category: itemData.category
        });
        
        const updatedDonations = [...donations];
        updatedDonations[editingIndex] = {
          ...updatedDonations[editingIndex],
          item_name: itemData.item_name,
          quantity: itemData.quantity,
          category: itemData.category
        };
        setDonations(updatedDonations);
        
        // Show match result if found
        if (result.best_match) {
          const match = result.best_match;
          alert(
            `Donation Updated! Match Found! 🎉\n\n` +
            `Shelter: ${match.shelter_name || 'Unknown'}\n` +
            `Item: ${match.item_name}\n` +
            `Quantity Needed: ${match.quantity}\n` +
            `Match Score: ${(match.similarity_score * 100).toFixed(1)}%\n` +
            `Can Fulfill: ${match.can_fulfill}`
          );
        } else {
          alert('Donation updated successfully! No matches found yet.');
        }
      } else {
        const result = await updateRequest(requests[editingIndex].request_id, {
          shelter_id: requests[editingIndex].shelter_id,
          item_name: itemData.item_name,
          quantity: itemData.quantity,
          category: itemData.category 
        });
        
        const updatedRequests = [...requests];
        updatedRequests[editingIndex] = {
          ...updatedRequests[editingIndex],
          item_name: itemData.item_name,
          quantity: itemData.quantity,
          category: itemData.category
        };
        setRequests(updatedRequests);
        
        // Show match result if found
        if (result.best_match) {
          const match = result.best_match;
          alert(
            `Request Updated! Match Found! 🎉\n\n` +
            `Donor: ${match.donor_name || 'Unknown'}\n` +
            `Item: ${match.item_name}\n` +
            `Quantity Available: ${match.quantity}\n` +
            `Match Score: ${(match.similarity_score * 100).toFixed(1)}%\n` +
            `Can Fulfill: ${match.can_fulfill}`
          );
        } else {
          alert('Request updated successfully! No matches found yet.');
        }
      }

      setIsModalOpen(false);
      setEditingIndex(null);
    } catch (error) {
      alert('Error updating item: ' + error);
    }
  };

  const getCurrentItemData = (): ItemData | null => {
    if (editingIndex === null) return null;

    const item = editingType === 'donation' 
      ? donations[editingIndex] 
      : requests[editingIndex];

    if (!item) return null;

    return {
      item_name: item.item_name,
      quantity: item.quantity,
      category: item.category
    };
  };

  const handleResolveMatch = (match: Match) => {
    setResolvingMatch(match);
    setIsResolveModalOpen(true);
  };

  const handleResolveSuccess = (matchId: string, newStatus: string) => {
    // Update the match status in the local state
    setMatches(matches.map(m => 
      m.id === matchId ? { ...m, status: newStatus } : m
    ));
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Navigation Bar */}
      <NavBar />

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 32px', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexShrink: 0
        }}>
          <h1 style={{
            fontSize: '28px',
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
            {!userType ? '+' : userType === 'donor' ? '+ New Donation' : '+ New Request'}
          </button>
        </div>

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

        <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', flex: 1, overflow: 'hidden' }}>
          {/* Active Matches List */}
          {!error && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '2px solid black',
              overflow: 'hidden',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header */}
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid #e5e7eb',
                flexShrink: 0
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                  Active Matches ({loadingMatches ? '...' : activeMatches})
                </h2>
              </div>

              {/* Matches List */}
              <div style={{ overflow: 'auto', flex: 1 }}>
                {loadingMatches ? (
                  <div style={{ padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', color: '#6b7280' }}>Loading matches...</p>
                  </div>
                ) : error ? (
                  <div style={{ padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', color: '#ef4444' }}>Error loading matches</p>
                  </div>
                ) : matches.filter(m => m.status === 'pending').length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', color: '#6b7280' }}>
                      No active matches yet. {userType === 'donor' ? 'Create a donation' : 'Create a request'} to get started!
                    </p>
                  </div>
                ) : (
                  matches.filter(m => m.status === 'pending').map((match, index) => (
                    <div
                      key={match.id}
                      style={{
                        padding: '24px',
                        borderBottom: index < matches.filter(m => m.status === 'pending').length - 1 ? '1px solid #e5e7eb' : 'none',
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

                      <button 
                        onClick={() => handleResolveMatch(match)}
                        style={{
                          backgroundColor: 'white',
                          color: 'black',
                          padding: '10px 20px',
                          border: '2px solid black',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Resolve Match
                      </button>
                    </div>
                  ))
                )}
              </div>
              
            </div>
          )}
          {/* Donations/Requests List */}
          {!error && (
            <ItemList
              items={userType === 'donor' ? donations : userType === 'shelter' ? requests : []}
              itemType={userType === 'donor' ? 'donation' : 'request'}
              userType={(userType as 'donor' | 'shelter') || 'donor'}
              isLoading={loadingItems || !userType}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />
          )}
        </div>

        {/* Edit Item Modal */}
        <EditItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveItem}
          itemType={editingType}
          initialData={getCurrentItemData()}
        />

        {/* Resolve Match Modal */}
        <ResolveMatchModal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          match={resolvingMatch}
          userId={currentUser?.uid || ''}
          onResolveSuccess={handleResolveSuccess}
        />
      </div>
    </div>
  );
}

export default Dashboard;