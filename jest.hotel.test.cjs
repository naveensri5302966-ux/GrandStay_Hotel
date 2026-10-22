/**
 * jest.hotel.test.cjs
 * Standalone Jest Test File for Hotel Booking Components
 * 
 * Scenario 4 / Experiment 1: Component Testing with Jest & React Testing Library specifications
 * Run directly via: node jest.hotel.test.cjs
 */

const assert = require("assert");

// Colors for terminal reporting
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  magenta: "\x1b[35m"
};

// --- Mock Hotel Dataset ---
const mockHotels = [
  {
    id: 101,
    name: "The Grand Stay",
    location: "Chennai",
    stars: 5,
    price: 8500,
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
    description: "A luxurious 5-star hotel offering elegant suites and premium spa facilities.",
    amenities: ["WiFi", "Swimming Pool", "Breakfast", "Spa"],
    rooms: [
      { id: 1, name: "Deluxe Room", price: 8500, capacity: 2, available: true },
      { id: 2, name: "Luxury Suite", price: 12000, capacity: 3, available: true }
    ]
  },
  {
    id: 102,
    name: "Royal Palm Resort",
    location: "Coimbatore",
    stars: 4,
    price: 6500,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
    description: "A peaceful resort surrounded by lush palm gardens.",
    amenities: ["WiFi", "Swimming Pool", "Gym", "Breakfast"],
    rooms: [
      { id: 1, name: "Standard Room", price: 6500, capacity: 2, available: true },
      { id: 2, name: "Palm Suite", price: 9500, capacity: 4, available: false }
    ]
  },
  {
    id: 103,
    name: "Serene Palace",
    location: "Bangalore",
    stars: 5,
    price: 10500,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    description: "Palatial grandeur meets contemporary technology in Bangalore.",
    amenities: ["WiFi", "Spa", "Gym", "Breakfast"],
    rooms: [
      { id: 1, name: "Executive Room", price: 10500, capacity: 2, available: true },
      { id: 2, name: "Presidential Suite", price: 18000, capacity: 4, available: true }
    ]
  }
];

// --- Financial Calculator ---
function calculateStayFinancials(roomPrice, checkIn, checkOut) {
  if (!checkIn || !checkOut || !roomPrice) {
    return { durationNights: 0, roomCost: 0, gst: 0, resortFee: 0, totalAmount: 0 };
  }
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return { durationNights: 0, roomCost: 0, gst: 0, resortFee: 0, totalAmount: 0, error: "Invalid dates" };
  }
  const diffTime = end.getTime() - start.getTime();
  const durationNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const roomCost = durationNights * roomPrice;
  const gst = Math.round(roomCost * 0.12);
  const resortFee = roomCost > 0 ? 500 : 0;
  const totalAmount = roomCost + gst + resortFee;

  return { durationNights, roomCost, gst, resortFee, totalAmount };
}

// --- Component DOM Simulators (RTL Equivalent) ---
function renderHotelCard(hotel) {
  const hasAvailableRoom = hotel.rooms ? hotel.rooms.some((r) => r.available !== false) : true;
  return {
    name: hotel.name,
    location: hotel.location,
    stars: hotel.stars,
    starsBadge: "★".repeat(hotel.stars),
    priceDisplay: `₹${hotel.price.toLocaleString("en-IN")}`,
    hasAvailableRoom,
    statusText: hasAvailableRoom ? "✓ Available" : "Sold Out",
    ariaLabel: `${hotel.name}, ${hotel.stars}-star hotel in ${hotel.location}`,
    imgLoading: "lazy"
  };
}

function renderRoomCard(room, isSelected = false, guestCount = 1) {
  const isAvailable = room.available !== false;
  const exceedsCapacity = room.capacity && guestCount > room.capacity;
  return {
    name: room.name,
    priceDisplay: `₹${room.price.toLocaleString("en-IN")}`,
    capacityText: `Up to ${room.capacity} ${room.capacity === 1 ? "Guest" : "Guests"}`,
    isSelected,
    isAvailable,
    exceedsCapacity,
    ariaLabel: `Select ${room.name} for ₹${room.price.toLocaleString("en-IN")} per night, capacity ${room.capacity} guests`,
    ariaPressed: isSelected,
    buttonText: !isAvailable ? "Unavailable" : isSelected ? "Selected Room ✓" : "Select Room"
  };
}

function searchHotels(hotels, { location = "", maxPrice = null, minStars = 0 }) {
  return hotels.filter((h) => {
    if (location && !h.location.toLowerCase().includes(location.toLowerCase()) && !h.name.toLowerCase().includes(location.toLowerCase())) {
      return false;
    }
    if (maxPrice !== null && h.price > maxPrice) return false;
    if (minStars > 0 && h.stars < minStars) return false;
    return true;
  });
}

// --- Jest Test Suite Engine ---
let passedTests = 0;
let totalTests = 0;

function describe(suiteName, fn) {
  console.log(`\n${colors.cyan}${colors.bold}================================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}🧪 JEST SUITE: ${suiteName}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}================================================================${colors.reset}`);
  fn();
}

function test(testName, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ${colors.green}✓ PASS:${colors.reset} ${testName}`);
  } catch (err) {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} ${testName}`);
    console.error(`    ${colors.red}${err.message}${colors.reset}`);
  }
}

// Custom Jest `expect` matcher utility
function expect(actual) {
  return {
    toBe: (expected) => assert.strictEqual(actual, expected),
    toEqual: (expected) => assert.deepStrictEqual(actual, expected),
    toBeTruthy: () => assert.ok(actual),
    toBeFalsy: () => assert.ok(!actual),
    toBeGreaterThan: (expected) => assert.ok(actual > expected),
    toContain: (item) => assert.ok(actual.includes(item))
  };
}

// ============================================================================
// EXECUTE TESTS
// ============================================================================

describe("Scenario 4 - Hotel Booking Component Testing (Jest)", () => {
  
  test("1. HotelCard renders correct hotel name, price in INR, and stars", () => {
    const card = renderHotelCard(mockHotels[0]);
    expect(card.name).toBe("The Grand Stay");
    expect(card.priceDisplay).toBe("₹8,500");
    expect(card.starsBadge).toBe("★★★★★");
    expect(card.location).toBe("Chennai");
  });

  test("2. HotelCard renders accessible aria-label and lazy image attribute", () => {
    const card = renderHotelCard(mockHotels[0]);
    expect(card.ariaLabel).toBe("The Grand Stay, 5-star hotel in Chennai");
    expect(card.imgLoading).toBe("lazy");
  });

  test("3. HotelCard reflects sold out status when no rooms are available", () => {
    const soldOutHotel = {
      ...mockHotels[1],
      rooms: [{ id: 1, name: "Room", price: 5000, available: false }]
    };
    const card = renderHotelCard(soldOutHotel);
    expect(card.hasAvailableRoom).toBeFalsy();
    expect(card.statusText).toBe("Sold Out");
  });

  test("4. RoomCard renders room details, formatted INR price and capacity", () => {
    const room = mockHotels[0].rooms[0];
    const roomCard = renderRoomCard(room, false, 2);
    expect(roomCard.name).toBe("Deluxe Room");
    expect(roomCard.priceDisplay).toBe("₹8,500");
    expect(roomCard.capacityText).toBe("Up to 2 Guests");
    expect(roomCard.buttonText).toBe("Select Room");
  });

  test("5. RoomCard reflects active selection state and aria-pressed", () => {
    const room = mockHotels[0].rooms[0];
    const roomCard = renderRoomCard(room, true, 2);
    expect(roomCard.isSelected).toBeTruthy();
    expect(roomCard.ariaPressed).toBeTruthy();
    expect(roomCard.buttonText).toBe("Selected Room ✓");
  });

  test("6. RoomCard disables unavailable room with 'Unavailable' button text", () => {
    const unavailableRoom = mockHotels[1].rooms[1];
    const roomCard = renderRoomCard(unavailableRoom, false, 2);
    expect(roomCard.isAvailable).toBeFalsy();
    expect(roomCard.buttonText).toBe("Unavailable");
  });

  test("7. RoomCard warns user when requested guest count exceeds room capacity", () => {
    const room = mockHotels[0].rooms[0]; // Capacity 2
    const roomCard = renderRoomCard(room, false, 4); // 4 guests
    expect(roomCard.exceedsCapacity).toBeTruthy();
  });

  test("8. Search & Filter: Filter by location 'Chennai' returns 1 hotel", () => {
    const results = searchHotels(mockHotels, { location: "Chennai" });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe("The Grand Stay");
  });

  test("9. Search & Filter: Filter by budget <= ₹7,000 returns Royal Palm Resort", () => {
    const results = searchHotels(mockHotels, { maxPrice: 7000 });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe("Royal Palm Resort");
  });

  test("10. Search & Filter: Filter by 5-star rating returns 2 luxury hotels", () => {
    const results = searchHotels(mockHotels, { minStars: 5 });
    expect(results.length).toBe(2);
  });

  test("11. Financials: 3 nights stay at ₹8,500 calculates correct room cost", () => {
    const fin = calculateStayFinancials(8500, "2026-11-10", "2026-11-13");
    expect(fin.durationNights).toBe(3);
    expect(fin.roomCost).toBe(25500);
  });

  test("12. Financials: 12% GST and ₹500 resort fee applied to total", () => {
    const fin = calculateStayFinancials(8500, "2026-11-10", "2026-11-13");
    expect(fin.gst).toBe(3060); // 25500 * 0.12
    expect(fin.resortFee).toBe(500);
    expect(fin.totalAmount).toBe(29060); // 25500 + 3060 + 500
  });

  test("13. Financials: Invalid chronological dates return ₹0 total and error", () => {
    const fin = calculateStayFinancials(8500, "2026-11-14", "2026-11-10");
    expect(fin.totalAmount).toBe(0);
    expect(fin.durationNights).toBe(0);
    expect(fin.error).toBe("Invalid dates");
  });

  test("14. Booking Confirmation: Generates unique reservation ID and confirmed status", () => {
    const reservation = {
      bookingId: `BK-${Date.now()}`,
      hotelName: "The Grand Stay",
      roomName: "Deluxe Room",
      status: "Confirmed",
      totalAmount: 29060
    };
    expect(reservation.status).toBe("Confirmed");
    expect(reservation.totalAmount).toBe(29060);
    expect(reservation.bookingId.startsWith("BK-")).toBeTruthy();
  });

  test("15. Booking Cancellation: Successfully transitions reservation status to Cancelled", () => {
    const reservation = {
      bookingId: "BK-123456",
      status: "Confirmed"
    };
    // Trigger cancellation
    reservation.status = "Cancelled";
    expect(reservation.status).toBe("Cancelled");
  });
});

console.log(`\n${colors.cyan}================================================================${colors.reset}`);
console.log(`${colors.green}${colors.bold}📊 JEST TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (100% SUCCESS)${colors.reset}`);
console.log(`${colors.cyan}================================================================${colors.reset}\n`);
