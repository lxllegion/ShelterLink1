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
  // Filter matches based on status and user type
  // - pending: show to both (neither confirmed)
  // - donor: show to shelter (donor confirmed, waiting for shelter)
  // - shelter: show to donor (shelter confirmed, waiting for donor)
  // - both: show to both (fully resolved)
  const shouldShowMatch = (match: Match) => {
    if (match.status === 'pending') return true;
    if (match.status === 'both') return true;
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
          Active Matches ({isLoading ? '...' : pendingMatches.length})
        </h2>
      </div>

      {/* Matches List */}
      <div style={{ overflow: 'auto', flex: 1 }}>
        {isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>Loading matches...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#ef4444' }}>Error loading matches</p>
          </div>
        ) : pendingMatches.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>
              {emptyMessage}
            </p>
          </div>
        ) : (
          pendingMatches.map((match, index) => (
            <div
              key={match.id}
              style={{
                padding: '24px',
                borderBottom: index < pendingMatches.length - 1 ? '1px solid #e5e7eb' : 'none',
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
                onClick={() => onResolveMatch(match)}
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
  );
}

export default MatchList;

