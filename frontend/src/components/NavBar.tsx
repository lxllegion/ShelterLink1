import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";

function NavBar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    setUserType(userType);
    setLoading(false);
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      color: 'white',
      padding: '1rem 1.5rem',
      boxShadow: '0 4px 6px rgba(255, 107, 53, 0.2)'
    }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">❤️</span>
              <span className="text-xl font-bold">ShelterLink</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              >
                Profile
              </button>
              {userType === 'shelter' ? <></> : loading ? <></> :
              <button
                onClick={() => navigate('/shelters')}
                className="text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              >
                Shelters Near Me
              </button>}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Welcome, {currentUser?.email}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                color: '#FF6B35',
                border: '2px solid white',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#FF6B35';
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