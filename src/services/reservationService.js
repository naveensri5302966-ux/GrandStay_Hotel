import apiClient, { isMockMode } from "./apiClient";
import logger from "../utils/logger";

/**
 * Native Fetch helper to demonstrate both Axios and Fetch APIs
 * (Topics: REST API, CRUD, Axios/Fetch)
 */
async function executeFetch(endpoint, method = "GET", body = null) {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("grand_stay_auth_token") : null;
  const baseUrl = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) || "http://localhost:5000/api";
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = {
    Accept: "application/json"
  };
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method: method.toUpperCase(),
    headers
  };
  if (body && method.toUpperCase() !== "GET") {
    options.body = JSON.stringify(body);
  }

  const startTime = Date.now();
  const response = await fetch(url, options);
  const duration = Date.now() - startTime;

  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.error || response.statusText || `HTTP Error ${response.status}`;
    const err = new Error(errorMsg);
    err.response = {
      status: response.status,
      statusText: response.statusText,
      data
    };
    err.status = response.status;
    err.duration = duration;
    throw err;
  }

  return {
    data,
    status: response.status,
    duration,
    headers: Object.fromEntries(response.headers.entries())
  };
}

/**
 * Reservation Service (Experiment 3: Hotel Reservation CRUD Operations)
 * Topics: REST API, CRUD, Axios/Fetch
 * 
 * a) Retrieve hotel and room information using GET
 * b) Create a hotel reservation using POST
 * c) Update reservation details using PUT/PATCH
 * d) Cancel a reservation using DELETE
 * e) Retrieve reservation history using GET
 * f) Implement loading and error handling for all operations
 */
export const reservationService = {
  /**
   * a) GET — Retrieve hotel catalog
   */
  async getHotels(params = {}, options = {}) {
    const isMock = isMockMode();
    const useFetch = Boolean(options.useFetch);
    logger.reservation("GET", "/hotels", "started", isMock);
    console.log(
      `%c[CRUD: GET Hotels (${useFetch ? "Fetch API" : "Axios"})] Fetching hotel catalog 🏨📥`,
      "background: #0284C7; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;",
      { endpoint: "/api/hotels", method: "GET", client: useFetch ? "Fetch" : "Axios", params }
    );
    try {
      if (useFetch) {
        const query = new URLSearchParams();
        if (params.location) query.append("location", params.location);
        if (params.maxPrice) query.append("maxPrice", params.maxPrice);
        if (params.minStars) query.append("minStars", params.minStars);
        const qs = query.toString() ? `?${query.toString()}` : "";
        const res = await executeFetch(`/hotels${qs}`, "GET");
        console.log(`%c[CRUD: GET Hotels (Fetch)] 200 OK (${res.data?.length || 0} hotels) ✅`, "color: #16A34A; font-weight: bold;", res.data);
        return res.data;
      }
      const data = await apiClient.get("/hotels", { params });
      console.log(`%c[CRUD: GET Hotels (Axios)] 200 OK (${data?.length || 0} hotels) ✅`, "color: #16A34A; font-weight: bold;", data);
      return data;
    } catch (error) {
      console.error("[CRUD: GET Hotels] Error:", error);
      throw error;
    }
  },

  /**
   * a) GET — Retrieve room details for a specific hotel
   */
  async getHotelRooms(hotelId, options = {}) {
    const isMock = isMockMode();
    const useFetch = Boolean(options.useFetch);
    logger.reservation("GET", `/hotels/${hotelId}/rooms`, "started", isMock);
    console.log(
      `%c[CRUD: GET Rooms (${useFetch ? "Fetch API" : "Axios"})] Fetching rooms for Hotel #${hotelId} 🛏️📥`,
      "background: #0284C7; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;",
      { hotelId, endpoint: `/api/hotels/${hotelId}/rooms`, method: "GET", client: useFetch ? "Fetch" : "Axios" }
    );
    try {
      if (useFetch) {
        const res = await executeFetch(`/hotels/${hotelId}/rooms`, "GET");
        console.log(`%c[CRUD: GET Rooms (Fetch)] 200 OK (${res.data?.length || 0} rooms) ✅`, "color: #16A34A; font-weight: bold;", res.data);
        return res.data;
      }
      const data = await apiClient.get(`/hotels/${hotelId}/rooms`);
      console.log(`%c[CRUD: GET Rooms (Axios)] 200 OK (${data?.length || 0} rooms) ✅`, "color: #16A34A; font-weight: bold;", data);
      return data;
    } catch (error) {
      console.error("[CRUD: GET Rooms] Error:", error);
      throw error;
    }
  },

  /**
   * e) GET — Retrieve all reservation history
   */
  async getReservations(options = {}) {
    const isMock = isMockMode();
    const useFetch = Boolean(options.useFetch);
    logger.reservation("GET", "/reservations", "started", isMock);
    console.log(
      `%c[CRUD: GET History (${useFetch ? "Fetch API" : "Axios"})] Sending GET Request 📥`,
      "background: #0284C7; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;",
      { endpoint: "/api/reservations", method: "GET", client: useFetch ? "Fetch" : "Axios" }
    );
    try {
      let data;
      if (useFetch) {
        const res = await executeFetch("/reservations", "GET");
        data = res.data;
      } else {
        data = await apiClient.get("/reservations");
      }
      const count = Array.isArray(data) ? data.length : 0;
      logger.reservation("GET", "/reservations", 200, isMock, `${count} stays retrieved`);
      console.log(
        `%c[CRUD: GET History] Success 200 OK (${count} stays loaded) ✅`,
        "color: #16A34A; font-weight: bold;",
        data
      );
      return data;
    } catch (error) {
      const status = error.response?.status || error.status || "error";
      logger.reservation("GET", "/reservations", status, isMock, error.message);
      console.error("[CRUD: GET History] Error:", error);
      throw error;
    }
  },

  /**
   * e) GET — Retrieve a single reservation by ID
   */
  async getReservationById(id, options = {}) {
    const isMock = isMockMode();
    const useFetch = Boolean(options.useFetch);
    logger.reservation("GET", `/reservations/${id}`, "started", isMock);
    console.log(
      `%c[CRUD: GET (By ID) (${useFetch ? "Fetch API" : "Axios"})] Sending GET Request 📥`,
      "background: #0284C7; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;",
      { id, endpoint: `/api/reservations/${id}`, method: "GET", client: useFetch ? "Fetch" : "Axios" }
    );
    try {
      let data;
      if (useFetch) {
        const res = await executeFetch(`/reservations/${id}`, "GET");
        data = res.data;
      } else {
        data = await apiClient.get(`/reservations/${id}`);
      }
      logger.reservation("GET", `/reservations/${id}`, 200, isMock);
      console.log(
        `%c[CRUD: GET (By ID)] Success 200 OK ✅`,
        "color: #16A34A; font-weight: bold;",
        data
      );
      return data;
    } catch (error) {
      const status = error.response?.status || error.status || "error";
      logger.reservation("GET", `/reservations/${id}`, status, isMock, error.message);
      console.error("[CRUD: GET (By ID)] Error:", error);
      throw error;
    }
  },

  /**
   * b) POST — Create a new hotel reservation
   */
  async createReservation(reservationData, options = {}) {
    const isMock = isMockMode();
    const useFetch = Boolean(options.useFetch);
    logger.reservation("POST", "/reservations", "started", isMock);
    console.log(
      `%c[CRUD: POST (${useFetch ? "Fetch API" : "Axios"})] Sending POST Request to Create Reservation 📤`,
      "background: #16A34A; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;",
      { endpoint: "/api/reservations", method: "POST", client: useFetch ? "Fetch" : "Axios", payload: reservationData }
    );
    try {
      let data;
      if (useFetch) {
        const res = await executeFetch("/reservations", "POST", reservationData);
        data = res.data;
      } else {
        data = await apiClient.post("/reservations", reservationData);
      }
      logger.reservation("POST", "/reservations", 201, isMock, `Created #${data.id}`);
      console.log(
        `%c[CRUD: POST] Success 201 Created (ID: ${data.id}) ✅`,
        "color: #16A34A; font-weight: bold;",
        data
      );
      return data;
    } catch (error) {
      const status = error.response?.status || error.status || "error";
      logger.reservation("POST", "/reservations", status, isMock, error.message);
      console.error("[CRUD: POST] Error:", error);
      throw error;
    }
  },

  /**
   * c) PUT — Update entire reservation details (dates, guest count, special requests)
   */
  async updateReservation(id, updateData, options = {}) {
    const isMock = isMockMode();
    const useFetch = Boolean(options.useFetch);
    logger.reservation("PUT", `/reservations/${id}`, "started", isMock);
    console.log(
      `%c[CRUD: UPDATE (PUT) (${useFetch ? "Fetch API" : "Axios"})] Sending PUT Request 🔄`,
      "background: #D97706; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;",
      { id, endpoint: `/api/reservations/${id}`, method: "PUT", client: useFetch ? "Fetch" : "Axios", payload: updateData }
    );
    try {
      let data;
      if (useFetch) {
        const res = await executeFetch(`/reservations/${id}`, "PUT", updateData);
        data = res.data;
      } else {
        data = await apiClient.put(`/reservations/${id}`, updateData);
      }
      logger.reservation("PUT", `/reservations/${id}`, 200, isMock, `Updated #${id}`);
      console.log(
        "%c[CRUD: UPDATE (PUT)] Success 200 OK ✅",
        "color: #16A34A; font-weight: bold;",
        data
      );
      return data;
    } catch (error) {
      const status = error.response?.status || error.status || "error";
      logger.reservation("PUT", `/reservations/${id}`, status, isMock, error.message);
      console.error("[CRUD: UPDATE (PUT)] Error:", error);
      throw error;
    }
  },

  /**
   * c) PATCH — Partially update reservation details (status, specialRequests, guest count)
   */
  async patchReservation(id, patchData, options = {}) {
    const isMock = isMockMode();
    const useFetch = Boolean(options.useFetch);
    logger.reservation("PATCH", `/reservations/${id}`, "started", isMock);
    console.log(
      `%c[CRUD: UPDATE (PATCH) (${useFetch ? "Fetch API" : "Axios"})] Sending PATCH Request 🔄`,
      "background: #8B5CF6; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;",
      { id, endpoint: `/api/reservations/${id}`, method: "PATCH", client: useFetch ? "Fetch" : "Axios", payload: patchData }
    );
    try {
      let data;
      if (useFetch) {
        const res = await executeFetch(`/reservations/${id}`, "PATCH", patchData);
        data = res.data;
      } else {
        data = await apiClient.patch(`/reservations/${id}`, patchData);
      }
      logger.reservation("PATCH", `/reservations/${id}`, 200, isMock, `Patched #${id}`);
      console.log(
        "%c[CRUD: UPDATE (PATCH)] Success 200 OK ✅",
        "color: #16A34A; font-weight: bold;",
        data
      );
      return data;
    } catch (error) {
      const status = error.response?.status || error.status || "error";
      logger.reservation("PATCH", `/reservations/${id}`, status, isMock, error.message);
      console.error("[CRUD: UPDATE (PATCH)] Error:", error);
      throw error;
    }
  },

  /**
   * POST (Update) — Update reservation details using POST method
   */
  async updateReservationWithPost(id, updateData, options = {}) {
    const isMock = isMockMode();
    const useFetch = Boolean(options.useFetch);
    logger.reservation("POST (UPDATE)", `/reservations/${id}`, "started", isMock);
    console.log(
      `%c[CRUD: UPDATE (POST) (${useFetch ? "Fetch API" : "Axios"})] Sending POST Request to Update 🔄`,
      "background: #D97706; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;",
      { id, endpoint: `/api/reservations/${id}`, method: "POST", client: useFetch ? "Fetch" : "Axios", payload: updateData }
    );
    try {
      let data;
      if (useFetch) {
        const res = await executeFetch(`/reservations/${id}`, "POST", updateData);
        data = res.data;
      } else {
        data = await apiClient.post(`/reservations/${id}`, updateData);
      }
      logger.reservation("POST (UPDATE)", `/reservations/${id}`, 200, isMock, `Updated #${id} via POST`);
      console.log(
        "%c[CRUD: UPDATE (POST)] Success 200 OK ✅",
        "color: #16A34A; font-weight: bold;",
        data
      );
      return data;
    } catch (error) {
      const status = error.response?.status || error.status || "error";
      logger.reservation("POST (UPDATE)", `/reservations/${id}`, status, isMock, error.message);
      console.error("[CRUD: UPDATE (POST)] Error:", error);
      throw error;
    }
  },

  /**
   * d) DELETE — Cancel a reservation
   */
  async cancelReservation(id, options = {}) {
    const isMock = isMockMode();
    const useFetch = Boolean(options.useFetch);
    logger.reservation("DELETE", `/reservations/${id}`, "started", isMock);
    console.log(
      `%c[CRUD: DELETE (${useFetch ? "Fetch API" : "Axios"})] Sending DELETE Request 🗑️`,
      "background: #DC2626; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;",
      { id, endpoint: `/api/reservations/${id}`, client: useFetch ? "Fetch" : "Axios" }
    );
    try {
      let data;
      if (useFetch) {
        const res = await executeFetch(`/reservations/${id}`, "DELETE");
        data = res.data;
      } else {
        data = await apiClient.delete(`/reservations/${id}`);
      }
      logger.reservation("DELETE", `/reservations/${id}`, 200, isMock, `Cancelled #${id}`);
      console.log(
        "%c[CRUD: DELETE] Success 200 OK ✅",
        "color: #16A34A; font-weight: bold;",
        data
      );
      return data;
    } catch (error) {
      const status = error.response?.status || error.status || "error";
      logger.reservation("DELETE", `/reservations/${id}`, status, isMock, error.message);
      console.error("[CRUD: DELETE] Error:", error);
      throw error;
    }
  },

  /**
   * Interactive Full CRUD Lifecycle Demonstration
   * Covers:
   * a) Retrieve hotel and room info (GET)
   * b) Create hotel reservation (POST)
   * c) Update reservation details (PUT and PATCH)
   * d) Cancel reservation (DELETE)
   * e) Retrieve reservation history (GET)
   * f) Loading and error handling
   */
  async runCrudLifecycleDemo(options = {}) {
    const useFetch = Boolean(options.useFetch);
    console.clear();
    console.log(
      `%c====================================================================\n🚀 EXPERIMENT 3: CRUD OPERATIONS CONSOLE DEMO (${useFetch ? "FETCH API" : "AXIOS CLIENT"})\n====================================================================`,
      "background: #0F172A; color: #38BDF8; font-size: 13px; font-weight: bold; padding: 6px 12px; border-radius: 4px;"
    );

    try {
      // 1. [PART A] GET Hotels & Rooms
      console.log("\n%c--- 1. [PART A: GET] Fetching Hotel & Room Information ---", "color: #0284C7; font-weight: bold; font-size: 12px;");
      const hotels = await this.getHotels({}, { useFetch });
      const firstHotel = hotels[0] || { id: 101, name: "The Grand Stay" };
      console.log("📥 GET /hotels Response:", hotels);

      const rooms = await this.getHotelRooms(firstHotel.id, { useFetch });
      const firstRoom = rooms[0] || { id: 1, name: "Deluxe Room", price: 8500 };
      console.log(`📥 GET /hotels/${firstHotel.id}/rooms Response:`, rooms);

      // 2. [PART E] GET Reservation History
      console.log("\n%c--- 2. [PART E: GET] Fetching Reservation History ---", "color: #0284C7; font-weight: bold; font-size: 12px;");
      const initialReservations = await this.getReservations({ useFetch });
      console.log("📥 Current Reservations Count:", initialReservations.length);

      // 3. [PART B] POST Create Reservation
      console.log("\n%c--- 3. [PART B: POST] Creating New Hotel Reservation ---", "color: #16A34A; font-weight: bold; font-size: 12px;");
      const newBookingData = {
        hotelId: firstHotel.id,
        hotelName: firstHotel.name,
        roomId: firstRoom.id,
        roomName: firstRoom.name,
        checkIn: "2026-11-20",
        checkOut: "2026-11-23",
        guests: 2,
        specialRequests: "High floor ocean view requested via CRUD Demo",
        customerName: "Eleanor Vance",
        email: "eleanor.vance@example.com",
        phone: "9876543210"
      };
      const created = await this.createReservation(newBookingData, { useFetch });
      console.log("📤 POST Created Record:", created);

      // 4. [PART C] PUT Update Reservation (Full modification / dates re-schedule)
      console.log("\n%c--- 4. [PART C: PUT] Updating Stay Dates & Guests ---", "color: #D97706; font-weight: bold; font-size: 12px;");
      const putUpdated = await this.updateReservation(
        created.id,
        {
          checkIn: "2026-11-21",
          checkOut: "2026-11-24",
          guests: 3,
          specialRequests: "Fruit basket and late checkout requested (PUT)"
        },
        { useFetch }
      );
      console.log("🔄 UPDATE (PUT) Response:", putUpdated);

      // 5. [PART C] PATCH Update Reservation (Partial modification)
      console.log("\n%c--- 5. [PART C: PATCH] Partially Updating Special Requests ---", "color: #8B5CF6; font-weight: bold; font-size: 12px;");
      const patchUpdated = await this.patchReservation(
        created.id,
        {
          specialRequests: "Additional feather pillows requested (PATCH)"
        },
        { useFetch }
      );
      console.log("🔄 UPDATE (PATCH) Response:", patchUpdated);

      // 6. [PART D] DELETE Cancel Reservation
      console.log("\n%c--- 6. [PART D: DELETE] Cancelling The Reservation ---", "color: #DC2626; font-weight: bold; font-size: 12px;");
      const cancelled = await this.cancelReservation(created.id, { useFetch });
      console.log("🗑️ DELETE Result:", cancelled);

      // 7. [PART E] Verify Removal via GET
      console.log("\n%c--- 7. [PART E: GET] Verifying Final Reservation History ---", "color: #0284C7; font-weight: bold; font-size: 12px;");
      const finalReservations = await this.getReservations({ useFetch });
      console.log("📥 Final Reservations Count:", finalReservations.length);

      console.log(
        `%c====================================================================\n✅ ALL CRUD OPERATIONS (a: GET, b: POST, c: PUT/PATCH, d: DELETE, e: GET) VERIFIED VIA ${useFetch ? "FETCH API" : "AXIOS"}!\n====================================================================`,
        "background: #064E3B; color: #34D399; font-size: 13px; font-weight: bold; padding: 6px 12px; border-radius: 4px;"
      );
      return { success: true, created, putUpdated, patchUpdated, cancelled };
    } catch (err) {
      console.error("❌ CRUD Demo Error:", err);
      throw err;
    }
  }
};

export default reservationService;
