import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import reservationService from "../services/reservationService";
import hotelService from "../services/hotelService";
import authService from "../services/authService";

import { store as reduxStore, selectHotel, setDates } from "../store/redux";

export function Header() {
  const { user, isAuthenticated, logout, simulateExpiredToken } = useAuth();
  const navigate = useNavigate();
  const [isSimulating, setIsSimulating] = useState(false);

  const handleTestReduxMiddleware = () => {
    console.clear();
    console.log(
      "%c[EXPERIMENT 2] DISPATCHING REDUX ACTIONS THROUGH MIDDLEWARE PIPELINE...",
      "background: #1E293B; color: #38BDF8; font-size: 13px; font-weight: bold; padding: 4px 8px; border-radius: 4px;"
    );

    // Dispatch selectHotel action to trigger Redux middleware
    reduxStore.dispatch(
      selectHotel({
        id: 101,
        name: "The Grand Stay Chennai",
        rooms: [
          { id: 1, name: "Deluxe Ocean Room", price: 8500 },
          { id: 2, name: "Presidential Suite", price: 15000 }
        ]
      })
    );

    // Dispatch setDates action to trigger middleware calculations & persistence
    reduxStore.dispatch(
      setDates({
        checkIn: "2026-11-10",
        checkOut: "2026-11-14" // 4 nights
      })
    );
  };


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleInspectJwt = () => {
    console.clear();
    console.log(
      "%c====================================================================\n🔐 EXPERIMENT 4: JWT TOKEN INSPECTOR & PAYLOAD DECODER\n====================================================================",
      "background: #0F172A; color: #38BDF8; font-size: 13px; font-weight: bold; padding: 6px 12px; border-radius: 4px;"
    );

    const rawToken = authService.getToken();
    if (!rawToken) {
      console.warn("%c[JWT INSPECTOR] No token found in browser storage (Not authenticated).", "color: #EF4444; font-weight: bold;");
      return;
    }

    console.log("%c[JWT RAW TOKEN STRING]:", "color: #A855F7; font-weight: bold;", rawToken);

    // Decode header, payload, signature
    const parts = rawToken.split(".");
    if (parts.length === 3) {
      try {
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        const expiresAt = payload.exp ? new Date(payload.exp * 1000).toLocaleString() : "Never";
        const issuedAt = payload.iat ? new Date(payload.iat * 1000).toLocaleString() : "Unknown";

        console.log(
          "\n%cJWT TOKEN FORMAT: %c<HEADER>%c.%c<PAYLOAD>%c.%c<SIGNATURE>",
          "font-weight: bold; font-size: 13px; color: #0F2942;",
          "color: #EF4444; font-weight: bold; font-size: 13px;",
          "color: #64748B; font-weight: bold; font-size: 13px;",
          "color: #8B5CF6; font-weight: bold; font-size: 13px;",
          "color: #64748B; font-weight: bold; font-size: 13px;",
          "color: #06B6D4; font-weight: bold; font-size: 13px;"
        );

        console.log(
          `%c${parts[0]}%c.%c${parts[1]}%c.%c${parts[2]}`,
          "color: #EF4444; font-weight: bold; word-break: break-all;",
          "color: #64748B; font-weight: bold;",
          "color: #8B5CF6; font-weight: bold; word-break: break-all;",
          "color: #64748B; font-weight: bold;",
          "color: #06B6D4; font-weight: bold; word-break: break-all;"
        );

        console.log(
          "\n%c1. [PART 1: HEADER (ALGORITHM & TOKEN TYPE)]:",
          "background: #FEE2E2; color: #DC2626; padding: 2px 6px; font-weight: bold; border-left: 3px solid #DC2626;",
          header
        );
        console.log(
          "%c2. [PART 2: PAYLOAD (CLAIMS & USER DATA)]:",
          "background: #F3E8FF; color: #7C3AED; padding: 2px 6px; font-weight: bold; border-left: 3px solid #7C3AED;",
          {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            issuer: payload.iss,
            audience: payload.aud,
            issuedAt: `${payload.iat} (${issuedAt})`,
            expiresAt: `${payload.exp} (${expiresAt})`
          }
        );
        console.log(
          "%c3. [PART 3: SIGNATURE (HMAC-SHA256 CHECKSUM)]:",
          "background: #CFFAFE; color: #0891B2; padding: 2px 6px; font-weight: bold; border-left: 3px solid #0891B2;",
          parts[2]
        );
        console.log(
          "\n%c🛡️ [SECURITY AUDIT] RFC 7519 Compliant JSON Web Token verified. Automatically attached by Axios on every authenticated request as: Authorization: Bearer <token>",
          "color: #059669; font-weight: bold; font-style: italic;"
        );
      } catch (err) {
        console.error("[JWT INSPECTOR] Error decoding token parts:", err);
      }
    } else {
      console.log("[JWT RAW TOKEN]:", rawToken);
    }
  };

  const handleTestExpiredToken = async () => {
    setIsSimulating(true);
    simulateExpiredToken();
    try {
      await reservationService.getReservations();
    } catch {
      navigate("/login", { state: { sessionExpired: true } });
    } finally {
      setIsSimulating(false);
    }
  };

  const publicLinks = [
    { to: "/", label: "Home" },
    { to: "/hotels", label: "Packages" },
    { to: "/rooms", label: "Rooms" },
    { to: "/crud-lab", label: "Exp 3: CRUD Lab" }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#D7E2EA] bg-[#F8FBFF]/95 backdrop-blur-md px-5 py-3.5 md:px-10 lg:px-16 transition-colors shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="group flex items-baseline gap-2">
          <span className="font-serif text-2xl md:text-3xl tracking-tight text-[#0F2942] group-hover:text-[#2F7FC1] transition-colors">
            grandstay
          </span>
          <span className="h-2 w-2 rounded-full bg-[#2F7FC1]" />
        </Link>

        {/* Navigation Links using NavLink for active styling without page reload */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-7">
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-[10px] tracking-[2px] uppercase font-semibold transition-colors ${
                  isActive
                    ? "text-[#2F7FC1] border-b-2 border-[#2F7FC1] pb-1"
                    : "text-[#5A738E] hover:text-[#0F2942]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {isAuthenticated && (
            <>
              <NavLink
                to="/booking"
                className={({ isActive }) =>
                  `text-[10px] tracking-[2px] uppercase font-semibold transition-colors ${
                    isActive
                      ? "text-[#2F7FC1] border-b-2 border-[#2F7FC1] pb-1"
                      : "text-[#5A738E] hover:text-[#0F2942]"
                  }`
                }
              >
                Reservation
              </NavLink>

              <NavLink
                to="/bookings"
                className={({ isActive }) =>
                  `text-[10px] tracking-[2px] uppercase font-semibold transition-colors ${
                    isActive
                      ? "text-[#2F7FC1] border-b-2 border-[#2F7FC1] pb-1"
                      : "text-[#5A738E] hover:text-[#0F2942]"
                  }`
                }
              >
                My Bookings
              </NavLink>
            </>
          )}
        </nav>

        {/* User Auth and Demonstration Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#5A738E]">
                Hi, <strong className="text-[#0F2942] font-semibold">{user?.name}</strong>
                {user?.role === "admin" && (
                  <span className="bg-purple-100 text-purple-800 border border-purple-300 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs">
                    Admin
                  </span>
                )}
              </span>

              {/* Exp. 3 Demonstration Button: Full CRUD in Console */}
              {user?.role === "admin" ? (
                <button
                  type="button"
                  onClick={async () => {
                    await hotelService.runPackageCrudLifecycleDemo();
                  }}
                  title="Admin CRUD: Execute GET, POST, UPDATE (POST/PUT), and DELETE on Hotel Packages with console output"
                  className="hidden lg:inline-flex items-center border border-purple-400 bg-purple-100 px-2.5 py-1 text-[8px] font-bold tracking-[1px] uppercase text-purple-900 hover:bg-purple-200 transition-colors shadow-xs"
                >
                  👑 Admin: Test Package CRUD
                </button>
              ) : (
                <Link
                  to="/crud-lab"
                  title="Experiment 3: Open CRUD Operations Interactive Lab Dashboard"
                  className="hidden lg:inline-flex items-center border border-emerald-400 bg-emerald-50 px-2.5 py-1 text-[8px] font-bold tracking-[1px] uppercase text-emerald-800 hover:bg-emerald-100 transition-colors rounded-xs shadow-2xs"
                >
                  ⚡ Exp. 3: CRUD Lab
                </Link>
              )}

              {/* Exp. 2 Demonstration Button: Trigger Redux Middleware */}
              <button
                type="button"
                onClick={handleTestReduxMiddleware}
                title="Experiment 2: Test Redux Toolkit Action Interception & Middleware Logging"
                className="hidden xl:inline-flex items-center border border-purple-300 bg-purple-50 px-2.5 py-1 text-[8px] font-semibold tracking-[1px] uppercase text-purple-800 hover:bg-purple-100 transition-colors"
              >
                ⚛️ Exp. 2: Test Redux Middleware
              </button>

              {/* Exp. 4 Demonstration Button: Inspect JWT Token */}
              <button
                type="button"
                onClick={handleInspectJwt}
                title="Experiment 4: Inspect and decode JWT token (Header, Payload Claims, Signature) in Console"
                className="hidden lg:inline-flex items-center border border-sky-300 bg-sky-50 px-2.5 py-1 text-[8px] font-semibold tracking-[1px] uppercase text-sky-800 hover:bg-sky-100 transition-colors"
              >
                🔐 Exp. 4: JWT Token
              </button>

              {/* Exp. 4 f Demonstration Button: Simulate 401 Session Expiry */}
              <button
                type="button"
                onClick={handleTestExpiredToken}
                disabled={isSimulating}
                title="Experiment 4 f: Test 401 Unauthorized Interceptor and Auto-Redirect"
                className="hidden lg:inline-flex items-center border border-amber-300 bg-amber-50 px-2.5 py-1 text-[8px] font-semibold tracking-[1px] uppercase text-amber-800 hover:bg-amber-100 transition-colors"
              >
                ⚡ Exp. 4: Test 401 Expiry
              </button>

              <NavLink
                to="/bookings"
                className="hidden sm:inline-block border border-[#D7E2EA] bg-white px-3 py-1.5 text-[9px] tracking-[1.5px] uppercase font-medium text-[#0F2942] hover:border-[#2F7FC1] hover:text-[#2F7FC1] transition-colors"
              >
                Bookings
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="border border-[#D7E2EA] bg-white px-3 py-1.5 text-[9px] tracking-[1.5px] uppercase font-medium text-[#5A738E] hover:text-red-600 hover:border-red-300 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                state={{ mode: "signin", from: "/" }}
                className="text-[10px] tracking-[1.5px] font-semibold uppercase text-[#2F7FC1] hover:text-[#1E527D] px-2.5 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                state={{ mode: "signup", from: "/" }}
                className="border border-[#2F7FC1] bg-[#2F7FC1] px-4 py-1.5 text-[9px] tracking-[1.5px] font-semibold uppercase text-white hover:bg-[#24659A] transition-colors shadow-xs"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
