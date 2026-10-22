import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useBookingContext } from "../context/BookingContext";
import hotelService from "../services/hotelService";
import RoomSelection from "./RoomSelection";
import Button from "./common/Button";
import Loading from "./common/Loading";

export function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedHotel,
    selectHotel,
    selectedRoom,
    selectRoom
  } = useBookingContext();

  const [hotel, setHotel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch individual hotel details using REST API (Experiment 1 d)
  useEffect(() => {
    let isMounted = true;

    hotelService
      .getHotelById(id)
      .then((data) => {
        if (isMounted) {
          setHotel(data);
          if (!selectedHotel || selectedHotel.id !== data.id) {
            selectHotel(data);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.error || "Could not retrieve hotel details from API");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, selectHotel, selectedHotel]);

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center bg-[#F8FBFF] px-6 py-20">
        <Loading message={`Fetching hotel #${id} from REST API...`} />
      </main>
    );
  }

  // Error / Not Found state
  if (error || !hotel) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center bg-[#F8FBFF] px-6 py-20 text-center">
        <div className="max-w-md border border-[#D7E2EA] bg-white p-10 rounded-sm shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600 border border-red-200">
            🏨
          </div>
          <p className="mt-5 text-[9px] font-semibold tracking-[3px] uppercase text-red-600">
            404 — Not Found
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#0F2942]">
            Hotel Not Found
          </h2>
          <p className="mt-3 text-xs leading-6 text-[#5A738E]">
            {error || `We could not find any hotel corresponding to ID #${id}.`}
          </p>
          <div className="mt-6">
            <Link to="/hotels">
              <Button variant="primary">Return to Hotels</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const handleStartBooking = () => {
    if (!selectedRoom && hotel.rooms?.length > 0) {
      selectRoom(hotel.rooms[0]);
    }
    navigate("/booking/room");
  };

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-[#0F2942]">
      {/* Breadcrumb / Top Bar */}
      <section className="border-b border-[#D7E2EA] bg-white px-5 py-3.5 md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-[#5A738E]">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-[#2F7FC1] transition-colors">Home</Link>
            <span>/</span>
            <Link to="/hotels" className="hover:text-[#2F7FC1] transition-colors">Hotels</Link>
            <span>/</span>
            <span className="font-semibold text-[#0F2942]">{hotel.name}</span>
          </div>

          <Link
            to="/hotels"
            className="text-[9px] tracking-[2px] uppercase font-semibold text-[#2F7FC1] hover:text-[#1E527D]"
          >
            ← All Hotels
          </Link>
        </div>
      </section>

      {/* Hero Image Section */}
      <section className="mx-auto max-w-7xl px-5 pt-8 md:px-10 lg:px-16">
        <div className="relative h-[360px] w-full overflow-hidden bg-[#B7E3FF]/20 md:h-[480px] rounded-sm shadow-sm border border-[#D7E2EA]">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-6 left-6 bg-[#0F2942]/90 px-4 py-2 backdrop-blur-xs rounded-xs">
            <span className="text-sm tracking-[3px] text-amber-300">
              {"★".repeat(hotel.stars)}
            </span>
          </div>
          <div className="absolute bottom-6 right-6 bg-white/95 px-5 py-3 shadow-md backdrop-blur-xs rounded-xs border border-[#D7E2EA]">
            <span className="text-[9px] tracking-[1.5px] uppercase font-semibold text-[#5A738E] block">
              Starting from
            </span>
            <span className="font-serif text-3xl font-bold text-[#0F2942]">
              ₹{hotel.price?.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-[#5A738E]"> / night</span>
          </div>
        </div>
      </section>

      {/* Hotel Details & Info Header */}
      <section className="mx-auto max-w-7xl px-5 pt-8 md:px-10 lg:px-16">
        <div className="border border-[#D7E2EA] bg-white p-8 md:p-12 rounded-sm shadow-xs">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div className="max-w-3xl">
              <p className="text-[9px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
                {hotel.location} • {hotel.stars}-STAR RESIDENCE (ID: {hotel.id})
              </p>
              <h1 className="mt-2 font-serif text-3xl md:text-5xl leading-tight text-[#0F2942]">
                {hotel.name}
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#5A738E]">
                {hotel.description}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartBooking}
              >
                Reserve This Hotel →
              </Button>
              <span className="text-center text-[10px] text-[#5A738E]">
                Instant REST API booking & free cancellations
              </span>
            </div>
          </div>

          {/* Amenities Grid */}
          <div className="mt-8 border-t border-[#D7E2EA]/60 pt-6">
            <p className="text-[9px] font-semibold tracking-[2px] uppercase text-[#2F7FC1]">
              Included Amenities & Hotel Services
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {hotel.amenities?.map((amenity) => (
                <span
                  key={amenity}
                  className="border border-[#D7E2EA] bg-[#B7E3FF]/25 px-3 py-1.5 text-xs text-[#0F2942] font-medium rounded-xs"
                >
                  ✓ {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Room Selection Section */}
      <RoomSelection onContinue={() => navigate("/booking/guest")} />
    </main>
  );
}

export default HotelDetailPage;
