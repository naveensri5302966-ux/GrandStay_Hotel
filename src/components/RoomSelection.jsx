import { useNavigate } from "react-router-dom";
import { useBookingContext } from "../context/BookingContext";
import RoomCard from "./RoomCard";
import Button from "./common/Button";

export function RoomSelection({ onContinue }) {
  const navigate = useNavigate();
  const {
    selectedHotel,
    selectedRoom,
    selectRoom,
    guests,
    updateGuests,
    checkIn,
    checkOut,
    updateDates
  } = useBookingContext();

  if (!selectedHotel) {
    return null;
  }

  const rooms = selectedHotel.rooms || [];
  const hasAvailableRooms = rooms.some((r) => r.available !== false);

  const handleProceed = () => {
    if (onContinue) {
      onContinue();
    } else {
      navigate("/booking/guest");
    }
  };

  return (
    <section id="rooms" className="bg-white px-5 py-16 text-[#0F2942] md:px-10 lg:px-16 border-t border-[#D7E2EA]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[9px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
              Step 1 of 3: Accommodations
            </p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl text-[#0F2942]">
              Select Your Room
            </h2>
            <p className="mt-2 text-xs text-[#5A738E]">
              Choose from available rooms and suites tailored to your group size and comfort at {selectedHotel.name}.
            </p>
          </div>

          {/* Quick Date and Guest Bar */}
          <div className="flex flex-wrap items-center gap-4 bg-[#F8FBFF] p-4 border border-[#D7E2EA] rounded-sm">
            <div>
              <label className="block text-[8px] font-semibold tracking-[1.5px] uppercase text-[#5A738E]">
                Guests
              </label>
              <select
                value={guests}
                onChange={(e) => updateGuests(Number(e.target.value))}
                className="mt-1 border border-[#D7E2EA] bg-white px-3 py-1.5 text-xs text-[#0F2942] outline-none rounded-xs"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[8px] font-semibold tracking-[1.5px] uppercase text-[#5A738E]">
                Check-In
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => updateDates(e.target.value, checkOut)}
                className="mt-1 border border-[#D7E2EA] bg-white px-2 py-1 text-xs text-[#0F2942] outline-none rounded-xs"
              />
            </div>

            <div>
              <label className="block text-[8px] font-semibold tracking-[1.5px] uppercase text-[#5A738E]">
                Check-Out
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => updateDates(checkIn, e.target.value)}
                className="mt-1 border border-[#D7E2EA] bg-white px-2 py-1 text-xs text-[#0F2942] outline-none rounded-xs"
              />
            </div>
          </div>
        </div>

        {/* Conditional Rendering: "No rooms available for selected dates" */}
        {!hasAvailableRooms || rooms.length === 0 ? (
          <div
            id="no-rooms-message"
            className="mt-10 border border-[#D7E2EA] bg-[#F8FBFF] p-12 text-center rounded-sm"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#B7E3FF]/30 text-2xl text-[#2F7FC1]">
              🛏️
            </div>
            <h3 className="mt-4 font-serif text-3xl text-[#0F2942]">
              No rooms available for selected dates
            </h3>
            <p className="mt-2 text-xs text-[#5A738E] max-w-md mx-auto">
              All room types at {selectedHotel.name} are fully booked for the chosen travel dates ({checkIn} to {checkOut}). Please adjust your dates or browse another hotel.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isSelected={selectedRoom?.id === room.id}
                guestCount={guests}
                onSelect={(selected) => selectRoom(selected)}
              />
            ))}
          </div>
        )}

        {/* Selected Room Notification and Next Action */}
        {selectedRoom && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#2F7FC1] bg-[#B7E3FF]/20 p-5 rounded-sm">
            <div>
              <p className="text-[9px] tracking-[1.5px] uppercase text-[#2F7FC1] font-bold">
                Room Selected
              </p>
              <p className="text-sm font-semibold text-[#0F2942] mt-0.5">
                {selectedRoom.name} — ₹{selectedRoom.price.toLocaleString("en-IN")}/night
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleProceed}
            >
              Continue with {selectedRoom.name} →
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default RoomSelection;
