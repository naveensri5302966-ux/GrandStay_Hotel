import Button from "./common/Button";

export function RoomCard({
  room,
  isSelected = false,
  onSelect,
  guestCount = 1
}) {
  const isAvailable = room.available !== false;
  const exceedsCapacity = room.capacity && guestCount > room.capacity;

  return (
    <div
      className={`relative flex flex-col justify-between border p-6 transition-all duration-200 rounded-sm shadow-xs ${
        isSelected
          ? "border-[#2F7FC1] bg-[#B7E3FF]/15 ring-2 ring-[#7CC8FF]"
          : "border-[#D7E2EA] bg-white hover:border-[#2F7FC1]"
      }`}
    >
      {isSelected && (
        <div className="absolute top-0 right-0 bg-[#2F7FC1] px-3 py-1 text-[8px] font-semibold tracking-[1.5px] uppercase text-white rounded-bl-sm">
          Selected Room ✓
        </div>
      )}

      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[9px] tracking-[1.5px] uppercase font-semibold text-[#2F7FC1]">
              Room Type
            </span>
            <h4 className="mt-1 font-serif text-2xl text-[#0F2942]">
              {room.name}
            </h4>
          </div>

          <div className="text-right">
            <span className="font-serif text-2xl font-bold text-[#0F2942]">
              ₹{room.price?.toLocaleString("en-IN")}
            </span>
            <span className="block text-[10px] text-[#5A738E]">/ night</span>
          </div>
        </div>

        <p className="mt-2.5 text-xs text-[#5A738E]">
          Comfortable accommodation with premium linens, en-suite bathroom, and climate control.
        </p>

        {/* Room Specifications */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#D7E2EA]/60 pt-3 text-xs text-[#0F2942]">
          <div className="flex items-center gap-1.5">
            <span>👥</span>
            <span>Up to {room.capacity} {room.capacity === 1 ? "Guest" : "Guests"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🛏️</span>
            <span>King / Twin Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>📶</span>
            <span>High-Speed WiFi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>☕</span>
            <span>Complimentary Tea/Coffee</span>
          </div>
        </div>

        {exceedsCapacity && (
          <p className="mt-3 text-[10px] text-amber-800 bg-amber-50 p-2 border border-amber-200 rounded-xs">
            ⚠ Warning: Selected guests ({guestCount}) exceed this room's capacity ({room.capacity}).
          </p>
        )}
      </div>

      <div className="mt-6 border-t border-[#D7E2EA]/60 pt-4">
        <Button
          type="button"
          variant={isSelected ? "secondary" : "primary"}
          size="md"
          className="w-full focus:ring-2 focus:ring-[#2F7FC1] focus:outline-none"
          disabled={!isAvailable}
          aria-pressed={isSelected}
          onClick={() => onSelect && onSelect(room)}
        >
          {!isAvailable
            ? "Unavailable"
            : isSelected
            ? "Selected Room ✓"
            : "Select Room"}
        </Button>
      </div>
    </div>
  );
}

export default RoomCard;
