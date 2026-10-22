import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import reservationService from "../services/reservationService";
import Button from "./common/Button";
import Loading from "./common/Loading";
import Input from "./common/Input";
import DatePicker from "./common/DatePicker";

export function BookingsList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");

  // Edit / Update Modal State (Experiment 3 c: PUT/PATCH)
  const [editingBooking, setEditingBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    specialRequests: ""
  });
  const [editError, setEditError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Cancel Confirmation Modal State (Experiment 3 d: DELETE)
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch reservation history via GET /reservations (Experiment 3 e)
  const loadReservations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reservationService.getReservations();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load reservations from server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    reservationService
      .getReservations()
      .then((data) => {
        if (!ignore) {
          setBookings(Array.isArray(data) ? data : []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.response?.data?.error || err.message || "Failed to load reservations from server.");
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Open Edit Modal
  const handleOpenEdit = (booking) => {
    setEditingBooking(booking);
    setEditFormData({
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests || 1,
      specialRequests: booking.specialRequests || ""
    });
    setEditError("");
    setActionSuccess("");
  };

  // Close Edit Modal
  const handleCloseEdit = () => {
    setEditingBooking(null);
    setEditError("");
  };

  // Submit Update (Supports both PUT and POST methods)
  const handleSaveUpdate = async (method = "put", e = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setEditError("");

    if (!editFormData.checkIn || !editFormData.checkOut) {
      setEditError("Check-in and check-out dates are required.");
      return;
    }

    if (editFormData.checkOut <= editFormData.checkIn) {
      setEditError("Check-out date must be strictly after check-in date.");
      return;
    }

    const numGuests = Number(editFormData.guests);
    if (!numGuests || numGuests < 1) {
      setEditError("At least 1 guest is required.");
      return;
    }

    setIsUpdating(true);
    try {
      const payload = {
        checkIn: editFormData.checkIn,
        checkOut: editFormData.checkOut,
        guests: numGuests,
        specialRequests: editFormData.specialRequests
      };

      let updated;
      if (method === "patch") {
        updated = await reservationService.patchReservation(editingBooking.id, {
          guests: numGuests,
          specialRequests: editFormData.specialRequests
        });
        setActionSuccess(`Reservation #${editingBooking.id} updated successfully via PATCH method (Partial update). Check console!`);
      } else if (method === "post") {
        updated = await reservationService.updateReservationWithPost(editingBooking.id, payload);
        setActionSuccess(`Reservation #${editingBooking.id} updated successfully via POST method. Check console!`);
      } else {
        updated = await reservationService.updateReservation(editingBooking.id, payload);
        setActionSuccess(`Reservation #${editingBooking.id} updated successfully via PUT method. Check console!`);
      }

      // Update state in-place
      setBookings((prev) =>
        prev.map((b) => (b.id === editingBooking.id ? updated : b))
      );
      handleCloseEdit();
    } catch (err) {
      setEditError(err.response?.data?.error || err.message || "Failed to update reservation.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick CRUD Testing triggers for instant console demonstration
  const handleTriggerQuickGet = async () => {
    console.clear();
    console.log("%c[EXPERIMENT 3] TRIGGERING GET METHOD...", "background: #0284C7; color: white; padding: 3px 6px; font-weight: bold;");
    await loadReservations();
    setActionSuccess("GET /api/reservations executed! Check DevTools console.");
  };

  const handleTriggerQuickPost = async () => {
    console.clear();
    console.log("%c[EXPERIMENT 3] TRIGGERING POST METHOD (CREATE)...", "background: #16A34A; color: white; padding: 3px 6px; font-weight: bold;");
    try {
      const res = await reservationService.createReservation({
        hotelId: 101,
        hotelName: "The Grand Stay Chennai",
        roomId: 1,
        roomName: "Deluxe Ocean Room",
        checkIn: "2026-11-20",
        checkOut: "2026-11-23",
        guests: 2,
        specialRequests: "Instant Booking via CRUD Console Bar",
        customerName: "Eleanor Vance",
        email: "eleanor.vance@example.com",
        phone: "9876543210"
      });
      await loadReservations();
      setActionSuccess(`New reservation #${res.id} created via POST method! Check DevTools console.`);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleTriggerQuickUpdatePost = async () => {
    if (bookings.length === 0) {
      alert("Please create or have at least one booking to test update.");
      return;
    }
    const target = bookings[0];
    console.clear();
    console.log("%c[EXPERIMENT 3] TRIGGERING UPDATE VIA POST METHOD...", "background: #D97706; color: white; padding: 3px 6px; font-weight: bold;");
    try {
      await reservationService.updateReservationWithPost(target.id, {
        specialRequests: "Updated via POST Method at " + new Date().toLocaleTimeString(),
        guests: Math.min(4, (target.guests || 1) + 1)
      });
      await loadReservations();
      setActionSuccess(`Reservation #${target.id} updated via POST method! Check DevTools console.`);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleTriggerQuickDelete = async () => {
    if (bookings.length === 0) {
      alert("No bookings available to cancel.");
      return;
    }
    const target = bookings[0];
    console.clear();
    console.log("%c[EXPERIMENT 3] TRIGGERING DELETE METHOD...", "background: #DC2626; color: white; padding: 3px 6px; font-weight: bold;");
    try {
      await reservationService.cancelReservation(target.id);
      await loadReservations();
      setActionSuccess(`Reservation #${target.id} cancelled via DELETE method! Check DevTools console.`);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleTriggerFullLifecycle = async () => {
    try {
      await reservationService.runCrudLifecycleDemo();
      await loadReservations();
      setActionSuccess("Complete CRUD Lifecycle (GET -> POST -> UPDATE-POST -> UPDATE-PUT -> DELETE -> GET) executed! Check DevTools console.");
    } catch (e) {
      setError(e.message);
    }
  };

  // Confirm and Execute Cancellation (Experiment 3 d: DELETE /reservations/:id)
  const handleConfirmCancel = async () => {
    if (!cancellingBookingId) return;

    setIsCancelling(true);
    setActionSuccess("");
    setError(null);

    try {
      await reservationService.cancelReservation(cancellingBookingId);
      // Remove from list
      setBookings((prev) => prev.filter((b) => b.id !== cancellingBookingId));
      setActionSuccess(`Reservation #${cancellingBookingId} cancelled successfully via DELETE request.`);
      setCancellingBookingId(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to cancel reservation.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FBFF] px-5 py-14 text-[#0F2942] md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        {/* Header Title */}
        <div className="border-b border-[#D7E2EA] pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-[9px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
              Account Reservations • CRUD Operations
            </p>
            <h1 className="mt-1 font-serif text-3xl md:text-4xl text-[#0F2942]">
              My Bookings
            </h1>
            <p className="mt-1.5 text-xs text-[#5A738E]">
              Welcome back, <strong className="text-[#0F2942]">{user?.name || "Guest"}</strong>. View, modify, or cancel your active hotel reservations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to="/crud-lab">
              <Button variant="outline" size="sm" className="border-emerald-500 text-emerald-800 bg-emerald-50 hover:bg-emerald-100">
                ⚡ Exp. 3 Lab Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={loadReservations} loading={isLoading}>
              ↻ Refresh
            </Button>
            <Link to="/hotels">
              <Button variant="primary" size="sm">
                Book New Stay +
              </Button>
            </Link>
          </div>
        </div>

        {/* ========================================================
            EXPERIMENT 3: CRUD OPERATIONS CONSOLE DEMO BAR
           ======================================================== */}
        <div className="mt-6 border border-[#2F7FC1]/40 bg-white p-4 rounded-sm shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[9px] font-bold tracking-[2px] uppercase text-[#2F7FC1] flex items-center gap-1.5">
                  <span>⚡</span> Experiment 3: REST API CRUD Console Demonstration
                </p>
                {user?.role === "admin" && (
                  <span className="bg-purple-100 text-purple-800 border border-purple-300 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs">
                    👑 Admin Mode (All Reservations Access)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5A738E] mt-0.5">
                {user?.role === "admin"
                  ? "As Administrator, you have full privileges to GET all guest reservations, CREATE, UPDATE (via POST/PUT), and DELETE any booking with full console output."
                  : "Click any method below to execute live and inspect formatted request & response logs in the DevTools console (F12)."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleTriggerFullLifecycle}
              className="inline-flex items-center gap-1.5 border border-emerald-500 bg-emerald-600 px-3.5 py-1.5 text-[9px] font-bold tracking-[1.5px] uppercase text-white hover:bg-emerald-700 transition-colors rounded-xs shadow-xs"
            >
              🚀 Run Full CRUD Lifecycle (All 4 Methods)
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#D7E2EA]/60">
            <button
              type="button"
              onClick={handleTriggerQuickGet}
              className="flex items-center justify-center gap-1.5 border border-blue-200 bg-blue-50/70 hover:bg-blue-100 px-2.5 py-1.5 text-[9px] font-semibold tracking-[1px] uppercase text-blue-800 transition-colors rounded-xs"
            >
              <span>📥</span> GET /reservations
            </button>

            <button
              type="button"
              onClick={handleTriggerQuickPost}
              className="flex items-center justify-center gap-1.5 border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 px-2.5 py-1.5 text-[9px] font-semibold tracking-[1px] uppercase text-emerald-800 transition-colors rounded-xs"
            >
              <span>📤</span> POST (Create)
            </button>

            <button
              type="button"
              onClick={handleTriggerQuickUpdatePost}
              className="flex items-center justify-center gap-1.5 border border-amber-200 bg-amber-50/70 hover:bg-amber-100 px-2.5 py-1.5 text-[9px] font-semibold tracking-[1px] uppercase text-amber-800 transition-colors rounded-xs"
            >
              <span>🔄</span> UPDATE (via POST)
            </button>

            <button
              type="button"
              onClick={handleTriggerQuickDelete}
              className="flex items-center justify-center gap-1.5 border border-red-200 bg-red-50/70 hover:bg-red-100 px-2.5 py-1.5 text-[9px] font-semibold tracking-[1px] uppercase text-red-800 transition-colors rounded-xs"
            >
              <span>🗑️</span> DELETE (Cancel)
            </button>
          </div>
        </div>

        {/* Action Success Alert */}
        {actionSuccess && (
          <div className="mt-6 border border-emerald-300 bg-emerald-50 p-4 rounded-xs text-xs text-emerald-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>✓</span> {actionSuccess}
            </span>
            <button
              type="button"
              onClick={() => setActionSuccess("")}
              className="font-bold text-emerald-900 hover:text-emerald-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Global Error Alert */}
        {error && (
          <div className="mt-6 border border-red-300 bg-red-50 p-4 rounded-xs text-xs text-red-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>⚠</span> {error}
            </span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="font-bold text-red-900 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Bookings Container */}
        <div className="mt-8">
          {isLoading ? (
            <div className="border border-[#D7E2EA] bg-white p-14 text-center rounded-sm shadow-xs">
              <Loading message="Retrieving reservation history via GET /reservations..." />
            </div>
          ) : bookings.length === 0 ? (
            <div className="border border-[#D7E2EA] bg-white p-14 text-center rounded-sm shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#B7E3FF]/30 text-2xl text-[#2F7FC1]">
                🧳
              </div>
              <h3 className="mt-4 font-serif text-3xl text-[#0F2942]">
                No Bookings Found
              </h3>
              <p className="mt-2 text-xs text-[#5A738E] max-w-sm mx-auto">
                You haven't made any hotel reservations yet. Explore our premier destinations to book your first getaway.
              </p>
              <div className="mt-6">
                <Link to="/hotels">
                  <Button variant="primary">Explore Hotels</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col md:flex-row border border-[#D7E2EA] bg-white overflow-hidden shadow-xs rounded-sm hover:border-[#2F7FC1] transition-colors"
                >
                  {/* Thumbnail */}
                  {booking.hotelImage && (
                    <div className="w-full md:w-64 h-48 md:h-auto shrink-0 bg-[#B7E3FF]/20 relative">
                      <img
                        src={booking.hotelImage}
                        alt={booking.hotelName}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-[#0F2942]/85 px-2 py-0.5 rounded-xs text-[10px] text-amber-300">
                        {"★".repeat(booking.hotelStars || 5)}
                      </div>
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#2F7FC1]">
                            Reservation #{booking.id}
                          </span>
                          <h3 className="font-serif text-2xl text-[#0F2942]">
                            {booking.hotelName}
                          </h3>
                          <p className="text-xs text-[#5A738E]">
                            {booking.hotelLocation}
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1 text-[9px] font-semibold tracking-[1px] uppercase rounded-xs ${
                            booking.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : booking.status === "Modified"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-[#B7E3FF]/40 text-[#2F7FC1] border border-[#7CC8FF]"
                          }`}
                        >
                          {booking.status || "Confirmed"} ✓
                        </span>
                      </div>

                      {/* Info Grid */}
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-y border-[#D7E2EA]/60 py-3 text-xs">
                        <div>
                          <span className="text-[8px] font-semibold tracking-[1px] uppercase text-[#5A738E] block">Room</span>
                          <span className="font-semibold text-[#0F2942]">{booking.roomName}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-semibold tracking-[1px] uppercase text-[#5A738E] block">Duration</span>
                          <span className="font-semibold text-[#0F2942]">{booking.totalStayDuration} Nights</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-semibold tracking-[1px] uppercase text-[#5A738E] block">Dates</span>
                          <span className="font-semibold text-[#0F2942]">{booking.checkIn} to {booking.checkOut}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-semibold tracking-[1px] uppercase text-[#5A738E] block">Total Amount</span>
                          <span className="font-serif font-bold text-sm text-[#2F7FC1]">
                            ₹{Number(booking.totalAmount || booking.amountPaid || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-[#5A738E] flex flex-wrap justify-between gap-2">
                        <p>
                          Guest: <strong className="text-[#0F2942]">{booking.customerName}</strong> ({booking.email} • {booking.phone})
                        </p>
                        <p>
                          Guests: <strong className="text-[#0F2942]">{booking.guests}</strong>
                        </p>
                      </div>

                      {booking.specialRequests && booking.specialRequests !== "None" && (
                        <p className="mt-1 text-xs text-[#5A738E] italic">
                          Special Requests: "{booking.specialRequests}"
                        </p>
                      )}
                    </div>

                    {/* CRUD Action Buttons */}
                    <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#D7E2EA]/60">
                      {/* UPDATE BUTTON (Experiment 3 c: PUT) */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(booking)}
                      >
                        ✏️ Modify Stay (PUT)
                      </Button>

                      {/* DELETE BUTTON (Experiment 3 d: DELETE) */}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setCancellingBookingId(booking.id)}
                      >
                        🗑 Cancel (DELETE)
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================
            MODAL: EDIT RESERVATION (Experiment 3 c: PUT/PATCH)
           ======================================================== */}
        {editingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2942]/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg border border-[#D7E2EA] bg-white p-6 sm:p-8 rounded-sm shadow-xl">
              <div className="flex items-center justify-between border-b border-[#D7E2EA]/60 pb-4">
                <div>
                  <p className="text-[9px] font-semibold tracking-[2px] uppercase text-[#2F7FC1]">
                    HTTP PUT /reservations/{editingBooking.id}
                  </p>
                  <h3 className="font-serif text-2xl text-[#0F2942] mt-0.5">
                    Modify Reservation Details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="text-lg font-bold text-[#5A738E] hover:text-[#0F2942]"
                >
                  ✕
                </button>
              </div>

              {editError && (
                <div className="mt-4 border border-red-300 bg-red-50 p-3 rounded-xs text-xs text-red-700">
                  ⚠ {editError}
                </div>
              )}

              <form onSubmit={handleSaveUpdate} className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <DatePicker
                    label="Check-In Date"
                    name="checkIn"
                    required
                    value={editFormData.checkIn}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, checkIn: e.target.value }))}
                  />

                  <DatePicker
                    label="Check-Out Date"
                    name="checkOutDate"
                    required
                    min={editFormData.checkIn}
                    value={editFormData.checkOut}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, checkOut: e.target.value }))}
                  />
                </div>

                <Input
                  label="Number of Guests"
                  name="guests"
                  type="number"
                  min="1"
                  max="6"
                  required
                  value={editFormData.guests}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, guests: e.target.value }))}
                />

                <div>
                  <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E] block mb-1.5">
                    Special Requests
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.specialRequests}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, specialRequests: e.target.value }))}
                    className="w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3.5 py-2 text-xs text-[#0F2942] outline-none focus:border-[#2F7FC1] rounded-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-[#D7E2EA]/60">
                  <Button variant="outline" size="sm" type="button" onClick={handleCloseEdit}>
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={(e) => handleSaveUpdate("patch", e)}
                    loading={isUpdating}
                    className="border-purple-400 text-purple-800 hover:bg-purple-50"
                  >
                    Partial Update (PATCH)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={(e) => handleSaveUpdate("post", e)}
                    loading={isUpdating}
                    className="border-amber-400 text-amber-800 hover:bg-amber-50"
                  >
                    Save Changes (POST Method)
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    onClick={(e) => handleSaveUpdate("put", e)}
                    loading={isUpdating}
                  >
                    Save Changes (PUT Method)
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL: CONFIRM CANCELLATION (Experiment 3 d: DELETE)
           ======================================================== */}
        {cancellingBookingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2942]/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 text-xl font-bold">
                ✕
              </div>
              <p className="mt-4 text-[9px] font-semibold tracking-[2px] uppercase text-red-600">
                HTTP DELETE /reservations/{cancellingBookingId}
              </p>
              <h3 className="mt-1 font-serif text-2xl text-[#0F2942]">
                Cancel Reservation?
              </h3>
              <p className="mt-2 text-xs text-[#5A738E] leading-5">
                Are you sure you want to cancel reservation <strong>#{cancellingBookingId}</strong>? This action will remove the stay from your account via the REST API.
              </p>

              <div className="mt-6 flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setCancellingBookingId(null)}
                >
                  Keep Reservation
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  type="button"
                  loading={isCancelling}
                  onClick={handleConfirmCancel}
                >
                  Confirm Cancellation (DELETE)
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default BookingsList;
