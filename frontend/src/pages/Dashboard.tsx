import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Donation, Request, Match, deleteDonation, deleteRequest, updateDonation, updateRequest } from '../api/backend';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';
import ItemList from '../components/ItemList';
import EditItemModal, { ItemData } from '../components/EditItemModal';
import DeleteItemModal, { DeleteItemData } from '../components/DeleteItemModal';
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

  // Modal state for deleting items
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [deletingType, setDeletingType] = useState<'donation' | 'request'>('donation');

  // Modal state for resolving matches
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolvingMatch, setResolvingMatch] = useState<Match | null>(null);

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
  const handleDeleteItem = (index: number, type: 'donation' | 'request') => {
    setDeletingIndex(index);
    setDeletingType(type);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingIndex === null) return;

    if (deletingType === 'donation') {
      const donationId = donations[deletingIndex].donation_id;
      await deleteDonation(donationId, currentUser?.uid || '');
      updateDonations(donations.filter((_: Donation, i: number) => i !== deletingIndex));
      // Remove any matches associated with this donation
      updateMatches(matches.filter((m: Match) => m.donation_id !== donationId));
    } else if (deletingType === 'request') {
      const requestId = requests[deletingIndex].request_id;
      await deleteRequest(requestId, currentUser?.uid || '');
      updateRequests(requests.filter((_: Request, i: number) => i !== deletingIndex));
      // Remove any matches associated with this request
      updateMatches(matches.filter((m: Match) => m.request_id !== requestId));
    }
  };

  const getDeletingItemData = (): DeleteItemData | null => {
    if (deletingIndex === null) return null;
    
    const item = deletingType === 'donation' 
      ? donations[deletingIndex] 
      : requests[deletingIndex];

    if (!item) return null;

    return {
      item_name: item.item_name,
      quantity: item.quantity,
      category: item.category
    };
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
                ) : matches.filter((m: Match) => m.status === 'pending').length === 0 ? (
                  <div style={{ padding: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', color: '#6b7280' }}>
                      No active matches yet. {userType === 'donor' ? 'Create a donation' : 'Create a request'} to get started!
                    </p>
                  </div>
                ) : (
                  matches.filter((m: Match) => m.status === 'pending').map((match: Match, index: number) => (
                    <div
                      key={match.id}
                      style={{
                        padding: '24px',
                        borderBottom: index < matches.filter((m: Match) => m.status === 'pending').length - 1 ? '1px solid #e5e7eb' : 'none',
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

        {/* Delete Item Modal */}
        <DeleteItemModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemType={deletingType}
          itemData={getDeletingItemData()}
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