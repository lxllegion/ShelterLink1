import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import NavBar from '../components/NavBar';
import { getShelters, Shelter, getShelterRequests, ShelterRequest } from '../api/backend';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

function SheltersNearMe() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [shelterRequests, setShelterRequests] = useState<{[key: string]: ShelterRequest[]}>({});
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Default center (San Francisco, CA)
  const defaultCenter: [number, number] = [37.7749, -122.4194];

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    // Fetch shelters from backend
    const fetchShelters = async () => {
      try {
        setLoading(true);
        const data = await getShelters();
        setShelters(data);
        setError(null);
      } catch (err) {
        setError('Failed to load shelters. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();
  }, []);

  // Handle shelter click - fetch requests on demand
  const handleShelterClick = async (shelter: Shelter) => {
    setSelectedShelter(shelter);

    // Only fetch if we haven't already cached this shelter's requests
    if (!shelterRequests[shelter.uid]) {
      setLoadingRequests(true);
      try {
        const requests = await getShelterRequests(shelter.uid);
        setShelterRequests(prev => ({
          ...prev,
          [shelter.uid]: requests
        }));
      } catch (error) {
        console.error(`Failed to fetch requests for shelter ${shelter.uid}:`, error);
        setShelterRequests(prev => ({
          ...prev,
          [shelter.uid]: []
        }));
      } finally {
        setLoadingRequests(false);
      }
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter and sort shelters
  const getFilteredShelters = () => {
    let filtered = shelters.filter(shelter =>
      shelter.latitude && shelter.longitude
    );

    if (userLocation && selectedFilter !== 'all') {
      const radius = parseInt(selectedFilter);
      filtered = filtered.filter(shelter => {
        const distance = calculateDistance(
          userLocation[0],
          userLocation[1],
          parseFloat(shelter.latitude!),
          parseFloat(shelter.longitude!)
        );
        return distance <= radius;
      });
    }

    // Sort by distance if user location is available
    if (userLocation) {
      filtered.sort((a, b) => {
        const distA = calculateDistance(
          userLocation[0],
          userLocation[1],
          parseFloat(a.latitude!),
          parseFloat(a.longitude!)
        );
        const distB = calculateDistance(
          userLocation[0],
          userLocation[1],
          parseFloat(b.latitude!),
          parseFloat(b.longitude!)
        );
        return distA - distB;
      });
    }

    return filtered;
  };

  const filteredShelters = getFilteredShelters();
  const mapCenter = userLocation || defaultCenter;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <NavBar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Shelters Near Me
          </h1>
          <p style={{ color: '#6b7280' }}>
            Find homeless shelters in your area
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontWeight: '500' }}>Distance Filter:</label>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              backgroundColor: 'white'
            }}
            disabled={!userLocation}
          >
            <option value="all">All Shelters</option>
            <option value="5">Within 5 miles</option>
            <option value="10">Within 10 miles</option>
            <option value="25">Within 25 miles</option>
            <option value="50">Within 50 miles</option>
          </select>
          {!userLocation && (
            <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>
              Enable location to use distance filter
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>Loading shelters...</p>
          </div>
        ) : error ? (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '0.5rem'
          }}>
            {error}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Map */}
            <div style={{
              height: '600px',
              border: '2px solid black',
              borderRadius: '0.5rem',
              overflow: 'hidden'
            }}>
              <MapContainer
                center={mapCenter}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User location marker */}
                {userLocation && (
                  <Marker position={userLocation}>
                    <Popup>Your Location</Popup>
                  </Marker>
                )}

                {/* Shelter markers */}
                {filteredShelters.map((shelter) => (
                  shelter.latitude && shelter.longitude && (
                    <Marker
                      key={shelter.id}
                      position={[parseFloat(shelter.latitude), parseFloat(shelter.longitude)]}
                    >
                      <Popup>
                        <div style={{ minWidth: '200px' }}>
                          <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            {shelter.shelter_name}
                          </h3>
                          {shelter.address && (
                            <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                              {shelter.address}
                            </p>
                          )}
                          {shelter.city && shelter.state && (
                            <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                              {shelter.city}, {shelter.state} {shelter.zip_code}
                            </p>
                          )}
                          <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                            {shelter.phone_number}
                          </p>
                          <p style={{ fontSize: '0.875rem' }}>
                            {shelter.email}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </div>

            {/* Shelter List */}
            <div style={{ height: '600px', overflowY: 'auto' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Shelter List ({filteredShelters.length})
              </h2>

              {filteredShelters.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                  No shelters found with the selected filters.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredShelters.map((shelter) => {
                    const distance = userLocation && shelter.latitude && shelter.longitude
                      ? calculateDistance(
                          userLocation[0],
                          userLocation[1],
                          parseFloat(shelter.latitude),
                          parseFloat(shelter.longitude)
                        )
                      : null;

                    return (
                      <div
                        key={shelter.id}
                        onClick={() => handleShelterClick(shelter)}
                        style={{
                          backgroundColor: 'white',
                          border: '2px solid black',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'black';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                            {shelter.shelter_name}
                          </h3>
                          <span style={{ color: '#3b82f6', fontSize: '0.875rem' }}>View Details →</span>
                        </div>

                        {distance !== null && (
                          <p style={{ color: '#059669', fontWeight: '500', marginBottom: '0.5rem' }}>
                            {distance.toFixed(1)} miles away
                          </p>
                        )}

                        <div style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                          {shelter.city && shelter.state && (
                            <p>{shelter.city}, {shelter.state}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Shelter Detail Modal */}
      {selectedShelter && (
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
          onClick={() => setSelectedShelter(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '2rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                {selectedShelter.shelter_name}
              </h2>
              <button
                onClick={() => setSelectedShelter(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>

            {/* Distance */}
            {userLocation && selectedShelter.latitude && selectedShelter.longitude && (
              <p style={{ color: '#059669', fontWeight: '600', fontSize: '1rem', marginBottom: '1rem' }}>
                {calculateDistance(
                  userLocation[0],
                  userLocation[1],
                  parseFloat(selectedShelter.latitude),
                  parseFloat(selectedShelter.longitude)
                ).toFixed(1)} miles away
              </p>
            )}

            {/* Contact Information Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                Contact Information
              </h3>
              <div style={{ display: 'grid', gap: '0.5rem', color: '#4b5563' }}>
                {selectedShelter.address && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '500' }}>Address:</span>
                    <span>{selectedShelter.address}</span>
                  </div>
                )}
                {selectedShelter.city && selectedShelter.state && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '500' }}>City:</span>
                    <span>{selectedShelter.city}, {selectedShelter.state} {selectedShelter.zip_code}</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '500' }}>Phone:</span>
                  <a href={`tel:${selectedShelter.phone_number}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    {selectedShelter.phone_number}
                  </a>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '500' }}>Email:</span>
                  <a href={`mailto:${selectedShelter.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                    {selectedShelter.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Items Needed Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                Items Needed
              </h3>
              {loadingRequests ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>Loading items...</p>
              ) : (shelterRequests[selectedShelter.uid] || []).length > 0 ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {(shelterRequests[selectedShelter.uid] || []).map((request) => (
                    <div
                      key={request.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: '500', color: '#111827' }}>{request.item_name}</p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{request.category}</p>
                      </div>
                      <div style={{
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}>
                        Qty: {request.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No items currently needed</p>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              {selectedShelter.latitude && selectedShelter.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedShelter.latitude},${selectedShelter.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    textDecoration: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Get Directions
                </a>
              )}
              <button
                onClick={() => setSelectedShelter(null)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SheltersNearMe;
