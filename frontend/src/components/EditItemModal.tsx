import { useState, useEffect } from 'react';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ItemData) => Promise<void>;
  itemType: 'donation' | 'request';
  initialData: ItemData | null;
}

export interface ItemData {
  item_name: string;
  quantity: number;
  category: string;
}

function EditItemModal({ isOpen, onClose, onSave, itemType, initialData }: EditItemModalProps) {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setItemName(initialData.item_name);
      setQuantity(initialData.quantity);
      setCategory(initialData.category);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        item_name: itemName,
        quantity,
        category
      });
      handleClose();
    } catch (err: any) {
      setError(err.message || `Failed to update ${itemType}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setItemName('');
    setQuantity(1);
    setCategory('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const categories = [
    'Food',
    'Clothing',
    'Bedding',
    'Medical Supplies',
    'Hygiene',
    'Baby Care',
    'Educational',
    'Emergency Supplies',
    'Other'
  ];

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
            Edit {itemType === 'donation' ? 'Donation' : 'Request'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Category */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#374151'
                }}
              >
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={isSaving}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: isSaving ? '#f3f4f6' : 'white',
                  opacity: isSaving ? 0.7 : 1
                }}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Item Description */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#374151'
                }}
              >
                Item Description
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
                disabled={isSaving}
                placeholder="e.g., Winter Coats"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: isSaving ? '#f3f4f6' : 'white',
                  opacity: isSaving ? 0.7 : 1
                }}
              />
            </div>

            {/* Quantity */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#374151'
                }}
              >
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                required
                disabled={isSaving}
                min="1"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: isSaving ? '#f3f4f6' : 'white',
                  opacity: isSaving ? 0.7 : 1
                }}
              />
            </div>

            {/* Warning Note */}
            <div
              style={{
                backgroundColor: '#dbeafe',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}
            >
              <span style={{ fontSize: '20px' }}>ℹ️</span>
              <div>
                <p style={{ fontSize: '14px', color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>
                  Note
                </p>
                <p style={{ fontSize: '14px', color: '#1e40af' }}>
                  Any existing matches associated with this {itemType} will be replaced with a new match based on the updated information.
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
                type="submit"
                disabled={isSaving}
                style={{
                  flex: 1,
                  backgroundColor: isSaving ? '#9ca3af' : 'black',
                  color: 'white',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                style={{
                  flex: 1,
                  backgroundColor: 'white',
                  color: 'black',
                  padding: '14px',
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.5 : 1
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditItemModal;
