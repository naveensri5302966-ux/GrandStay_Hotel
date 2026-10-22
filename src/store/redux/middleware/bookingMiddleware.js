import logger from "../../../utils/logger";

/**
 * Custom Redux Middleware for Hotel Booking State Management (Experiment 2 e & f)
 * 
 * Demonstrates:
 * 1. Action interception: Logs state transitions, action types, and payload audits.
 * 2. Date Boundary Validation: Warns if check-out date is before or equal to check-in.
 * 3. Persistence: Automatically syncs updated booking state to browser storage (localStorage).
 */
export const bookingMiddleware = (store) => (next) => (action) => {
  const prevState = store.getState();
  
  // Forward action through reducer pipeline
  const result = next(action);
  
  const nextState = store.getState();

  // Middleware only processes booking actions
  if (action.type && action.type.startsWith("booking/")) {
    const actionName = action.type.replace("booking/", "");

    // 1. Logging Middleware
    logger.booking(
      `[Redux Middleware] Action: ${actionName}`,
      JSON.stringify(action.payload || {})
    );

    // 2. Financial & Date Calculation Auditing
    if (action.type === "booking/setDates") {
      const { checkIn, checkOut } = action.payload || {};
      if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
        console.warn(
          `[Redux Middleware Warning] Invalid Date Range: checkOut (${checkOut}) must be after checkIn (${checkIn})`
        );
      }
    }

    if (nextState.booking?.roomCost !== prevState.booking?.roomCost) {
      logger.booking(
        `[Redux Middleware] Recalculated Total`,
        `Stay: ${nextState.booking.totalStayDuration} nights | Subtotal: ₹${nextState.booking.roomCost} | GST 12%: ₹${nextState.booking.taxes} | Total: ₹${nextState.booking.finalBookingAmount}`
      );
    }

    // 3. Browser Storage Persistence Middleware (Experiment 2 f)
    try {
      localStorage.setItem(
        "grand_stay_redux_booking",
        JSON.stringify(nextState.booking)
      );
    } catch (err) {
      console.error("[Redux Middleware] Failed to persist state to localStorage:", err);
    }
  }

  return result;
};

export default bookingMiddleware;
