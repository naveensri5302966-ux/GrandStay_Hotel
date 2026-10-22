/**
 * SearchBar.test.jsx
 * Scenario 4 / Experiment 1: Hotel Search, Date & Filter Component Testing
 * Testing Framework: Jest & React Testing Library (RTL) Standard Specification
 */

/* eslint-disable no-undef */
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { BookingContext } from '../context/BookingContext';

describe('Scenario 4 - SearchBar Component Tests (React Testing Library & Jest)', () => {
  const defaultContextValues = {
    location: '',
    setLocation: jest.fn(),
    checkIn: '2026-11-10',
    checkOut: '2026-11-14',
    updateDates: jest.fn(),
    guests: 2,
    updateGuests: jest.fn()
  };

  const renderSearchBar = (customContext = {}) => {
    return render(
      <BookingContext.Provider value={{ ...defaultContextValues, ...customContext }}>
        <MemoryRouter>
          <SearchBar />
        </MemoryRouter>
      </BookingContext.Provider>
    );
  };

  test('a) renders all search controls: Destination, Check-In, Check-Out, and Guests', () => {
    renderSearchBar();

    expect(screen.getByLabelText(/Destination \/ Hotel Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Check-In Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Check-Out Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Guests/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  test('b) updates location input as user types', () => {
    let capturedLocation = '';
    const setLocation = (val) => { capturedLocation = val; };

    renderSearchBar({ setLocation });

    const destInput = screen.getByPlaceholderText(/City \(e\.g\. Chennai, Goa/i);
    fireEvent.change(destInput, { target: { value: 'Goa' } });

    expect(capturedLocation).toBe('Goa');
  });

  test('c) updates guest count when dropdown selection changes', () => {
    let selectedGuests = 2;
    const updateGuests = (val) => { selectedGuests = val; };

    renderSearchBar({ updateGuests });

    const guestSelect = screen.getByLabelText(/Guests/i);
    fireEvent.change(guestSelect, { target: { value: '4' } });

    expect(selectedGuests).toBe(4);
  });

  test('d) ensures form submits with Search button', () => {
    let searchCalled = false;
    const onSearch = () => { searchCalled = true; };

    render(
      <BookingContext.Provider value={defaultContextValues}>
        <MemoryRouter>
          <SearchBar onSearch={onSearch} />
        </MemoryRouter>
      </BookingContext.Provider>
    );

    const searchBtn = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchBtn);

    expect(searchCalled).toBe(true);
  });
});
