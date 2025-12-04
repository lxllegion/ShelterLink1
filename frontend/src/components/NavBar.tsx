import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

function NavBar() {
  const { currentUser, userInfo, userInfoLoading } = useAuth();
  const navigate = useNavigate();
  
  const userType = userInfo?.userType || null;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav style={{ backgroundColor: '#FF6B35', color: 'white', padding: '16px 24px' }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏠</span>
              <span className="text-xl font-bold">ShelterLink</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm transition-colors"
                style={{ color: 'white' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#FFF5EE'}
                onMouseOut={(e) => e.currentTarget.style.color = 'white'}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="text-sm transition-colors"
                style={{ color: 'white' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#FFF5EE'}
                onMouseOut={(e) => e.currentTarget.style.color = 'white'}
              >
                Profile
              </button>
              {userType === 'donor' && !userInfoLoading && (
                <button
                  onClick={() => navigate('/shelters')}
                  className="text-sm transition-colors"
                  style={{ color: 'white' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#FFF5EE'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'white'}
                >
                  Shelters Near Me
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Welcome, {currentUser?.email}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '2px solid white',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#FF6B35';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
  );
}

export default NavBar;