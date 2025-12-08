import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Donation, Request, Match, deleteDonation, deleteRequest, updateDonation, updateRequest } from '../api/backend';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';
import ItemList from '../components/ItemList';
import MatchList from '../components/MatchList';
import EditItemModal, { ItemData } from '../components/EditItemModal';
import DeleteItemModal, { DeleteItemData } from '../components/DeleteItemModal';
import ResolveMatchModal from '../components/ResolveMatchModal';
import MatchMadeModal, { MatchData } from '../components/MatchMadeModal';

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

  // Modal state for match made notification
  const [isMatchMadeModalOpen, setIsMatchMadeModalOpen] = useState(false);
  const [matchMadeData, setMatchMadeData] = useState<MatchData | null>(null);

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
    
    if (editingType === 'donation') {
      const donationId = donations[editingIndex].donation_id;
      const result = await updateDonation(donationId, {
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
      
      // Remove old matches for this donation and add new one if found
      const filteredMatches = matches.filter((m: Match) => m.donation_id !== donationId);
      
      if (result.best_match) {
        const match = result.best_match;
        // Add the new match to frontend state
        const newMatch: Match = {
          id: match.id || `match-${Date.now()}`,
          donor_id: donations[editingIndex].donor_id,
          donation_id: donationId,
          donor_username: match.donor_username || '',
          donor_email: match.donor_email,
          donor_phone: match.donor_phone,
          shelter_id: match.shelter_id,
          request_id: match.request_id,
          shelter_name: match.shelter_name || 'Unknown',
          shelter_email: match.shelter_email,
          shelter_phone: match.shelter_phone,
          shelter_address: match.shelter_address,
          shelter_city: match.shelter_city,
          shelter_state: match.shelter_state,
          shelter_zip_code: match.shelter_zip_code,
          item_name: match.item_name,
          quantity: match.quantity,
          category: match.category || itemData.category,
          matched_at: match.matched_at || new Date().toISOString(),
          status: match.status || 'pending',
        };
        updateMatches([...filteredMatches, newMatch]);
        
        // Show match made modal
        setMatchMadeData({
          shelter_name: match.shelter_name,
          item_name: match.item_name,
          quantity: match.quantity,
          category: match.category || itemData.category,
          similarity_score: match.similarity_score,
          can_fulfill: match.can_fulfill,
        });
        setIsMatchMadeModalOpen(true);
      } else {
        updateMatches(filteredMatches);
      }
    } else {
      const requestId = requests[editingIndex].request_id;
      const result = await updateRequest(requestId, {
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
      
      // Remove old matches for this request and add new one if found
      const filteredMatches = matches.filter((m: Match) => m.request_id !== requestId);
      
      if (result.best_match) {
        const match = result.best_match;
        // Add the new match to frontend state
        const newMatch: Match = {
          id: match.id || `match-${Date.now()}`,
          donor_id: match.donor_id,
          donation_id: match.donation_id,
          donor_username: match.donor_username || match.donor_name || 'Unknown',
          donor_email: match.donor_email,
          donor_phone: match.donor_phone,
          shelter_id: requests[editingIndex].shelter_id,
          request_id: requestId,
          shelter_name: match.shelter_name || '',
          shelter_email: match.shelter_email,
          shelter_phone: match.shelter_phone,
          shelter_address: match.shelter_address,
          shelter_city: match.shelter_city,
          shelter_state: match.shelter_state,
          shelter_zip_code: match.shelter_zip_code,
          item_name: match.item_name,
          quantity: match.quantity,
          category: match.category || itemData.category,
          matched_at: match.matched_at || new Date().toISOString(),
          status: match.status || 'pending',
        };
        updateMatches([...filteredMatches, newMatch]);
        
        // Show match made modal
        setMatchMadeData({
          donor_name: match.donor_name,
          donor_username: match.donor_username,
          item_name: match.item_name,
          quantity: match.quantity,
          category: match.category || itemData.category,
          similarity_score: match.similarity_score,
          can_fulfill: match.can_fulfill,
        });
        setIsMatchMadeModalOpen(true);
      } else {
        updateMatches(filteredMatches);
      }
    }

    setIsModalOpen(false);
    setEditingIndex(null);
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
            <MatchList
              matches={matches}
              userType={(userType as 'donor' | 'shelter') || 'donor'}
              isLoading={loadingMatches || !userType}
              error={error}
              onResolveMatch={handleResolveMatch}
            />
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

        {/* Match Made Modal */}
        <MatchMadeModal
          isOpen={isMatchMadeModalOpen}
          onClose={() => setIsMatchMadeModalOpen(false)}
          matchData={matchMadeData}
          userType={(userType as 'donor' | 'shelter') || 'donor'}
          actionType="updated"
        />
      </div>
    </div>
  );
}

export default Dashboard;