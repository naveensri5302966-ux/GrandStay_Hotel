/**
 * HotelCard.test.jsx
 * Scenario 4 / Experiment 1: Hotel Booking Component Testing
 * Testing Framework: Jest & React Testing Library (RTL) Standard Specification
 */

/* eslint-disable no-undef */
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HotelCard } from './HotelCard';
import { BookingContext } from '../context/BookingContext';

// Mock Hotel Data
const mockHotel = {
  id: 101,
  name: 'The Grand Stay',
  location: 'Chennai',
  stars: 5,
  price: 8500,
  image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
  description: 'A luxurious 5-star hotel offering elegant suites, premium spa facilities, and world-class hospitality.',
  amenities: ['WiFi', 'Swimming Pool', 'Breakfast', 'Spa'],
  rooms: [
    { id: 1, name: 'Deluxe Room', price: 8500, capacity: 2, available: true },
    { id: 2, name: 'Luxury Suite', price: 12000, capacity: 3, available: true }
  ]
};

const mockSoldOutHotel = {
  ...mockHotel,
  id: 102,
  name: 'Royal Palm Resort',
  rooms: [
    { id: 1, name: 'Deluxe Room', price: 8500, capacity: 2, available: false }
  ]
};

const renderWithProviders = (ui, { selectHotel = jest.fn() } = {}) => {
  return render(
    <BookingContext.Provider value={{ selectHotel }}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </BookingContext.Provider>
  );
};

describe('Scenario 4 - HotelCard Component Tests (React Testing Library & Jest)', () => {
  test('a) renders hotel name, location and pricing in Indian Rupees', () => {
    renderWithProviders(<HotelCard hotel={mockHotel} />);
    
    // Check Hotel Name
    expect(screen.getByText('The Grand Stay')).toBeInTheDocument();
    
    // Check Location
    expect(screen.getAllByText(/Chennai/i).length).toBeGreaterThan(0);
    
    // Check Indian Rupee formatted pricing
    expect(screen.getByText('₹8,500')).toBeInTheDocument();
  });

  test('b) displays 5-star rating and availability indicator', () => {
    renderWithProviders(<HotelCard hotel={mockHotel} />);
    
    // Check 5 star stars symbol rendered
    expect(screen.getByText('★★★★★')).toBeInTheDocument();
    
    // Availability badge
    expect(screen.getByText(/✓ Available/i)).toBeInTheDocument();
  });

  test('c) shows Sold Out status when rooms are unavailable', () => {
    renderWithProviders(<HotelCard hotel={mockSoldOutHotel} />);
    expect(screen.getByText(/Sold Out/i)).toBeInTheDocument();
  });

  test('d) triggers navigation and hotel selection upon "View Details" click', () => {
    let clicked = false;
    const handleSelect = () => { clicked = true; };

    renderWithProviders(<HotelCard hotel={mockHotel} viewDetails={handleSelect} />);
    
    const detailsBtn = screen.getByRole('button', { name: /View Details/i });
    expect(detailsBtn).toBeInTheDocument();
    
    fireEvent.click(detailsBtn);
    expect(clicked).toBe(true);
  });

  test('e) contains accessible image element with lazy loading attribute', () => {
    renderWithProviders(<HotelCard hotel={mockHotel} />);
    const img = screen.getByRole('img', { name: /The Grand Stay/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('src', mockHotel.image);
  });
});
