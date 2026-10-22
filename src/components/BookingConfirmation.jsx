import { Link, useNavigate } from "react-router-dom";
import { useBookingContext } from "../context/BookingContext";
import Button from "./common/Button";

export function BookingConfirmation() {
  const navigate = useNavigate();
  const {
    selectedHotel,
    selectedRoom,
    checkIn,
    checkOut,
    guests,
    totalStayDuration,
    finalBookingAmount,
    reservationDetails,
    clearBooking
  } = useBookingContext();

  const hotel = selectedHotel;
  const room = selectedRoom;

  if (!hotel || !room) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center bg-[#F8FBFF] px-6 py-20 text-center text-[#0F2942]">
        <div className="max-w-md border border-[#D7E2EA] bg-white p-10 rounded-sm shadow-xs">
          <h2 className="font-serif text-3xl text-[#0F2942]">
            No Active Reservation
          </h2>
          <p className="mt-3 text-xs leading-6 text-[#5A738E]">
            You do not currently have an active reservation in progress.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/hotels">
              <Button variant="primary">Explore Hotels</Button>
            </Link>
            <Link to="/bookings">
              <Button variant="outline">My Bookings</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const reservationId = reservationDetails?.id || "RES-2026-CONFIRMED";

  const handleStartNew = () => {
    clearBooking();
    navigate("/hotels");
  };

  return (
    <main className="min-h-screen bg-[#F8FBFF] px-5 py-16 text-[#0F2942] md:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl border border-[#D7E2EA] bg-white p-8 md:p-14 text-center rounded-sm shadow-xs">
        {/* Success Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#B7E3FF]/40 text-2xl text-[#2F7FC1] border border-[#7CC8FF]">
          ✓
        </div>

        <p className="mt-6 text-[9px] font-semibold tracking-[4px] uppercase text-[#2F7FC1]">
          Booking Confirmed & Synchronized via REST API
        </p>

        <h1 className="mt-2 font-serif text-3xl md:text-5xl text-[#0F2942]">
          Your stay is secured.
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#5A738E]">
          Thank you for choosing {hotel.name}. Your reservation has been created in the database,
          synchronized with your browser state, and confirmation has been generated.
        </p>

        {/* Detailed Reservation Receipt */}
        <div className="mx-auto mt-8 max-w-2xl border border-[#D7E2EA] bg-[#F8FBFF] text-left rounded-sm overflow-hidden">
          {/* Reservation Number Header */}
          <div className="border-b border-[#D7E2EA] p-5 bg-[#B7E3FF]/20 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[9px] tracking-[1.5px] uppercase font-bold text-[#2F7FC1] block">
                Official Confirmation Code
              </span>
              <span className="font-mono text-base font-bold text-[#0F2942]">
                {reservationId}
              </span>
            </div>
            <span className="bg-emerald-600 text-white px-3 py-1 text-[9px] font-semibold tracking-[1px] uppercase rounded-xs">
              Status: Confirmed ✓
            </span>
          </div>

          {/* Hotel Info */}
          <div className="border-b border-[#D7E2EA] p-6">
            <p className="text-[8px] font-semibold tracking-[2px] uppercase text-[#2F7FC1]">
              Hotel Property
            </p>
            <h2 className="mt-1 font-serif text-2xl text-[#0F2942]">
              {hotel.name}
            </h2>
            <p className="mt-1 text-xs text-[#5A738E]">
              {hotel.location} • {"★".repeat(hotel.stars)}
            </p>
          </div>

          {/* Room & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-[#D7E2EA]">
            <div className="p-6 border-b sm:border-b-0 sm:border-r border-[#D7E2EA]">
              <p className="text-[8px] font-semibold tracking-[2px] uppercase text-[#5A738E]">
                Room Type
              </p>
              <p className="mt-1 text-sm font-semibold text-[#0F2942]">
                {room.name}
              </p>
              <p className="text-xs text-[#5A738E]">
                {guests} {guests === 1 ? "Guest" : "Guests"}
              </p>
            </div>

            <div className="p-6">
              <p className="text-[8px] font-semibold tracking-[2px] uppercase text-[#5A738E]">
                Dates of Stay
              </p>
              <p className="mt-1 text-sm font-semibold text-[#0F2942]">
                {checkIn} to {checkOut}
              </p>
              <p className="text-xs text-[#5A738E]">
                {totalStayDuration} Nights Stay
              </p>
            </div>
          </div>

          {/* Primary Guest Info */}
          {reservationDetails && (
            <div className="border-b border-[#D7E2EA] p-6 text-xs">
              <p className="text-[8px] font-semibold tracking-[2px] uppercase text-[#2F7FC1]">
                Primary Guest Registration
              </p>
              <p className="mt-1 font-semibold text-sm text-[#0F2942]">
                {reservationDetails.customerName}
              </p>
              <p className="text-[#5A738E] mt-0.5">
                {reservationDetails.email} • {reservationDetails.phone}
              </p>
              {reservationDetails.specialRequests && reservationDetails.specialRequests !== "None" && (
                <p className="text-[#5A738E] mt-1.5 italic">
                  Special requests: "{reservationDetails.specialRequests}"
                </p>
              )}
            </div>
          )}

          {/* Financial summary */}
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-[9px] font-semibold tracking-[2px] uppercase text-[#2F7FC1]">
                Total Amount Paid
              </p>
              <span className="text-xs text-[#5A738E]">All taxes & resort fees included</span>
            </div>
            <p className="font-serif text-3xl font-bold text-[#2F7FC1]">
              ₹{finalBookingAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/bookings">
            <Button variant="primary" size="lg">
              View My Bookings History
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={handleStartNew}
          >
            Book Another Stay
          </Button>
        </div>
      </div>
    </main>
  );
}

export default BookingConfirmation;
