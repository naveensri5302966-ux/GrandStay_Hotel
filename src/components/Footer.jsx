import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="border-t border-[#D7E2EA] bg-[#F8FBFF] px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-3 md:items-end">
          {/* BRAND */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl text-[#2F7FC1]">
                grandstay
              </span>
              <span className="h-2 w-2 rounded-full bg-[#7CC8FF]" />
            </div>
            <p className="mt-3 max-w-xs text-xs leading-6 text-[#5A738E]">
              Luxurious stays designed for meaningful experiences, seamless reservations, and premier hospitality.
            </p>
          </div>

          {/* LINKS */}
          <div className="flex flex-wrap gap-6 md:justify-center">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="text-[9px] tracking-[2px] font-semibold text-[#5A738E] hover:text-[#2F7FC1] transition-colors"
                >
                  HOME
                </Link>
                <Link
                  to="/hotels"
                  className="text-[9px] tracking-[2px] font-semibold text-[#5A738E] hover:text-[#2F7FC1] transition-colors"
                >
                  HOTELS
                </Link>
                <Link
                  to="/rooms"
                  className="text-[9px] tracking-[2px] font-semibold text-[#5A738E] hover:text-[#2F7FC1] transition-colors"
                >
                  ROOMS
                </Link>
                <Link
                  to="/bookings"
                  className="text-[9px] tracking-[2px] font-semibold text-[#5A738E] hover:text-[#2F7FC1] transition-colors"
                >
                  MY BOOKINGS
                </Link>
              </>
            ) : (
              <span className="text-[10px] tracking-[2px] uppercase text-[#5A738E]">
                Boutique Hospitality & Hotel Reservations
              </span>
            )}
          </div>

          {/* COPYRIGHT */}
          <div className="text-left md:text-right">
            <p className="text-[9px] tracking-[2px] text-[#5A738E]">
              © 2026 THE GRAND STAY • SCENARIO 4
            </p>
            <p className="text-[8px] tracking-[1.5px] uppercase text-[#2F7FC1] mt-1 font-medium">
              REST APIs • Zustand • CRUD • Authentication
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;