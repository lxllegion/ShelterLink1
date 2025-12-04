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
    <nav className="bg-black text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">❤️</span>
              <span className="text-xl font-bold">ShelterLink</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm hover:text-gray-300 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="text-sm hover:text-gray-300 transition-colors"
              >
                Profile
              </button>
              {userType === 'donor' && !userInfoLoading && (
                <button
                  onClick={() => navigate('/shelters')}
                  className="text-sm hover:text-gray-300 transition-colors"
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
              className="px-4 py-2 bg-transparent border border-white rounded hover:bg-white hover:text-black transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
  );
}

export default NavBar;