/**
 * Application Logger Utility
 * Provides structured, formatted development-only console output
 * matching exact lab experiment demonstration requirements.
 *
 * Examples of output:
 * [API] GET /hotels — started
 * [API] GET /hotels — success (200) [Mock Adapter]
 * [HOTELS] Loaded: 8
 * [SEARCH] Location: Chennai
 * [FILTER] Availability: available
 * [BOOKING] Hotel selected: The Grand Stay
 * [BOOKING] Room selected: Deluxe Room
 * [BOOKING] Stay duration: 3 nights
 * [BOOKING] Subtotal: ₹25500
 * [BOOKING] Tax: ₹3060
 * [BOOKING] Total: ₹29060
 * [RESERVATION] POST /reservations — started
 * [RESERVATION] POST /reservations — success (201) [Mock Adapter]
 * [AUTH] Login successful
 * [AUTH] Protected request authorized
 * [AUTH] Session expired — redirecting to login
 * [AUTH] Logout successful
 */

const isDev = import.meta.env.DEV !== false;

export const logger = {
  // REST API request and response logging
  api(method, url, status, isMock = false, extra = "") {
    if (!isDev) return;
    const tag = "[API]";
    const mockBadge = isMock ? " [Mock Adapter]" : " [Real Backend]";
    const extraInfo = extra ? ` (${extra})` : "";
    
    if (status === "started") {
      console.log(`%c${tag} ${method.toUpperCase()} ${url} — started`, "color: #2F7FC1; font-weight: bold;");
    } else if (typeof status === "number" && status >= 200 && status < 300) {
      console.log(
        `%c${tag} ${method.toUpperCase()} ${url} — success (${status})${mockBadge}${extraInfo}`,
        "color: #16A34A; font-weight: bold;"
      );
    } else if (status === "error" || (typeof status === "number" && status >= 400)) {
      console.warn(
        `%c${tag} ${method.toUpperCase()} ${url} — error (${status})${mockBadge}${extraInfo}`,
        "color: #DC2626; font-weight: bold;"
      );
    } else {
      console.log(`${tag} ${method.toUpperCase()} ${url} — ${status}${mockBadge}`);
    }
  },

  // Hotels catalog and query results
  hotels(count, extra = "") {
    if (!isDev) return;
    console.log(`%c[HOTELS] Loaded: ${count}${extra ? ` (${extra})` : ""}`, "color: #2F7FC1; font-weight: 600;");
  },

  // Search queries
  search(field, value) {
    if (!isDev) return;
    console.log(`%c[SEARCH] ${field}: ${value || "all"}`, "color: #0284C7; font-weight: 600;");
  },

  // Filters
  filter(field, value) {
    if (!isDev) return;
    console.log(`%c[FILTER] ${field}: ${Array.isArray(value) ? value.join(", ") || "none" : value}`, "color: #0284C7; font-weight: 600;");
  },

  // Booking actions and financial calculations
  booking(action, value) {
    if (!isDev) return;
    console.log(`%c[BOOKING] ${action}: ${value}`, "color: #7C3AED; font-weight: 600;");
  },

  // CRUD Reservation operations
  reservation(method, endpoint, status, isMock = false, details = "") {
    if (!isDev) return;
    const tag = "[RESERVATION]";
    const mockBadge = isMock ? " [Mock Adapter]" : " [Real Backend]";
    const detailsSuffix = details ? ` — ${details}` : "";

    if (status === "started") {
      console.log(`%c${tag} ${method.toUpperCase()} ${endpoint} — started`, "color: #2F7FC1; font-weight: bold;");
    } else if (typeof status === "number" && status >= 200 && status < 300) {
      console.log(
        `%c${tag} ${method.toUpperCase()} ${endpoint} — success (${status})${mockBadge}${detailsSuffix}`,
        "color: #16A34A; font-weight: bold;"
      );
    } else {
      console.warn(
        `%c${tag} ${method.toUpperCase()} ${endpoint} — error (${status})${mockBadge}${detailsSuffix}`,
        "color: #DC2626; font-weight: bold;"
      );
    }
  },

  // Authentication events
  auth(message, level = "info") {
    if (!isDev) return;
    const tag = "[AUTH]";
    if (level === "error" || message.includes("expired") || message.includes("Unauthorized")) {
      console.warn(`%c${tag} ${message}`, "color: #EA580C; font-weight: bold;");
    } else {
      console.log(`%c${tag} ${message}`, "color: #059669; font-weight: bold;");
    }
  },

  // General error logging
  error(tag, message, err) {
    if (!isDev) return;
    console.error(`%c[${tag}] ${message}`, "color: #DC2626; font-weight: bold;", err || "");
  }
};

export default logger;
