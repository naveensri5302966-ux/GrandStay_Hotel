import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";
import { hashPassword, verifyPassword, signToken, verifyToken, getJwtSecret } from "./authUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Attempt to load root .env file if available
try {
  const envPath = path.resolve(__dirname, "..", ".env");
  if (fs.existsSync(envPath) && typeof process.loadEnvFile === "function") {
    process.loadEnvFile(envPath);
  }
} catch {
  // Ignore if already loaded or not found
}

// Fail safely on boot if strong JWT_SECRET is missing or invalid
try {
  getJwtSecret();
} catch (err) {
  console.error("\x1b[31m%s\x1b[0m", err.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// Production-ready CORS with origin whitelist validation
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000"
    ];

// Production Security Headers & Fingerprint Removal
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (isProduction) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, unit test suites)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || (!isProduction && origin.startsWith("http://localhost:"))) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy rejection: Origin '${origin}' is not authorized.`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    credentials: true,
    maxAge: 86400
  })
);

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[API-SERVER] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// -------------------------------------------------------------
// DATA PERSISTENCE SETUP
// -------------------------------------------------------------
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const RESERVATIONS_FILE = path.join(DATA_DIR, "reservations.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 8 Verified Hotels Catalog
const hotelData = [
  {
    id: 101,
    name: "The Grand Stay",
    location: "Chennai",
    stars: 5,
    price: 8500,
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
    description: "A luxurious 5-star hotel offering elegant suites, premium spa facilities, and world-class hospitality.",
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
    description: "A peaceful resort surrounded by lush palm gardens and modern wellness amenities.",
    amenities: ["WiFi", "Swimming Pool", "Gym", "Breakfast"],
    rooms: [
      { id: 1, name: "Standard Room", price: 6500, capacity: 2, available: true },
      { id: 2, name: "Premium Room", price: 9000, capacity: 3, available: true }
    ]
  },
  {
    id: 103,
    name: "Serene Palace",
    location: "Bangalore",
    stars: 5,
    price: 10500,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    description: "Experience timeless palace grandeur and contemporary luxury in the Silicon Valley of India.",
    amenities: ["WiFi", "Spa", "Gym", "Breakfast"],
    rooms: [
      { id: 1, name: "Executive Room", price: 10500, capacity: 2, available: true },
      { id: 2, name: "Presidential Suite", price: 18000, capacity: 4, available: true }
    ]
  },
  {
    id: 104,
    name: "Ocean Pearl Hotel",
    location: "Goa",
    stars: 5,
    price: 9200,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    description: "A stunning coastal sanctuary with sunset views, infinity pool, and private beach access.",
    amenities: ["WiFi", "Swimming Pool", "Breakfast", "Spa"],
    rooms: [
      { id: 1, name: "Sea View Room", price: 9200, capacity: 2, available: true },
      { id: 2, name: "Ocean Suite", price: 14500, capacity: 4, available: true }
    ]
  },
  {
    id: 105,
    name: "Green Valley Resort",
    location: "Ooty",
    stars: 4,
    price: 5800,
    image: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1200&q=80",
    description: "A serene hillside retreat nestled amongst misty tea plantations and eucalyptus woods.",
    amenities: ["WiFi", "Breakfast", "Gym"],
    rooms: [
      { id: 1, name: "Valley View Room", price: 5800, capacity: 2, available: true },
      { id: 2, name: "Family Suite", price: 8200, capacity: 4, available: true }
    ]
  },
  {
    id: 106,
    name: "Royal Heritage",
    location: "Madurai",
    stars: 4,
    price: 5200,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    description: "A heritage boutique hotel reflecting Dravidian architecture and warm South Indian hospitality.",
    amenities: ["WiFi", "Breakfast", "Swimming Pool"],
    rooms: [
      { id: 1, name: "Heritage Room", price: 5200, capacity: 2, available: true },
      { id: 2, name: "Royal Suite", price: 7800, capacity: 3, available: true }
    ]
  },
  {
    id: 107,
    name: "Skyline Residency",
    location: "Hyderabad",
    stars: 5,
    price: 7800,
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    description: "Panoramic city skyline views with premium corporate and leisure amenities.",
    amenities: ["WiFi", "Gym", "Breakfast", "Swimming Pool"],
    rooms: [
      { id: 1, name: "City View Room", price: 7800, capacity: 2, available: true },
      { id: 2, name: "Business Suite", price: 11000, capacity: 3, available: true }
    ]
  },
  {
    id: 108,
    name: "Lakeside Retreat",
    location: "Kochi",
    stars: 4,
    price: 6200,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    description: "Idyllic backwaters getaway with wooden cottages, Ayurvedic spa, and tranquil lake breezes.",
    amenities: ["WiFi", "Swimming Pool", "Breakfast", "Spa"],
    rooms: [
      { id: 1, name: "Lake View Room", price: 6200, capacity: 2, available: true },
      { id: 2, name: "Lakeside Suite", price: 9800, capacity: 4, available: true }
    ]
  }
];

// Initial Seed Users with secure salted password hashes
function initialUsers() {
  return [
    {
      id: "usr-eleanor-8491",
      name: "Eleanor Vance",
      email: "eleanor.vance@example.com",
      username: "eleanor",
      role: "guest",
      passwordHash: hashPassword("Password@123"),
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr-john-2045",
      name: "John Doe",
      email: "john.doe@example.com",
      username: "johndoe",
      role: "guest",
      passwordHash: hashPassword("Password@456"),
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      createdAt: new Date().toISOString()
    },
    {
      id: "usr-admin-0001",
      name: "System Administrator",
      email: "admin@grandstay.com",
      username: "admin",
      role: "admin",
      passwordHash: hashPassword("Admin@2026!"),
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      createdAt: new Date().toISOString()
    }
  ];
}

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    }
  } catch (err) {
    console.warn("[BACKEND] Error loading users file, initializing defaults:", err.message);
  }
  const defaults = initialUsers();
  saveUsers(defaults);
  return defaults;
}

function saveUsers(usersList) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersList, null, 2), "utf-8");
  } catch (err) {
    console.error("[BACKEND] Error saving users file:", err.message);
  }
}

// Initial Seed Reservations associated with specific verified users
function initialReservations() {
  return [
    {
      id: "RES-2026-849102",
      userId: "usr-eleanor-8491",
      userEmail: "eleanor.vance@example.com",
      hotelId: 101,
      hotelName: "The Grand Stay",
      hotelLocation: "Chennai",
      hotelImage: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
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
      userId: "usr-eleanor-8491",
      userEmail: "eleanor.vance@example.com",
      hotelId: 104,
      hotelName: "Ocean Pearl Hotel",
      hotelLocation: "Goa",
      hotelImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
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
    },
    {
      id: "RES-2026-902341",
      userId: "usr-john-2045",
      userEmail: "john.doe@example.com",
      hotelId: 103,
      hotelName: "Serene Palace",
      hotelLocation: "Bangalore",
      hotelImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      hotelStars: 5,
      roomId: 1,
      roomName: "Executive Room",
      checkIn: "2026-11-15",
      checkOut: "2026-11-18",
      totalStayDuration: 3,
      guests: 2,
      roomPrice: 10500,
      roomCost: 31500,
      taxes: 3780,
      additionalCharges: 500,
      totalAmount: 35780,
      customerName: "John Doe",
      email: "john.doe@example.com",
      phone: "9123456789",
      specialRequests: "Late check-in requested",
      status: "Confirmed",
      bookedOn: "18/10/2026",
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];
}

function loadReservations() {
  try {
    if (fs.existsSync(RESERVATIONS_FILE)) {
      return JSON.parse(fs.readFileSync(RESERVATIONS_FILE, "utf-8"));
    }
  } catch (err) {
    console.warn("[BACKEND] Error reading reservations file, initializing defaults:", err.message);
  }
  const defaults = initialReservations();
  saveReservations(defaults);
  return defaults;
}

function saveReservations(reservationsList) {
  try {
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(reservationsList, null, 2), "utf-8");
  } catch (err) {
    console.error("[BACKEND] Error writing reservations file:", err.message);
  }
}

let users = loadUsers();
let reservations = loadReservations();

// -------------------------------------------------------------
// RATE LIMITING & SECURITY GUARDS
// -------------------------------------------------------------
const failedLoginAttempts = new Map(); // key: ip/email -> { count, lockedUntil }

function checkRateLimit(key) {
  const record = failedLoginAttempts.get(key);
  if (!record) return { allowed: true };

  const now = Date.now();
  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      retryAfter: remainingSeconds,
      message: `Too many failed login attempts. Account temporarily locked. Try again in ${remainingSeconds}s.`
    };
  }

  if (record.lockedUntil && record.lockedUntil <= now) {
    failedLoginAttempts.delete(key);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedLogin(key) {
  const record = failedLoginAttempts.get(key) || { count: 0, lockedUntil: null };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 60000; // 60 seconds lockout
  }
  failedLoginAttempts.set(key, record);
}

function clearFailedLogin(key) {
  failedLoginAttempts.delete(key);
}

// -------------------------------------------------------------
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// -------------------------------------------------------------

/**
 * Strict authentication middleware: Rejects any request without a valid signed JWT
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Authentication required: Missing Authorization header. Provide a valid Bearer token.",
      code: "AUTH_REQUIRED"
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Invalid authorization format. Header must follow 'Bearer <token>' schema.",
      code: "INVALID_AUTH_FORMAT"
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      error: "Authentication required: Bearer token is empty.",
      code: "EMPTY_TOKEN"
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { userId, email, role, iat, exp, iss, aud }
    next();
  } catch (err) {
    const isExpired = err.message.toLowerCase().includes("expired");
    return res.status(401).json({
      error: "Unauthorized: " + err.message,
      code: isExpired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
      isTokenExpired: isExpired
    });
  }
}

/**
 * Double-booking collision detector
 * Checks if another active reservation overlaps the requested date range for the same hotel room
 */
function hasDateConflict(hotelId, roomId, checkIn, checkOut, excludeReservationId = null) {
  const startA = new Date(checkIn).getTime();
  const endA = new Date(checkOut).getTime();

  return reservations.some((r) => {
    if (excludeReservationId && r.id === excludeReservationId) return false;
    if (r.status === "Cancelled") return false;
    if (Number(r.hotelId) !== Number(hotelId) || Number(r.roomId) !== Number(roomId)) return false;

    const startB = new Date(r.checkIn).getTime();
    const endB = new Date(r.checkOut).getTime();
    // Overlap: (startA < endB) && (endA > startB)
    return startA < endB && endA > startB;
  });
}

// -------------------------------------------------------------
// 0. HEALTH CHECK
// -------------------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Grand Stay Hotel REST API Backend",
    mode: "genuine-network-api",
    authMechanism: "HMAC-SHA256 Signed JWT",
    passwordSecurity: "Salted Scrypt",
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// 1. HOTEL ENDPOINTS (Experiment 1: REST APIs with Axios/Fetch)
// -------------------------------------------------------------

// GET /api/hotels (supports location, maxPrice, minStars, amenities, availability, checkIn, checkOut)
app.get("/api/hotels", (req, res) => {
  const { location, maxPrice, minStars, amenities, availability, checkIn, checkOut } = req.query;
  let results = [...hotelData];

  if (location && location.trim()) {
    const q = location.toLowerCase().trim();
    results = results.filter(
      (h) => h.location.toLowerCase().includes(q) || h.name.toLowerCase().includes(q)
    );
  }

  if (maxPrice) {
    const max = Number(maxPrice);
    results = results.filter((h) => h.price <= max);
  }

  if (minStars) {
    const min = Number(minStars);
    results = results.filter((h) => h.stars >= min);
  }

  // Filter based on real date-range room availability if dates provided
  if (checkIn && checkOut) {
    results = results.filter((h) => {
      if (!h.rooms || h.rooms.length === 0) return false;
      return h.rooms.some((room) => !hasDateConflict(h.id, room.id, checkIn, checkOut));
    });
  } else if (availability === "available") {
    results = results.filter((h) => (h.rooms ? h.rooms.some((r) => r.available !== false) : true));
  }

  if (amenities) {
    const reqAmenities = Array.isArray(amenities)
      ? amenities
      : String(amenities).split(",").map((s) => s.trim()).filter(Boolean);
    if (reqAmenities.length > 0) {
      results = results.filter((h) =>
        reqAmenities.every((amenity) => h.amenities?.includes(amenity))
      );
    }
  }

  res.json(results);
});

// GET /api/hotels/:id
app.get("/api/hotels/:id", (req, res) => {
  const hotelId = Number(req.params.id);
  const hotel = hotelData.find((h) => h.id === hotelId);
  if (!hotel) {
    return res.status(404).json({ error: `Hotel with ID ${hotelId} not found` });
  }
  res.json(hotel);
});

// GET /api/hotels/:id/rooms
app.get("/api/hotels/:id/rooms", (req, res) => {
  const hotelId = Number(req.params.id);
  const hotel = hotelData.find((h) => h.id === hotelId);
  if (!hotel) {
    return res.status(404).json({ error: `Hotel with ID ${hotelId} not found` });
  }
  res.json(hotel.rooms || []);
});

// -------------------------------------------------------------
// ADMIN HOTEL PACKAGE CRUD ENDPOINTS (Create, Edit, Delete, Update via POST/PUT)
// -------------------------------------------------------------

// POST /api/hotels — Admin Create New Hotel Package
app.post("/api/hotels", requireAuth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Only administrators can create hotel packages." });
  }

  const { name, location, price, stars, image, description, amenities, rooms } = req.body;
  if (!name || !location || !price) {
    return res.status(400).json({ error: "Hotel name, location, and price are required." });
  }

  const maxId = hotelData.reduce((max, h) => Math.max(max, Number(h.id) || 0), 100);
  const newHotel = {
    id: maxId + 1,
    name: String(name).trim(),
    location: String(location).trim(),
    price: Number(price),
    stars: Number(stars) || 4,
    image: image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    description: description || "Exclusive luxury hotel package with curated guest amenities.",
    amenities: Array.isArray(amenities) ? amenities : ["WiFi", "Breakfast", "Swimming Pool"],
    rooms: Array.isArray(rooms) && rooms.length > 0 ? rooms : [
      { id: 1, name: "Deluxe Room", price: Number(price), capacity: 2, available: true },
      { id: 2, name: "Executive Suite", price: Math.round(Number(price) * 1.4), capacity: 3, available: true }
    ],
    createdAt: new Date().toISOString()
  };

  hotelData.push(newHotel);
  console.log(`[API-SERVER] [ADMIN-CRUD] POST /api/hotels -> Created hotel package #${newHotel.id} (${newHotel.name})`);
  res.status(201).json(newHotel);
});

// PUT /api/hotels/:id — Admin Update Hotel Package (PUT method)
app.put("/api/hotels/:id", requireAuth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Only administrators can edit hotel packages." });
  }

  const hotelId = Number(req.params.id);
  const index = hotelData.findIndex((h) => h.id === hotelId);
  if (index === -1) {
    return res.status(404).json({ error: `Hotel package with ID ${hotelId} not found.` });
  }

  const existing = hotelData[index];
  const { name, location, price, stars, image, description, amenities, rooms } = req.body;

  const updatedHotel = {
    ...existing,
    ...(name && { name: String(name).trim() }),
    ...(location && { location: String(location).trim() }),
    ...(price !== undefined && { price: Number(price) }),
    ...(stars !== undefined && { stars: Number(stars) }),
    ...(image && { image }),
    ...(description && { description }),
    ...(amenities && { amenities: Array.isArray(amenities) ? amenities : existing.amenities }),
    ...(rooms && { rooms: Array.isArray(rooms) ? rooms : existing.rooms }),
    updatedAt: new Date().toISOString()
  };

  hotelData[index] = updatedHotel;
  console.log(`[API-SERVER] [ADMIN-CRUD] PUT /api/hotels/${hotelId} -> Updated package #${hotelId}`);
  res.json(updatedHotel);
});

// POST /api/hotels/:id — Admin Update Hotel Package (POST method update)
app.post("/api/hotels/:id", requireAuth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Only administrators can edit hotel packages." });
  }

  const hotelId = Number(req.params.id);
  const index = hotelData.findIndex((h) => h.id === hotelId);
  if (index === -1) {
    return res.status(404).json({ error: `Hotel package with ID ${hotelId} not found.` });
  }

  const existing = hotelData[index];
  const { name, location, price, stars, image, description, amenities, rooms } = req.body;

  const updatedHotel = {
    ...existing,
    ...(name && { name: String(name).trim() }),
    ...(location && { location: String(location).trim() }),
    ...(price !== undefined && { price: Number(price) }),
    ...(stars !== undefined && { stars: Number(stars) }),
    ...(image && { image }),
    ...(description && { description }),
    ...(amenities && { amenities: Array.isArray(amenities) ? amenities : existing.amenities }),
    ...(rooms && { rooms: Array.isArray(rooms) ? rooms : existing.rooms }),
    updatedAt: new Date().toISOString()
  };

  hotelData[index] = updatedHotel;
  console.log(`[API-SERVER] [ADMIN-CRUD] POST /api/hotels/${hotelId} -> Updated package #${hotelId} via POST`);
  res.json(updatedHotel);
});

// POST /api/hotels/:id/update — Alternative route for POST method package updates
app.post("/api/hotels/:id/update", requireAuth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Only administrators can edit hotel packages." });
  }

  const hotelId = Number(req.params.id);
  const index = hotelData.findIndex((h) => h.id === hotelId);
  if (index === -1) {
    return res.status(404).json({ error: `Hotel package with ID ${hotelId} not found.` });
  }

  const existing = hotelData[index];
  const { name, location, price, stars, image, description, amenities, rooms } = req.body;

  const updatedHotel = {
    ...existing,
    ...(name && { name: String(name).trim() }),
    ...(location && { location: String(location).trim() }),
    ...(price !== undefined && { price: Number(price) }),
    ...(stars !== undefined && { stars: Number(stars) }),
    ...(image && { image }),
    ...(description && { description }),
    ...(amenities && { amenities: Array.isArray(amenities) ? amenities : existing.amenities }),
    ...(rooms && { rooms: Array.isArray(rooms) ? rooms : existing.rooms }),
    updatedAt: new Date().toISOString()
  };

  hotelData[index] = updatedHotel;
  console.log(`[API-SERVER] [ADMIN-CRUD] POST /api/hotels/${hotelId}/update -> Updated package #${hotelId}`);
  res.json(updatedHotel);
});

// DELETE /api/hotels/:id — Admin Delete Hotel Package (DELETE method)
app.delete("/api/hotels/:id", requireAuth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Only administrators can delete hotel packages." });
  }

  const hotelId = Number(req.params.id);
  const index = hotelData.findIndex((h) => h.id === hotelId);
  if (index === -1) {
    return res.status(404).json({ error: `Hotel package with ID ${hotelId} not found.` });
  }

  const removed = hotelData.splice(index, 1)[0];
  console.log(`[API-SERVER] [ADMIN-CRUD] DELETE /api/hotels/${hotelId} -> Deleted package #${hotelId} (${removed.name})`);
  res.json({
    message: `Hotel package #${hotelId} (${removed.name}) deleted successfully by Administrator.`,
    deletedId: hotelId,
    deletedHotel: removed
  });
});

// -------------------------------------------------------------
// 2. AUTHENTICATION ENDPOINTS (Experiment 4: Auth & Tokens)
// -------------------------------------------------------------

// POST /api/auth/login (Real credential validation against salted scrypt hashes)
app.post("/api/auth/login", (req, res) => {
  const { email, username, password } = req.body;
  const identifier = (email || username || "").trim().toLowerCase();

  if (!identifier || !password) {
    return res.status(400).json({ error: "Email or username and password are required." });
  }

  const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";
  const rateLimitKey = `${clientIp}:${identifier}`;

  // Rate limiting check
  const rateLimitCheck = checkRateLimit(rateLimitKey);
  if (!rateLimitCheck.allowed) {
    res.setHeader("Retry-After", String(rateLimitCheck.retryAfter || 60));
    return res.status(429).json({
      error: rateLimitCheck.message,
      code: "TOO_MANY_ATTEMPTS",
      retryAfter: rateLimitCheck.retryAfter || 60
    });
  }

  // User lookup
  const user = users.find(
    (u) => u.email.toLowerCase() === identifier || (u.username && u.username.toLowerCase() === identifier)
  );

  if (!user) {
    recordFailedLogin(rateLimitKey);
    return res.status(401).json({
      error: "Invalid credentials: User account not found.",
      code: "USER_NOT_FOUND"
    });
  }

  // Verify password with cryptographic timing-safe scrypt verification
  const isPasswordValid = verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    recordFailedLogin(rateLimitKey);
    return res.status(401).json({
      error: "Invalid credentials: Incorrect password provided.",
      code: "INVALID_PASSWORD"
    });
  }

  // Login successful
  clearFailedLogin(rateLimitKey);

  // Generate cryptographically signed JWT token (expires in 1 hour)
  const token = signToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    3600
  );

  const sanitizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    avatar: user.avatar
  };

  res.json({
    token,
    tokenType: "Bearer",
    expiresIn: 3600,
    user: sanitizedUser
  });
});

// POST /api/auth/register (Registers new user with salted password hash)
app.post("/api/auth/register", (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "Full name, email, and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(400).json({ error: "An account with this email address already exists." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  const newUser = {
    id: "usr-" + Math.floor(100000 + Math.random() * 900000),
    name: fullName.trim(),
    email: normalizedEmail,
    phone: phone || "",
    role: "guest",
    passwordHash: hashPassword(password),
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  const token = signToken(
    {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    },
    3600
  );

  res.status(201).json({
    token,
    tokenType: "Bearer",
    expiresIn: 3600,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar
    }
  });
});

// GET /api/auth/profile (Protected profile route)
app.get("/api/auth/profile", requireAuth, (req, res) => {
  const user = users.find((u) => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar
  });
});

// -------------------------------------------------------------
// 3. RESERVATION CRUD ENDPOINTS (Experiment 3: Protected CRUD & Ownership)
// -------------------------------------------------------------

// GET /api/reservations (Strict ownership: Returns only caller's reservations unless admin)
app.get("/api/reservations", requireAuth, (req, res) => {
  if (req.user.role === "admin") {
    return res.json(reservations);
  }
  const userReservations = reservations.filter((r) => r.userId === req.user.userId);
  res.json(userReservations);
});

// GET /api/reservations/:id (Strict ownership: 403 Forbidden if not owner and not admin)
app.get("/api/reservations/:id", requireAuth, (req, res) => {
  const item = reservations.find((r) => r.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: `Reservation #${req.params.id} not found` });
  }

  // Ownership verification
  if (item.userId !== req.user.userId && req.user.role !== "admin") {
    return res.status(403).json({
      error: "Forbidden: You are not authorized to view another guest's reservation.",
      code: "ACCESS_DENIED"
    });
  }

  res.json(item);
});

// POST /api/reservations (Protected reservation creation with conflict prevention & recalculation)
app.post("/api/reservations", requireAuth, (req, res) => {
  const payload = req.body;

  // Validation
  if (!payload.hotelId || !payload.roomId || !payload.checkIn || !payload.checkOut) {
    return res.status(400).json({
      error: "Missing required booking details (hotelId, roomId, checkIn, or checkOut)."
    });
  }

  const checkInDate = new Date(payload.checkIn);
  const checkOutDate = new Date(payload.checkOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return res.status(400).json({ error: "Invalid check-in or check-out date format." });
  }

  if (checkOutDate <= checkInDate) {
    return res.status(400).json({ error: "Check-out date must be strictly after check-in date." });
  }

  // Check double-booking conflict
  if (hasDateConflict(payload.hotelId, payload.roomId, payload.checkIn, payload.checkOut)) {
    return res.status(409).json({
      error: "Room unavailable: This room is already booked for the selected dates. Please choose different dates or another room.",
      code: "BOOKING_CONFLICT"
    });
  }

  // Look up verified hotel & room from authoritative database
  const hotel = hotelData.find((h) => h.id === Number(payload.hotelId));
  if (!hotel) {
    return res.status(404).json({ error: `Hotel #${payload.hotelId} does not exist.` });
  }

  const room = (hotel.rooms || []).find((r) => r.id === Number(payload.roomId));
  if (!room) {
    return res.status(404).json({ error: `Room #${payload.roomId} not found in ${hotel.name}.` });
  }

  // Authoritative server-side calculations (Do NOT trust client-submitted prices)
  const diffTime = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const roomPrice = room.price;
  const roomCost = roomPrice * nights;
  const taxes = Math.round(roomCost * 0.12); // 12% Hospitality GST
  const additionalCharges = 500; // Flat Resort & Concierge fee
  const totalAmount = roomCost + taxes + additionalCharges;

  // Establish ownership strictly from verified authentication token
  const newReservation = {
    id: "RES-2026-" + Math.floor(100000 + Math.random() * 900000),
    userId: req.user.userId,
    userEmail: req.user.email,
    hotelId: hotel.id,
    hotelName: hotel.name,
    hotelLocation: hotel.location,
    hotelImage: hotel.image,
    hotelStars: hotel.stars,
    roomId: room.id,
    roomName: room.name,
    checkIn: payload.checkIn,
    checkOut: payload.checkOut,
    totalStayDuration: nights,
    guests: Math.min(Math.max(1, Number(payload.guests) || 1), room.capacity || 4),
    roomPrice,
    roomCost,
    taxes,
    additionalCharges,
    totalAmount,
    customerName: payload.customerName || req.user.email.split("@")[0],
    email: payload.email || req.user.email,
    phone: payload.phone || "9876543210",
    specialRequests: payload.specialRequests || "None",
    status: "Confirmed",
    bookedOn: new Date().toLocaleDateString("en-IN"),
    createdAt: new Date().toISOString()
  };

  reservations = [newReservation, ...reservations];
  saveReservations(reservations);

  res.status(201).json(newReservation);
});

// UPDATE RESERVATION HANDLER (Supports both PUT and POST for update)
const handleUpdateReservation = (req, res) => {
  const resId = req.params.id;
  const index = reservations.findIndex((r) => r.id === resId);

  if (index === -1) {
    return res.status(404).json({ error: `Reservation #${resId} not found` });
  }

  const existing = reservations[index];

  // Ownership verification
  if (existing.userId !== req.user.userId && req.user.role !== "admin") {
    return res.status(403).json({
      error: "Forbidden: You are not authorized to modify another guest's reservation.",
      code: "ACCESS_DENIED"
    });
  }

  const payload = req.body;
  let updatedRecord = { ...existing };

  // If dates are changing, validate and check for date collisions
  if (payload.checkIn && payload.checkOut) {
    const checkInDate = new Date(payload.checkIn);
    const checkOutDate = new Date(payload.checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: "Check-out date must be strictly after check-in date." });
    }

    if (hasDateConflict(existing.hotelId, existing.roomId, payload.checkIn, payload.checkOut, resId)) {
      return res.status(409).json({
        error: "Cannot reschedule: The room is already booked by another reservation on these dates.",
        code: "BOOKING_CONFLICT"
      });
    }

    const diff = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    updatedRecord.checkIn = payload.checkIn;
    updatedRecord.checkOut = payload.checkOut;
    updatedRecord.totalStayDuration = nights;
    updatedRecord.roomCost = (updatedRecord.roomPrice || 8500) * nights;
    updatedRecord.taxes = Math.round(updatedRecord.roomCost * 0.12);
    updatedRecord.totalAmount = updatedRecord.roomCost + updatedRecord.taxes + (updatedRecord.additionalCharges || 500);
  }

  if (payload.guests) {
    updatedRecord.guests = Number(payload.guests);
  }
  if (payload.specialRequests !== undefined) {
    updatedRecord.specialRequests = payload.specialRequests;
  }
  if (payload.status) {
    updatedRecord.status = payload.status;
  } else {
    updatedRecord.status = "Modified";
  }

  updatedRecord.updatedAt = new Date().toISOString();
  reservations[index] = updatedRecord;
  saveReservations(reservations);

  res.json(updatedRecord);
};

// PUT /api/reservations/:id (Standard RESTful update)
app.put("/api/reservations/:id", requireAuth, handleUpdateReservation);

// POST /api/reservations/:id and POST /api/reservations/:id/update (Update via POST method)
app.post("/api/reservations/:id", requireAuth, handleUpdateReservation);
app.post("/api/reservations/:id/update", requireAuth, handleUpdateReservation);

// PATCH /api/reservations/:id
app.patch("/api/reservations/:id", requireAuth, (req, res) => {
  const resId = req.params.id;
  const index = reservations.findIndex((r) => r.id === resId);

  if (index === -1) {
    return res.status(404).json({ error: `Reservation #${resId} not found` });
  }

  const existing = reservations[index];
  if (existing.userId !== req.user.userId && req.user.role !== "admin") {
    return res.status(403).json({
      error: "Forbidden: You are not authorized to modify another guest's reservation.",
      code: "ACCESS_DENIED"
    });
  }

  const payload = req.body;
  const updatedRecord = { ...existing, ...payload, updatedAt: new Date().toISOString() };
  reservations[index] = updatedRecord;
  saveReservations(reservations);

  res.json(updatedRecord);
});

// DELETE /api/reservations/:id (Strict ownership: 403 Forbidden if not owner)
app.delete("/api/reservations/:id", requireAuth, (req, res) => {
  const resId = req.params.id;
  const index = reservations.findIndex((r) => r.id === resId);

  if (index === -1) {
    return res.status(404).json({ error: `Reservation #${resId} not found` });
  }

  const existing = reservations[index];
  if (existing.userId !== req.user.userId && req.user.role !== "admin") {
    return res.status(403).json({
      error: "Forbidden: You are not authorized to cancel another guest's reservation.",
      code: "ACCESS_DENIED"
    });
  }

  const removed = reservations.splice(index, 1)[0];
  saveReservations(reservations);

  res.json({
    success: true,
    message: `Reservation #${resId} has been successfully cancelled`,
    cancelledReservation: removed
  });
});

// -------------------------------------------------------------
// 4. UNKNOWN ROUTE HANDLER
// -------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// -------------------------------------------------------------
// START SERVER
// -------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🛡️  Grand Stay Secure Enterprise REST API running on port ${PORT}`);
  console.log(`👉 Base URL: http://localhost:${PORT}/api`);
  console.log(`🔐 Authentication: Cryptographic HMAC-SHA256 Signed JWTs`);
  console.log(`🔑 Password Security: Per-user Salted Scrypt Hashes`);
  console.log(`🔒 Ownership Protection: Strict multi-tenant isolation enforced`);
  console.log(`================================================================`);
});
