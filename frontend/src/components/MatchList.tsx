import { useState } from 'react';
import { Match } from '../api/backend';

interface MatchListProps {
  matches: Match[];
  userType: 'donor' | 'shelter';
  isLoading: boolean;
  error: string | null;
  onResolveMatch: (match: Match) => void;
}

function MatchList({ 
  matches, 
  userType, 
  isLoading, 
  error,
  onResolveMatch 
}: MatchListProps) {
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  // Filter matches based on status and user type
  // - pending: show to both (neither confirmed)
  // - donor: show to shelter (donor confirmed, waiting for shelter)
  // - shelter: show to donor (shelter confirmed, waiting for donor)
  // - both: hide from both (fully resolved)
  const shouldShowMatch = (match: Match) => {
    if (match.status === 'both') return false;
    if (match.status === 'pending') return true;
    if (userType === 'donor' && match.status === 'shelter') return true;
    if (userType === 'shelter' && match.status === 'donor') return true;
    return false;
  };

  const pendingMatches = matches.filter(shouldShowMatch);
  
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

  const emptyMessage = userType === 'donor'
    ? 'No active matches yet. Create a donation to get started!'
    : 'No active matches yet. Create a request to get started!';

  return (
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
          Active Matches ({isLoading ? '...' : pendingMatches.length})
        </h2>
      </div>

      {/* Matches List */}
      <div style={{ overflow: 'auto', flex: 1 }}>
        {isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#A0522D' }}>Loading matches...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#CC2900' }}>Error loading matches</p>
          </div>
        ) : pendingMatches.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#A0522D' }}>
              {emptyMessage}
            </p>
          </div>
        ) : (
          pendingMatches.map((match, index) => {
            const isExpanded = expandedMatchId === match.id;
            return (
              <div
                key={match.id}
                style={{
                  borderBottom: index < pendingMatches.length - 1 ? '1px solid #FFE5CC' : 'none',
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
                      onResolveMatch(match);
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
                          {userType === 'donor' ? 'Shelter Name' : 'Donor Name'}
                        </p>
                        <p style={{ fontSize: '14px', color: '#8B4513', fontWeight: '500' }}>
                          {userType === 'donor' ? match.shelter_name : match.donor_username}
                        </p>
                      </div>

                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#A0522D', marginBottom: '4px', textTransform: 'uppercase' }}>
                          Email
                        </p>
                        <p style={{ fontSize: '14px', color: '#8B4513', fontWeight: '500' }}>
                          {userType === 'donor' ? (match.shelter_email || 'N/A') : (match.donor_email || 'N/A')}
                        </p>
                      </div>

                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#A0522D', marginBottom: '4px', textTransform: 'uppercase' }}>
                          Phone Number
                        </p>
                        <p style={{ fontSize: '14px', color: '#8B4513', fontWeight: '500' }}>
                          {userType === 'donor' ? (match.shelter_phone || 'N/A') : (match.donor_phone || 'N/A')}
                        </p>
                      </div>

                      {userType === 'donor' && match.shelter_address && (
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#A0522D', marginBottom: '4px', textTransform: 'uppercase' }}>
                            Address
                          </p>
                          <p style={{ fontSize: '14px', color: '#8B4513', fontWeight: '500' }}>
                            {match.shelter_address}
                            {match.shelter_city && `, ${match.shelter_city}`}
                            {match.shelter_state && `, ${match.shelter_state}`}
                            {match.shelter_zip_code && ` ${match.shelter_zip_code}`}
                          </p>
                        </div>
                      )}

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
  );
}

export default MatchList;
