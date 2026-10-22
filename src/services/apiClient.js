import axios from "axios";
import logger from "../utils/logger";
import { mockApiAdapter } from "./mockApiAdapter";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
// Use mock adapter ONLY if explicitly enabled via environment variable
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";

export const isMockMode = () => USE_MOCK;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  },
  timeout: 10000
});

// Explicit mock adapter override only when configured
if (USE_MOCK) {
  apiClient.defaults.adapter = async (config) => {
    return mockApiAdapter(config);
  };
}

// Request Interceptor: Attach Auth Token and log start
apiClient.interceptors.request.use(
  (config) => {
    const method = (config.method || "get").toUpperCase();
    const url = config.url || "";
    const isMock = USE_MOCK || Boolean(config.adapter && config.adapter !== axios.defaults.adapter);

    logger.api(method, url, "started", isMock);

    // Retrieve token safely from storage
    const token = localStorage.getItem("grand_stay_auth_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      logger.auth("Protected request authorized");
    }

    return config;
  },
  (error) => {
    logger.error("API", "Request setup error", error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Log success / handle 401 and errors
apiClient.interceptors.response.use(
  (response) => {
    const method = (response.config.method || "get").toUpperCase();
    const url = response.config.url || "";
    const status = response.status;
    const isMock = response.isMock || USE_MOCK;

    logger.api(method, url, status, isMock);

    // Return the response payload directly for developer convenience
    return response.data;
  },
  async (error) => {
    const config = error.config || {};
    const method = (config.method || "GET").toUpperCase();
    const url = config.url || "";
    const status = error.response ? error.response.status : null;
    const isMock = USE_MOCK;

    if (status === 401) {
      logger.auth("Session expired — redirecting to login", "error");
      localStorage.removeItem("grand_stay_auth_token");
      localStorage.removeItem("grand_stay_auth_user");

      // Notify application of session expiration without infinite reload
      window.dispatchEvent(
        new CustomEvent("grandstay:session-expired", {
          detail: { message: "Session expired. Please log in again." }
        })
      );
    } else if (!error.response && (error.code === "ERR_NETWORK" || error.message?.includes("Network Error"))) {
      logger.error("API", `Network error connecting to backend at ${BASE_URL}${url}. Check if the server is running on port 5000.`, error);
      
      // Keep mock mode available as an explicitly labelled fallback only if offline fallback is enabled
      if (import.meta.env.VITE_ENABLE_OFFLINE_FALLBACK === "true" || window.__FORCE_MOCK_FALLBACK__) {
        logger.api(method, url, "fallback (200)", true, "Mock Adapter Fallback - Server Offline");
        const fallbackRes = await mockApiAdapter(config);
        return fallbackRes.data;
      }
    } else {
      logger.api(method, url, status || "Network Error", isMock);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
