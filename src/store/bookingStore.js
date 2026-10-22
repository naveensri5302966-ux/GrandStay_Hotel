import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { hotelData } from "../data";
import logger from "../utils/logger";

/**
 * Calculation Helper for Itemized Financials:
 * Stay duration, room cost, taxes (12% GST), additional resort charges, and total amount.
 */
export function calculateBookingFinancials(selectedRoom, checkIn, checkOut) {
  if (!checkIn || !checkOut) {
    return {
      totalStayDuration: 0,
      roomCost: 0,
      taxes: 0,
      additionalCharges: 0,
      finalBookingAmount: 0
    };
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = end.getTime() - start.getTime();
  const rawNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const totalStayDuration = rawNights > 0 ? rawNights : 0;

  const roomPrice = selectedRoom?.price || 0;
  const roomCost = totalStayDuration > 0 ? roomPrice * totalStayDuration : 0;
  const taxes = roomCost > 0 ? Math.round(roomCost * 0.12) : 0; // 12% GST
  const additionalCharges = roomCost > 0 ? 500 : 0; // ₹500 Flat Resort & Concierge Fee
  const finalBookingAmount = roomCost > 0 ? roomCost + taxes + additionalCharges : 0;

  return {
    totalStayDuration,
    roomCost,
    taxes,
    additionalCharges,
    finalBookingAmount
  };
}

/**
 * Custom Action-Logging Middleware for Zustand
 * Intercepts booking state changes and produces structured DevTools console logs.
 */
const bookingLoggerMiddleware = (config) => (set, get, api) =>
  config(
    (args) => {
      const prevState = get();
      set(args);
      const nextState = get();

      // Explicit Middleware Console Demonstration
      console.log(
        "%c[MIDDLEWARE] Action Intercepted ⚙️",
        "background: #7C3AED; color: white; padding: 2px 6px; border-radius: 2px; font-weight: bold;",
        {
          actionPayload: typeof args === "function" ? "functional_update" : args,
          prevFinancials: {
            nights: prevState.totalStayDuration,
            total: `₹${prevState.finalBookingAmount}`
          },
          nextFinancials: {
            nights: nextState.totalStayDuration,
            total: `₹${nextState.finalBookingAmount}`
          }
        }
      );

      // Check what changed and log meaningful actions
      if (nextState.selectedHotel?.id !== prevState.selectedHotel?.id) {
        if (nextState.selectedHotel) {
          logger.booking("[MIDDLEWARE] Hotel selected", nextState.selectedHotel.name);
        } else {
          logger.booking("[MIDDLEWARE] Hotel deselected", "None");
        }
      }

      if (nextState.selectedRoom?.id !== prevState.selectedRoom?.id) {
        if (nextState.selectedRoom) {
          logger.booking("[MIDDLEWARE] Room selected", nextState.selectedRoom.name);
        } else {
          logger.booking("[MIDDLEWARE] Room deselected", "None");
        }
      }

      if (
        nextState.checkIn !== prevState.checkIn ||
        nextState.checkOut !== prevState.checkOut
      ) {
        logger.booking("[MIDDLEWARE] Stay duration", `${nextState.totalStayDuration} nights (${nextState.checkIn} to ${nextState.checkOut})`);
        if (nextState.roomCost > 0) {
          logger.booking("[MIDDLEWARE] Subtotal", `₹${nextState.roomCost.toLocaleString("en-IN")}`);
          logger.booking("[MIDDLEWARE] Tax (12% GST)", `₹${nextState.taxes.toLocaleString("en-IN")}`);
          logger.booking("[MIDDLEWARE] Total", `₹${nextState.finalBookingAmount.toLocaleString("en-IN")}`);
        }
      }

      // Storage Persistence Notice
      console.log(
        "%c[MIDDLEWARE: STORAGE] Persisted to localStorage 💾",
        "color: #059669; font-weight: bold;",
        `Key: grand_stay_booking_store | Total: ₹${nextState.finalBookingAmount}`
      );
    },
    get,
    api
  );

/**
 * Initial Default Booking State
 */
const initialHotel = hotelData[0] || null;
const initialRoom = initialHotel?.rooms?.[0] || null;
const initialCheckIn = "2026-11-10";
const initialCheckOut = "2026-11-13";
const initialFinancials = calculateBookingFinancials(initialRoom, initialCheckIn, initialCheckOut);

/**
 * Global Hotel Booking Store (Experiment 2: Zustand + Middleware + Persistence)
 */
export const useBookingStore = create(
  bookingLoggerMiddleware(
    persist(
      (set, get) => ({
        // State properties
        selectedHotel: initialHotel,
        selectedRoom: initialRoom,
        checkIn: initialCheckIn,
        checkOut: initialCheckOut,
        guests: 2,
        reservationDetails: {
          customerName: "Eleanor Vance",
          email: "eleanor.vance@example.com",
          phone: "9876543210",
          specialRequests: "High floor, quiet corner room with sea breeze"
        },
        bookingConfirmed: false,
        showDetails: true,

        // Calculated Financial Breakdown
        ...initialFinancials,

        // Actions
        selectHotel: (hotel) => {
          const state = get();
          const firstRoom = hotel?.rooms?.[0] || null;
          const financials = calculateBookingFinancials(firstRoom, state.checkIn, state.checkOut);

          set({
            selectedHotel: hotel,
            selectedRoom: firstRoom,
            bookingConfirmed: false,
            showDetails: true,
            ...financials
          });
        },

        deselectHotel: () => {
          set({
            selectedHotel: null,
            selectedRoom: null,
            bookingConfirmed: false,
            ...calculateBookingFinancials(null, null, null)
          });
        },

        selectRoom: (room) => {
          const state = get();
          const financials = calculateBookingFinancials(room, state.checkIn, state.checkOut);

          set({
            selectedRoom: room,
            bookingConfirmed: false,
            ...financials
          });
        },

        deselectRoom: () => {
          const state = get();
          set({
            selectedRoom: null,
            ...calculateBookingFinancials(null, state.checkIn, state.checkOut)
          });
        },

        updateDates: (checkIn, checkOut) => {
          const state = get();

          // Validate checkout date is strictly after checkin
          let validCheckOut = checkOut;
          if (checkIn && checkOut && checkOut <= checkIn) {
            const startDate = new Date(checkIn);
            startDate.setDate(startDate.getDate() + 1);
            validCheckOut = startDate.toISOString().split("T")[0];
          }

          const financials = calculateBookingFinancials(state.selectedRoom, checkIn, validCheckOut);

          set({
            checkIn,
            checkOut: validCheckOut,
            ...financials
          });
        },

        updateGuests: (guestCount) => {
          const count = Math.max(1, Number(guestCount) || 1);
          const state = get();

          // If current room capacity is exceeded, keep or notify
          let room = state.selectedRoom;
          if (room && room.capacity < count) {
            // Find appropriate room if possible
            const betterRoom = state.selectedHotel?.rooms?.find((r) => r.capacity >= count);
            if (betterRoom) {
              room = betterRoom;
            }
          }

          const financials = calculateBookingFinancials(room, state.checkIn, state.checkOut);

          set({
            guests: count,
            selectedRoom: room,
            ...financials
          });
        },

        setReservationDetails: (details) => {
          set((prev) => ({
            reservationDetails: {
              ...prev.reservationDetails,
              ...details
            }
          }));
        },

        setBookingConfirmed: (status) => {
          set({ bookingConfirmed: Boolean(status) });
        },

        setShowDetails: (status) => {
          set({ showDetails: Boolean(status) });
        },

        confirmBooking: (paymentDetails) => {
          set((prev) => ({
            bookingConfirmed: true,
            reservationDetails: {
              ...prev.reservationDetails,
              ...paymentDetails
            }
          }));
        },

        clearBooking: () => {
          set({
            selectedHotel: null,
            selectedRoom: null,
            bookingConfirmed: false,
            showDetails: false,
            ...calculateBookingFinancials(null, null, null)
          });
        },

        goBack: () => {
          set({
            showDetails: false,
            bookingConfirmed: false
          });
        }
      }),
      {
        name: "grand_stay_booking_store",
        storage: createJSONStorage(() => localStorage),
        // Only persist safe, non-sensitive booking selections (never passwords or secret tokens)
        partialize: (state) => ({
          selectedHotel: state.selectedHotel,
          selectedRoom: state.selectedRoom,
          checkIn: state.checkIn,
          checkOut: state.checkOut,
          guests: state.guests,
          reservationDetails: state.reservationDetails,
          bookingConfirmed: state.bookingConfirmed
        })
      }
    )
  )
);

export default useBookingStore;
