import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingContext } from "../context/BookingContext";
import { hotelData } from "../data";
import RoomCard from "./RoomCard";
import Button from "./common/Button";

export function RoomsPage() {
  const navigate = useNavigate();
  const {
    selectedHotel,
    selectHotel,
    selectedRoom,
    selectRoom,
    guests
  } = useBookingContext();

  const [selectedHotelFilter, setSelectedHotelFilter] = useState(
    selectedHotel ? String(selectedHotel.id) : "all"
  );
  const [capacityFilter, setCapacityFilter] = useState(0);

  // Aggregate rooms across selected hotel or all hotels
  const allRoomsWithHotel = useMemo(() => {
    const list = [];
    hotelData.forEach((hotel) => {
      if (selectedHotelFilter !== "all" && String(hotel.id) !== selectedHotelFilter) {
        return;
      }
      hotel.rooms.forEach((room) => {
        if (capacityFilter > 0 && room.capacity < capacityFilter) {
          return;
        }
        list.push({ ...room, hotel });
      });
    });
    return list;
  }, [selectedHotelFilter, capacityFilter]);

  const handleSelectRoom = (roomWithHotel) => {
    selectHotel(roomWithHotel.hotel);
    selectRoom(roomWithHotel);
    navigate("/booking/guest");
  };

  return (
    <main className="min-h-screen bg-[#F8FBFF] px-5 py-14 text-[#0F2942] md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="max-w-2xl pb-10">
          <p className="text-[9px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
            Curated Accommodations
          </p>
          <h1 className="mt-1 font-serif text-3xl md:text-5xl text-[#0F2942]">
            Available Rooms & Suites
          </h1>
          <p className="mt-2 text-xs leading-6 text-[#5A738E]">
            Browse luxury suites and executive rooms across our properties, designed for discerning travelers.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="mb-10 flex flex-wrap items-center gap-6 border border-[#D7E2EA] bg-white p-5 rounded-sm shadow-xs">
          <div>
            <label className="block text-[8px] font-semibold tracking-[1.5px] uppercase text-[#5A738E]">
              Filter by Hotel
            </label>
            <select
              value={selectedHotelFilter}
              onChange={(e) => setSelectedHotelFilter(e.target.value)}
              className="mt-1 border border-[#D7E2EA] bg-[#F8FBFF] px-3 py-2 text-xs text-[#0F2942] rounded-xs outline-none"
            >
              <option value="all">All Hotels & Resorts</option>
              {hotelData.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[8px] font-semibold tracking-[1.5px] uppercase text-[#5A738E]">
              Minimum Capacity
            </label>
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(Number(e.target.value))}
              className="mt-1 border border-[#D7E2EA] bg-[#F8FBFF] px-3 py-2 text-xs text-[#0F2942] rounded-xs outline-none"
            >
              <option value="0">Any Capacity</option>
              <option value="2">2+ Guests</option>
              <option value="3">3+ Guests</option>
              <option value="4">4+ Guests</option>
            </select>
          </div>

          <div className="sm:ml-auto">
            <span className="text-xs text-[#5A738E]">
              Showing <strong className="text-[#0F2942]">{allRoomsWithHotel.length}</strong> available room types
            </span>
          </div>
        </div>

        {/* Rooms Grid */}
        {allRoomsWithHotel.length === 0 ? (
          <div
            id="no-rooms-message"
            className="border border-[#D7E2EA] bg-white p-14 text-center rounded-sm shadow-xs"
          >
            <p className="text-3xl">🛏️</p>
            <h2 className="mt-4 font-serif text-3xl text-[#0F2942]">
              No rooms available for selected dates
            </h2>
            <p className="mt-2 text-xs text-[#5A738E] max-w-sm mx-auto">
              No rooms match your filter criteria. Please adjust your selections.
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedHotelFilter("all");
                  setCapacityFilter(0);
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allRoomsWithHotel.map((item) => (
              <div key={`${item.hotel.id}-${item.id}`} className="flex flex-col">
                <div className="bg-[#B7E3FF]/30 px-4 py-2 text-[9px] font-semibold tracking-[1.5px] uppercase text-[#2F7FC1] border-t border-x border-[#D7E2EA] rounded-t-sm">
                  {item.hotel.name} • {item.hotel.location}
                </div>
                <RoomCard
                  room={item}
                  isSelected={
                    selectedHotel?.id === item.hotel.id &&
                    selectedRoom?.id === item.id
                  }
                  guestCount={guests}
                  onSelect={() => handleSelectRoom(item)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default RoomsPage;
