import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserInfo, getDonations, getRequests, getMatches } from '../api/backend';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfoLoading, setUserInfoLoading] = useState(false);
  
  // Dashboard data state
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [matches, setMatches] = useState([]);
  const [dashboardDataLoaded, setDashboardDataLoaded] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Function to fetch user info from backend
  const fetchUserInfo = async (userId) => {
    if (!userId) return null;
    
    setUserInfoLoading(true);
    try {
      const data = await getUserInfo(userId);
      setUserInfo(data);
      return data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    } finally {
      setUserInfoLoading(false);
    }
  };

  // Function to fetch dashboard data (donations/requests/matches)
  const fetchDashboardData = async (userId, userType) => {
    if (!userId || !userType) return;
    
    setDashboardLoading(true);
    try {
      // Fetch matches
      const matchesData = await getMatches(userId, userType);
      const userMatches = userType === 'donor'
        ? matchesData.filter(m => m.donor_id === userId)
        : matchesData.filter(m => m.shelter_id === userId);
      setMatches(userMatches);

      // Fetch items based on user type
      if (userType === 'donor') {
        const donationsData = await getDonations(userId);
        setDonations(donationsData);
      } else if (userType === 'shelter') {
        const requestsData = await getRequests(userId);
        setRequests(requestsData);
      }
      
      setDashboardDataLoaded(true);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Function to update user info (for use after profile edits)
  const updateUserInfo = (newUserInfo) => {
    setUserInfo(newUserInfo);
  };

  // Function to update donations
  const updateDonations = (newDonations) => {
    setDonations(newDonations);
  };

  // Function to update requests
  const updateRequests = (newRequests) => {
    setRequests(newRequests);
  };

  // Function to update matches
  const updateMatches = (newMatches) => {
    setMatches(newMatches);
  };

  // Function to clear all data (for logout)
  const clearAllData = () => {
    setUserInfo(null);
    setDonations([]);
    setRequests([]);
    setMatches([]);
    setDashboardDataLoaded(false);
  };

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user info when user is authenticated
        await fetchUserInfo(user.uid);
      } else {
        // Clear all data when logged out
        clearAllData();
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userInfo,
    userInfoLoading,
    loading,
    fetchUserInfo,
    updateUserInfo,
    // Dashboard data
    donations,
    requests,
    matches,
    dashboardDataLoaded,
    dashboardLoading,
    fetchDashboardData,
    updateDonations,
    updateRequests,
    updateMatches,
    clearAllData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
