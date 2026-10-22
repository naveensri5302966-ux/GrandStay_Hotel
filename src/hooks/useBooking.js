import { useBookingStore } from "../store/bookingStore";

/**
 * Custom Hook: useBooking()
 * Provides seamless bridge between components and the Zustand global booking store (Experiment 2).
 * Preserves the exact signature and behavior expected by existing Unit 3 components.
 */
export function useBooking() {
  const store = useBookingStore();

  return {
    // State properties
    selectedHotel: store.selectedHotel,
    setSelectedHotel: store.selectHotel,
    selectedRoom: store.selectedRoom,
    setSelectedRoom: store.selectRoom,
    checkIn: store.checkIn,
    setCheckIn: (date) => store.updateDates(date, store.checkOut),
    checkOut: store.checkOut,
    setCheckOut: (date) => store.updateDates(store.checkIn, date),
    guests: store.guests,
    setGuests: store.updateGuests,
    reservationDetails: store.reservationDetails,
    setReservationDetails: store.setReservationDetails,
    bookingConfirmed: store.bookingConfirmed,
    setBookingConfirmed: store.setBookingConfirmed,
    showDetails: store.showDetails,
    setShowDetails: store.setShowDetails,

    // Financial calculations calculated in store
    totalStayDuration: store.totalStayDuration,
    roomCost: store.roomCost,
    taxes: store.taxes,
    additionalCharges: store.additionalCharges,
    finalBookingAmount: store.finalBookingAmount,

    // Store Actions
    selectHotel: store.selectHotel,
    deselectHotel: store.deselectHotel,
    selectRoom: store.selectRoom,
    deselectRoom: store.deselectRoom,
    updateGuests: store.updateGuests,
    updateDates: store.updateDates,
    clearBooking: store.clearBooking,
    confirmBooking: store.confirmBooking,
    goBack: store.goBack
  };
}

export default useBooking;
