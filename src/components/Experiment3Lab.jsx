import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import reservationService from "../services/reservationService";
import Button from "./common/Button";
import Loading from "./common/Loading";
import Input from "./common/Input";
import DatePicker from "./common/DatePicker";

export function Experiment3Lab() {
  const { user } = useAuth();

  // Active Tab: "overview", "part-a", "part-b", "part-c", "part-d", "part-e", "part-f"
  const [activeTab, setActiveTab] = useState("overview");

  // HTTP Client: "axios" vs "fetch"
  const [httpClient, setHttpClient] = useState("axios");
  const useFetch = httpClient === "fetch";

  // Syllabus Completion Status
  const [completedSteps, setCompletedSteps] = useState({
    a: false,
    b: false,
    c: false,
    d: false,
    e: false,
    f: false
  });

  // REST API Inspector State
  const [inspector, setInspector] = useState({
    title: "Initial Ready State",
    endpoint: "/api/reservations",
    method: "GET",
    client: "Axios",
    status: 200,
    statusText: "Ready",
    requestHeaders: {
      Accept: "application/json",
      Authorization: "Bearer <JWT_TOKEN>"
    },
    requestPayload: null,
    responsePayload: { message: "Select any operation to inspect live request & response traffic." },
    durationMs: 0,
    timestamp: new Date().toLocaleTimeString()
  });

  // Shared Data States
  const [hotels, setHotels] = useState([]);
  const [selectedHotelRooms, setSelectedHotelRooms] = useState([]);
  const [selectedHotelForRooms, setSelectedHotelForRooms] = useState(null);
  const [reservations, setReservations] = useState([]);

  // Loading States for individual actions (Requirement f: Loading handling)
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [loadingC, setLoadingC] = useState(false);
  const [loadingD, setLoadingD] = useState(false);
  const [loadingE, setLoadingE] = useState(false);
  const [loadingF, setLoadingF] = useState(false);

  // Error States (Requirement f: Error handling)
  const [errorA, setErrorA] = useState(null);
  const [errorB, setErrorB] = useState(null);
  const [errorC, setErrorC] = useState(null);
  const [errorD, setErrorD] = useState(null);
  const [errorE, setErrorE] = useState(null);
  const [errorF, setErrorF] = useState(null);

  // Success Notification Banner
  const [successMsg, setSuccessMsg] = useState("");

  // Part a Filter
  const [filterCity, setFilterCity] = useState("");

  // Part b Form
  const [createForm, setCreateForm] = useState({
    hotelId: 101,
    hotelName: "The Grand Stay",
    roomId: 1,
    roomName: "Deluxe Room",
    roomPrice: 8500,
    checkIn: "2026-11-20",
    checkOut: "2026-11-23",
    guests: 2,
    customerName: user?.name || "Eleanor Vance",
    email: user?.email || "eleanor.vance@example.com",
    phone: "9876543210",
    specialRequests: "High floor ocean view requested via Experiment 3"
  });

  // Part c Update Form
  const [updateTargetId, setUpdateTargetId] = useState("");
  const [updateForm, setUpdateForm] = useState({
    checkIn: "2026-11-21",
    checkOut: "2026-11-24",
    guests: 3,
    specialRequests: "Upgraded to fruit basket & late checkout"
  });

  // Helper to record traffic in inspector
  const logInspector = useCallback((title, endpoint, method, reqPayload, resPayload, status = 200, statusText = "OK", duration = 15) => {
    setInspector({
      title,
      endpoint,
      method,
      client: useFetch ? "Fetch API" : "Axios",
      status,
      statusText,
      requestHeaders: {
        Accept: "application/json",
        "Content-Type": reqPayload ? "application/json" : undefined,
        Authorization: "Bearer " + (localStorage.getItem("grand_stay_auth_token")?.substring(0, 24) || "none") + "..."
      },
      requestPayload: reqPayload,
      responsePayload: resPayload,
      durationMs: duration,
      timestamp: new Date().toLocaleTimeString()
    });
  }, [useFetch]);

  // Helper calculation for Part b
  const checkInDate = new Date(createForm.checkIn);
  const checkOutDate = new Date(createForm.checkOut);
  const diffDays = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  const validNights = diffDays > 0 ? diffDays : 0;
  const roomCost = validNights * (createForm.roomPrice || 8500);
  const gstTax = Math.round(roomCost * 0.12);
  const resortFee = 500;
  const grandTotal = roomCost + gstTax + resortFee;

  // Fetch rooms for a selected hotel
  const handleFetchRooms = useCallback(async (hotel) => {
    setSelectedHotelForRooms(hotel);
    setLoadingA(true);
    const startTime = Date.now();
    try {
      const rooms = await reservationService.getHotelRooms(hotel.id, { useFetch });
      const duration = Date.now() - startTime;
      setSelectedHotelRooms(Array.isArray(rooms) ? rooms : []);
      logInspector(`a) Retrieve Rooms for ${hotel.name}`, `/api/hotels/${hotel.id}/rooms`, "GET", null, rooms, 200, "OK", duration);
      setCompletedSteps((prev) => ({ ...prev, a: true }));
    } catch (err) {
      const status = err.response?.status || err.status || 500;
      const msg = err.response?.data?.error || err.message || "Failed to fetch room details.";
      setErrorA(`[HTTP ${status}] ${msg}`);
    } finally {
      setLoadingA(false);
    }
  }, [useFetch, logInspector]);

  // -------------------------------------------------------------
  // a) Retrieve hotel and room information using GET
  // -------------------------------------------------------------
  const handleFetchHotels = useCallback(async () => {
    setLoadingA(true);
    setErrorA(null);
    setSuccessMsg("");
    const startTime = Date.now();
    try {
      const params = filterCity ? { location: filterCity } : {};
      const data = await reservationService.getHotels(params, { useFetch });
      const duration = Date.now() - startTime;
      setHotels(Array.isArray(data) ? data : []);
      logInspector("a) Retrieve Hotels Catalog", "/api/hotels", "GET", params, data, 200, "OK", duration);
      setCompletedSteps((prev) => ({ ...prev, a: true }));
      setSuccessMsg(`Part a) Successfully retrieved ${data.length} hotels via GET /api/hotels using ${useFetch ? "Fetch API" : "Axios"}.`);

      // Auto-fetch rooms of first hotel
      if (data.length > 0) {
        handleFetchRooms(data[0]);
      }
    } catch (err) {
      const status = err.response?.status || err.status || 500;
      const msg = err.response?.data?.error || err.message || "Failed to load hotels.";
      setErrorA(`[HTTP ${status}] ${msg}`);
      logInspector("a) GET Hotels Failed", "/api/hotels", "GET", null, { error: msg }, status, "Error", Date.now() - startTime);
    } finally {
      setLoadingA(false);
    }
  }, [filterCity, useFetch, handleFetchRooms, logInspector]);

  // -------------------------------------------------------------
  // e) Retrieve reservation history using GET
  // -------------------------------------------------------------
  const handleFetchReservations = useCallback(async () => {
    setLoadingE(true);
    setErrorE(null);
    const startTime = Date.now();
    try {
      const data = await reservationService.getReservations({ useFetch });
      const duration = Date.now() - startTime;
      setReservations(Array.isArray(data) ? data : []);
      logInspector("e) Retrieve Reservation History", "/api/reservations", "GET", null, data, 200, "OK", duration);
      setCompletedSteps((prev) => ({ ...prev, e: true }));
      if (data.length > 0 && !updateTargetId) {
        setUpdateTargetId(data[0].id);
      }
      return data;
    } catch (err) {
      const status = err.response?.status || err.status || 500;
      const msg = err.response?.data?.error || err.message || "Failed to load reservations.";
      setErrorE(`[HTTP ${status}] ${msg}`);
      logInspector("e) GET History Failed", "/api/reservations", "GET", null, { error: msg }, status, "Error", Date.now() - startTime);
    } finally {
      setLoadingE(false);
    }
  }, [useFetch, updateTargetId, logInspector]);

  // Initial load via clean promise handling
  useEffect(() => {
    let ignore = false;
    reservationService.getHotels({}, { useFetch: false })
      .then((data) => {
        if (!ignore && Array.isArray(data)) {
          setHotels(data);
          if (data.length > 0) {
            setSelectedHotelForRooms(data[0]);
            reservationService.getHotelRooms(data[0].id, { useFetch: false })
              .then((rooms) => {
                if (!ignore && Array.isArray(rooms)) {
                  setSelectedHotelRooms(rooms);
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => {});

    reservationService.getReservations({ useFetch: false })
      .then((data) => {
        if (!ignore && Array.isArray(data)) {
          setReservations(data);
          if (data.length > 0) {
            setUpdateTargetId(data[0].id);
          }
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  // -------------------------------------------------------------
  // b) Create a hotel reservation using POST
  // -------------------------------------------------------------
  const handleCreateReservation = async (e) => {
    if (e) e.preventDefault();
    setLoadingB(true);
    setErrorB(null);
    setSuccessMsg("");
    const startTime = Date.now();

    if (validNights <= 0) {
      setErrorB("Validation Error: Check-out date must be strictly after Check-in date.");
      setLoadingB(false);
      return;
    }

    const payload = {
      hotelId: Number(createForm.hotelId),
      hotelName: createForm.hotelName,
      roomId: Number(createForm.roomId),
      roomName: createForm.roomName,
      checkIn: createForm.checkIn,
      checkOut: createForm.checkOut,
      guests: Number(createForm.guests),
      customerName: createForm.customerName,
      email: createForm.email,
      phone: createForm.phone,
      specialRequests: createForm.specialRequests
    };

    try {
      const created = await reservationService.createReservation(payload, { useFetch });
      const duration = Date.now() - startTime;
      logInspector("b) Create Reservation (POST)", "/api/reservations", "POST", payload, created, 201, "Created", duration);
      setCompletedSteps((prev) => ({ ...prev, b: true }));
      setSuccessMsg(`Part b) Created reservation #${created.id} successfully (Status: 201 Created) using ${useFetch ? "Fetch API" : "Axios"}!`);
      setUpdateTargetId(created.id);
      await handleFetchReservations();
      setActiveTab("part-e");
    } catch (err) {
      const status = err.response?.status || err.status || 500;
      const msg = err.response?.data?.error || err.message || "Failed to create reservation.";
      setErrorB(`[HTTP ${status}] ${msg}`);
      logInspector("b) POST Reservation Failed", "/api/reservations", "POST", payload, { error: msg }, status, "Error", Date.now() - startTime);
    } finally {
      setLoadingB(false);
    }
  };

  // -------------------------------------------------------------
  // c) Update reservation details using PUT
  // -------------------------------------------------------------
  const handleUpdateReservationPut = async () => {
    if (!updateTargetId) {
      setErrorC("Please select a reservation to update.");
      return;
    }
    setLoadingC(true);
    setErrorC(null);
    setSuccessMsg("");
    const startTime = Date.now();

    const payload = {
      checkIn: updateForm.checkIn,
      checkOut: updateForm.checkOut,
      guests: Number(updateForm.guests),
      specialRequests: updateForm.specialRequests
    };

    try {
      const updated = await reservationService.updateReservation(updateTargetId, payload, { useFetch });
      const duration = Date.now() - startTime;
      logInspector(`c) Full Update via PUT #${updateTargetId}`, `/api/reservations/${updateTargetId}`, "PUT", payload, updated, 200, "OK", duration);
      setCompletedSteps((prev) => ({ ...prev, c: true }));
      setSuccessMsg(`Part c) Reservation #${updateTargetId} updated successfully via PUT request (Status: 200 OK)!`);
      await handleFetchReservations();
    } catch (err) {
      const status = err.response?.status || err.status || 500;
      const msg = err.response?.data?.error || err.message || "Failed to update reservation via PUT.";
      setErrorC(`[HTTP ${status}] ${msg}`);
      logInspector("c) PUT Update Failed", `/api/reservations/${updateTargetId}`, "PUT", payload, { error: msg }, status, "Error", Date.now() - startTime);
    } finally {
      setLoadingC(false);
    }
  };

  // -------------------------------------------------------------
  // c) Update reservation details using PATCH
  // -------------------------------------------------------------
  const handleUpdateReservationPatch = async () => {
    if (!updateTargetId) {
      setErrorC("Please select a reservation to patch.");
      return;
    }
    setLoadingC(true);
    setErrorC(null);
    setSuccessMsg("");
    const startTime = Date.now();

    const patchPayload = {
      specialRequests: updateForm.specialRequests + " [Patched at " + new Date().toLocaleTimeString() + "]",
      status: "Modified"
    };

    try {
      const patched = await reservationService.patchReservation(updateTargetId, patchPayload, { useFetch });
      const duration = Date.now() - startTime;
      logInspector(`c) Partial Update via PATCH #${updateTargetId}`, `/api/reservations/${updateTargetId}`, "PATCH", patchPayload, patched, 200, "OK", duration);
      setCompletedSteps((prev) => ({ ...prev, c: true }));
      setSuccessMsg(`Part c) Reservation #${updateTargetId} partially modified via PATCH request (Status: 200 OK)!`);
      await handleFetchReservations();
    } catch (err) {
      const status = err.response?.status || err.status || 500;
      const msg = err.response?.data?.error || err.message || "Failed to patch reservation.";
      setErrorC(`[HTTP ${status}] ${msg}`);
      logInspector("c) PATCH Update Failed", `/api/reservations/${updateTargetId}`, "PATCH", patchPayload, { error: msg }, status, "Error", Date.now() - startTime);
    } finally {
      setLoadingC(false);
    }
  };

  // -------------------------------------------------------------
  // d) Cancel a reservation using DELETE
  // -------------------------------------------------------------
  const handleCancelReservation = async (resId) => {
    if (!resId) return;
    setLoadingD(true);
    setErrorD(null);
    setSuccessMsg("");
    const startTime = Date.now();

    try {
      const result = await reservationService.cancelReservation(resId, { useFetch });
      const duration = Date.now() - startTime;
      logInspector(`d) Cancel Reservation via DELETE #${resId}`, `/api/reservations/${resId}`, "DELETE", null, result, 200, "OK", duration);
      setCompletedSteps((prev) => ({ ...prev, d: true }));
      setSuccessMsg(`Part d) Reservation #${resId} cancelled successfully via DELETE request (Status: 200 OK)!`);
      await handleFetchReservations();
    } catch (err) {
      const status = err.response?.status || err.status || 500;
      const msg = err.response?.data?.error || err.message || "Failed to cancel reservation.";
      setErrorD(`[HTTP ${status}] ${msg}`);
      logInspector("d) DELETE Cancel Failed", `/api/reservations/${resId}`, "DELETE", null, { error: msg }, status, "Error", Date.now() - startTime);
    } finally {
      setLoadingD(false);
    }
  };

  // -------------------------------------------------------------
  // f) Error Handling Demonstrations: 400, 409, 404, 401
  // -------------------------------------------------------------
  const handleSimulateError = async (type) => {
    setLoadingF(true);
    setErrorF(null);
    setSuccessMsg("");
    const startTime = Date.now();

    try {
      if (type === "400_dates") {
        // Submit checkout before checkin
        const badPayload = {
          hotelId: 101,
          roomId: 1,
          checkIn: "2026-11-25",
          checkOut: "2026-11-20" // Bad chronological order
        };
        await reservationService.createReservation(badPayload, { useFetch });
      } else if (type === "409_conflict") {
        // Attempt double booking on overlapping dates for same room
        const conflictPayload = {
          hotelId: 101,
          hotelName: "The Grand Stay",
          roomId: 1,
          roomName: "Deluxe Room",
          checkIn: "2026-11-10",
          checkOut: "2026-11-13" // Matches existing seed reservation
        };
        // Book once
        await reservationService.createReservation(conflictPayload, { useFetch });
        // Book exact same room & dates second time to trigger 409 Conflict
        await reservationService.createReservation(conflictPayload, { useFetch });
      } else if (type === "404_not_found") {
        await reservationService.getReservationById("RES-INVALID-999999", { useFetch });
      } else if (type === "slow_loading") {
        // Injects artificial delay to demonstrate loading indicator
        await new Promise((r) => setTimeout(r, 1600));
        await reservationService.getHotels({}, { useFetch });
        setCompletedSteps((prev) => ({ ...prev, f: true }));
        setSuccessMsg("Part f) Loading state verified: Spinners, disabled buttons, and state transitions operated smoothly!");
        setLoadingF(false);
        return;
      }
    } catch (err) {
      const status = err.response?.status || err.status || "Unknown";
      const errMsg = err.response?.data?.error || err.message || "An expected error occurred";
      const duration = Date.now() - startTime;
      setErrorF(`Triggered [HTTP ${status}]: "${errMsg}"`);
      logInspector(`f) Error Handling Simulation (${type})`, "/api/reservations", "POST/GET", { simulatedTest: type }, { status, error: errMsg }, status, "Expected Lab Error", duration);
      setCompletedSteps((prev) => ({ ...prev, f: true }));
      setSuccessMsg(`Part f) Error Handling Verified: Server returned HTTP ${status} and client handled it cleanly without crashing!`);
    } finally {
      setLoadingF(false);
    }
  };

  // -------------------------------------------------------------
  // Full Lifecycle Master Runner (Tests a -> f sequentially)
  // -------------------------------------------------------------
  const handleRunFullLifecycle = async () => {
    setSuccessMsg("Executing complete CRUD lifecycle: GET -> POST -> PUT -> PATCH -> DELETE -> GET...");
    try {
      await reservationService.runCrudLifecycleDemo({ useFetch });
      setCompletedSteps({ a: true, b: true, c: true, d: true, e: true, f: true });
      await handleFetchHotels();
      await handleFetchReservations();
      setSuccessMsg("🎉 ALL EXPERIMENT 3 OPERATIONS (a to f) COMPLETED SUCCESSFULLY! Check DevTools console (F12) for color-coded request logs.");
    } catch (err) {
      setSuccessMsg("Lifecycle error: " + err.message);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FBFF] px-4 py-8 text-[#0F2942] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Lab Header */}
        <div className="border-b border-[#D7E2EA] pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#B7E3FF] text-[#0F2942] text-[9px] font-bold tracking-[2px] uppercase px-2.5 py-0.5 rounded-xs border border-[#7CC8FF]">
                Laboratory Experiment 3
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold tracking-[1px] uppercase px-2 py-0.5 rounded-xs border border-emerald-300">
                REST API & CRUD Architecture
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-[#0F2942]">
              Hotel Reservation CRUD Operations
            </h1>
            <p className="mt-1.5 text-xs text-[#5A738E] max-w-2xl leading-5">
              Comprehensive practical evaluation of <strong>RESTful CRUD operations</strong> using both <strong>Axios</strong> and <strong>Native Fetch API</strong>.
              Demonstrates asynchronous data fetching, reservation booking, update (PUT/PATCH), cancellation (DELETE), history retrieval (GET), and robust loading and error resilience.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Client Toggle */}
            <div className="flex items-center border border-[#2F7FC1]/40 bg-white p-1 rounded-xs shadow-2xs">
              <button
                type="button"
                onClick={() => setHttpClient("axios")}
                className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-2xs transition-colors ${
                  httpClient === "axios"
                    ? "bg-[#2F7FC1] text-white"
                    : "text-[#5A738E] hover:text-[#0F2942]"
                }`}
              >
                Axios Client
              </button>
              <button
                type="button"
                onClick={() => setHttpClient("fetch")}
                className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-2xs transition-colors ${
                  httpClient === "fetch"
                    ? "bg-[#2F7FC1] text-white"
                    : "text-[#5A738E] hover:text-[#0F2942]"
                }`}
              >
                Fetch API
              </button>
            </div>

            <button
              type="button"
              onClick={handleRunFullLifecycle}
              className="inline-flex items-center justify-center gap-1.5 border border-emerald-500 bg-emerald-600 px-4 py-2 text-[10px] font-bold tracking-[1.5px] uppercase text-white hover:bg-emerald-700 transition-colors rounded-xs shadow-xs"
            >
              🚀 Run Full CRUD Demo (a to f)
            </button>
          </div>
        </div>

        {/* Syllabus Subtasks Checklist Card */}
        <div className="mt-6 border border-[#2F7FC1]/30 bg-white p-4 rounded-sm shadow-xs">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#D7E2EA]/60">
            <span className="text-[9px] font-bold tracking-[2px] uppercase text-[#2F7FC1] flex items-center gap-1.5">
              <span>📋</span> Lab Syllabus Subtasks Verification Matrix
            </span>
            <span className="text-[10px] font-semibold text-[#5A738E]">
              {Object.values(completedSteps).filter(Boolean).length} / 6 Verified
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[10px]">
            <div className={`p-2 rounded-xs border transition-colors flex items-center gap-1.5 ${completedSteps.a ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-[#F8FBFF] border-[#D7E2EA] text-[#5A738E]"}`}>
              <span>{completedSteps.a ? "✓" : "○"}</span>
              <span className="font-semibold">a) GET Hotels/Rooms</span>
            </div>
            <div className={`p-2 rounded-xs border transition-colors flex items-center gap-1.5 ${completedSteps.b ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-[#F8FBFF] border-[#D7E2EA] text-[#5A738E]"}`}>
              <span>{completedSteps.b ? "✓" : "○"}</span>
              <span className="font-semibold">b) POST Reservation</span>
            </div>
            <div className={`p-2 rounded-xs border transition-colors flex items-center gap-1.5 ${completedSteps.c ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-[#F8FBFF] border-[#D7E2EA] text-[#5A738E]"}`}>
              <span>{completedSteps.c ? "✓" : "○"}</span>
              <span className="font-semibold">c) PUT/PATCH Update</span>
            </div>
            <div className={`p-2 rounded-xs border transition-colors flex items-center gap-1.5 ${completedSteps.d ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-[#F8FBFF] border-[#D7E2EA] text-[#5A738E]"}`}>
              <span>{completedSteps.d ? "✓" : "○"}</span>
              <span className="font-semibold">d) DELETE Cancel</span>
            </div>
            <div className={`p-2 rounded-xs border transition-colors flex items-center gap-1.5 ${completedSteps.e ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-[#F8FBFF] border-[#D7E2EA] text-[#5A738E]"}`}>
              <span>{completedSteps.e ? "✓" : "○"}</span>
              <span className="font-semibold">e) GET History</span>
            </div>
            <div className={`p-2 rounded-xs border transition-colors flex items-center gap-1.5 ${completedSteps.f ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-[#F8FBFF] border-[#D7E2EA] text-[#5A738E]"}`}>
              <span>{completedSteps.f ? "✓" : "○"}</span>
              <span className="font-semibold">f) Loading & Error</span>
            </div>
          </div>
        </div>

        {/* Global Success Banner */}
        {successMsg && (
          <div className="mt-4 border border-emerald-300 bg-emerald-50 p-3.5 rounded-xs text-xs text-emerald-800 flex items-center justify-between shadow-2xs">
            <span className="flex items-center gap-2">
              <span className="font-bold">✓</span> {successMsg}
            </span>
            <button
              type="button"
              onClick={() => setSuccessMsg("")}
              className="text-emerald-900 font-bold hover:text-emerald-700 ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mt-6 flex border-b border-[#D7E2EA] overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 text-[10px] font-bold tracking-[1.5px] uppercase whitespace-nowrap transition-colors border-b-2 ${
              activeTab === "overview"
                ? "border-[#2F7FC1] text-[#2F7FC1] bg-white"
                : "border-transparent text-[#5A738E] hover:text-[#0F2942]"
            }`}
          >
            Overview & Quick Test
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("part-a")}
            className={`px-4 py-2.5 text-[10px] font-bold tracking-[1.5px] uppercase whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "part-a"
                ? "border-[#2F7FC1] text-[#2F7FC1] bg-white"
                : "border-transparent text-[#5A738E] hover:text-[#0F2942]"
            }`}
          >
            <span>a) GET Hotels & Rooms</span>
            <span className="bg-blue-100 text-blue-800 px-1 py-0.2 rounded-xs text-[8px]">GET</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("part-b")}
            className={`px-4 py-2.5 text-[10px] font-bold tracking-[1.5px] uppercase whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "part-b"
                ? "border-[#2F7FC1] text-[#2F7FC1] bg-white"
                : "border-transparent text-[#5A738E] hover:text-[#0F2942]"
            }`}
          >
            <span>b) POST Create</span>
            <span className="bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded-xs text-[8px]">POST</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("part-c")}
            className={`px-4 py-2.5 text-[10px] font-bold tracking-[1.5px] uppercase whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "part-c"
                ? "border-[#2F7FC1] text-[#2F7FC1] bg-white"
                : "border-transparent text-[#5A738E] hover:text-[#0F2942]"
            }`}
          >
            <span>c) PUT / PATCH Update</span>
            <span className="bg-amber-100 text-amber-800 px-1 py-0.2 rounded-xs text-[8px]">PUT/PATCH</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("part-d")}
            className={`px-4 py-2.5 text-[10px] font-bold tracking-[1.5px] uppercase whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "part-d"
                ? "border-[#2F7FC1] text-[#2F7FC1] bg-white"
                : "border-transparent text-[#5A738E] hover:text-[#0F2942]"
            }`}
          >
            <span>d) DELETE Cancel</span>
            <span className="bg-red-100 text-red-800 px-1 py-0.2 rounded-xs text-[8px]">DELETE</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("part-e")}
            className={`px-4 py-2.5 text-[10px] font-bold tracking-[1.5px] uppercase whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "part-e"
                ? "border-[#2F7FC1] text-[#2F7FC1] bg-white"
                : "border-transparent text-[#5A738E] hover:text-[#0F2942]"
            }`}
          >
            <span>e) GET History</span>
            <span className="bg-blue-100 text-blue-800 px-1 py-0.2 rounded-xs text-[8px]">GET</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("part-f")}
            className={`px-4 py-2.5 text-[10px] font-bold tracking-[1.5px] uppercase whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "part-f"
                ? "border-[#2F7FC1] text-[#2F7FC1] bg-white"
                : "border-transparent text-[#5A738E] hover:text-[#0F2942]"
            }`}
          >
            <span>f) Loading & Error Matrix</span>
            <span className="bg-rose-100 text-rose-800 px-1 py-0.2 rounded-xs text-[8px]">ERRORS</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-6">
          {/* TAB 0: OVERVIEW & QUICK ACTIONS */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-[#D7E2EA] bg-white p-5 rounded-sm shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#2F7FC1]">Endpoint a</span>
                    <span className="bg-blue-100 text-blue-800 text-[8px] font-bold px-1.5 py-0.5 rounded-xs">GET</span>
                  </div>
                  <h3 className="mt-2 font-serif text-lg text-[#0F2942]">Hotel & Room Catalog</h3>
                  <p className="mt-1 text-xs text-[#5A738E]">
                    Fetches 8 luxury hotels and dynamic room categories with tariffs.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setActiveTab("part-a"); handleFetchHotels(); }}
                    className="mt-4 text-[9px] font-bold tracking-[1px] uppercase text-[#2F7FC1] hover:underline flex items-center gap-1"
                  >
                    Test GET /hotels →
                  </button>
                </div>

                <div className="border border-[#D7E2EA] bg-white p-5 rounded-sm shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold tracking-[1.5px] uppercase text-emerald-700">Endpoint b</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold px-1.5 py-0.5 rounded-xs">POST</span>
                  </div>
                  <h3 className="mt-2 font-serif text-lg text-[#0F2942]">Create Reservation</h3>
                  <p className="mt-1 text-xs text-[#5A738E]">
                    Creates reservation with conflict prevention and 12% GST calculation.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("part-b")}
                    className="mt-4 text-[9px] font-bold tracking-[1px] uppercase text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    Test POST /reservations →
                  </button>
                </div>

                <div className="border border-[#D7E2EA] bg-white p-5 rounded-sm shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold tracking-[1.5px] uppercase text-amber-700">Endpoint c</span>
                    <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded-xs">PUT / PATCH</span>
                  </div>
                  <h3 className="mt-2 font-serif text-lg text-[#0F2942]">Update Reservation</h3>
                  <p className="mt-1 text-xs text-[#5A738E]">
                    Supports full replacement (PUT) and partial field updates (PATCH).
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("part-c")}
                    className="mt-4 text-[9px] font-bold tracking-[1px] uppercase text-amber-700 hover:underline flex items-center gap-1"
                  >
                    Test PUT / PATCH →
                  </button>
                </div>

                <div className="border border-[#D7E2EA] bg-white p-5 rounded-sm shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold tracking-[1.5px] uppercase text-red-700">Endpoint d</span>
                    <span className="bg-red-100 text-red-800 text-[8px] font-bold px-1.5 py-0.5 rounded-xs">DELETE</span>
                  </div>
                  <h3 className="mt-2 font-serif text-lg text-[#0F2942]">Cancel Reservation</h3>
                  <p className="mt-1 text-xs text-[#5A738E]">
                    Removes reservation and releases room inventory for future bookings.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("part-d")}
                    className="mt-4 text-[9px] font-bold tracking-[1px] uppercase text-red-700 hover:underline flex items-center gap-1"
                  >
                    Test DELETE →
                  </button>
                </div>
              </div>

              {/* Architecture Explanation Card */}
              <div className="border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-xs">
                <h3 className="font-serif text-xl text-[#0F2942]">
                  RESTful Architecture & Design Specification
                </h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#5A738E] leading-5">
                  <div className="border-l-2 border-[#2F7FC1] pl-3">
                    <strong className="text-[#0F2942] block">Client Choice: Axios vs. Fetch</strong>
                    Axios automatically transforms JSON, handles status codes, and intercepts authorization tokens. Native Fetch offers standard browser zero-dependency API execution. Both are toggleable here.
                  </div>
                  <div className="border-l-2 border-emerald-600 pl-3">
                    <strong className="text-[#0F2942] block">Conflict Prevention (Double Booking)</strong>
                    POST /reservations detects date interval collision via mathematical overlap logic: <code>(startA &lt; endB) &amp;&amp; (endA &gt; startB)</code>. Returns HTTP 409 Conflict.
                  </div>
                  <div className="border-l-2 border-amber-600 pl-3">
                    <strong className="text-[#0F2942] block">Server-Side Calculations</strong>
                    Tariffs, 12% GST hospitality tax, and flat ₹500 resort fee are computed server-side to prevent client pricing tampering.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: PART A (GET HOTELS & ROOMS) */}
          {activeTab === "part-a" && (
            <div className="space-y-6">
              <div className="border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D7E2EA]/60 pb-4">
                  <div>
                    <span className="bg-blue-100 text-blue-800 text-[9px] font-bold tracking-[1.5px] uppercase px-2 py-0.5 rounded-xs">
                      HTTP Method: GET
                    </span>
                    <h2 className="mt-1 font-serif text-2xl text-[#0F2942]">
                      Part a) Retrieve Hotel and Room Information
                    </h2>
                    <p className="text-xs text-[#5A738E]">
                      Endpoints: <code>GET /api/hotels</code> and <code>GET /api/hotels/:id/rooms</code>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      className="border border-[#D7E2EA] bg-[#F8FBFF] px-3 py-1.5 text-xs text-[#0F2942] rounded-xs"
                    >
                      <option value="">All Locations</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Goa">Goa</option>
                      <option value="Kochi">Kochi</option>
                    </select>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleFetchHotels}
                      loading={loadingA}
                    >
                      Fetch Hotels (GET)
                    </Button>
                  </div>
                </div>

                {errorA && (
                  <div className="mt-4 border border-red-300 bg-red-50 p-3 rounded-xs text-xs text-red-700">
                    ⚠ {errorA}
                  </div>
                )}

                {loadingA ? (
                  <div className="py-12 text-center">
                    <Loading message="Fetching hotels and room catalog from REST API..." />
                  </div>
                ) : (
                  <div className="mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {hotels.map((h) => (
                        <div
                          key={h.id}
                          className={`border p-4 rounded-xs transition-all ${
                            selectedHotelForRooms?.id === h.id
                              ? "border-[#2F7FC1] bg-[#B7E3FF]/15 ring-2 ring-[#7CC8FF]"
                              : "border-[#D7E2EA] bg-white hover:border-[#2F7FC1]"
                          }`}
                        >
                          <div className="h-28 overflow-hidden rounded-xs bg-[#B7E3FF]/20 relative">
                            <img src={h.image} alt={h.name} className="h-full w-full object-cover" />
                            <span className="absolute top-2 left-2 bg-[#0F2942]/85 text-amber-300 text-[9px] px-1.5 py-0.5 rounded-xs">
                              {"★".repeat(h.stars || 5)}
                            </span>
                          </div>
                          <h4 className="mt-2.5 font-serif text-base text-[#0F2942]">{h.name}</h4>
                          <p className="text-[11px] text-[#5A738E]">{h.location}</p>
                          <p className="mt-1 font-serif font-bold text-sm text-[#2F7FC1]">
                            ₹{h.price?.toLocaleString("en-IN")} <span className="text-[10px] text-[#5A738E] font-normal">/ night</span>
                          </p>

                          <button
                            type="button"
                            onClick={() => handleFetchRooms(h)}
                            className="mt-3 w-full border border-[#2F7FC1] bg-[#2F7FC1]/10 hover:bg-[#2F7FC1] hover:text-white px-2 py-1.5 text-[9px] font-bold tracking-[1px] uppercase text-[#2F7FC1] transition-colors rounded-xs"
                          >
                            View Rooms (GET)
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Rooms Display for Selected Hotel */}
                    {selectedHotelForRooms && (
                      <div className="mt-8 border-t border-[#D7E2EA] pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#2F7FC1]">
                              HTTP GET /api/hotels/{selectedHotelForRooms.id}/rooms
                            </span>
                            <h3 className="font-serif text-xl text-[#0F2942]">
                              Rooms Available at {selectedHotelForRooms.name}
                            </h3>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedHotelRooms.map((room) => (
                            <div key={room.id} className="border border-[#D7E2EA] bg-white p-4 rounded-xs shadow-2xs">
                              <span className="text-[8px] font-bold tracking-[1px] uppercase text-[#2F7FC1]">Room #{room.id}</span>
                              <h4 className="font-serif text-base text-[#0F2942]">{room.name}</h4>
                              <p className="mt-1 font-serif text-sm font-bold text-[#0F2942]">
                                ₹{room.price?.toLocaleString("en-IN")} <span className="text-[10px] text-[#5A738E] font-normal">/ night</span>
                              </p>
                              <p className="text-[10px] text-[#5A738E] mt-1">Capacity: Up to {room.capacity} Guests</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setCreateForm((prev) => ({
                                    ...prev,
                                    hotelId: selectedHotelForRooms.id,
                                    hotelName: selectedHotelForRooms.name,
                                    roomId: room.id,
                                    roomName: room.name,
                                    roomPrice: room.price
                                  }));
                                  setActiveTab("part-b");
                                }}
                                className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold tracking-[1px] uppercase py-1.5 rounded-xs transition-colors"
                              >
                                Select For Booking (POST) →
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PART B (POST CREATE RESERVATION) */}
          {activeTab === "part-b" && (
            <div className="space-y-6">
              <div className="border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-xs">
                <div className="border-b border-[#D7E2EA]/60 pb-4">
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold tracking-[1.5px] uppercase px-2 py-0.5 rounded-xs">
                    HTTP Method: POST
                  </span>
                  <h2 className="mt-1 font-serif text-2xl text-[#0F2942]">
                    Part b) Create a Hotel Reservation using POST
                  </h2>
                  <p className="text-xs text-[#5A738E]">
                    Endpoint: <code>POST /api/reservations</code> • Server recalculates duration, 12% GST, and prevents double-booking collisions.
                  </p>
                </div>

                {errorB && (
                  <div className="mt-4 border border-red-300 bg-red-50 p-3 rounded-xs text-xs text-red-700">
                    ⚠ {errorB}
                  </div>
                )}

                <form onSubmit={handleCreateReservation} className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Booking Form */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E] block mb-1">
                          Select Hotel
                        </label>
                        <select
                          value={createForm.hotelId}
                          onChange={(e) => {
                            const hid = Number(e.target.value);
                            const h = hotels.find((item) => item.id === hid) || hotels[0];
                            setCreateForm((prev) => ({
                              ...prev,
                              hotelId: hid,
                              hotelName: h?.name || "The Grand Stay"
                            }));
                          }}
                          className="w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3 py-2 text-xs text-[#0F2942] rounded-xs"
                        >
                          {hotels.map((h) => (
                            <option key={h.id} value={h.id}>{h.name} ({h.location})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E] block mb-1">
                          Room Category
                        </label>
                        <select
                          value={createForm.roomId}
                          onChange={(e) => {
                            const rid = Number(e.target.value);
                            setCreateForm((prev) => ({
                              ...prev,
                              roomId: rid,
                              roomName: rid === 1 ? "Deluxe Room" : "Executive Suite",
                              roomPrice: rid === 1 ? 8500 : 12000
                            }));
                          }}
                          className="w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3 py-2 text-xs text-[#0F2942] rounded-xs"
                        >
                          <option value={1}>Deluxe Room (₹8,500/night)</option>
                          <option value={2}>Executive Suite (₹12,000/night)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <DatePicker
                        label="Check-In Date"
                        name="checkIn"
                        required
                        value={createForm.checkIn}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, checkIn: e.target.value }))}
                      />

                      <DatePicker
                        label="Check-Out Date"
                        name="checkOut"
                        required
                        min={createForm.checkIn}
                        value={createForm.checkOut}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, checkOut: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Guests"
                        name="guests"
                        type="number"
                        min="1"
                        max="6"
                        required
                        value={createForm.guests}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, guests: e.target.value }))}
                      />

                      <Input
                        label="Guest Full Name"
                        name="customerName"
                        required
                        value={createForm.customerName}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, customerName: e.target.value }))}
                      />

                      <Input
                        label="Phone Number"
                        name="phone"
                        required
                        value={createForm.phone}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E] block mb-1">
                        Special Requests
                      </label>
                      <textarea
                        rows={2}
                        value={createForm.specialRequests}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, specialRequests: e.target.value }))}
                        className="w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3.5 py-2 text-xs text-[#0F2942] rounded-xs"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      loading={loadingB}
                      className="w-full sm:w-auto"
                    >
                      Execute POST /api/reservations
                    </Button>
                  </div>

                  {/* Right Column: Live Calculation Breakdown */}
                  <div className="border border-[#D7E2EA] bg-[#F8FBFF] p-5 rounded-xs h-fit space-y-3">
                    <span className="text-[9px] font-bold tracking-[2px] uppercase text-[#2F7FC1] block">
                      Live Financial Calculation
                    </span>
                    <div className="space-y-2 text-xs border-y border-[#D7E2EA]/60 py-3">
                      <div className="flex justify-between">
                        <span className="text-[#5A738E]">Stay Duration</span>
                        <span className="font-semibold text-[#0F2942]">{validNights} Nights</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5A738E]">Room Price</span>
                        <span className="font-semibold text-[#0F2942]">₹{createForm.roomPrice?.toLocaleString("en-IN")}/night</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5A738E]">Room Subtotal</span>
                        <span className="font-semibold text-[#0F2942]">₹{roomCost.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5A738E]">12% Hospitality GST</span>
                        <span className="font-semibold text-[#0F2942]">₹{gstTax.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5A738E]">Resort Concierge Fee</span>
                        <span className="font-semibold text-[#0F2942]">₹{resortFee.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-xs font-bold uppercase text-[#0F2942]">Grand Total</span>
                      <span className="font-serif text-2xl font-bold text-[#2F7FC1]">
                        ₹{grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#5A738E] italic pt-1">
                      * Values are verified and recalculated server-side upon POST submission.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: PART C (PUT & PATCH UPDATE) */}
          {activeTab === "part-c" && (
            <div className="space-y-6">
              <div className="border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-xs">
                <div className="border-b border-[#D7E2EA]/60 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold tracking-[1.5px] uppercase px-2 py-0.5 rounded-xs">
                      HTTP Method: PUT
                    </span>
                    <span className="bg-purple-100 text-purple-800 text-[9px] font-bold tracking-[1.5px] uppercase px-2 py-0.5 rounded-xs">
                      HTTP Method: PATCH
                    </span>
                  </div>
                  <h2 className="mt-1 font-serif text-2xl text-[#0F2942]">
                    Part c) Update Reservation Details using PUT / PATCH
                  </h2>
                  <p className="text-xs text-[#5A738E]">
                    Endpoints: <code>PUT /api/reservations/:id</code> (Full Update / Re-schedule) and <code>PATCH /api/reservations/:id</code> (Partial Field Modification).
                  </p>
                </div>

                {errorC && (
                  <div className="mt-4 border border-red-300 bg-red-50 p-3 rounded-xs text-xs text-red-700">
                    ⚠ {errorC}
                  </div>
                )}

                <div className="mt-6 space-y-4 max-w-xl">
                  <div>
                    <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E] block mb-1">
                      Target Reservation to Modify
                    </label>
                    <select
                      value={updateTargetId}
                      onChange={(e) => setUpdateTargetId(e.target.value)}
                      className="w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3 py-2 text-xs text-[#0F2942] rounded-xs"
                    >
                      <option value="">-- Choose Existing Reservation --</option>
                      {reservations.map((r) => (
                        <option key={r.id} value={r.id}>
                          #{r.id} — {r.hotelName} ({r.checkIn} to {r.checkOut}) [₹{r.totalAmount}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <DatePicker
                      label="New Check-In Date"
                      name="checkIn"
                      value={updateForm.checkIn}
                      onChange={(e) => setUpdateForm((prev) => ({ ...prev, checkIn: e.target.value }))}
                    />

                    <DatePicker
                      label="New Check-Out Date"
                      name="checkOut"
                      min={updateForm.checkIn}
                      value={updateForm.checkOut}
                      onChange={(e) => setUpdateForm((prev) => ({ ...prev, checkOut: e.target.value }))}
                    />
                  </div>

                  <Input
                    label="Guest Count"
                    name="guests"
                    type="number"
                    min="1"
                    max="6"
                    value={updateForm.guests}
                    onChange={(e) => setUpdateForm((prev) => ({ ...prev, guests: e.target.value }))}
                  />

                  <div>
                    <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E] block mb-1">
                      Special Requests / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={updateForm.specialRequests}
                      onChange={(e) => setUpdateForm((prev) => ({ ...prev, specialRequests: e.target.value }))}
                      className="w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3.5 py-2 text-xs text-[#0F2942] rounded-xs"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleUpdateReservationPut}
                      loading={loadingC}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      🔄 Execute PUT /api/reservations/{updateTargetId || ":id"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUpdateReservationPatch}
                      loading={loadingC}
                      className="border-purple-400 text-purple-800 hover:bg-purple-50"
                    >
                      ⚡ Execute PATCH /api/reservations/{updateTargetId || ":id"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PART D (DELETE CANCEL RESERVATION) */}
          {activeTab === "part-d" && (
            <div className="space-y-6">
              <div className="border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-xs">
                <div className="border-b border-[#D7E2EA]/60 pb-4">
                  <span className="bg-red-100 text-red-800 text-[9px] font-bold tracking-[1.5px] uppercase px-2 py-0.5 rounded-xs">
                    HTTP Method: DELETE
                  </span>
                  <h2 className="mt-1 font-serif text-2xl text-[#0F2942]">
                    Part d) Cancel a Reservation using DELETE
                  </h2>
                  <p className="text-xs text-[#5A738E]">
                    Endpoint: <code>DELETE /api/reservations/:id</code> • Releases room inventory immediately and confirms cancellation with HTTP 200 OK.
                  </p>
                </div>

                {errorD && (
                  <div className="mt-4 border border-red-300 bg-red-50 p-3 rounded-xs text-xs text-red-700">
                    ⚠ {errorD}
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  {reservations.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-[#D7E2EA] rounded-xs text-xs text-[#5A738E]">
                      No active reservations found to cancel. Create one under Tab (b) first!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reservations.map((res) => (
                        <div
                          key={res.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[#D7E2EA] bg-[#F8FBFF] rounded-xs gap-3"
                        >
                          <div>
                            <span className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#2F7FC1]">
                              Reservation #{res.id}
                            </span>
                            <h4 className="font-serif text-lg text-[#0F2942]">{res.hotelName} — {res.roomName}</h4>
                            <p className="text-xs text-[#5A738E]">
                              Dates: {res.checkIn} to {res.checkOut} ({res.totalStayDuration} Nights) • Paid: ₹{Number(res.totalAmount).toLocaleString("en-IN")}
                            </p>
                          </div>

                          <Button
                            variant="danger"
                            size="sm"
                            loading={loadingD}
                            onClick={() => handleCancelReservation(res.id)}
                          >
                            🗑 Cancel (DELETE)
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PART E (GET RESERVATION HISTORY) */}
          {activeTab === "part-e" && (
            <div className="space-y-6">
              <div className="border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D7E2EA]/60 pb-4">
                  <div>
                    <span className="bg-blue-100 text-blue-800 text-[9px] font-bold tracking-[1.5px] uppercase px-2 py-0.5 rounded-xs">
                      HTTP Method: GET
                    </span>
                    <h2 className="mt-1 font-serif text-2xl text-[#0F2942]">
                      Part e) Retrieve Reservation History using GET
                    </h2>
                    <p className="text-xs text-[#5A738E]">
                      Endpoint: <code>GET /api/reservations</code> • Returns user-scoped authenticated reservation records.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFetchReservations}
                    loading={loadingE}
                  >
                    ↻ Refresh History (GET)
                  </Button>
                </div>

                {errorE && (
                  <div className="mt-4 border border-red-300 bg-red-50 p-3 rounded-xs text-xs text-red-700">
                    ⚠ {errorE}
                  </div>
                )}

                {loadingE ? (
                  <div className="py-12 text-center">
                    <Loading message="Retrieving reservation history via GET /api/reservations..." />
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {reservations.length === 0 ? (
                      <div className="p-8 text-center border border-[#D7E2EA] rounded-xs text-xs text-[#5A738E]">
                        No reservation history found. Create your first booking under Tab (b)!
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-[#D7E2EA]">
                          <thead className="bg-[#B7E3FF]/30 text-[#0F2942] uppercase text-[9px] tracking-[1px]">
                            <tr>
                              <th className="p-3 border-b border-[#D7E2EA]">ID</th>
                              <th className="p-3 border-b border-[#D7E2EA]">Hotel & Room</th>
                              <th className="p-3 border-b border-[#D7E2EA]">Dates</th>
                              <th className="p-3 border-b border-[#D7E2EA]">Guests</th>
                              <th className="p-3 border-b border-[#D7E2EA]">Total Amount</th>
                              <th className="p-3 border-b border-[#D7E2EA]">Status</th>
                              <th className="p-3 border-b border-[#D7E2EA] text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#D7E2EA]/60">
                            {reservations.map((res) => (
                              <tr key={res.id} className="hover:bg-[#F8FBFF] transition-colors">
                                <td className="p-3 font-semibold text-[#2F7FC1]">#{res.id}</td>
                                <td className="p-3">
                                  <div className="font-semibold text-[#0F2942]">{res.hotelName}</div>
                                  <div className="text-[10px] text-[#5A738E]">{res.roomName}</div>
                                </td>
                                <td className="p-3">{res.checkIn} to {res.checkOut}</td>
                                <td className="p-3">{res.guests}</td>
                                <td className="p-3 font-bold text-[#2F7FC1]">₹{Number(res.totalAmount).toLocaleString("en-IN")}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-xs ${
                                    res.status === "Cancelled"
                                      ? "bg-red-100 text-red-700"
                                      : res.status === "Modified"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-emerald-100 text-emerald-800"
                                  }`}>
                                    {res.status || "Confirmed"}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleCancelReservation(res.id)}
                                    className="text-red-600 hover:text-red-800 text-[10px] font-bold uppercase hover:underline"
                                  >
                                    Cancel
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: PART F (LOADING & ERROR HANDLING SHOWCASE) */}
          {activeTab === "part-f" && (
            <div className="space-y-6">
              <div className="border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-xs">
                <div className="border-b border-[#D7E2EA]/60 pb-4">
                  <span className="bg-rose-100 text-rose-800 text-[9px] font-bold tracking-[1.5px] uppercase px-2 py-0.5 rounded-xs">
                    Lab Requirement f)
                  </span>
                  <h2 className="mt-1 font-serif text-2xl text-[#0F2942]">
                    Part f) Loading and Error Handling Stress Tests
                  </h2>
                  <p className="text-xs text-[#5A738E]">
                    Verify that your application gracefully handles HTTP 400 Bad Request, HTTP 409 Conflict (double booking), HTTP 404 Not Found, and asynchronous loading states without uncaught exceptions.
                  </p>
                </div>

                {errorF && (
                  <div className="mt-4 border border-rose-300 bg-rose-50 p-3 rounded-xs text-xs text-rose-800">
                    {errorF}
                  </div>
                )}

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-[#D7E2EA] p-4 rounded-xs bg-[#F8FBFF]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold tracking-[1px] uppercase text-rose-700">Error Simulation 1</span>
                      <span className="bg-rose-100 text-rose-800 text-[8px] font-bold px-1.5 py-0.5 rounded-xs">400 Bad Request</span>
                    </div>
                    <h4 className="mt-2 font-serif text-base text-[#0F2942]">Invalid Chronological Date Order</h4>
                    <p className="mt-1 text-xs text-[#5A738E]">
                      Submits a check-out date (Nov 20) earlier than check-in date (Nov 25).
                    </p>
                    <button
                      type="button"
                      disabled={loadingF}
                      onClick={() => handleSimulateError("400_dates")}
                      className="mt-3 border border-rose-300 bg-rose-100 hover:bg-rose-200 text-rose-900 text-[9px] font-bold tracking-[1px] uppercase px-3 py-1.5 rounded-xs transition-colors"
                    >
                      Trigger 400 Bad Dates Error
                    </button>
                  </div>

                  <div className="border border-[#D7E2EA] p-4 rounded-xs bg-[#F8FBFF]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold tracking-[1px] uppercase text-rose-700">Error Simulation 2</span>
                      <span className="bg-rose-100 text-rose-800 text-[8px] font-bold px-1.5 py-0.5 rounded-xs">409 Conflict</span>
                    </div>
                    <h4 className="mt-2 font-serif text-base text-[#0F2942]">Double-Booking Collision Detection</h4>
                    <p className="mt-1 text-xs text-[#5A738E]">
                      Attempts to reserve room #1 for date intervals that are already booked.
                    </p>
                    <button
                      type="button"
                      disabled={loadingF}
                      onClick={() => handleSimulateError("409_conflict")}
                      className="mt-3 border border-rose-300 bg-rose-100 hover:bg-rose-200 text-rose-900 text-[9px] font-bold tracking-[1px] uppercase px-3 py-1.5 rounded-xs transition-colors"
                    >
                      Trigger 409 Double Booking Error
                    </button>
                  </div>

                  <div className="border border-[#D7E2EA] p-4 rounded-xs bg-[#F8FBFF]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold tracking-[1px] uppercase text-rose-700">Error Simulation 3</span>
                      <span className="bg-rose-100 text-rose-800 text-[8px] font-bold px-1.5 py-0.5 rounded-xs">404 Not Found</span>
                    </div>
                    <h4 className="mt-2 font-serif text-base text-[#0F2942]">Non-Existent Reservation Lookup</h4>
                    <p className="mt-1 text-xs text-[#5A738E]">
                      Sends GET /api/reservations/RES-INVALID-999999 to test missing resource handling.
                    </p>
                    <button
                      type="button"
                      disabled={loadingF}
                      onClick={() => handleSimulateError("404_not_found")}
                      className="mt-3 border border-rose-300 bg-rose-100 hover:bg-rose-200 text-rose-900 text-[9px] font-bold tracking-[1px] uppercase px-3 py-1.5 rounded-xs transition-colors"
                    >
                      Trigger 404 Not Found
                    </button>
                  </div>

                  <div className="border border-[#D7E2EA] p-4 rounded-xs bg-[#F8FBFF]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold tracking-[1px] uppercase text-amber-700">Loading State Simulation</span>
                      <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 py-0.5 rounded-xs">Latency 1.6s</span>
                    </div>
                    <h4 className="mt-2 font-serif text-base text-[#0F2942]">Async Spinners &amp; Disabled Buttons</h4>
                    <p className="mt-1 text-xs text-[#5A738E]">
                      Injects 1.6 seconds artificial network latency to observe loading indicators and button freeze.
                    </p>
                    <button
                      type="button"
                      disabled={loadingF}
                      onClick={() => handleSimulateError("slow_loading")}
                      className="mt-3 border border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[9px] font-bold tracking-[1px] uppercase px-3 py-1.5 rounded-xs transition-colors"
                    >
                      {loadingF ? "Simulating Latency..." : "Test 1.6s Loading State"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================
            LIVE REST API INSPECTOR & PAYLOAD CONSOLE (CRITICAL FOR LAB EVALUATION)
           ======================================================== */}
        <section aria-label="REST API Inspector" className="mt-10 border border-[#2F7FC1]/40 bg-white rounded-sm shadow-md overflow-hidden">
          <div className="bg-[#0F2942] text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-mono">●</span>
              <h3 className="text-xs font-bold tracking-[2px] uppercase">
                Live REST API Inspector &amp; Network Payload Console
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-[#B7E3FF]">Client: <strong>{inspector.client}</strong></span>
              <span className="text-slate-400">|</span>
              <span className="text-[#B7E3FF]">Time: {inspector.timestamp}</span>
              <span className="text-slate-400">|</span>
              <span className="text-emerald-300 font-mono font-bold">{inspector.durationMs}ms</span>
            </div>
          </div>

          <div className="p-5 bg-slate-900 text-slate-100 font-mono text-xs">
            {/* Request Summary Bar */}
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-700">
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-xs ${
                  inspector.method === "GET"
                    ? "bg-blue-600 text-white"
                    : inspector.method === "POST"
                    ? "bg-emerald-600 text-white"
                    : inspector.method === "PUT"
                    ? "bg-amber-600 text-white"
                    : inspector.method === "PATCH"
                    ? "bg-purple-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {inspector.method}
              </span>
              <span className="text-sky-300 font-semibold">{inspector.endpoint}</span>
              <span className="text-slate-500">→</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-xs ${
                  inspector.status >= 200 && inspector.status < 300
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-600"
                    : inspector.status === 409
                    ? "bg-rose-950 text-rose-300 border border-rose-600"
                    : "bg-amber-950 text-amber-300 border border-amber-600"
                }`}
              >
                HTTP {inspector.status} {inspector.statusText}
              </span>
              <span className="text-slate-400 text-[10px] ml-auto">
                Operation: <strong className="text-slate-200">{inspector.title}</strong>
              </span>
            </div>

            {/* Split Payloads: Request vs Response */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pb-1 uppercase tracking-wider">
                  <span>Request Payload ({inspector.method})</span>
                  <span>Headers: application/json</span>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xs text-[11px] overflow-x-auto text-emerald-300 max-h-48">
                  {inspector.requestPayload
                    ? JSON.stringify(inspector.requestPayload, null, 2)
                    : "// No request body required for " + inspector.method}
                </pre>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pb-1 uppercase tracking-wider">
                  <span>Response Body ({inspector.status} {inspector.statusText})</span>
                  <span>Latency: {inspector.durationMs}ms</span>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xs text-[11px] overflow-x-auto text-sky-300 max-h-48">
                  {JSON.stringify(inspector.responsePayload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Experiment3Lab;
