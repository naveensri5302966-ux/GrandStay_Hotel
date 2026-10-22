import { useNavigate } from "react-router-dom";
import { useBookingContext } from "../context/BookingContext";
import RoomCard from "./RoomCard";
import Button from "./common/Button";

export function BookingRoomStep() {
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

  const handleContinue = () => {
    if (!selectedRoom) {
      return;
    }
    navigate("/booking/guest");
  };

  return (
    <div className="border border-[#D7E2EA] bg-white p-6 sm:p-10 rounded-sm shadow-xs">
      <div className="border-b border-[#D7E2EA]/60 pb-6">
        <p className="text-[9px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
          Step 1 of 3
        </p>
        <h2 className="mt-2 font-serif text-3xl text-[#0F2942]">
          Choose Your Room Type
        </h2>
        <p className="mt-1.5 text-xs text-[#5A738E]">
          Select the room configuration that best fits your group at {selectedHotel.name}.
        </p>
      </div>

      {/* Stay Parameters Control */}
      <div className="mt-6 flex flex-wrap items-center gap-4 border border-[#D7E2EA] bg-[#F8FBFF] p-4 text-xs rounded-sm">
        <div>
          <label className="block text-[8px] font-semibold tracking-[1.5px] uppercase text-[#5A738E]">
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => updateGuests(Number(e.target.value))}
            className="mt-1 border border-[#D7E2EA] bg-white px-3 py-1.5 text-xs text-[#0F2942] rounded-xs"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "Guest" : "Guests"}
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
            className="mt-1 border border-[#D7E2EA] bg-white px-2.5 py-1 text-xs text-[#0F2942] rounded-xs"
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
            className="mt-1 border border-[#D7E2EA] bg-white px-2.5 py-1 text-xs text-[#0F2942] rounded-xs"
          />
        </div>
      </div>

      {/* Conditional Rendering: "No rooms available for selected dates" */}
      {!hasAvailableRooms || rooms.length === 0 ? (
        <div
          id="no-rooms-message"
          className="mt-8 border border-[#D7E2EA] bg-[#F8FBFF] p-10 text-center rounded-sm"
        >
          <p className="text-2xl">🛏️</p>
          <h3 className="mt-3 font-serif text-2xl text-[#0F2942]">
            No rooms available for selected dates
          </h3>
          <p className="mt-2 text-xs text-[#5A738E]">
            Please change your travel dates or consider another property.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              isSelected={selectedRoom?.id === room.id}
              guestCount={guests}
              onSelect={(r) => selectRoom(r)}
            />
          ))}
        </div>
      )}

      {/* Conditional Rendering: "Please select a room" */}
      {!selectedRoom && hasAvailableRooms && (
        <div className="mt-8 border border-amber-200 bg-amber-50/70 p-4 text-center rounded-xs">
          <p className="text-xs font-semibold text-amber-800">
            Please select a room from the options above before continuing to guest details.
          </p>
        </div>
      )}

      {/* Navigation action */}
      <div className="mt-8 flex items-center justify-between border-t border-[#D7E2EA]/60 pt-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/hotel/${selectedHotel.id}`)}
        >
          ← Hotel Overview
        </Button>

        <Button
          variant="primary"
          size="lg"
          disabled={!selectedRoom}
          onClick={handleContinue}
        >
          Continue to Guest Details →
        </Button>
      </div>
    </div>
  );
}

export default BookingRoomStep;
