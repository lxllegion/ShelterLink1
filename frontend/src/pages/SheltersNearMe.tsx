import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import NavBar from '../components/NavBar';
import { getShelters, Shelter } from '../api/backend';
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
                        style={{
                          backgroundColor: 'white',
                          border: '2px solid black',
                          padding: '1rem',
                          borderRadius: '0.5rem'
                        }}
                      >
                        <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                          {shelter.shelter_name}
                        </h3>

                        {distance !== null && (
                          <p style={{ color: '#059669', fontWeight: '500', marginBottom: '0.5rem' }}>
                            {distance.toFixed(1)} miles away
                          </p>
                        )}

                        <div style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                          {shelter.address && (
                            <p style={{ marginBottom: '0.25rem' }}>
                              {shelter.address}
                            </p>
                          )}
                          {shelter.city && shelter.state && (
                            <p style={{ marginBottom: '0.25rem' }}>
                              {shelter.city}, {shelter.state} {shelter.zip_code}
                            </p>
                          )}
                          <p style={{ marginBottom: '0.25rem' }}>
                            Phone: {shelter.phone_number}
                          </p>
                          <p>Email: {shelter.email}</p>
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
    </div>
  );
}

export default SheltersNearMe;
