# Shelters Near Me Feature - Setup Guide

## Overview
The "Shelters Near Me" feature allows users to view homeless shelters on an interactive map with location-based filtering and distance calculations.

## What Was Implemented

### Backend Changes

1. **Database Schema Updates** ([database.py](backend/database.py))
   - Added location fields to `shelters_table`:
     - `address`, `city`, `state`, `zip_code`
     - `latitude`, `longitude` (for map coordinates)

2. **API Endpoints**
   - New endpoint: `GET /shelters/` - Returns all shelters with location data
   - Files created:
     - [backend/routers/shelters.py](backend/routers/shelters.py)
     - [backend/services/shelters.py](backend/services/shelters.py)

3. **Schema Updates** ([backend/schemas/shelter.py](backend/schemas/shelter.py))
   - Added optional location fields to Shelter model

4. **Service Updates** ([backend/services/signup.py](backend/services/signup.py))
   - Updated `create_shelter()` to save location fields

### Frontend Changes

1. **New Page Component** ([frontend/src/pages/SheltersNearMe.tsx](frontend/src/pages/SheltersNearMe.tsx))
   - Interactive map using Leaflet/OpenStreetMap
   - User location detection via Geolocation API
   - Distance-based filtering (5, 10, 25, 50 miles)
   - Split view: map on left, shelter list on right
   - Haversine formula for distance calculations
   - Markers for user location and shelters

2. **API Integration** ([frontend/src/api/backend.ts](frontend/src/api/backend.ts))
   - Added `Shelter` interface
   - Created `getShelters()` function

3. **Navigation Updates**
   - Added `/shelters` route in [App.tsx](frontend/src/App.tsx)
   - Updated [NavBar.tsx](frontend/src/components/NavBar.tsx) with navigation links

4. **Dependencies Installed**
   - `leaflet` - Map library
   - `react-leaflet` - React bindings for Leaflet
   - `@types/leaflet` - TypeScript definitions

## How to Test

### 1. Start the Backend

```bash
cd backend
# Make sure your virtual environment is activated
python -m uvicorn main:app --reload
```

The backend should be running at http://localhost:8000

### 2. Add Sample Shelters to Database

Since the existing shelters in the database don't have location data, you need to either:

**Option A: Register new shelters via the registration form with location data**

**Option B: Manually insert test data using Python:**

```python
# Run this in your backend directory with venv activated
from database import engine, shelters_table
import uuid

shelters = [
    {
        "id": str(uuid.uuid4()),
        "uid": "S00001",
        "shelter_name": "Seattle Shelter",
        "email": "contact@seashelter.org",
        "phone_number": "555-123-4567",
        "address": "1902 2nd Ave",
        "city": "Seattle",
        "state": "WA",
        "zip_code": "98101",
        "latitude": "47.6097",
        "longitude": "-122.3331"
    },
    {
        "id": str(uuid.uuid4()),
        "uid": "S00002",
        "shelter_name": "Tacoma Care Center",
        "email": "info@tacshelter.org",
        "phone_number": "555-987-6543",
        "address": "1501 Pacific Ave",
        "city": "Tacoma",
        "state": "WA",
        "zip_code": "98402",
        "latitude": "47.2529",
        "longitude": "-122.4443"
    },
    {
        "id": str(uuid.uuid4()),
        "uid": "S00003",
        "shelter_name": "Bellevue Hope Center",
        "email": "help@bellevuehope.org",
        "phone_number": "555-222-3333",
        "address": "1116 108th Ave NE",
        "city": "Bellevue",
        "state": "WA",
        "zip_code": "98004",
        "latitude": "47.6149",
        "longitude": "-122.1938"
    }
]

with engine.connect() as conn:
    trans = conn.begin()
    for shelter in shelters:
        conn.execute(shelters_table.insert().values(**shelter))
    trans.commit()
```

### 3. Start the Frontend

```bash
cd frontend
npm start
```

The app should open at http://localhost:3000

### 4. Test the Feature

1. Register/Login to the app
2. Click "Shelters Near Me" in the navigation bar
3. Allow location access when prompted (optional, for distance filtering)
4. You should see:
   - An interactive map with shelter markers
   - A list of shelters on the right side
   - Distance information if location is enabled
   - Filter options to show shelters within specific distances

## Features

- **Interactive Map**: OpenStreetMap showing all shelters
- **User Location Detection**: Shows your current location on the map
- **Distance Filtering**: Filter shelters by distance (5/10/25/50 miles)
- **Distance Calculation**: Shows exact distance to each shelter
- **Detailed Information**: Address, phone, email for each shelter
- **Responsive Design**: Works on different screen sizes
- **Marker Popups**: Click markers to see shelter details

## Future Enhancements

1. **Update Registration Form**: Add location fields to shelter registration
2. **Geocoding Integration**: Automatically convert addresses to coordinates using:
   - Google Maps Geocoding API
   - Mapbox Geocoding API
   - OpenStreetMap Nominatim
3. **Search Functionality**: Search shelters by name or location
4. **Advanced Filters**: Filter by services offered, capacity, hours
5. **Directions**: Add "Get Directions" button linking to Google Maps
6. **Clustering**: Group nearby markers for better map visualization
7. **Real-time Data**: Update shelter availability/capacity in real-time

## API Endpoints

### Get All Shelters
```
GET http://localhost:8000/shelters/

Response:
{
  "shelters": [
    {
      "id": "...",
      "uid": "...",
      "shelter_name": "Seattle Shelter",
      "email": "contact@seashelter.org",
      "phone_number": "555-123-4567",
      "address": "1902 2nd Ave",
      "city": "Seattle",
      "state": "WA",
      "zip_code": "98101",
      "latitude": "47.6097",
      "longitude": "-122.3331"
    }
  ],
  "count": 1
}
```

## Troubleshooting

### Map Not Displaying
- Check browser console for errors
- Ensure leaflet CSS is imported
- Verify shelters have valid latitude/longitude values

### No Shelters Showing
- Check that shelters exist in the database with location data
- Verify the backend is running and accessible
- Check browser console for API errors

### Location Not Working
- Ensure HTTPS or localhost (geolocation requires secure context)
- Check browser permissions for location access
- Try manually selecting a distance filter

### TypeScript Errors
- Ensure `@types/leaflet` is installed
- Run `npm install` to verify all dependencies

## Files Modified/Created

### Backend
- `backend/database.py` - Added location columns
- `backend/schemas/shelter.py` - Added location fields
- `backend/routers/shelters.py` - NEW
- `backend/services/shelters.py` - NEW
- `backend/services/signup.py` - Updated shelter creation
- `backend/main.py` - Registered shelters router
- `backend/data/mock_data.json` - Added sample data

### Frontend
- `frontend/src/pages/SheltersNearMe.tsx` - NEW
- `frontend/src/api/backend.ts` - Added getShelters()
- `frontend/src/App.tsx` - Added /shelters route
- `frontend/src/components/NavBar.tsx` - Added navigation links
- `frontend/package.json` - Added leaflet dependencies
