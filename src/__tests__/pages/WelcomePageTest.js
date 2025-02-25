// src/__tests__/pages/WelcomePageTest.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import WelcomePage from '../../pages/WelcomePage';
import { getFeaturedItems } from '../../firebase/firebaseService';

// Mock Firebase services
jest.mock('../../firebase/firebaseService');
jest.mock('../../firebase/config', () => ({
  auth: {},
  db: {},
  storage: {}
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn()
};
global.navigator.geolocation = mockGeolocation;

const mockFeaturedItems = [
  {
    id: '1',
    shopId: 'shop1',
    name: 'Test Item 1',
    price: '100',
    description: 'Test description 1',
    shopName: 'Test Shop 1',
    images: ['test-image-1.jpg']
  },
  {
    id: '2',
    shopId: 'shop2',
    name: 'Test Item 2',
    price: '200',
    description: 'Test description 2',
    shopName: 'Test Shop 2',
    images: ['test-image-2.jpg']
  }
];

describe('WelcomePage Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    getFeaturedItems.mockReset();
    mockGeolocation.getCurrentPosition.mockReset();
  });

  test('renders welcome message and main sections', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <WelcomePage />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome to KalKode')).toBeInTheDocument();
    expect(screen.getByText(/Join the underground marketplace/i)).toBeInTheDocument();
    expect(screen.getByText('Open Up Shop')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  test('loads and displays featured items', async () => {
    getFeaturedItems.mockResolvedValue(mockFeaturedItems);

    render(
      <MemoryRouter>
        <AuthProvider>
          <WelcomePage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });
  });

  test('handles failed featured items load', async () => {
    getFeaturedItems.mockRejectedValue(new Error('Failed to load items'));

    render(
      <MemoryRouter>
        <AuthProvider>
          <WelcomePage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load featured items/i)).toBeInTheDocument();
    });
  });

  test('handles tab switching correctly', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <WelcomePage />
        </AuthProvider>
      </MemoryRouter>
    );

    // Click on different tabs
    fireEvent.click(screen.getByText('Nearby Items'));
    expect(screen.getByPlaceholderText(/Enter your address/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Featured Media'));
    // Add assertions for Featured Media tab content

    fireEvent.click(screen.getByText('Featured Items'));
    // Verify return to featured items tab
  });

  test('handles location services for nearby items', async () => {
    const mockPosition = {
      coords: {
        latitude: 29.6350,
        longitude: -95.4738
      }
    };
    mockGeolocation.getCurrentPosition.mockImplementation((success) => success(mockPosition));

    render(
      <MemoryRouter>
        <AuthProvider>
          <WelcomePage />
        </AuthProvider>
      </MemoryRouter>
    );

    // Switch to nearby items tab
    fireEvent.click(screen.getByText('Nearby Items'));
    
    // Click use live location
    fireEvent.click(screen.getByText('Use Live Location'));

    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });
  });

  test('handles navigation to shop creation', () => {
    const { getByText } = render(
      <MemoryRouter>
        <AuthProvider>
          <WelcomePage />
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.click(getByText('Open Up Shop'));
    // Add assertions for navigation
  });

  test('handles pagination correctly', async () => {
    getFeaturedItems.mockResolvedValue(mockFeaturedItems);

    render(
      <MemoryRouter>
        <AuthProvider>
          <WelcomePage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      const paginationInfo = screen.getByText(/Showing/);
      expect(paginationInfo).toBeInTheDocument();
    });

    // Test pagination navigation
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(getFeaturedItems).toHaveBeenCalledTimes(2);
    });
  });
});