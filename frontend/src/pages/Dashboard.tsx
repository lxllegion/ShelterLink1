import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [userType, setUserType] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    setUserType(userType);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <NavBar />

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
            <button className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors" onClick={() => navigate('/form')}>{userType === 'donor' ? '+ New Donation' : '+ New Request'}</button>
          </div>
          
          
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Welcome to ShelterLink!
            </h2>
            <p className="text-gray-600 mb-6">
              You are successfully logged in. This is your protected dashboard where you can manage shelter resources and help connect people in need.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Shelter Management</h3>
                <p className="text-gray-600 text-sm">Manage shelter listings and availability</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Resource Tracking</h3>
                <p className="text-gray-600 text-sm">Track resources and capacity</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">User Support</h3>
                <p className="text-gray-600 text-sm">Help users find shelter resources</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;