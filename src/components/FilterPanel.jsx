import { useBookingContext } from "../context/BookingContext";

export function FilterPanel({
  maxPrice,
  setMaxPrice,
  minStars,
  setMinStars,
  selectedAmenities,
  setSelectedAmenities
}) {
  const { availability, setAvailability, resetFilters } = useBookingContext();

  const amenities = [
    "WiFi",
    "Swimming Pool",
    "Breakfast",
    "Spa",
    "Gym"
  ];

  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((item) => item !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  return (
    <aside className="border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
          Refine Search
        </p>
        <button
          type="button"
          onClick={resetFilters}
          className="text-[10px] tracking-[1px] uppercase font-semibold text-[#5A738E] hover:text-[#2F7FC1] transition-colors"
        >
          Reset
        </button>
      </div>

      <h3 className="mt-2 font-serif text-2xl text-[#0F2942]">
        Filters
      </h3>

      {/* AVAILABILITY FILTER (Experiment 1 b) */}
      <div className="mt-6 border-t border-[#D7E2EA] pt-5">
        <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E] block mb-2.5">
          Room Availability
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={availability === "available"}
            onChange={(e) => setAvailability(e.target.checked ? "available" : "all")}
            className="h-4 w-4 accent-[#2F7FC1]"
          />
          <span className="text-xs text-[#0F2942] font-medium">
            Available rooms only
          </span>
        </label>
      </div>

      {/* MAX PRICE FILTER */}
      <div className="mt-6 border-t border-[#D7E2EA] pt-5">
        <div className="flex justify-between items-baseline">
          <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E]">
            Max Price
          </label>
          <span className="text-sm font-semibold text-[#2F7FC1]">
            ₹{Number(maxPrice || 0).toLocaleString("en-IN")}
          </span>
        </div>

        <input
          type="range"
          min="3000"
          max="20000"
          step="500"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="mt-4 w-full accent-[#2F7FC1]"
        />

        <div className="mt-2 flex justify-between text-[10px] text-[#5A738E]">
          <span>₹3,000</span>
          <span>₹20,000</span>
        </div>
      </div>

      {/* STAR RATING */}
      <div className="mt-6 border-t border-[#D7E2EA] pt-5">
        <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E] block mb-2">
          Star Rating
        </label>

        <select
          value={minStars}
          onChange={(e) => setMinStars(Number(e.target.value))}
          className="w-full border border-[#D7E2EA] bg-[#F8FBFF] px-3.5 py-2 text-xs text-[#0F2942] outline-none focus:border-[#2F7FC1] focus:ring-1 focus:ring-[#7CC8FF] transition-colors"
        >
          <option value="0">All Hotels (3 - 5 Stars)</option>
          <option value="3">3 Stars & Above</option>
          <option value="4">4 Stars & Above</option>
          <option value="5">5 Stars Luxury Only</option>
        </select>
      </div>

      {/* AMENITIES */}
      <div className="mt-6 border-t border-[#D7E2EA] pt-5">
        <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E] block mb-3">
          Hotel Amenities
        </label>

        <div className="space-y-3">
          {amenities.map((amenity) => (
            <label
              key={amenity}
              className="flex cursor-pointer items-center gap-3 text-xs text-[#0F2942]"
            >
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="h-4 w-4 accent-[#2F7FC1]"
              />
              <span>{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default FilterPanel;