import { createSlice } from "@reduxjs/toolkit";
import { calculateBookingFinancials } from "../bookingStore";

const loadInitialBookingState = () => {
  try {
    const saved = localStorage.getItem("grand_stay_redux_booking");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Fallback if storage not available or corrupted
  }

  return {
    selectedHotel: null,
    selectedRoom: null,
    checkIn: "",
    checkOut: "",
    guestsCount: 1,
    guestDetails: {
      fullName: "",
      email: "",
      phone: "",
      specialRequests: ""
    },
    totalStayDuration: 0,
    roomCost: 0,
    taxes: 0,
    additionalCharges: 0,
    finalBookingAmount: 0
  };
};

const initialState = loadInitialBookingState();

export const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    selectHotel: (state, action) => {
      state.selectedHotel = action.payload;
      if (action.payload?.rooms?.length > 0 && !state.selectedRoom) {
        state.selectedRoom = action.payload.rooms[0];
      }
      const fin = calculateBookingFinancials(state.selectedRoom, state.checkIn, state.checkOut);
      state.totalStayDuration = fin.totalStayDuration;
      state.roomCost = fin.roomCost;
      state.taxes = fin.taxes;
      state.additionalCharges = fin.additionalCharges;
      state.finalBookingAmount = fin.finalBookingAmount;
    },

    selectRoom: (state, action) => {
      state.selectedRoom = action.payload;
      const fin = calculateBookingFinancials(state.selectedRoom, state.checkIn, state.checkOut);
      state.totalStayDuration = fin.totalStayDuration;
      state.roomCost = fin.roomCost;
      state.taxes = fin.taxes;
      state.additionalCharges = fin.additionalCharges;
      state.finalBookingAmount = fin.finalBookingAmount;
    },

    setDates: (state, action) => {
      const { checkIn, checkOut } = action.payload || {};
      state.checkIn = checkIn || "";
      state.checkOut = checkOut || "";
      const fin = calculateBookingFinancials(state.selectedRoom, state.checkIn, state.checkOut);
      state.totalStayDuration = fin.totalStayDuration;
      state.roomCost = fin.roomCost;
      state.taxes = fin.taxes;
      state.additionalCharges = fin.additionalCharges;
      state.finalBookingAmount = fin.finalBookingAmount;
    },

    setGuestsCount: (state, action) => {
      state.guestsCount = Number(action.payload) || 1;
    },

    setGuestDetails: (state, action) => {
      state.guestDetails = {
        ...state.guestDetails,
        ...action.payload
      };
    },

    calculateFinancials: (state) => {
      const fin = calculateBookingFinancials(state.selectedRoom, state.checkIn, state.checkOut);
      state.totalStayDuration = fin.totalStayDuration;
      state.roomCost = fin.roomCost;
      state.taxes = fin.taxes;
      state.additionalCharges = fin.additionalCharges;
      state.finalBookingAmount = fin.finalBookingAmount;
    },

    resetBooking: (state) => {
      state.selectedHotel = null;
      state.selectedRoom = null;
      state.checkIn = "";
      state.checkOut = "";
      state.guestsCount = 1;
      state.guestDetails = {
        fullName: "",
        email: "",
        phone: "",
        specialRequests: ""
      };
      state.totalStayDuration = 0;
      state.roomCost = 0;
      state.taxes = 0;
      state.additionalCharges = 0;
      state.finalBookingAmount = 0;
    }
  }
});

export const {
  selectHotel,
  selectRoom,
  setDates,
  setGuestsCount,
  setGuestDetails,
  calculateFinancials,
  resetBooking
} = bookingSlice.actions;

export default bookingSlice.reducer;
