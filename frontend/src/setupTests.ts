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
