import { useNavigate } from "react-router-dom";
import { useBookingContext } from "../context/BookingContext";
import Button from "./common/Button";

export function SearchBar({ className = "", onSearch }) {
  const navigate = useNavigate();
  const {
    location,
    setLocation,
    checkIn,
    checkOut,
    updateDates,
    guests,
    updateGuests
  } = useBookingContext();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch();
    }
    navigate("/hotels");
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className={`border border-[#D7E2EA] bg-white p-5 md:p-6 shadow-sm rounded-sm ${className}`}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        {/* Destination / Location */}
        <div>
          <label htmlFor="search-destination" className="block text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E]">
            Destination / Hotel Name
          </label>
          <input
            id="search-destination"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City (e.g. Chennai, Goa, Bangalore, Kochi)"
            className="mt-1.5 w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3.5 py-2.5 text-xs text-[#0F2942] outline-none focus:border-[#2F7FC1] focus:ring-1 focus:ring-[#7CC8FF] transition-colors"
          />
        </div>

        {/* Check-In */}
        <div>
          <label htmlFor="search-check-in" className="block text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E]">
            Check-In Date
          </label>
          <input
            id="search-check-in"
            type="date"
            value={checkIn}
            onChange={(e) => updateDates(e.target.value, checkOut)}
            aria-label="Check-in date"
            className="mt-1.5 w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3.5 py-2.5 text-xs text-[#0F2942] outline-none focus:border-[#2F7FC1] focus:ring-1 focus:ring-[#7CC8FF] transition-colors"
          />
        </div>

        {/* Check-Out */}
        <div>
          <label htmlFor="search-check-out" className="block text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E]">
            Check-Out Date
          </label>
          <input
            id="search-check-out"
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => updateDates(checkIn, e.target.value)}
            aria-label="Check-out date"
            className="mt-1.5 w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3.5 py-2.5 text-xs text-[#0F2942] outline-none focus:border-[#2F7FC1] focus:ring-1 focus:ring-[#7CC8FF] transition-colors"
          />
        </div>

        {/* Guests & Search Button */}
        <div className="flex items-center gap-3">
          <div className="w-1/2">
            <label htmlFor="search-guests" className="block text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E]">
              Guests
            </label>
            <select
              id="search-guests"
              value={guests}
              onChange={(e) => updateGuests(Number(e.target.value))}
              aria-label="Number of guests"
              className="mt-1.5 w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3 py-2.5 text-xs text-[#0F2942] outline-none focus:border-[#2F7FC1] focus:ring-1 focus:ring-[#7CC8FF] transition-colors"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "Guest" : "Guests"}
                </option>
              ))}
            </select>
          </div>

          <div className="w-1/2 pt-5">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              aria-label="Search available hotels"
            >
              Search
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default SearchBar;
