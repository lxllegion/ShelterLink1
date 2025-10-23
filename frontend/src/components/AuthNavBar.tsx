import { useNavigate } from "react-router-dom";

function AuthNavBar() {
  const navigate = useNavigate();
  
  return (
    <nav style={{
      backgroundColor: 'black',
      color: 'white',
      padding: '20px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>❤️</span>
        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>ShelterLink</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <button style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px'
        }} onClick={() => navigate('/login')}>
          Login
        </button>
        <button style={{
          backgroundColor: 'white',
          color: 'black',
          border: 'none',
          padding: '10px 24px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500'
        }} onClick={() => navigate('/register')}>
          Sign Up
        </button>
      </div>
    </nav>
  );
}

export default AuthNavBar;