import { useNavigate } from "react-router-dom";

function AuthNavBar() {
  const navigate = useNavigate();
  
  return (
    <nav className="bg-black text-white px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">❤️</span>
          <span className="text-xl font-bold">ShelterLink</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-transparent border-none text-white hover:text-gray-300 transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors font-medium"
          >
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AuthNavBar;