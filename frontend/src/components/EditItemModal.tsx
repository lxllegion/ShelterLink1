import { useState, useEffect } from 'react';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ItemData) => void;
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

  useEffect(() => {
    if (initialData) {
      setItemName(initialData.item_name);
      setQuantity(initialData.quantity);
      setCategory(initialData.category);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      item_name: itemName,
      quantity,
      category
    });
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setItemName('');
    setQuantity(1);
    setCategory('');
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
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: 'white'
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
                placeholder="e.g., Winter Coats"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
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
                min="1"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  backgroundColor: 'black',
                  color: 'white',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  flex: 1,
                  backgroundColor: 'white',
                  color: 'black',
                  padding: '14px',
                  border: '2px solid black',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
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

