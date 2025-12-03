import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserInfo, UserInfo, updateDonor, updateShelter, deleteDonor, deleteShelter } from '../api/backend';
import NavBar from '../components/NavBar';
import DeleteAccountModal from '../components/DeleteAccountModal';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from 'firebase/auth';

// Geocoding function using OpenStreetMap Nominatim API
const geocodeAddress = async (address: string, city: string, state: string, zipCode: string): Promise<{ lat: string; lon: string } | null> => {
  try {
    const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`,
      {
        headers: {
          'User-Agent': 'ShelterLink/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: data[0].lat, lon: data[0].lon };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

function Profile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  // Form states for editing
  const [editName, setEditName] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editShelterName, setEditShelterName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editZipCode, setEditZipCode] = useState('');
  const [editLatitude, setEditLatitude] = useState('');
  const [editLongitude, setEditLongitude] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const data = await getUserInfo(currentUser.uid);
        setUserInfo(data);

        // Initialize edit form with current data
        if (data.userData) {
          setEditName(data.userData.name || '');
          setEditPhoneNumber(data.userData.phone_number || '');
          setEditUsername(data.userData.username || '');
          setEditShelterName(data.userData.shelter_name || '');
          setEditAddress(data.userData.address || '');
          setEditCity(data.userData.city || '');
          setEditState(data.userData.state || '');
          setEditZipCode(data.userData.zip_code || '');
          setEditLatitude(data.userData.latitude || '');
          setEditLongitude(data.userData.longitude || '');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load user information');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [currentUser]);

  const handleSaveChanges = async () => {
    try {
      if (userInfo?.userType === 'donor') { 
        await updateDonor(currentUser?.uid || '', {
          name: editName,
          phone_number: editPhoneNumber,
          username: editUsername,
        });
        // Update local state to reflect changes
        setUserInfo({
          ...userInfo,
          userData: {
            ...userInfo.userData,
            name: editName,
            phone_number: editPhoneNumber,
            username: editUsername,
          }
        });
      } else if (userInfo?.userType === 'shelter') {
        // Auto-geocode when address fields are filled
        let lat = editLatitude;
        let lon = editLongitude;
        
        if (editAddress && editCity && editState) {
          setIsGeocoding(true);
          const coords = await geocodeAddress(editAddress, editCity, editState, editZipCode);
          if (coords) {
            lat = coords.lat;
            lon = coords.lon;
            setEditLatitude(lat);
            setEditLongitude(lon);
          }
          setIsGeocoding(false);
        }
        
        await updateShelter(currentUser?.uid || '', {
          shelter_name: editShelterName,
          phone_number: editPhoneNumber,
          address: editAddress,
          city: editCity,
          state: editState,
          zip_code: editZipCode,
          latitude: lat,
          longitude: lon,
        });
        // Update local state to reflect changes
        setUserInfo({
          ...userInfo,
          userData: {
            ...userInfo.userData,
            shelter_name: editShelterName,
            phone_number: editPhoneNumber,
            address: editAddress,
            city: editCity,
            state: editState,
            zip_code: editZipCode,
            latitude: lat,
            longitude: lon,
          }
        });
      }
    } catch (error) {
      alert('Error updating profile: ' + error);
      return;
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    if (userInfo?.userData) {
      setEditName(userInfo.userData.name || '');
      setEditPhoneNumber(userInfo.userData.phone_number || '');
      setEditUsername(userInfo.userData.username || '');
      setEditShelterName(userInfo.userData.shelter_name || '');
      setEditAddress(userInfo.userData.address || '');
      setEditCity(userInfo.userData.city || '');
      setEditState(userInfo.userData.state || '');
      setEditZipCode(userInfo.userData.zip_code || '');
      setEditLatitude(userInfo.userData.latitude || '');
      setEditLongitude(userInfo.userData.longitude || '');
    }
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;

    try {

      if (userInfo?.userType === 'donor') {
        await deleteDonor(currentUser.uid);
      } else if (userInfo?.userType === 'shelter') {
        await deleteShelter(currentUser.uid);
      }
      // Delete user from Firebase Authentication
      await deleteUser(currentUser);
      navigate('/');
    } catch (err: any) {
      console.error('Error deleting account:', err);
      alert('Failed to delete account. Please try again or contact support.');
    }
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <NavBar />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 32px', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexShrink: 0
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            My Profile
          </h1>
          {!isEditing && !loading && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                backgroundColor: 'black',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: '12px',
            padding: '16px',
            flexShrink: 0
          }}>
            <p style={{ color: '#991b1b', fontWeight: '600' }}>Error: {error}</p>
          </div>
        )}

        {/* Profile Content */}
        {!loading && !error && userInfo && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px solid black',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* User Type Badge */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: userInfo.userType === 'donor' ? '#fef2f2' : '#eff6ff',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '32px' }}>
                  {userInfo.userType === 'donor' ? '❤️' : '🏠'}
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                    {userInfo.userType === 'donor' ? 'Donor Account' : 'Shelter Account'}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>
                    {userInfo.userType === 'donor' 
                      ? 'Making a difference through donations'
                      : 'Helping those in need'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div style={{ padding: '20px' }}>
              {isEditing ? (
                // Edit Mode
                <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Name (Donor only) */}
                    {userInfo.userType === 'donor' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}

                    {/* Username (Donor only) */}
                    {userInfo.userType === 'donor' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                          Username
                        </label>
                        <input
                          type="text"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}

                    {/* Shelter Name (Shelter only) */}
                    {userInfo.userType === 'shelter' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                          Shelter Name
                        </label>
                        <input
                          type="text"
                          value={editShelterName}
                          onChange={(e) => setEditShelterName(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '2px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}

                    {/* Phone Number */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editPhoneNumber}
                        onChange={(e) => setEditPhoneNumber(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Address fields (Shelter only) */}
                    {userInfo.userType === 'shelter' && (
                      <>
                        <div>
                          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            placeholder="123 Main St"
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '16px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>
                              City
                            </label>
                            <input
                              type="text"
                              value={editCity}
                              onChange={(e) => setEditCity(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>
                              State
                            </label>
                            <input
                              type="text"
                              value={editState}
                              onChange={(e) => setEditState(e.target.value)}
                              placeholder="WA"
                              maxLength={2}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>
                              ZIP Code
                            </label>
                            <input
                              type="text"
                              value={editZipCode}
                              onChange={(e) => setEditZipCode(e.target.value)}
                              placeholder="12345"
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        </div>

                      </>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button
                        type="submit"
                        disabled={isGeocoding}
                        style={{
                          flex: 1,
                          backgroundColor: 'black',
                          color: 'white',
                          padding: '10px',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: isGeocoding ? 'not-allowed' : 'pointer',
                          opacity: isGeocoding ? 0.7 : 1
                        }}
                      >
                        {isGeocoding ? 'Getting Location...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        style={{
                          flex: 1,
                          backgroundColor: 'white',
                          color: 'black',
                          padding: '10px',
                          border: '2px solid black',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                // View Mode
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Name (Donor only) */}
                  {userInfo.userType === 'donor' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase' }}>
                        Full Name
                      </label>
                      <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '500' }}>
                        {userInfo.userData?.name || 'Not provided'}
                      </p>
                    </div>
                  )}

                  {/* Username (Donor only) */}
                  {userInfo.userType === 'donor' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase' }}>
                        Username
                      </label>
                      <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '500' }}>
                        {userInfo.userData?.username || 'Not provided'}
                      </p>
                    </div>
                  )}

                  {/* Shelter Name (Shelter only) */}
                  {userInfo.userType === 'shelter' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase' }}>
                        Shelter Name
                      </label>
                      <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '500' }}>
                        {userInfo.userData?.shelter_name || 'Not provided'}
                      </p>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase' }}>
                      Email Address
                    </label>
                    <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '500' }}>
                      {userInfo.userData?.email || currentUser?.email || 'Not provided'}
                    </p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase' }}>
                      Phone Number
                    </label>
                    <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '500' }}>
                      {userInfo.userData?.phone_number || 'Not provided'}
                    </p>
                  </div>

                  {/* Address (Shelter only) */}
                  {userInfo.userType === 'shelter' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#6b7280', marginBottom: '2px', textTransform: 'uppercase' }}>
                        Address
                      </label>
                      <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '500' }}>
                        {userInfo.userData?.address && userInfo.userData?.city && userInfo.userData?.state ? (
                          <>
                            {userInfo.userData.address}<br />
                            {userInfo.userData.city}, {userInfo.userData.state} {userInfo.userData.zip_code}
                          </>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    </div>
                  )}

                  {/* Delete Account Button */}
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{
                        backgroundColor: 'white',
                        color: '#dc2626',
                        padding: '10px 20px',
                        border: '2px solid #dc2626',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        userType={userInfo?.userType || null}
      />
    </div>
  );
}

export default Profile;