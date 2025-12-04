import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DonationForm, RequestForm, Match, getDonations, getRequests, getMatches, getUserInfo, deleteDonation, deleteRequest, updateDonation, updateRequest } from '../api/backend';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';
import ItemList from '../components/ItemList';
import EditItemModal, { ItemData } from '../components/EditItemModal';

// Extended types with IDs for items stored in state
interface DonationWithId extends DonationForm {
  donation_id: string;
}

interface RequestWithId extends RequestForm {
  request_id: string;
}

const RETRY_DELAY = 1500;
const MAX_RETRIES = 3;

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);

  const [donations, setDonations] = useState<DonationWithId[]>([]);
  const [requests, setRequests] = useState<RequestWithId[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state for editing items
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<'donation' | 'request'>('donation');

  // Modal state for viewing match details
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [partnerDetails, setPartnerDetails] = useState<any>(null);
  const [loadingPartner, setLoadingPartner] = useState(false);

  const mockDonations = [
    {
      donation_id: '2b97cf15-1cc9-43f1-9fe8-eb1535b6d9ef',
      item_name: 'Winter Coats',
      quantity: 15,
      donor_id: '0a50ac41-d922-4497-a7ba-4ba4510476c7',
      category: 'Clothing'
    },

    {
      donation_id: '2',
      item_name: 'Winter Coats',
      quantity: 15,
      donor_id: '0a50ac41-d922-4497-a7ba-4ba4510476c7',
      category: 'Clothing'
    },

    {
      donation_id: '3',
      item_name: 'Winter Coats',
      quantity: 15,
      donor_id: '0a50ac41-d922-4497-a7ba-4ba4510476c7',
      category: 'Clothing'
    },

    {
      donation_id: '4',
      item_name: 'Winter Coats',
      quantity: 15,
      donor_id: '0a50ac41-d922-4497-a7ba-4ba4510476c7',
      category: 'Clothing'
    },

    {
      donation_id: '5',
      item_name: 'Winter Coats',
      quantity: 15,
      donor_id: '0a50ac41-d922-4497-a7ba-4ba4510476c7',
      category: 'Clothing'
    },

    {
      donation_id: '6',
      item_name: 'Winter Coats',
      quantity: 15,
      donor_id: '0a50ac41-d922-4497-a7ba-4ba4510476c7',
      category: 'Clothing'
    },

    {
      donation_id: '7',
      item_name: 'Winter Coats',
      quantity: 15,
      donor_id: '0a50ac41-d922-4497-a7ba-4ba4510476c7',
      category: 'Clothing'
    },

    {
      donation_id: '8',
      item_name: 'Winter Coats',
      quantity: 15,
      donor_id: '0a50ac41-d922-4497-a7ba-4ba4510476c7',
      category: 'Clothing'
    },
  ];

  const mockRequests = [
    {
      request_id: '1',
      item_name: 'Sleeping Bags',
      quantity: 15,
      shelter_id: '0a50ac41-d922-4497-a7ba-4ba4510476c7',
      category: 'Clothing'
    },

    {
      request_id: '2',
      item_name: 'Winter Coats',
      quantity: 15,
      shelter_id: '0a50ac41-d922-4497-a7ba-4ba4510476c7',
      category: 'Clothing'
    },

  ];

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
        const matchesData = await getMatches(userId, userInfo.userType);
        setMatches(matchesData);

        if (userInfo.userType === 'donor') {
          // Fetch donations for this donor
          const donationsData = await getDonations(userId);
          const userDonations = donationsData.filter(d => d.donor_id === userId) as DonationWithId[];
          setDonations(userDonations);

          // Filter matches for this donor
          const userMatches = matchesData.filter(m => m.donor_id === userId);
          setMatches(userMatches);
        } else if (userInfo.userType === 'shelter') {
          // Fetch requests for this shelter
          const requestsData = await getRequests(userId);
          const userRequests = requestsData.filter(r => r.shelter_id === userId) as RequestWithId[]; // Note: using donor_id field for shelter_id
          setRequests(userRequests);

          // Filter matches for this shelter
          const userMatches = matchesData.filter(m => m.shelter_id === userId);
          setMatches(userMatches);
        }

        if (userInfo.userType === 'donor') {
          setDonations(mockDonations as DonationWithId[]);
        } else if (userInfo.userType === 'shelter') {
          setRequests(mockRequests as RequestWithId[]);
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

  const handleMatchClick = async (match: Match) => {
    setSelectedMatch(match);
    setLoadingPartner(true);
    setPartnerDetails(null);

    try {
      // Fetch partner details based on user type
      const partnerId = userType === 'donor' ? match.shelter_id : match.donor_id;
      const partnerInfo = await getUserInfo(partnerId);

      if (partnerInfo && !partnerInfo.error) {
        setPartnerDetails(partnerInfo.userData);
      }
    } catch (error) {
      console.error('Error fetching partner details:', error);
    } finally {
      setLoadingPartner(false);
    }
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#FFF5EE', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
            color: '#8B4513'
          }}>
            Dashboard
          </h1>
          <button
            onClick={() => navigate('/form')}
            style={{
              backgroundColor: '#FF6B35',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(255, 107, 53, 0.3)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E85A2A'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FF6B35'}
          >
            {loading ? '+' : userType === 'donor' ? '+ New Donation' : '+ New Request'}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ fontSize: '18px', color: '#A0522D' }}>Loading...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            backgroundColor: '#FFE5E0',
            border: '2px solid #FF6B35',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '32px'
          }}>
            <p style={{ color: '#CC2900', fontWeight: '600' }}>Error: {error}</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', flex: 1, overflow: 'hidden' }}>
          {/* Active Matches List */}
          {!loading && !error && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '2px solid #FFB366',
              overflow: 'hidden',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 6px rgba(255, 107, 53, 0.1)'
            }}>
              {/* Header */}
              <div style={{
                padding: '16px 24px',
                borderBottom: '2px solid #FFE5CC',
                flexShrink: 0,
                background: 'linear-gradient(to right, #FFF5EE, #FFE5CC)'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#8B4513' }}>
                  Active Matches ({activeMatches})
                </h2>
              </div>

              {/* Matches List */}
              <div style={{ overflow: 'auto', flex: 1 }}>
                {matches.filter(m => m.status === 'pending').length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', color: '#A0522D' }}>
                      No active matches yet. {userType === 'donor' ? 'Create a donation' : 'Create a request'} to get started!
                    </p>
                  </div>
                ) : (
                  matches.filter(m => m.status === 'pending').map((match, index) => (
                    <div
                      key={match.id}
                      onClick={() => handleMatchClick(match)}
                      style={{
                        padding: '24px',
                        borderBottom: index < matches.filter(m => m.status === 'pending').length - 1 ? '1px solid #FFE5CC' : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        backgroundColor: 'white'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFF5EE';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#8B4513', marginBottom: '4px' }}>
                          {userType === 'donor'
                            ? `Match with ${match.shelter_name}`
                            : `Match with ${match.donor_username}`
                          }
                        </h3>
                        <p style={{ fontSize: '14px', color: '#A0522D', marginBottom: '4px' }}>
                          {match.category} • {match.item_name} • Quantity: {match.quantity}
                        </p>
                        <p style={{ fontSize: '12px', color: '#CD853F' }}>
                          Matched {formatTimeAgo(match.matched_at)}
                        </p>
                      </div>

                      <button style={{
                        backgroundColor: '#FF6B35',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(255, 107, 53, 0.2)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E85A2A'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FF6B35'}
                      >
                        View Details
                      </button>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}
          {/* Donations/Requests List */}
          {!loading && !error && userType && (userType === 'donor' || userType === 'shelter') && (
            <ItemList
              items={userType === 'donor' ? donations : requests}
              itemType={userType === 'donor' ? 'donation' : 'request'}
              userType={userType}
              isLoading={false}
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

        {/* Match Details Modal */}
        {selectedMatch && (
          <div
            onClick={() => setSelectedMatch(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(139, 69, 19, 0.3)',
                border: '2px solid #FFB366'
              }}
            >
              {/* Modal Header */}
              <div style={{ padding: '24px', borderBottom: '2px solid #FFE5CC', background: 'linear-gradient(to right, #FFF5EE, #FFE5CC)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8B4513' }}>
                    Match Details
                  </h2>
                  <button
                    onClick={() => setSelectedMatch(null)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      color: '#A0522D',
                      padding: '0 8px',
                      lineHeight: '1'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '24px' }}>
                {/* Partner Information */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#8B4513', marginBottom: '0.75rem', borderBottom: '2px solid #FFE5CC', paddingBottom: '0.5rem' }}>
                    {userType === 'donor' ? 'Shelter Information' : 'Donor Information'}
                  </h3>

                  {loadingPartner ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#A0522D' }}>
                      Loading contact details...
                    </div>
                  ) : partnerDetails ? (
                    <div style={{
                      backgroundColor: '#FFF5EE',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #FFE5CC'
                    }}>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {/* Name */}
                        <div>
                          <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#8B4513', marginBottom: '0.25rem' }}>
                            {userType === 'donor' ? partnerDetails.shelter_name : partnerDetails.name}
                          </div>
                        </div>

                        {/* Email */}
                        {partnerDetails.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: '600', color: '#A0522D', minWidth: '60px' }}>Email:</span>
                            <a
                              href={`mailto:${partnerDetails.email}`}
                              style={{
                                color: '#FF6B35',
                                textDecoration: 'none',
                                transition: 'color 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.color = '#E85A2A'}
                              onMouseOut={(e) => e.currentTarget.style.color = '#FF6B35'}
                            >
                              {partnerDetails.email}
                            </a>
                          </div>
                        )}

                        {/* Phone */}
                        {partnerDetails.phone_number && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: '600', color: '#A0522D', minWidth: '60px' }}>Phone:</span>
                            <a
                              href={`tel:${partnerDetails.phone_number}`}
                              style={{
                                color: '#FF6B35',
                                textDecoration: 'none',
                                transition: 'color 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.color = '#E85A2A'}
                              onMouseOut={(e) => e.currentTarget.style.color = '#FF6B35'}
                            >
                              {partnerDetails.phone_number}
                            </a>
                          </div>
                        )}

                        {/* Address (for shelters only) */}
                        {userType === 'donor' && partnerDetails.address && (
                          <div>
                            <div style={{ fontWeight: '600', color: '#A0522D', marginBottom: '0.25rem' }}>Address:</div>
                            <div style={{ color: '#8B4513', lineHeight: '1.5' }}>
                              {partnerDetails.address}
                              {partnerDetails.city && partnerDetails.state && partnerDetails.zip_code && (
                                <div>{partnerDetails.city}, {partnerDetails.state} {partnerDetails.zip_code}</div>
                              )}
                            </div>
                            {partnerDetails.latitude && partnerDetails.longitude && (
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${partnerDetails.latitude},${partnerDetails.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-block',
                                  marginTop: '0.5rem',
                                  padding: '0.5rem 1rem',
                                  backgroundColor: '#FF6B35',
                                  color: 'white',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E85A2A'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FF6B35'}
                              >
                                Get Directions
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '600', color: '#A0522D' }}>
                          {userType === 'donor' ? 'Shelter:' : 'Donor:'}
                        </span>
                        <span style={{ color: '#8B4513' }}>
                          {userType === 'donor' ? selectedMatch.shelter_name : selectedMatch.donor_username}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#8B4513', marginBottom: '0.75rem', borderBottom: '2px solid #FFE5CC', paddingBottom: '0.5rem' }}>
                    Item Details
                  </h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      backgroundColor: '#FFF5EE',
                      borderRadius: '6px',
                      border: '1px solid #FFE5CC'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#8B4513', marginBottom: '0.25rem' }}>
                          {selectedMatch.item_name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#A0522D' }}>
                          {selectedMatch.category}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', color: '#FF6B35', fontSize: '1.125rem' }}>
                          {selectedMatch.quantity}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#A0522D' }}>
                          units
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Status */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#8B4513', marginBottom: '0.75rem', borderBottom: '2px solid #FFE5CC', paddingBottom: '0.5rem' }}>
                    Status
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#FFE5CC',
                      color: '#CC5500',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {selectedMatch.status}
                    </span>
                    <span style={{ color: '#A0522D', fontSize: '0.875rem' }}>
                      • Matched {formatTimeAgo(selectedMatch.matched_at)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: '#FF6B35',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 4px rgba(255, 107, 53, 0.3)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E85A2A'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FF6B35'}
                    onClick={() => {
                      alert('Contact functionality coming soon!');
                      setSelectedMatch(null);
                    }}
                  >
                    Contact {userType === 'donor' ? 'Shelter' : 'Donor'}
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      color: '#FF6B35',
                      border: '2px solid #FF6B35',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFF5EE';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                    onClick={() => setSelectedMatch(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
