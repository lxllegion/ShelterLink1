interface Item {
  item_name: string;
  quantity: number;
  category: string;
}

interface ItemListProps {
  items: Item[];
  itemType: 'donation' | 'request';
  userType: 'donor' | 'shelter';
  isLoading: boolean;
  onEditItem: (index: number, type: 'donation' | 'request') => void;
  onDeleteItem: (index: number, type: 'donation' | 'request') => void;
}

function ItemList({ 
  items, 
  itemType, 
  userType, 
  isLoading, 
  onEditItem, 
  onDeleteItem 
}: ItemListProps) {
  const title = userType === 'donor' ? 'My Donations' : 'My Requests';
  const loadingMessage = userType === 'donor' ? 'Loading donations...' : 'Loading requests...';
  const emptyMessage = userType === 'donor'
    ? 'No donations yet. Press the "+ New Donation" button to create your first donation!'
    : 'No requests yet. Press the "+ New Request" button to create your first request!';

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
          {title} ({isLoading ? '...' : items.length})
        </h2>
      </div>

      {/* Items List */}
      <div style={{ overflow: 'auto', flex: 1 }}>
        {isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>{loadingMessage}</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>
              {emptyMessage}
            </p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '20px 24px',
                borderBottom: index < items.length - 1 ? '1px solid #e5e7eb' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
                  {item.item_name}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  {item.category} • Quantity: {item.quantity}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onEditItem(index, itemType)}
                  style={{
                    backgroundColor: 'white',
                    color: 'black',
                    padding: '8px 16px',
                    border: '2px solid black',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteItem(index, itemType)}
                  style={{
                    backgroundColor: 'white',
                    color: '#dc2626',
                    padding: '8px 16px',
                    border: '2px solid #dc2626',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ItemList;