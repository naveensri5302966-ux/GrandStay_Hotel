import { hotelData } from "../data";

const RESERVATIONS_STORAGE_KEY = "grand_stay_reservations_db";

// Seed initial reservations if storage is empty
function getStoredReservations() {
  try {
    const raw = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Could not read reservations from storage:", e);
  }

  // Initial seed data for demonstration
  const seed = [
    {
      id: "RES-2026-849102",
      hotelId: 101,
      hotelName: "The Grand Stay",
      hotelLocation: "Chennai",
      hotelImage:
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
      hotelStars: 5,
      roomId: 1,
      roomName: "Deluxe Room",
      checkIn: "2026-11-10",
      checkOut: "2026-11-13",
      totalStayDuration: 3,
      guests: 2,
      roomPrice: 8500,
      roomCost: 25500,
      taxes: 3060,
      additionalCharges: 500,
      totalAmount: 29060,
      customerName: "Eleanor Vance",
      email: "eleanor.vance@example.com",
      phone: "9876543210",
      specialRequests: "High floor, quiet corner room with sea breeze",
      status: "Confirmed",
      bookedOn: "19/10/2026",
      createdAt: new Date().toISOString()
    },
    {
      id: "RES-2026-512948",
      hotelId: 104,
      hotelName: "Ocean Pearl Hotel",
      hotelLocation: "Goa",
      hotelImage:
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      hotelStars: 5,
      roomId: 2,
      roomName: "Ocean Suite",
      checkIn: "2026-12-01",
      checkOut: "2026-12-05",
      totalStayDuration: 4,
      guests: 3,
      roomPrice: 14500,
      roomCost: 58000,
      taxes: 6960,
      additionalCharges: 500,
      totalAmount: 65460,
      customerName: "Eleanor Vance",
      email: "eleanor.vance@example.com",
      phone: "9876543210",
      specialRequests: "Sunset balcony view and airport transfer",
      status: "Confirmed",
      bookedOn: "18/10/2026",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  try {
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(seed));
  } catch (e) {
    console.warn("Could not seed reservations:", e);
  }
  return seed;
}

function saveStoredReservations(reservations) {
  try {
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations));
  } catch (e) {
    console.warn("Could not save reservations:", e);
  }
}

/**
 * Mock API Adapter: Intercepts API requests when no external backend is connected.
 * Provides real HTTP response formats (status, headers, data) and persists state.
 */
export async function mockApiAdapter(config) {
  const { url = "", method = "get", data: rawData, params = {}, headers = {} } = config;
  const cleanUrl = url.replace(/^\/api/, "").replace(/\?.*$/, "");
  const payload = typeof rawData === "string" ? JSON.parse(rawData || "{}") : rawData || {};

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 260));

  // Check auth header if required
  const authHeader = headers.Authorization || headers.authorization;
  const isExpiredDemoToken = authHeader && authHeader.includes("expired-token");

  if (isExpiredDemoToken) {
    const error = new Error("Request failed with status code 401");
    error.response = {
      status: 401,
      statusText: "Unauthorized",
      data: { error: "Token expired or invalid", message: "Your session has expired. Please log in again." },
      headers: {},
      config
    };
    error.isAxiosError = true;
    throw error;
  }

  // -------------------------------------------------------------
  // EXPERIMENT 1: Hotel Endpoints
  // -------------------------------------------------------------

  // GET /hotels
  if (method.toLowerCase() === "get" && cleanUrl === "/hotels") {
    let results = [...hotelData];

    // Filter by location
    if (params.location && params.location.trim()) {
      const q = params.location.toLowerCase().trim();
      results = results.filter(
        (h) => h.location.toLowerCase().includes(q) || h.name.toLowerCase().includes(q)
      );
    }

    // Filter by max price
    if (params.maxPrice) {
      const max = Number(params.maxPrice);
      results = results.filter((h) => h.price <= max);
    }

    // Filter by minimum star rating
    if (params.minStars) {
      const min = Number(params.minStars);
      results = results.filter((h) => h.stars >= min);
    }

    // Filter by availability
    if (params.availability === "available") {
      results = results.filter((h) =>
        h.rooms ? h.rooms.some((r) => r.available !== false) : true
      );
    }

    // Filter by amenities
    if (params.amenities) {
      const reqAmenities = Array.isArray(params.amenities)
        ? params.amenities
        : String(params.amenities).split(",").filter(Boolean);
      if (reqAmenities.length > 0) {
        results = results.filter((h) =>
          reqAmenities.every((amenity) => h.amenities?.includes(amenity))
        );
      }
    }

    return {
      status: 200,
      statusText: "OK",
      data: results,
      headers: { "content-type": "application/json" },
      config,
      isMock: true
    };
  }

  // GET /hotels/:id
  const hotelMatch = cleanUrl.match(/^\/hotels\/(\d+)$/);
  if (method.toLowerCase() === "get" && hotelMatch) {
    const hotelId = Number(hotelMatch[1]);
    const hotel = hotelData.find((h) => h.id === hotelId);

    if (!hotel) {
      const error = new Error("Hotel not found");
      error.response = {
        status: 404,
        statusText: "Not Found",
        data: { error: `Hotel with ID ${hotelId} not found` },
        headers: {},
        config
      };
      throw error;
    }

    return {
      status: 200,
      statusText: "OK",
      data: hotel,
      headers: { "content-type": "application/json" },
      config,
      isMock: true
    };
  }

  // GET /hotels/:id/rooms
  const roomsMatch = cleanUrl.match(/^\/hotels\/(\d+)\/rooms$/);
  if (method.toLowerCase() === "get" && roomsMatch) {
    const hotelId = Number(roomsMatch[1]);
    const hotel = hotelData.find((h) => h.id === hotelId);

    if (!hotel) {
      const error = new Error("Hotel not found");
      error.response = {
        status: 404,
        statusText: "Not Found",
        data: { error: `Hotel with ID ${hotelId} not found` },
        headers: {},
        config
      };
      throw error;
    }

    return {
      status: 200,
      statusText: "OK",
      data: hotel.rooms || [],
      headers: { "content-type": "application/json" },
      config,
      isMock: true
    };
  }

  // -------------------------------------------------------------
  // EXPERIMENT 3: CRUD Reservation Endpoints
  // -------------------------------------------------------------

  // GET /reservations
  if (method.toLowerCase() === "get" && cleanUrl === "/reservations") {
    const reservations = getStoredReservations();
    return {
      status: 200,
      statusText: "OK",
      data: reservations,
      headers: { "content-type": "application/json" },
      config,
      isMock: true
    };
  }

  // GET /reservations/:id
  const resDetailMatch = cleanUrl.match(/^\/reservations\/([^/]+)$/);
  if (method.toLowerCase() === "get" && resDetailMatch) {
    const resId = resDetailMatch[1];
    const reservations = getStoredReservations();
    const item = reservations.find((r) => r.id === resId);

    if (!item) {
      const error = new Error("Reservation not found");
      error.response = {
        status: 404,
        statusText: "Not Found",
        data: { error: `Reservation #${resId} not found` },
        headers: {},
        config
      };
      throw error;
    }

    return {
      status: 200,
      statusText: "OK",
      data: item,
      headers: { "content-type": "application/json" },
      config,
      isMock: true
    };
  }

  // POST /reservations (Create)
  if (method.toLowerCase() === "post" && cleanUrl === "/reservations") {
    // Validate required fields
    if (!payload.hotelName || !payload.roomName || !payload.checkIn || !payload.checkOut) {
      const error = new Error("Validation Error");
      error.response = {
        status: 400,
        statusText: "Bad Request",
        data: { error: "Missing required booking details (hotel, room, checkIn, or checkOut)" },
        headers: {},
        config
      };
      throw error;
    }

    const newReservation = {
      id: "RES-2026-" + Math.floor(100000 + Math.random() * 900000),
      hotelId: payload.hotelId || 101,
      hotelName: payload.hotelName,
      hotelLocation: payload.hotelLocation || "India",
      hotelImage: payload.hotelImage || "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
      hotelStars: payload.hotelStars || 5,
      roomId: payload.roomId || 1,
      roomName: payload.roomName,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      totalStayDuration: payload.totalStayDuration || 1,
      guests: payload.guests || 1,
      roomPrice: payload.roomPrice || 8500,
      roomCost: payload.roomCost || 8500,
      taxes: payload.taxes || 1020,
      additionalCharges: payload.additionalCharges || 500,
      totalAmount: payload.totalAmount || payload.amountPaid || 10020,
      customerName: payload.customerName || "Eleanor Vance",
      email: payload.email || "eleanor.vance@example.com",
      phone: payload.phone || "9876543210",
      specialRequests: payload.specialRequests || "None",
      status: "Confirmed",
      bookedOn: new Date().toLocaleDateString("en-IN"),
      createdAt: new Date().toISOString()
    };

    const reservations = getStoredReservations();
    saveStoredReservations([newReservation, ...reservations]);

    return {
      status: 201,
      statusText: "Created",
      data: newReservation,
      headers: { "content-type": "application/json" },
      config,
      isMock: true
    };
  }

  // PUT, PATCH, or POST /reservations/:id (Update)
  const resUpdateMatch = cleanUrl.match(/^\/reservations\/([^/]+)(?:\/update)?$/);
  const m = method.toLowerCase();
  if ((m === "put" || m === "patch" || (m === "post" && resUpdateMatch && resUpdateMatch[1] !== "reservations")) && resUpdateMatch) {
    const resId = resUpdateMatch[1];
    const reservations = getStoredReservations();
    const index = reservations.findIndex((r) => r.id === resId);

    if (index === -1) {
      const error = new Error("Reservation not found");
      error.response = {
        status: 404,
        statusText: "Not Found",
        data: { error: `Reservation #${resId} not found` },
        headers: {},
        config
      };
      throw error;
    }

    // Recalculate duration and price if dates or room changed
    let updatedRecord = { ...reservations[index], ...payload, status: payload.status || "Modified" };
    if (payload.checkIn && payload.checkOut) {
      const start = new Date(payload.checkIn);
      const end = new Date(payload.checkOut);
      const diff = end.getTime() - start.getTime();
      const nights = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      updatedRecord.totalStayDuration = nights;
      updatedRecord.roomCost = (updatedRecord.roomPrice || 8500) * nights;
      updatedRecord.taxes = Math.round(updatedRecord.roomCost * 0.12);
      updatedRecord.totalAmount = updatedRecord.roomCost + updatedRecord.taxes + (updatedRecord.additionalCharges || 500);
    }

    reservations[index] = updatedRecord;
    saveStoredReservations(reservations);

    return {
      status: 200,
      statusText: "OK",
      data: updatedRecord,
      headers: { "content-type": "application/json" },
      config,
      isMock: true
    };
  }

  // DELETE /reservations/:id (Cancel)
  const resDeleteMatch = cleanUrl.match(/^\/reservations\/([^/]+)$/);
  if (method.toLowerCase() === "delete" && resDeleteMatch) {
    const resId = resDeleteMatch[1];
    const reservations = getStoredReservations();
    const index = reservations.findIndex((r) => r.id === resId);

    if (index === -1) {
      const error = new Error("Reservation not found");
      error.response = {
        status: 404,
        statusText: "Not Found",
        data: { error: `Reservation #${resId} not found` },
        headers: {},
        config
      };
      throw error;
    }

    const removed = reservations.splice(index, 1)[0];
    saveStoredReservations(reservations);

    return {
      status: 200,
      statusText: "OK",
      data: {
        success: true,
        message: `Reservation #${resId} has been successfully cancelled`,
        cancelledReservation: removed
      },
      headers: { "content-type": "application/json" },
      config,
      isMock: true
    };
  }

  // -------------------------------------------------------------
  // EXPERIMENT 4: Authentication Endpoints
  // -------------------------------------------------------------

  // POST /auth/login
  if (method.toLowerCase() === "post" && cleanUrl === "/auth/login") {
    const { email = "", username = "", password = "" } = payload;
    const identifier = email || username;

    if (!identifier || !password) {
      const error = new Error("Missing credentials");
      error.response = {
        status: 400,
        statusText: "Bad Request",
        data: { error: "Email/username and password are required" },
        headers: {},
        config
      };
      throw error;
    }

    const name = identifier.includes("@") ? identifier.split("@")[0].replace(/\./g, " ") : identifier;
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

    const token = "jwt-gs-" + btoa(JSON.stringify({ user: identifier, exp: Date.now() + 3600000 }));
    const userProfile = {
      id: "usr-" + Math.floor(1000 + Math.random() * 9000),
      name: formattedName,
      email: identifier.includes("@") ? identifier : `${identifier}@grandstay.com`,
      role: "Verified Guest",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    };

    return {
      status: 200,
      statusText: "OK",
      data: {
        token,
        tokenType: "Bearer",
        expiresIn: 3600,
        user: userProfile
      },
      headers: { "content-type": "application/json" },
      config,
      isMock: true
    };
  }

  // POST /auth/register
  if (method.toLowerCase() === "post" && cleanUrl === "/auth/register") {
    const { fullName, email, phone, password } = payload;

    if (!fullName || !email || !password) {
      const error = new Error("Missing registration fields");
      error.response = {
        status: 400,
        statusText: "Bad Request",
        data: { error: "Full name, email, and password are required" },
        headers: {},
        config
      };
      throw error;
    }

    const token = "jwt-gs-" + btoa(JSON.stringify({ user: email, exp: Date.now() + 3600000 }));
    const userProfile = {
      id: "usr-" + Math.floor(1000 + Math.random() * 9000),
      name: fullName,
      email,
      phone: phone || "",
      role: "Club Member",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    };

    return {
      status: 201,
      statusText: "Created",
      data: {
        token,
        tokenType: "Bearer",
        expiresIn: 3600,
        user: userProfile
      },
      headers: { "content-type": "application/json" },
      config,
      isMock: true
    };
  }

  // Fallback 404 for unknown endpoint
  const error = new Error(`Cannot ${method.toUpperCase()} ${cleanUrl}`);
  error.response = {
    status: 404,
    statusText: "Not Found",
    data: { error: `Endpoint ${cleanUrl} not found` },
    headers: {},
    config
  };
  throw error;
}

export default mockApiAdapter;
