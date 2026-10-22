import { Link, useNavigate } from "react-router-dom";
import { useBookingContext } from "../context/BookingContext";

export function HotelCard({ hotel, viewDetails, onEdit, onDelete }) {
  const navigate = useNavigate();
  const { selectHotel } = useBookingContext();

  const handleSelect = () => {
    if (selectHotel) {
      selectHotel(hotel);
    }
    if (viewDetails) {
      viewDetails(hotel);
    }
    navigate(`/hotel/${hotel.id}`);
  };

  const hasAvailableRoom = hotel.rooms ? hotel.rooms.some((r) => r.available !== false) : true;

  return (
    <article className="group flex flex-col border border-[#D7E2EA] bg-white transition duration-300 hover:border-[#2F7FC1] hover:shadow-md rounded-sm overflow-hidden">
      {/* Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-[#B7E3FF]/20">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-[#0F2942]/85 px-2.5 py-1 backdrop-blur-xs rounded-xs">
          <span className="text-[11px] tracking-[1.5px] text-amber-300">
            {"★".repeat(hotel.stars)}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 text-[8px] font-semibold tracking-[1.5px] uppercase text-[#2F7FC1] shadow-xs rounded-xs">
          {hotel.location}
        </div>
        {hasAvailableRoom ? (
          <div className="absolute bottom-3 left-3 bg-emerald-600/90 text-white px-2 py-0.5 text-[8px] font-semibold tracking-[1px] uppercase rounded-xs">
            ✓ Available
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 bg-red-600/90 text-white px-2 py-0.5 text-[8px] font-semibold tracking-[1px] uppercase rounded-xs">
            Sold Out
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <p className="text-[9px] tracking-[2px] uppercase font-semibold text-[#2F7FC1]">
            {hotel.location} • {hotel.stars}-STAR RESIDENCE
          </p>

          <h3 className="mt-1.5 font-serif text-2xl text-[#0F2942]">
            <Link
              to={`/hotel/${hotel.id}`}
              onClick={handleSelect}
              className="transition hover:text-[#2F7FC1]"
            >
              {hotel.name}
            </Link>
          </h3>

          <p className="mt-2 text-xs leading-5 text-[#5A738E] line-clamp-2">
            {hotel.description}
          </p>

          {/* Amenities Pills */}
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {hotel.amenities?.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="border border-[#D7E2EA] bg-[#B7E3FF]/25 px-2.5 py-0.5 text-[10px] font-medium text-[#0F2942] rounded-xs"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & Call to Action */}
        <div className="mt-5 flex items-end justify-between border-t border-[#D7E2EA]/60 pt-4">
          <div>
            <span className="text-[9px] tracking-[1px] uppercase text-[#5A738E] block">
              Starting from
            </span>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="font-serif text-2xl font-bold text-[#0F2942]">
                ₹{hotel.price.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] text-[#5A738E]">/ night</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(hotel)}
                title="Edit Hotel Package (Admin)"
                className="border border-amber-300 bg-amber-50 px-2 py-1.5 text-[8px] tracking-[1px] font-bold uppercase text-amber-800 transition hover:bg-amber-100 rounded-xs"
              >
                ✏️ Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(hotel)}
                title="Delete Hotel Package (Admin)"
                className="border border-red-300 bg-red-50 px-2 py-1.5 text-[8px] tracking-[1px] font-bold uppercase text-red-800 transition hover:bg-red-100 rounded-xs"
              >
                🗑️
              </button>
            )}
            {viewDetails ? (
              <button
                type="button"
                onClick={() => {
                  handleSelect();
                  viewDetails(hotel);
                }}
                className="border border-[#2F7FC1] bg-[#2F7FC1] px-3.5 py-2 text-[9px] tracking-[1.5px] font-semibold uppercase text-white transition hover:bg-[#24659A] rounded-xs shadow-xs"
              >
                View Details
              </button>
            ) : (
              <Link
                to={`/hotel/${hotel.id}`}
                onClick={handleSelect}
                className="border border-[#2F7FC1] bg-[#2F7FC1] px-3.5 py-2 text-[9px] tracking-[1.5px] font-semibold uppercase text-white transition hover:bg-[#24659A] rounded-xs shadow-xs"
              >
                Details
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default HotelCard;
