/**
 * RoomCard.test.jsx
 * Scenario 4 / Experiment 1: Room Selection & Component Testing
 * Testing Framework: Jest & React Testing Library (RTL) Standard Specification
 */

/* eslint-disable no-undef */
import { render, screen, fireEvent } from '@testing-library/react';
import { RoomCard } from './RoomCard';

const mockRoom = {
  id: 1,
  name: 'Deluxe Suite',
  price: 9500,
  capacity: 2,
  available: true
};

const mockUnavailableRoom = {
  id: 2,
  name: 'Presidential Penthouse',
  price: 25000,
  capacity: 4,
  available: false
};

describe('Scenario 4 - RoomCard Component Tests (React Testing Library & Jest)', () => {
  test('a) renders room title, price and guest capacity', () => {
    render(<RoomCard room={mockRoom} guestCount={2} />);
    
    // Check Room Name
    expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
    
    // Check Price formatted
    expect(screen.getByText('₹9,500')).toBeInTheDocument();
    
    // Check Capacity
    expect(screen.getByText(/Up to 2 Guests/i)).toBeInTheDocument();
  });

  test('b) displays active selection badge and aria-pressed when isSelected=true', () => {
    render(<RoomCard room={mockRoom} isSelected={true} />);
    
    // Badge rendered
    expect(screen.getAllByText(/Selected Room ✓/i)[0]).toBeInTheDocument();
    
    // Check accessibility button state
    const selectBtn = screen.getByRole('button', { name: /Selected Room ✓/i });
    expect(selectBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('c) triggers onSelect callback with room object when clicked', () => {
    let selectedRoom = null;
    const handleSelect = (room) => {
      selectedRoom = room;
    };

    render(<RoomCard room={mockRoom} onSelect={handleSelect} isSelected={false} />);
    
    const selectBtn = screen.getByRole('button', { name: /Select Room/i });
    fireEvent.click(selectBtn);
    
    expect(selectedRoom).toEqual(mockRoom);
  });

  test('d) disables button and shows "Unavailable" when room.available is false', () => {
    render(<RoomCard room={mockUnavailableRoom} />);
    
    const unavailableBtn = screen.getByRole('button', { name: /Unavailable/i });
    expect(unavailableBtn).toBeDisabled();
  });

  test('e) warns user if requested guest count exceeds room capacity', () => {
    render(<RoomCard room={mockRoom} guestCount={4} />);
    
    expect(screen.getByText(/exceed this room's capacity/i)).toBeInTheDocument();
  });
});
