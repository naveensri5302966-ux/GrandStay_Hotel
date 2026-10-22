import { useNavigate, Link } from "react-router-dom";
import { useBookingContext } from "../context/BookingContext";
import Button from "./common/Button";

export function BookingSummaryStep() {
  const navigate = useNavigate();
  const {
    selectedHotel,
    selectedRoom,
    checkIn,
    checkOut,
    guests,
    reservationDetails,
    totalStayDuration,
    roomCost,
    taxes,
    additionalCharges,
    finalBookingAmount,
    clearBooking
  } = useBookingContext();

  const formatPrice = (val) =>
    `₹${Number(val || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  // Conditional Rendering 1: "Your booking is empty"
  if (!selectedHotel) {
    return (
      <div className="border border-[#D7E2EA] bg-white p-10 text-center rounded-sm shadow-xs">
        <h3 className="font-serif text-3xl text-[#0F2942]">
          Your booking is empty
        </h3>
        <p className="mt-2 text-xs text-[#5A738E]">
          Please choose a hotel to view booking details.
        </p>
        <Link to="/hotels" className="mt-4 inline-block">
          <Button variant="primary">Browse Hotels</Button>
        </Link>
      </div>
    );
  }

  // Conditional Rendering 2: "Please select a room"
  if (!selectedRoom) {
    return (
      <div className="border border-[#D7E2EA] bg-white p-10 text-center rounded-sm shadow-xs">
        <h3 className="font-serif text-3xl text-[#0F2942]">
          Please select a room
        </h3>
        <p className="mt-2 text-xs text-[#5A738E]">
          You have selected {selectedHotel.name}, but have not yet chosen a room.
        </p>
        <div className="mt-6">
          <Button variant="primary" onClick={() => navigate("/booking/room")}>
            Choose Room
          </Button>
        </div>
      </div>
    );
  }

  const handleProceedToPayment = () => {
    navigate("/checkout");
  };

  return (
    <div className="border border-[#D7E2EA] bg-white p-6 sm:p-10 rounded-sm shadow-xs text-[#0F2942]">
      <div className="border-b border-[#D7E2EA]/60 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[9px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
            Step 3 of 3
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#0F2942]">
            Review Booking Summary
          </h2>
          <p className="mt-1 text-xs text-[#5A738E]">
            Verify all reservation details and itemized pricing calculated by Zustand store before payment.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={clearBooking}
        >
          Clear Booking
        </Button>
      </div>

      {/* Hotel & Room Overview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 border border-[#D7E2EA] bg-[#F8FBFF] p-6 rounded-sm">
        <div>
          <p className="text-[9px] font-semibold tracking-[2px] uppercase text-[#2F7FC1]">
            Property & Room
          </p>
          <h3 className="mt-1.5 font-serif text-2xl text-[#0F2942]">
            {selectedHotel.name}
          </h3>
          <p className="mt-1 text-xs text-[#5A738E]">
            {selectedHotel.location} • {"★".repeat(selectedHotel.stars)}
          </p>
          <p className="mt-3 text-sm font-semibold text-[#0F2942]">
            {selectedRoom.name}
          </p>
          <p className="text-xs text-[#5A738E]">
            Capacity: {selectedRoom.capacity} Guests
          </p>
        </div>

        <div>
          <p className="text-[9px] font-semibold tracking-[2px] uppercase text-[#2F7FC1]">
            Dates & Guest Count
          </p>
          <div className="mt-2 space-y-1 text-xs text-[#0F2942]">
            <p>
              <strong className="text-[#0F2942]">Check-In:</strong> {checkIn}
            </p>
            <p>
              <strong className="text-[#0F2942]">Check-Out:</strong> {checkOut}
            </p>
            <p>
              <strong className="text-[#0F2942]">Duration:</strong> {totalStayDuration} Nights
            </p>
            <p>
              <strong className="text-[#0F2942]">Guests:</strong> {guests} {guests === 1 ? "Guest" : "Guests"}
            </p>
          </div>

          {reservationDetails && (
            <div className="mt-4 border-t border-[#D7E2EA]/60 pt-3 text-xs text-[#5A738E]">
              <p className="font-semibold text-[#0F2942]">{reservationDetails.customerName}</p>
              <p>{reservationDetails.email} • {reservationDetails.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Financial Breakdown (Experiment 2 d) */}
      <div className="mt-8 border border-[#D7E2EA] bg-white p-6 rounded-sm">
        <p className="text-[9px] font-semibold tracking-[2px] uppercase text-[#2F7FC1]">
          Itemized Financial Breakdown (Zustand Global Store)
        </p>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between text-[#5A738E]">
            <span>Total Stay Duration:</span>
            <span className="font-medium text-[#0F2942]">{totalStayDuration} Nights</span>
          </div>

          <div className="flex justify-between text-[#5A738E]">
            <span>Room Cost ({formatPrice(selectedRoom.price)} × {totalStayDuration} nights):</span>
            <span className="font-medium text-[#0F2942]">{formatPrice(roomCost)}</span>
          </div>

          <div className="flex justify-between text-[#5A738E]">
            <span>Taxes (12% Hospitality GST):</span>
            <span className="font-medium text-[#0F2942]">{formatPrice(taxes)}</span>
          </div>

          <div className="flex justify-between text-[#5A738E]">
            <span>Resort & Concierge Fee:</span>
            <span className="font-medium text-[#0F2942]">{formatPrice(additionalCharges)}</span>
          </div>

          <div className="border-t border-[#D7E2EA] pt-4 flex justify-between items-baseline">
            <span className="font-serif text-lg text-[#0F2942]">Final Booking Amount:</span>
            <span className="font-serif text-3xl font-bold text-[#2F7FC1]">
              {formatPrice(finalBookingAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Stepper Navigation Actions */}
      <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-[#D7E2EA]/60 pt-6">
        <Button
          variant="outline"
          onClick={() => navigate("/booking/guest")}
        >
          ← Edit Guest Details
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={handleProceedToPayment}
        >
          Proceed to Payment ({formatPrice(finalBookingAmount)}) →
        </Button>
      </div>
    </div>
  );
}

export default BookingSummaryStep;
