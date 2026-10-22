import { Outlet, NavLink, useLocation, Link, Navigate } from "react-router-dom";
import { useBookingContext } from "../context/BookingContext";
import ErrorBoundary from "./common/ErrorBoundary";

export function BookingLayout() {
  const { selectedHotel, checkIn, checkOut, guests } = useBookingContext();
  const location = useLocation();

  if (location.pathname === "/booking" || location.pathname === "/booking/") {
    return <Navigate to="/booking/room" replace />;
  }

  // If no hotel is selected, prompt user to pick one
  if (!selectedHotel) {
    return (
      <main className="min-h-[70vh] bg-[#F8FBFF] px-5 py-20 text-center text-[#0F2942]">
        <div className="mx-auto max-w-lg border border-[#D7E2EA] bg-white p-12 rounded-sm shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#B7E3FF]/30 text-2xl text-[#2F7FC1]">
            📋
          </div>
          <p className="mt-5 text-[9px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
            Reservation Step
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#0F2942]">
            Your booking is empty
          </h2>
          <p className="mt-3 text-xs leading-6 text-[#5A738E]">
            You have not selected a hotel yet. Browse our luxury hotels and select a destination to begin your reservation.
          </p>
          <div className="mt-6">
            <Link
              to="/hotels"
              className="inline-block border border-[#2F7FC1] bg-[#2F7FC1] px-6 py-3 text-[10px] tracking-[2px] font-semibold uppercase text-white hover:bg-[#24659A] rounded-xs shadow-xs"
            >
              Explore Hotels
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const steps = [
    { path: "/booking/room", label: "1. Room Selection" },
    { path: "/booking/guest", label: "2. Guest Details" },
    { path: "/booking/summary", label: "3. Booking Summary" }
  ];

  return (
    <main className="min-h-screen bg-[#F8FBFF] pb-24 text-[#0F2942]">
      {/* Hotel Reservation Header Banner */}
      <section className="border-b border-[#D7E2EA] bg-white px-5 py-6 md:px-10 lg:px-16 shadow-xs">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[9px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
                Reserving at
              </p>
              <h1 className="font-serif text-2xl text-[#0F2942] md:text-3xl mt-0.5">
                {selectedHotel.name}
              </h1>
              <p className="text-xs text-[#5A738E] mt-1">
                {selectedHotel.location} • {"★".repeat(selectedHotel.stars)} • {checkIn} to {checkOut} ({guests} {guests === 1 ? "Guest" : "Guests"})
              </p>
            </div>

            <Link
              to={`/hotel/${selectedHotel.id}`}
              className="text-[9px] tracking-[2px] uppercase font-semibold text-[#2F7FC1] hover:text-[#1E527D]"
            >
              View Hotel Overview →
            </Link>
          </div>

          {/* Stepper Navigation */}
          <nav aria-label="Booking steps" className="mt-6 flex flex-wrap border-t border-[#D7E2EA]/60 pt-5 gap-3 sm:gap-6">
            {steps.map((step) => (
              <NavLink
                key={step.path}
                to={step.path}
                className={({ isActive }) =>
                  `text-[10px] tracking-[2px] uppercase pb-2 transition-all font-semibold border-b-2 ${
                    isActive
                      ? "border-[#2F7FC1] text-[#2F7FC1]"
                      : "border-transparent text-[#5A738E] hover:text-[#0F2942]"
                  }`
                }
              >
                {step.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </section>

      {/* Nested Route Body via Outlet */}
      <div className="mx-auto max-w-5xl px-5 pt-8 md:px-10">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
    </main>
  );
}

export default BookingLayout;
