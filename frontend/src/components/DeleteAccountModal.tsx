interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userType: 'donor' | 'shelter' | null;
}

function DeleteAccountModal({ isOpen, onClose, onConfirm, userType }: DeleteAccountModalProps) {
  if (!isOpen) return null;

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
          padding: '32px'
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
          Delete Account?
        </h2>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>
          Are you sure you want to delete your account? This action cannot be undone. 
          All your data, including {userType === 'donor' ? 'donations' : 'requests'} and matches, will be permanently removed.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
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
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '14px',
              border: '2px solid #dc2626',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountModal;

