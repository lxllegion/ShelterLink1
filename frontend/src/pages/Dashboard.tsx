import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Donation, Request, Match, deleteDonation, deleteRequest, updateDonation, updateRequest } from '../api/backend';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';
import ItemList from '../components/ItemList';
import EditItemModal, { ItemData } from '../components/EditItemModal';
import ResolveMatchModal from '../components/ResolveMatchModal';

function Dashboard() {
  const navigate = useNavigate();
  const { 
    currentUser, 
    userInfo,
    donations, 
    requests, 
    matches, 
    dashboardDataLoaded,
    dashboardLoading,
    fetchDashboardData,
    updateDonations,
    updateRequests,
    updateMatches
  } = useAuth();
  
  const [error, setError] = useState<string | null>(null);

  // Modal state for editing items
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<'donation' | 'request'>('donation');

  // Modal state for resolving matches
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolvingMatch, setResolvingMatch] = useState<Match | null>(null);

  // State for expanded match cards
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const userType = userInfo?.userType || null;

  // Fetch dashboard data only if not already loaded
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser || !userInfo?.userType) return;
      
      if (!dashboardDataLoaded && !dashboardLoading) {
        await fetchDashboardData(currentUser.uid, userInfo.userType);
      }
    };

    loadDashboardData();
  }, [currentUser, userInfo, dashboardDataLoaded, dashboardLoading, fetchDashboardData]);

  const loadingMatches = dashboardLoading || !dashboardDataLoaded;
  const loadingItems = dashboardLoading || !dashboardDataLoaded;

  // Calculate stats
  const activeMatches = matches.filter((m: Match) => m.status === 'pending').length;

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
          updateDonations(donations.filter((_: Donation, i: number) => i !== index));
        } else if (type === 'request') {
          await deleteRequest(requests[index].request_id, currentUser?.uid || '');
          updateRequests(requests.filter((_: Request, i: number) => i !== index));
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
        updateDonations(updatedDonations);
        
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
        updateRequests(updatedRequests);
        
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
    // Update the match status in the context
    updateMatches(matches.map((m: Match) => 
      m.id === matchId ? { ...m, status: newStatus } : m
    ));
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
            {!userType ? '+' : userType === 'donor' ? '+ New Donation' : '+ New Request'}
          </button>
        </div>

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
          {!error && (
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
                  Active Matches ({loadingMatches ? '...' : activeMatches})
                </h2>
              </div>

              {/* Matches List */}
              <div style={{ overflow: 'auto', flex: 1 }}>
                {loadingMatches ? (
                  <div style={{ padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', color: '#A0522D' }}>Loading matches...</p>
                  </div>
                ) : error ? (
                  <div style={{ padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', color: '#CC2900' }}>Error loading matches</p>
                  </div>
                ) : matches.filter((m: Match) => m.status === 'pending').length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', color: '#A0522D' }}>
                      No active matches yet. {userType === 'donor' ? 'Create a donation' : 'Create a request'} to get started!
                    </p>
                  </div>
                ) : (
                  matches.filter((m: Match) => m.status === 'pending').map((match: Match, index: number) => {
                    const isExpanded = expandedMatchId === match.id;
                    return (
                      <div
                        key={match.id}
                        style={{
                          borderBottom: index < matches.filter((m: Match) => m.status === 'pending').length - 1 ? '1px solid #FFE5CC' : 'none',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        {/* Clickable Card Header */}
                        <div
                          onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                          style={{
                            padding: '24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            backgroundColor: isExpanded ? '#FFF5EE' : 'transparent'
                          }}
                          onMouseOver={(e) => !isExpanded && (e.currentTarget.style.backgroundColor = '#FFFBF7')}
                          onMouseOut={(e) => !isExpanded && (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ flex: 1 }}>
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

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolveMatch(match);
                            }}
                            style={{
                              backgroundColor: '#FF6B35',
                              color: 'white',
                              padding: '10px 20px',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 4px rgba(255, 107, 53, 0.2)',
                              marginLeft: '16px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E85A2A'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FF6B35'}
                          >
                            Resolve Match
                          </button>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div style={{
                            padding: '0 24px 24px 24px',
                            backgroundColor: '#FFF5EE',
                            borderTop: '1px solid #FFE5CC'
                          }}>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '16px',
                              marginTop: '16px'
                            }}>
                              <div>
                                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#A0522D', marginBottom: '4px', textTransform: 'uppercase' }}>
                                  {userType === 'donor' ? 'Shelter' : 'Donor'}
                                </p>
                                <p style={{ fontSize: '14px', color: '#8B4513', fontWeight: '500' }}>
                                  {userType === 'donor' ? match.shelter_name : match.donor_username}
                                </p>
                              </div>

                              <div>
                                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#A0522D', marginBottom: '4px', textTransform: 'uppercase' }}>
                                  Match ID
                                </p>
                                <p style={{ fontSize: '14px', color: '#8B4513', fontWeight: '500' }}>
                                  {match.id.substring(0, 8)}...
                                </p>
                              </div>

                              <div>
                                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#A0522D', marginBottom: '4px', textTransform: 'uppercase' }}>
                                  Item
                                </p>
                                <p style={{ fontSize: '14px', color: '#8B4513', fontWeight: '500' }}>
                                  {match.item_name}
                                </p>
                              </div>

                              <div>
                                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#A0522D', marginBottom: '4px', textTransform: 'uppercase' }}>
                                  Category
                                </p>
                                <p style={{ fontSize: '14px', color: '#8B4513', fontWeight: '500' }}>
                                  {match.category}
                                </p>
                              </div>

                              <div>
                                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#A0522D', marginBottom: '4px', textTransform: 'uppercase' }}>
                                  Quantity
                                </p>
                                <p style={{ fontSize: '14px', color: '#8B4513', fontWeight: '500' }}>
                                  {match.quantity}
                                </p>
                              </div>

                              <div>
                                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#A0522D', marginBottom: '4px', textTransform: 'uppercase' }}>
                                  Status
                                </p>
                                <p style={{ fontSize: '14px', color: '#8B4513', fontWeight: '500' }}>
                                  {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
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