import { useState } from 'react';
import { Match, resolveMatch } from '../api/backend';

interface ResolveMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  userId: string;
  onResolveSuccess: (matchId: string, newStatus: string) => void;
}

function ResolveMatchModal({ isOpen, onClose, match, userId, onResolveSuccess }: ResolveMatchModalProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResolve = async () => {
    if (!match) return;

    setIsResolving(true);
    setError(null);

    try {
      const newStatus = await resolveMatch(match.id, userId);
      // The backend returns the new status as a string
      onResolveSuccess(match.id, newStatus);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve match');
    } finally {
      setIsResolving(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen || !match) return null;

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
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
            Resolve Match
          </h2>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Match Details */}
            <div>
              <p style={{ fontSize: '16px', color: '#374151', marginBottom: '16px' }}>
                Are you sure you want to resolve this match?
              </p>
              
              <div
                style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px'
                }}
              >
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Item: </span>
                  <span style={{ color: '#6b7280' }}>{match.item_name}</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Category: </span>
                  <span style={{ color: '#6b7280' }}>{match.category}</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Quantity: </span>
                  <span style={{ color: '#6b7280' }}>{match.quantity}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Current Status: </span>
                  <span
                    style={{
                      color: match.status === 'pending' ? '#f59e0b' : '#10b981',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}
                  >
                    {match.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              >
                <p style={{ color: '#991b1b', fontSize: '14px' }}>{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={handleResolve}
                disabled={isResolving}
                style={{
                  flex: 1,
                  backgroundColor: isResolving ? '#9ca3af' : 'black',
                  color: 'white',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isResolving ? 'not-allowed' : 'pointer'
                }}
              >
                {isResolving ? 'Resolving...' : 'Resolve Match'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isResolving}
                style={{
                  flex: 1,
                  backgroundColor: 'white',
                  color: 'black',
                  padding: '14px',
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isResolving ? 'not-allowed' : 'pointer',
                  opacity: isResolving ? 0.5 : 1
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResolveMatchModal;