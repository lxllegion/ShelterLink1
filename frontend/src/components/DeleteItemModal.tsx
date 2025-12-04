import { useState } from 'react';

export interface DeleteItemData {
  item_name: string;
  quantity: number;
  category: string;
}

interface DeleteItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  itemType: 'donation' | 'request';
  itemData: DeleteItemData | null;
}

function DeleteItemModal({ isOpen, onClose, onConfirm, itemType, itemData }: DeleteItemModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm();
      handleClose();
    } catch (err: any) {
      setError(err.message || `Failed to delete ${itemType}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen || !itemData) return null;

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
            Delete {itemType === 'donation' ? 'Donation' : 'Request'}
          </h2>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Confirmation Message */}
            <p style={{ fontSize: '16px', color: '#374151' }}>
              Are you sure you want to delete this {itemType}?
            </p>

            {/* Item Details */}
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
                <span style={{ color: '#6b7280' }}>{itemData.item_name}</span>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Category: </span>
                <span style={{ color: '#6b7280' }}>{itemData.category}</span>
              </div>
              <div>
                <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Quantity: </span>
                <span style={{ color: '#6b7280' }}>{itemData.quantity}</span>
              </div>
            </div>

            {/* Warning Note */}
            <div
              style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}
            >
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div>
                <p style={{ fontSize: '14px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>
                  Important Notice
                </p>
                <p style={{ fontSize: '14px', color: '#92400e' }}>
                  Any matches associated with this {itemType} will also be deleted. This action cannot be undone.
                </p>
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
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  backgroundColor: isDeleting ? '#9ca3af' : '#dc2626',
                  color: 'white',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  backgroundColor: 'white',
                  color: 'black',
                  padding: '14px',
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.5 : 1
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

export default DeleteItemModal;

