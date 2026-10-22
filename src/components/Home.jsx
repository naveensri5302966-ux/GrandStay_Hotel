import { Link } from "react-router-dom";
import { useBookingContext } from "../context/BookingContext";
import SearchBar from "./SearchBar";
import HotelCard from "./HotelCard";
import Button from "./common/Button";

export function Home() {
  const { hotels, selectHotel } = useBookingContext();
  const featuredHotels = hotels.slice(0, 3);

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-[#0F2942]">
      {/* Hero Section */}
      <section className="relative px-5 pt-12 pb-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 border border-[#B7E3FF] bg-[#B7E3FF]/30 px-3 py-1 rounded-full text-[9px] font-bold tracking-[2px] uppercase text-[#2F7FC1] mb-4">
                <span>✦</span> Scenario 4: Hotel Room Booking Web Application
              </div>

              <h1 className="mt-2 font-serif text-4xl sm:text-6xl lg:text-7xl leading-[1.08] text-[#0F2942]">
                Curated stays for unforgettable moments.
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-[#5A738E]">
                Immerse yourself in luxury retreats across India with REST API hotel fetching,
                global state management via Zustand, full CRUD reservation lifecycle, and token-protected endpoints.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/hotels">
                  <Button variant="primary" size="lg">
                    Search & Book Hotels →
                  </Button>
                </Link>
                <Link to="/rooms">
                  <Button variant="outline" size="lg">
                    Browse Rooms & Suites
                  </Button>
                </Link>
              </div>

              {/* Four Experiments Indicator Pills */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[8px] font-bold tracking-[1px] uppercase">
                <div className="border border-[#D7E2EA] bg-white p-2 rounded-xs">
                  <span className="text-[#2F7FC1] block">Exp. 1</span> REST APIs
                </div>
                <div className="border border-[#D7E2EA] bg-white p-2 rounded-xs">
                  <span className="text-[#2F7FC1] block">Exp. 2</span> Zustand State
                </div>
                <div className="border border-[#D7E2EA] bg-white p-2 rounded-xs">
                  <span className="text-[#2F7FC1] block">Exp. 3</span> CRUD Booking
                </div>
                <div className="border border-[#D7E2EA] bg-white p-2 rounded-xs">
                  <span className="text-[#2F7FC1] block">Exp. 4</span> Auth & Tokens
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="relative">
              <div className="h-[400px] md:h-[480px] w-full overflow-hidden border border-[#D7E2EA] rounded-sm shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
                  alt="Luxury Hotel Exterior"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 hidden sm:block bg-white p-5 border border-[#D7E2EA] rounded-sm shadow-lg max-w-xs">
                <span className="text-[9px] tracking-[1.5px] uppercase font-bold text-[#2F7FC1] block">
                  Best Rate & Token Security
                </span>
                <p className="mt-1 font-serif text-base text-[#0F2942]">
                  Direct REST API privileges with flexible cancellations.
                </p>
              </div>
            </div>
          </div>

          {/* Integrated Search Bar */}
          <div className="mt-14">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="border-t border-[#D7E2EA] bg-white px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between pb-10 gap-4">
            <div>
              <p className="text-[9px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
                Signature Destinations
              </p>
              <h2 className="mt-1 font-serif text-3xl md:text-4xl text-[#0F2942]">
                Featured Properties
              </h2>
            </div>

            <Link
              to="/hotels"
              className="text-[10px] tracking-[2px] uppercase font-bold text-[#2F7FC1] hover:text-[#1E527D]"
            >
              View All {hotels.length} Properties →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                viewDetails={selectHotel}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features & Guarantees */}
      <section className="border-t border-[#D7E2EA] bg-[#F8FBFF] px-5 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-2xs">
              <span className="text-2xl text-[#2F7FC1]">🌐</span>
              <h3 className="mt-3 font-serif text-lg text-[#0F2942]">
                REST API Integration
              </h3>
              <p className="mt-1.5 text-xs leading-5 text-[#5A738E]">
                Axios client with interceptors for bearer tokens, live query filtering, and automatic mock fallback.
              </p>
            </div>

            <div className="border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-2xs">
              <span className="text-2xl text-[#2F7FC1]">⚡</span>
              <h3 className="mt-3 font-serif text-lg text-[#0F2942]">
                Zustand State & Logger
              </h3>
              <p className="mt-1.5 text-xs leading-5 text-[#5A738E]">
                Global store tracking stays, calculating 12% GST and duration, with action-logging middleware.
              </p>
            </div>

            <div className="border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-2xs">
              <span className="text-2xl text-[#2F7FC1]">📑</span>
              <h3 className="mt-3 font-serif text-lg text-[#0F2942]">
                Full CRUD Lifecycle
              </h3>
              <p className="mt-1.5 text-xs leading-5 text-[#5A738E]">
                POST reservations, GET history, PUT modifications, and DELETE cancellations with live status updates.
              </p>
            </div>

            <div className="border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-2xs">
              <span className="text-2xl text-[#2F7FC1]">🛡️</span>
              <h3 className="mt-3 font-serif text-lg text-[#0F2942]">
                Auth & Token Guard
              </h3>
              <p className="mt-1.5 text-xs leading-5 text-[#5A738E]">
                Protected routes, token injection, automatic 401 session expiry handling, and secure logout.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
