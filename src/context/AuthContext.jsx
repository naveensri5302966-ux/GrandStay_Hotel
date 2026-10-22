import { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState("");

  const isAuthenticated = Boolean(user && token);

  // Handle session expiration event dispatched by Axios interceptor on 401 response
  useEffect(() => {
    const handleSessionExpired = (e) => {
      setUser(null);
      setToken(null);
      setSessionExpiredMessage(e.detail?.message || "Your session has expired. Please sign in again.");
    };

    window.addEventListener("grandstay:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("grandstay:session-expired", handleSessionExpired);
    };
  }, []);

  // Login handler using REST API
  const login = useCallback(async (credentials) => {
    setSessionExpiredMessage("");
    const result = await authService.login(credentials);
    setUser(result.user);
    setToken(result.token);
    return result;
  }, []);

  // Signup / Register handler using REST API
  const signup = useCallback(async (userData) => {
    setSessionExpiredMessage("");
    const result = await authService.register(userData);
    setUser(result.user);
    setToken(result.token);
    return result;
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    setSessionExpiredMessage("");
  }, []);

  // Demonstration tool: trigger 401 simulation
  const simulateExpiredToken = useCallback(() => {
    authService.simulateExpiredToken();
    setToken("expired-token");
  }, []);

  const clearSessionMessage = useCallback(() => {
    setSessionExpiredMessage("");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        sessionExpiredMessage,
        clearSessionMessage,
        login,
        signup,
        logout,
        simulateExpiredToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
