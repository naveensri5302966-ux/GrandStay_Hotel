const { configureStore, createSlice } = require('@reduxjs/toolkit');

// Mock localStorage in Node.js environment
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

// Itemized calculation logic
function calculateBookingFinancials(selectedRoom, checkIn, checkOut) {
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
  const additionalCharges = roomCost > 0 ? 500 : 0; // ₹500 Flat Resort Fee
  const finalBookingAmount = roomCost > 0 ? roomCost + taxes + additionalCharges : 0;

  return {
    totalStayDuration,
    roomCost,
    taxes,
    additionalCharges,
    finalBookingAmount
  };
}

// Booking Slice
const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    selectedHotel: null,
    selectedRoom: null,
    checkIn: '',
    checkOut: '',
    guestsCount: 1,
    guestDetails: { fullName: '', email: '', phone: '', specialRequests: '' },
    totalStayDuration: 0,
    roomCost: 0,
    taxes: 0,
    additionalCharges: 0,
    finalBookingAmount: 0
  },
  reducers: {
    selectHotel: (state, action) => {
      state.selectedHotel = action.payload;
      if (action.payload?.rooms?.length > 0 && !state.selectedRoom) {
        state.selectedRoom = action.payload.rooms[0];
      }
      const fin = calculateBookingFinancials(state.selectedRoom, state.checkIn, state.checkOut);
      Object.assign(state, fin);
    },
    selectRoom: (state, action) => {
      state.selectedRoom = action.payload;
      const fin = calculateBookingFinancials(state.selectedRoom, state.checkIn, state.checkOut);
      Object.assign(state, fin);
    },
    setDates: (state, action) => {
      state.checkIn = action.payload.checkIn || '';
      state.checkOut = action.payload.checkOut || '';
      const fin = calculateBookingFinancials(state.selectedRoom, state.checkIn, state.checkOut);
      Object.assign(state, fin);
    },
    setGuestsCount: (state, action) => {
      state.guestsCount = Number(action.payload) || 1;
    },
    setGuestDetails: (state, action) => {
      state.guestDetails = { ...state.guestDetails, ...action.payload };
    },
    resetBooking: (state) => {
      state.selectedHotel = null;
      state.selectedRoom = null;
      state.checkIn = '';
      state.checkOut = '';
      state.guestsCount = 1;
      state.guestDetails = { fullName: '', email: '', phone: '', specialRequests: '' };
      state.totalStayDuration = 0;
      state.roomCost = 0;
      state.taxes = 0;
      state.additionalCharges = 0;
      state.finalBookingAmount = 0;
    }
  }
});

const { selectHotel, selectRoom, setDates, setGuestsCount, setGuestDetails, resetBooking } = bookingSlice.actions;

// Captured logs from middleware
const interceptedActions = [];

// Custom Curried Redux Middleware
const bookingMiddleware = (store) => (next) => (action) => {
  interceptedActions.push(action);
  const result = next(action);
  const nextState = store.getState();

  if (action.type && action.type.startsWith('booking/')) {
    try {
      localStorage.setItem('grand_stay_redux_booking', JSON.stringify(nextState.booking));
    } catch (_e) {}
  }

  return result;
};

// Create Redux Store with Middleware
const store = configureStore({
  reducer: {
    booking: bookingSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(bookingMiddleware)
});

// Run Tests
console.log('================================================================');
console.log('⚛️  EXPERIMENT 2: REDUX TOOLKIT & MIDDLEWARE VERIFICATION SUITE');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(title, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${title} ${detail ? '(' + detail + ')' : ''}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${title} ${detail ? '(' + detail + ')' : ''}`);
    failed++;
  }
}

// 1. Initial State
const s0 = store.getState().booking;
assert('Redux Store initializes with default booking state', s0.selectedHotel === null && s0.totalStayDuration === 0);

// 2. Select Hotel
store.dispatch(selectHotel({
  id: 101,
  name: 'The Grand Stay Chennai',
  rooms: [
    { id: 1, name: 'Deluxe Room', price: 8500 },
    { id: 2, name: 'Luxury Suite', price: 12000 }
  ]
}));
const s1 = store.getState().booking;
assert('selectHotel action updates selectedHotel in Redux store', s1.selectedHotel?.id === 101);
assert('selectHotel auto-selects first room when none selected', s1.selectedRoom?.name === 'Deluxe Room');

// 3. Set Dates & Calculations
store.dispatch(setDates({ checkIn: '2026-11-10', checkOut: '2026-11-13' }));
const s2 = store.getState().booking;
assert('setDates calculates stay duration (3 nights)', s2.totalStayDuration === 3);
assert('Redux state computes room cost (8500 * 3 = ₹25,500)', s2.roomCost === 25500);
assert('Redux state computes 12% GST tax (₹3,060)', s2.taxes === 3060);
assert('Redux state computes resort fee (₹500)', s2.additionalCharges === 500);
assert('Redux state computes final amount (₹29,060)', s2.finalBookingAmount === 29060);

// 4. Select Room (Switch to Luxury Suite)
store.dispatch(selectRoom({ id: 2, name: 'Luxury Suite', price: 12000 }));
const s3 = store.getState().booking;
assert('selectRoom updates room to Luxury Suite', s3.selectedRoom?.price === 12000);
assert('selectRoom dynamically recalculates total (12000 * 3 + tax + fee = ₹40,820)', s3.finalBookingAmount === 40820);

// 5. Guest Information
store.dispatch(setGuestsCount(2));
store.dispatch(setGuestDetails({
  fullName: 'Eleanor Vance',
  email: 'eleanor.vance@example.com',
  phone: '9876543210'
}));
const s4 = store.getState().booking;
assert('setGuestsCount updates guest count', s4.guestsCount === 2);
assert('setGuestDetails updates contact information', s4.guestDetails.fullName === 'Eleanor Vance');

// 6. Middleware Verification
assert('Redux middleware intercepted all dispatched actions', interceptedActions.length >= 5);
const lastPersisted = JSON.parse(mockStorage['grand_stay_redux_booking'] || '{}');
assert('Redux persistence middleware stored state in localStorage', lastPersisted.finalBookingAmount === 40820);
assert('Persisted guest name matches in browser storage', lastPersisted.guestDetails?.fullName === 'Eleanor Vance');

// 7. Reset Booking
store.dispatch(resetBooking());
const s5 = store.getState().booking;
assert('resetBooking cleanly clears booking state', s5.selectedHotel === null && s5.finalBookingAmount === 0);

console.log('\n================================================================');
console.log(`📊 REDUX & MIDDLEWARE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
