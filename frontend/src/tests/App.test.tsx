// ShelterLink1/frontend/src/App.test.tsx
import { render, screen } from '@testing-library/react';

// Bypass Firebase auth in tests
jest.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: any) => <>{children}</>,
  useAuth: () => ({ currentUser: null, loading: false }),
}));

import App from '../App';

test('renders landing page', () => {
  render(<App />);
  expect(
    screen.getByText(/Connecting People with Shelter Resources/i)
  ).toBeInTheDocument();
});