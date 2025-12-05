import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavBar from '../components/NavBar';

// Mock Firebase auth
jest.mock('../firebase', () => ({
  auth: {
    signOut: jest.fn(() => Promise.resolve()),
  },
}));

// Mock AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { email: 'test@example.com', uid: 'test-uid' },
    loading: false,
  }),
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('NavBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders ShelterLink branding', () => {
    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    expect(screen.getByText('ShelterLink')).toBeInTheDocument();
    expect(screen.getByText('❤️')).toBeInTheDocument();
  });

  test('displays user email', () => {
    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    expect(screen.getByText(/Welcome, test@example.com/i)).toBeInTheDocument();
  });

  test('renders navigation buttons', () => {
    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('navigates to dashboard when Dashboard button is clicked', () => {
    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    const dashboardButton = screen.getByText('Dashboard');
    fireEvent.click(dashboardButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('navigates to profile when Profile button is clicked', () => {
    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    const profileButton = screen.getByText('Profile');
    fireEvent.click(profileButton);

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  test('shows Shelters Near Me button for donors', () => {
    localStorage.setItem('userType', 'donor');

    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    expect(screen.getByText('Shelters Near Me')).toBeInTheDocument();
  });

  test('hides Shelters Near Me button for shelters', () => {
    localStorage.setItem('userType', 'shelter');

    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    expect(screen.queryByText('Shelters Near Me')).not.toBeInTheDocument();
  });
});
