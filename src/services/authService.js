import apiClient from "./apiClient";
import logger from "../utils/logger";

const TOKEN_KEY = "grand_stay_auth_token";
const USER_KEY = "grand_stay_auth_user";

/**
 * Auth Service (Experiment 4: Authentication and Token Management)
 * Topics: Authentication, Token Management, Protected APIs
 * 
 * Security Architecture Note:
 * - In production architectures, authentication tokens should preferably be stored in
 *   secure, HttpOnly, SameSite cookies managed by the backend to prevent XSS exfiltration.
 * - For client-rendered Single Page Application demonstrations, tokens are managed via
 *   browser storage with strict non-exposure of passwords and automatic 401 revocation.
 * - Passwords are NEVER persisted in browser storage.
 */
export const authService = {
  /**
   * User login using Authentication API (POST /auth/login)
   */
  async login(credentials) {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      const { token, user } = response;

      if (token) {
        this.setToken(token);
        this.setUser(user);
        logger.auth("Login successful");
      }
      return { token, user };
    } catch (error) {
      logger.auth(`Login failed: ${error.response?.data?.error || error.message}`, "error");
      throw error;
    }
  },

  /**
   * User registration using Authentication API (POST /auth/register)
   */
  async register(userData) {
    try {
      const response = await apiClient.post("/auth/register", userData);
      const { token, user } = response;

      if (token) {
        this.setToken(token);
        this.setUser(user);
        logger.auth("Registration successful");
      }
      return { token, user };
    } catch (error) {
      logger.auth(`Registration failed: ${error.response?.data?.error || error.message}`, "error");
      throw error;
    }
  },

  /**
   * Logout user and clear all sensitive credentials
   */
  logout() {
    this.removeToken();
    this.removeUser();
    logger.auth("Logout successful");
  },

  /**
   * Token and User storage helpers
   */
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn("Storage write error for token:", e);
    }
  },

  removeToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn("Storage remove error for token:", e);
    }
  },

  getUser() {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn("Storage write error for user:", e);
    }
  },

  removeUser() {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn("Storage remove error for user:", e);
    }
  },

  /**
   * Helper for demonstration: Simulate an expired token to test 401 handling & redirection
   */
  simulateExpiredToken() {
    try {
      localStorage.setItem(TOKEN_KEY, "expired-token-" + Date.now());
      logger.auth("Simulating expired token for demonstration...", "error");
    } catch (e) {
      console.warn("Could not simulate token expiry:", e);
    }
  }
};

export default authService;
