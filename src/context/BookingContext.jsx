import { createContext, useContext, useMemo } from "react";
import useHotels from "../hooks/useHotels";
import { useBookingStore } from "../store/bookingStore";

/**
 * BookingContext
 * Integrates REST API hotel data (Experiment 1) with Zustand global state management (Experiment 2)
 * to provide a unified, highly optimized state provider across the entire application.
 */
export const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const hotelsHook = useHotels();
  const store = useBookingStore();

  const contextValue = useMemo(() => {
    return {
      // Hotel API State & Filters (Experiment 1)
      hotels: hotelsHook.hotels,
      setHotels: hotelsHook.setHotels,
      filteredHotels: hotelsHook.filteredHotels,
      isLoadingHotels: hotelsHook.isLoading,
      hotelsError: hotelsHook.error,
      location: hotelsHook.location,
      setLocation: hotelsHook.setLocation,
      maxPrice: hotelsHook.maxPrice,
      setMaxPrice: hotelsHook.setMaxPrice,
      minStars: hotelsHook.minStars,
      setMinStars: hotelsHook.setMinStars,
      selectedAmenities: hotelsHook.selectedAmenities,
      setSelectedAmenities: hotelsHook.setSelectedAmenities,
      availability: hotelsHook.availability,
      setAvailability: hotelsHook.setAvailability,
      resetFilters: hotelsHook.resetFilters,
      refetchHotels: hotelsHook.refetchHotels,

      // Zustand Global Booking State (Experiment 2)
      selectedHotel: store.selectedHotel,
      setSelectedHotel: store.selectHotel,
      selectHotel: store.selectHotel,
      deselectHotel: store.deselectHotel,

      selectedRoom: store.selectedRoom,
      setSelectedRoom: store.selectRoom,
      selectRoom: store.selectRoom,
      deselectRoom: store.deselectRoom,

      checkIn: store.checkIn,
      setCheckIn: (date) => {
        store.updateDates(date, store.checkOut);
        hotelsHook.setCheckIn(date);
      },
      checkOut: store.checkOut,
      setCheckOut: (date) => {
        store.updateDates(store.checkIn, date);
        hotelsHook.setCheckOut(date);
      },
      updateDates: (inDate, outDate) => {
        store.updateDates(inDate, outDate);
        hotelsHook.setCheckIn(inDate);
        hotelsHook.setCheckOut(outDate);
      },

      guests: store.guests,
      setGuests: store.updateGuests,
      updateGuests: store.updateGuests,

      reservationDetails: store.reservationDetails,
      setReservationDetails: store.setReservationDetails,

      bookingConfirmed: store.bookingConfirmed,
      setBookingConfirmed: store.setBookingConfirmed,
      showDetails: store.showDetails,
      setShowDetails: store.setShowDetails,

      // Calculated Financials (Stay duration, room cost, taxes, fees, total)
      totalStayDuration: store.totalStayDuration,
      roomCost: store.roomCost,
      taxes: store.taxes,
      additionalCharges: store.additionalCharges,
      finalBookingAmount: store.finalBookingAmount,

      // Booking Store Actions
      clearBooking: store.clearBooking,
      confirmBooking: store.confirmBooking,
      goBack: store.goBack
    };
  }, [hotelsHook, store]);

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingContext() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookingContext must be used within a BookingProvider");
  }
  return context;
}

export default BookingContext;
