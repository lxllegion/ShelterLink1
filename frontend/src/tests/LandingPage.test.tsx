import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';

describe('LandingPage Component', () => {
  test('renders main heading', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(
      screen.getByText('Connecting People with Shelter Resources')
    ).toBeInTheDocument();
  });

  test('renders description text', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(
      screen.getByText(/ShelterLink helps connect individuals and families/i)
    ).toBeInTheDocument();
  });

  test('renders Get Started button', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    const getStartedButton = screen.getByText('Get Started');
    expect(getStartedButton).toBeInTheDocument();
    expect(getStartedButton.closest('a')).toHaveAttribute('href', '/register');
  });

  test('renders Sign In button', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    const signInButton = screen.getByText('Sign In');
    expect(signInButton).toBeInTheDocument();
    expect(signInButton.closest('a')).toHaveAttribute('href', '/login');
  });

  test('renders feature cards', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Shelter Management')).toBeInTheDocument();
    expect(screen.getByText('Resource Tracking')).toBeInTheDocument();
    expect(screen.getByText('Community Support')).toBeInTheDocument();
  });

  test('renders feature descriptions', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(
      screen.getByText(/Manage shelter listings and track availability/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Monitor capacity and resources/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Connect with local organizations/i)
    ).toBeInTheDocument();
  });
});
