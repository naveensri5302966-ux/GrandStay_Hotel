import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./bookingSlice";
import bookingMiddleware from "./middleware/bookingMiddleware";

/**
 * Redux Toolkit Global Store Configuration (Experiment 2 a & e)
 * Integrates configureStore with Redux DevTools and custom middleware.
 */
export const store = configureStore({
  reducer: {
    booking: bookingReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(bookingMiddleware)
});

export default store;
