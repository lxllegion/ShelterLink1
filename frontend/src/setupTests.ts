// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Prevent real Firebase initialization during tests
jest.mock('firebase/app', () => ({
  initializeApp: () => ({}),
}));

jest.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  onAuthStateChanged: (_auth: any, cb: any) => {
    // Immediately resolve as "logged out" in tests
    cb(null);
    return () => {};
  },
}));

// Mock react-leaflet components
jest.mock('react-leaflet', () => {
  const React = require('react');
  return {
    MapContainer: ({ children }: any) => React.createElement('div', { 'data-testid': 'map-container' }, children),
    TileLayer: () => React.createElement('div', { 'data-testid': 'tile-layer' }),
    Marker: ({ children }: any) => React.createElement('div', { 'data-testid': 'marker' }, children),
    Popup: ({ children }: any) => React.createElement('div', { 'data-testid': 'popup' }, children),
    useMap: () => ({}),
    useMapEvent: () => ({}),
    useMapEvents: () => ({}),
  };
});

// Mock leaflet
jest.mock('leaflet', () => ({
  Icon: {
    Default: {
      prototype: {},
      mergeOptions: jest.fn(),
    },
  },
  icon: jest.fn(),
  marker: jest.fn(),
  map: jest.fn(),
}));