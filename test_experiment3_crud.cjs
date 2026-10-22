/**
 * test_experiment3_crud.cjs
 * Comprehensive Automated Verification Suite for Experiment 3:
 * Hotel Reservation CRUD Operations (Topics: REST API, CRUD, Axios/Fetch)
 * 
 * Verifies:
 * a) Retrieve hotel and room information using GET.
 * b) Create a hotel reservation using POST.
 * c) Update reservation details using PUT and PATCH.
 * d) Cancel a reservation using DELETE.
 * e) Retrieve reservation history using GET.
 * f) Implement loading and error handling (400, 401, 404, 409).
 */

const assert = require("assert");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  magenta: "\x1b[35m"
};

const BASE_URL = process.env.API_URL || "http://localhost:5000/api";
let passed = 0;
let failed = 0;

function reportPass(description) {
  passed++;
  console.log(`  ${colors.green}✓ PASS:${colors.reset} ${description}`);
}

function reportFail(description, err) {
  failed++;
  console.log(`  ${colors.red}✗ FAIL:${colors.reset} ${description}`);
  console.error(err);
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, options);
  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  return { status: response.status, data, headers: response.headers };
}

(async () => {
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}🏨 EXPERIMENT 3: HOTEL RESERVATION CRUD OPERATIONS TEST SUITE${colors.reset}`);
  console.log(`${colors.cyan}Topics: REST API, CRUD Operations, Axios/Fetch, Error Resilience${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  try {
    // 0. AUTHENTICATE TO RECEIVE JWT BEARER TOKEN
    console.log(`${colors.bold}--- 0. Authentication Pre-flight (Login) ---${colors.reset}`);
    const loginRes = await request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "eleanor.vance@example.com",
        password: "Password@123"
      })
    });

    assert.strictEqual(loginRes.status, 200, "Login must return 200 OK");
    assert.ok(loginRes.data.token, "Login must return signed JWT token");
    const authToken = loginRes.data.token;
    reportPass(`Signed Bearer JWT received for ${loginRes.data.user.email} (${authToken.substring(0, 20)}...)`);

    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`
    };

    // -------------------------------------------------------------
    // a) Retrieve hotel and room information using GET
    // -------------------------------------------------------------
    console.log(`\n${colors.bold}--- a) Retrieve Hotel & Room Information [GET] ---${colors.reset}`);
    
    // a1: GET all hotels
    const hotelsRes = await request("/hotels");
    assert.strictEqual(hotelsRes.status, 200, "GET /api/hotels must return 200 OK");
    assert.ok(Array.isArray(hotelsRes.data), "Hotels response must be an array");
    assert.ok(hotelsRes.data.length >= 4, "Must return catalog with multiple hotels");
    reportPass(`GET /api/hotels returned ${hotelsRes.data.length} hotels`);

    // a2: GET hotel by ID
    const hotelId = hotelsRes.data[0].id;
    const hotelDetailRes = await request(`/hotels/${hotelId}`);
    assert.strictEqual(hotelDetailRes.status, 200, "GET /api/hotels/:id must return 200 OK");
    assert.strictEqual(hotelDetailRes.data.id, hotelId);
    assert.ok(hotelDetailRes.data.name, "Hotel must have name");
    assert.ok(hotelDetailRes.data.price > 0, "Hotel must have nightly tariff");
    reportPass(`GET /api/hotels/${hotelId} returned details for "${hotelDetailRes.data.name}"`);

    // a3: GET rooms for hotel
    const roomsRes = await request(`/hotels/${hotelId}/rooms`);
    assert.strictEqual(roomsRes.status, 200, "GET /api/hotels/:id/rooms must return 200 OK");
    assert.ok(Array.isArray(roomsRes.data), "Rooms response must be an array");
    assert.ok(roomsRes.data.length > 0, "Hotel must have available room categories");
    const selectedRoom = roomsRes.data[0];
    reportPass(`GET /api/hotels/${hotelId}/rooms returned ${roomsRes.data.length} room types (e.g. "${selectedRoom.name}", ₹${selectedRoom.price}/night)`);

    // -------------------------------------------------------------
    // b) Create a hotel reservation using POST
    // -------------------------------------------------------------
    console.log(`\n${colors.bold}--- b) Create a Hotel Reservation [POST] ---${colors.reset}`);
    
    const checkIn = "2026-11-20";
    const checkOut = "2026-11-23"; // 3 nights
    const createPayload = {
      hotelId: hotelId,
      roomId: selectedRoom.id,
      checkIn,
      checkOut,
      guests: 2,
      customerName: "Eleanor Vance",
      email: "eleanor.vance@example.com",
      phone: "9876543210",
      specialRequests: "Quiet corner room requested via automated CRUD test suite"
    };

    const createRes = await request("/reservations", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(createPayload)
    });

    assert.strictEqual(createRes.status, 201, "POST /api/reservations must return 201 Created");
    assert.ok(createRes.data.id, "Reservation must generate a unique ID");
    assert.strictEqual(createRes.data.totalStayDuration, 3, "Duration must be calculated as exactly 3 nights");
    
    const expectedRoomCost = selectedRoom.price * 3;
    const expectedTaxes = Math.round(expectedRoomCost * 0.12);
    const expectedTotal = expectedRoomCost + expectedTaxes + 500;
    assert.strictEqual(createRes.data.roomCost, expectedRoomCost, `Room cost must be ₹${expectedRoomCost}`);
    assert.strictEqual(createRes.data.taxes, expectedTaxes, `Hospitality GST (12%) must be ₹${expectedTaxes}`);
    assert.strictEqual(createRes.data.totalAmount, expectedTotal, `Grand total must be ₹${expectedTotal}`);
    assert.strictEqual(createRes.data.status, "Confirmed");
    
    const createdId = createRes.data.id;
    reportPass(`POST /api/reservations created reservation #${createdId} (Duration: 3 nights, Total: ₹${expectedTotal})`);

    // -------------------------------------------------------------
    // c) Update reservation details using PUT & PATCH
    // -------------------------------------------------------------
    console.log(`\n${colors.bold}--- c) Update Reservation Details [PUT & PATCH] ---${colors.reset}`);

    // c1: PUT update (Full reschedule: modify dates & guests)
    const putPayload = {
      checkIn: "2026-11-21",
      checkOut: "2026-11-25", // 4 nights now
      guests: 3,
      specialRequests: "Fruit basket & late check-out requested via PUT"
    };

    const putRes = await request(`/reservations/${createdId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(putPayload)
    });

    assert.strictEqual(putRes.status, 200, "PUT /api/reservations/:id must return 200 OK");
    assert.strictEqual(putRes.data.id, createdId);
    assert.strictEqual(putRes.data.totalStayDuration, 4, "Stay duration must be recalculated to 4 nights");
    assert.strictEqual(putRes.data.guests, 3);
    assert.strictEqual(putRes.data.status, "Modified");
    const updatedExpectedCost = selectedRoom.price * 4;
    const updatedExpectedTax = Math.round(updatedExpectedCost * 0.12);
    const updatedExpectedTotal = updatedExpectedCost + updatedExpectedTax + 500;
    assert.strictEqual(putRes.data.totalAmount, updatedExpectedTotal, `Total recalculated to ₹${updatedExpectedTotal}`);
    reportPass(`PUT /api/reservations/${createdId} rescheduled to 4 nights (New Total: ₹${updatedExpectedTotal}, Status: Modified)`);

    // c2: PATCH update (Partial update: update special requests only)
    const patchPayload = {
      specialRequests: "Extra feather pillows & airport transfer requested via PATCH"
    };

    const patchRes = await request(`/reservations/${createdId}`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify(patchPayload)
    });

    assert.strictEqual(patchRes.status, 200, "PATCH /api/reservations/:id must return 200 OK");
    assert.strictEqual(patchRes.data.specialRequests, patchPayload.specialRequests);
    assert.strictEqual(patchRes.data.totalStayDuration, 4, "Duration must remain unchanged under PATCH");
    reportPass(`PATCH /api/reservations/${createdId} partially modified special requests without re-submitting full booking`);

    // -------------------------------------------------------------
    // e) Retrieve reservation history using GET
    // -------------------------------------------------------------
    console.log(`\n${colors.bold}--- e) Retrieve Reservation History [GET] ---${colors.reset}`);

    const historyRes = await request("/reservations", {
      method: "GET",
      headers: authHeaders
    });

    assert.strictEqual(historyRes.status, 200, "GET /api/reservations must return 200 OK");
    assert.ok(Array.isArray(historyRes.data), "History must be an array of reservations");
    const found = historyRes.data.find((r) => r.id === createdId);
    assert.ok(found, `Newly created reservation #${createdId} must exist in user history`);
    assert.strictEqual(found.hotelId, hotelId);
    assert.strictEqual(found.specialRequests, patchPayload.specialRequests);
    reportPass(`GET /api/reservations retrieved ${historyRes.data.length} reservations, including modified #${createdId}`);

    // e2: GET single reservation by ID
    const singleRes = await request(`/reservations/${createdId}`, {
      method: "GET",
      headers: authHeaders
    });
    assert.strictEqual(singleRes.status, 200, "GET /api/reservations/:id must return 200 OK");
    assert.strictEqual(singleRes.data.id, createdId);
    reportPass(`GET /api/reservations/${createdId} retrieved authoritative single stay record`);

    // -------------------------------------------------------------
    // d) Cancel a reservation using DELETE
    // -------------------------------------------------------------
    console.log(`\n${colors.bold}--- d) Cancel a Reservation [DELETE] ---${colors.reset}`);

    const deleteRes = await request(`/reservations/${createdId}`, {
      method: "DELETE",
      headers: authHeaders
    });

    assert.strictEqual(deleteRes.status, 200, "DELETE /api/reservations/:id must return 200 OK");
    assert.ok(deleteRes.data.message || deleteRes.data.success, "Must return cancellation confirmation");
    reportPass(`DELETE /api/reservations/${createdId} successfully cancelled stay and released room inventory`);

    // Verify removal via GET
    const postDeleteRes = await request(`/reservations/${createdId}`, {
      method: "GET",
      headers: authHeaders
    });
    assert.strictEqual(postDeleteRes.status, 404, "Reservation must no longer be found after DELETE");
    reportPass(`Verified #${createdId} is purged from active reservations (Returns HTTP 404 Not Found)`);

    // -------------------------------------------------------------
    // f) Implement loading and error handling for all operations
    // -------------------------------------------------------------
    console.log(`\n${colors.bold}--- f) Error Handling & Boundary Condition Validations ---${colors.reset}`);

    // f1: 400 Bad Request on inverted chronological dates (checkout before checkin)
    const badDatesRes = await request("/reservations", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        hotelId: 101,
        roomId: 1,
        checkIn: "2026-11-25",
        checkOut: "2026-11-20" // Check-out before check-in!
      })
    });
    assert.strictEqual(badDatesRes.status, 400, "Inverted dates must return 400 Bad Request");
    assert.ok(badDatesRes.data.error.includes("Check-out date must be strictly after check-in date"));
    reportPass("Error Resilience: HTTP 400 correctly returned when check-out precedes check-in");

    // f2: 409 Conflict on double booking collision
    // First, book a test slot
    const bookSlotRes = await request("/reservations", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        hotelId: 102,
        roomId: 1,
        checkIn: "2026-12-10",
        checkOut: "2026-12-15",
        guests: 2
      })
    });
    assert.strictEqual(bookSlotRes.status, 201);
    const tempResId = bookSlotRes.data.id;

    // Second, attempt to double-book overlapping dates (2026-12-12 to 2026-12-18)
    const collisionRes = await request("/reservations", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        hotelId: 102,
        roomId: 1,
        checkIn: "2026-12-12",
        checkOut: "2026-12-18",
        guests: 2
      })
    });
    assert.strictEqual(collisionRes.status, 409, "Double booking collision must return HTTP 409 Conflict");
    assert.strictEqual(collisionRes.data.code, "BOOKING_CONFLICT");
    reportPass("Error Resilience: HTTP 409 Conflict triggered on date interval collision (Double-booking blocked)");

    // Clean up temporary slot
    await request(`/reservations/${tempResId}`, { method: "DELETE", headers: authHeaders });

    // f3: 404 Not Found on invalid reservation ID
    const notFoundRes = await request("/reservations/RES-NONEXISTENT-999999", {
      method: "GET",
      headers: authHeaders
    });
    assert.strictEqual(notFoundRes.status, 404, "Invalid ID must return 404 Not Found");
    reportPass("Error Resilience: HTTP 404 returned for missing reservation lookup");

    // f4: 401 Unauthorized when Bearer token is omitted
    const unauthorizedRes = await request("/reservations", {
      method: "GET"
      // Missing headers.Authorization
    });
    assert.strictEqual(unauthorizedRes.status, 401, "Missing token must return 401 Unauthorized");
    assert.strictEqual(unauthorizedRes.data.code, "AUTH_REQUIRED");
    reportPass("Error Resilience: HTTP 401 Unauthorized returned when Authorization header is absent");

    // -------------------------------------------------------------
    // SUMMARY REPORT
    // -------------------------------------------------------------
    console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.green}🎉 EXPERIMENT 3 CRUD VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED${colors.reset}`);
    console.log(`${colors.cyan}All Experiment 3 operations (a, b, c, d, e, f) verified 100% compliant.${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    reportFail("Fatal test error", err);
    process.exit(1);
  }
})();
