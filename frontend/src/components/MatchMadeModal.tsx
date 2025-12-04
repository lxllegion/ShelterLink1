export interface MatchData {
  shelter_name?: string;
  donor_name?: string;
  donor_username?: string;
  item_name: string;
  quantity: number;
  category?: string;
  similarity_score?: number;
  can_fulfill?: boolean;
}

interface MatchMadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchData: MatchData | null;
  userType: 'donor' | 'shelter';
  actionType: 'created' | 'updated';
}

function MatchMadeModal({ isOpen, onClose, matchData, userType, actionType }: MatchMadeModalProps) {
  if (!isOpen || !matchData) return null;

  const actionText = actionType === 'created' ? 'Created' : 'Updated';
  const itemTypeText = userType === 'donor' ? 'Donation' : 'Request';

  return (
    <div
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
        zIndex: 1000
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '2px solid black',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        {/* Header with celebration */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
            Match Found!
          </h2>
          <p style={{ fontSize: '14px', color: '#15803d', marginTop: '4px' }}>
            {itemTypeText} {actionText} Successfully
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Match Partner */}
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '8px',
                padding: '16px'
              }}
            >
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', marginBottom: '4px', textTransform: 'uppercase' }}>
                {userType === 'donor' ? 'Matched Shelter' : 'Matched Donor'}
              </p>
              <p style={{ fontSize: '18px', fontWeight: '600', color: '#14532d' }}>
                {userType === 'donor' 
                  ? matchData.shelter_name || 'Unknown Shelter'
                  : matchData.donor_name || matchData.donor_username || 'Unknown Donor'
                }
              </p>
            </div>

            {/* Match Details */}
            <div
              style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px'
              }}
            >
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase' }}>
                Match Details
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>Item</p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{matchData.item_name}</p>
                </div>
                
                <div>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>
                    {userType === 'donor' ? 'Quantity Needed' : 'Quantity Available'}
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{matchData.quantity}</p>
                </div>

                {matchData.category && (
                  <div>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>Category</p>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{matchData.category}</p>
                  </div>
                )}

                {matchData.similarity_score !== undefined && (
                  <div>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>Match Score</p>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      {(matchData.similarity_score * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>

              {matchData.can_fulfill !== undefined && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{matchData.can_fulfill ? '✅' : '⚠️'}</span>
                    <p style={{ fontSize: '14px', color: matchData.can_fulfill ? '#166534' : '#92400e' }}>
                      {matchData.can_fulfill 
                        ? 'This donation can fulfill the request!' 
                        : 'Partial fulfillment possible'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Info Note */}
            <div
              style={{
                backgroundColor: '#dbeafe',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '16px' }}>💡</span>
              <p style={{ fontSize: '13px', color: '#1e40af' }}>
                You can view and manage this match from your Dashboard.
              </p>
            </div>

            {/* Button */}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                backgroundColor: '#16a34a',
                color: 'white',
                padding: '14px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchMadeModal;

