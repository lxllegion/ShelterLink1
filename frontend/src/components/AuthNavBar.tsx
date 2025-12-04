import { useNavigate } from "react-router-dom";

function AuthNavBar() {
  const navigate = useNavigate();
  
  return (
    <nav style={{ backgroundColor: '#FF6B35', color: 'white', padding: '16px 24px' }}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🏠</span>
          <span className="text-xl font-bold">ShelterLink</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#FFF5EE'}
            onMouseOut={(e) => e.currentTarget.style.color = 'white'}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '8px 24px',
              backgroundColor: 'white',
              color: '#FF6B35',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FFF5EE'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AuthNavBar;