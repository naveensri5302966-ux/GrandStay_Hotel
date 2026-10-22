import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "./common/Input";
import Button from "./common/Button";

export function Login() {
  const { login, signup, isAuthenticated, sessionExpiredMessage, clearSessionMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: "signin" or "signup"
  const [mode, setMode] = useState(location.state?.mode === "signup" ? "signup" : "signin");

  // Controlled form state
  const [formData, setFormData] = useState({
    fullName: "Eleanor Vance",
    emailOrUsername: "eleanor.vance@example.com",
    email: "eleanor.vance@example.com",
    phone: "9876543210",
    password: "Password@123",
    confirmPassword: "Password@123"
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const redirectTarget =
    location.state?.from && location.state.from !== "/login"
      ? location.state.from
      : "/";

  // Form validation
  const validate = () => {
    const errs = {};

    if (mode === "signin") {
      if (!formData.emailOrUsername.trim()) {
        errs.emailOrUsername = "Email or username is required.";
      } else if (
        formData.emailOrUsername.includes("@") &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailOrUsername.trim())
      ) {
        errs.emailOrUsername = "Please enter a valid email address.";
      }

      if (!formData.password) {
        errs.password = "Password is required.";
      } else if (formData.password.length < 6) {
        errs.password = "Password must be at least 6 characters.";
      }
    } else {
      if (!formData.fullName.trim()) {
        errs.fullName = "Full name is required.";
      } else if (formData.fullName.trim().length < 2) {
        errs.fullName = "Full name must be at least 2 characters.";
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        errs.email = "Email address is required.";
      } else if (!emailRegex.test(formData.email.trim())) {
        errs.email = "Please enter a valid email address.";
      }

      const cleanPhone = formData.phone.replace(/[\s-]/g, "");
      if (!cleanPhone.trim()) {
        errs.phone = "Phone number is required.";
      } else if (!/^[0-9]{10}$/.test(cleanPhone)) {
        errs.phone = "Phone number must be exactly 10 digits.";
      }

      if (!formData.password) {
        errs.password = "Password is required.";
      } else if (formData.password.length < 6) {
        errs.password = "Password must be at least 6 characters.";
      }

      if (formData.confirmPassword !== formData.password) {
        errs.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) {
      setApiError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      if (mode === "signin") {
        // Authenticate via REST API (POST /auth/login)
        await login({
          email: formData.emailOrUsername.includes("@")
            ? formData.emailOrUsername
            : `${formData.emailOrUsername}@grandstay.com`,
          username: formData.emailOrUsername,
          password: formData.password
        });
      } else {
        // Register via REST API (POST /auth/register)
        await signup({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password
        });
      }

      if (clearSessionMessage) {
        clearSessionMessage();
      }

      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.error || err.message || "Authentication request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center bg-[#F8FBFF] px-5 py-14 text-[#0F2942]">
      <div className="w-full max-w-md border border-[#D7E2EA] bg-white p-8 sm:p-10 shadow-sm rounded-sm">
        {/* Header Tabs: Sign In / Sign Up */}
        <div className="flex border-b border-[#D7E2EA] mb-8">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrors({});
              setApiError("");
            }}
            className={`flex-1 py-3 text-[10px] font-bold tracking-[2px] uppercase transition-colors border-b-2 ${
              mode === "signin"
                ? "border-[#2F7FC1] text-[#2F7FC1]"
                : "border-transparent text-[#5A738E] hover:text-[#0F2942]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrors({});
              setApiError("");
            }}
            className={`flex-1 py-3 text-[10px] font-bold tracking-[2px] uppercase transition-colors border-b-2 ${
              mode === "signup"
                ? "border-[#2F7FC1] text-[#2F7FC1]"
                : "border-transparent text-[#5A738E] hover:text-[#0F2942]"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="text-center">
          <p className="text-[9px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
            {mode === "signin" ? "REST API Authentication" : "Member Registration"}
          </p>
          <h1 className="mt-1.5 font-serif text-3xl text-[#0F2942]">
            {mode === "signin" ? "Sign In to Reserve" : "Create an Account"}
          </h1>
          <p className="mt-2 text-xs leading-5 text-[#5A738E]">
            {mode === "signin"
              ? "Sign in to access hotel searches, suite reservations, and token-protected booking operations."
              : "Register to unlock member privileges, save reservations, and manage stay history."}
          </p>
        </div>

        {/* Expired Session / 401 Alert */}
        {(sessionExpiredMessage || location.state?.sessionExpired) && (
          <div className="mt-5 border border-amber-300 bg-amber-50 p-3 text-center text-xs text-amber-800 rounded-xs">
            ⚡ <strong>Session Expired (401 Unauthorized):</strong> Your authorization token was revoked or expired. Please sign in again.
          </div>
        )}

        {/* Protected Route Redirect Notice */}
        {location.state?.from && location.state.from !== "/" && !sessionExpiredMessage && (
          <div className="mt-5 border border-[#B7E3FF] bg-[#B7E3FF]/20 p-3 text-center text-xs text-[#0F2942] rounded-xs">
            🔒 Authentication required to access <strong>{location.state.from}</strong>. Please sign in to proceed.
          </div>
        )}

        {/* API Error Notification */}
        {apiError && (
          <div className="mt-5 border border-red-300 bg-red-50 p-3 text-center text-xs text-red-700 rounded-xs">
            ⚠ {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signin" ? (
            <>
              <Input
                label="Email or Username"
                name="emailOrUsername"
                required
                value={formData.emailOrUsername}
                onChange={handleChange}
                placeholder="e.g. eleanor.vance@example.com"
                error={errors.emailOrUsername}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
              />

              <div className="flex items-center justify-between text-xs text-[#5A738E] pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-3.5 w-3.5 accent-[#2F7FC1]"
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-[#2F7FC1] hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
            </>
          ) : (
            <>
              <Input
                label="Full Name"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Eleanor Vance"
                error={errors.fullName}
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. eleanor@example.com"
                error={errors.email}
              />

              <Input
                label="Phone Number (10 Digits)"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                error={errors.phone}
              />

              <Input
                label="Password (min 6 chars)"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.confirmPassword}
              />
            </>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full"
            >
              {mode === "signin" ? "Sign In & Access Hotels →" : "Create Account & Access Hotels →"}
            </Button>
          </div>
        </form>

        <div className="mt-6 border-t border-[#D7E2EA]/60 pt-5 text-center text-xs text-[#5A738E]">
          {mode === "signin" ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrors({});
                  setApiError("");
                }}
                className="text-[#2F7FC1] font-semibold hover:underline"
              >
                Sign Up for free
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrors({});
                  setApiError("");
                }}
                className="text-[#2F7FC1] font-semibold hover:underline"
              >
                Sign In to existing account
              </button>
            </p>
          )}
        </div>

        {/* Demo Accounts Quick-Select for Lab Evaluation */}
        <div className="mt-8 border border-[#D7E2EA] bg-[#F8FBFF] p-4 rounded-sm text-xs">
          <p className="text-[9px] font-semibold tracking-[2px] uppercase text-[#2F7FC1] mb-2 flex items-center justify-between">
            <span>🛡️ Configured Demo Credentials (Unit 4 Auth)</span>
            <span className="text-[8px] bg-[#B7E3FF]/50 text-[#0F2942] px-1.5 py-0.5 rounded-xs">Verified</span>
          </p>
          <div className="space-y-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setFormData((prev) => ({
                  ...prev,
                  emailOrUsername: "eleanor.vance@example.com",
                  password: "Password@123"
                }));
                setApiError("");
              }}
              className="w-full text-left p-2 rounded-xs bg-white border border-[#D7E2EA] hover:border-[#2F7FC1] transition-colors flex justify-between items-center"
            >
              <div>
                <strong className="text-[#0F2942] block">Eleanor Vance (Guest)</strong>
                <span className="text-[10px] text-[#5A738E]">eleanor.vance@example.com • Password@123</span>
              </div>
              <span className="text-[9px] font-semibold text-[#2F7FC1]">Use →</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setFormData((prev) => ({
                  ...prev,
                  emailOrUsername: "john.doe@example.com",
                  password: "Password@456"
                }));
                setApiError("");
              }}
              className="w-full text-left p-2 rounded-xs bg-white border border-[#D7E2EA] hover:border-[#2F7FC1] transition-colors flex justify-between items-center"
            >
              <div>
                <strong className="text-[#0F2942] block">John Doe (Guest)</strong>
                <span className="text-[10px] text-[#5A738E]">john.doe@example.com • Password@456</span>
              </div>
              <span className="text-[9px] font-semibold text-[#2F7FC1]">Use →</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setFormData((prev) => ({
                  ...prev,
                  emailOrUsername: "admin@grandstay.com",
                  password: "Admin@2026!"
                }));
                setApiError("");
              }}
              className="w-full text-left p-2 rounded-xs bg-white border border-[#D7E2EA] hover:border-[#2F7FC1] transition-colors flex justify-between items-center"
            >
              <div>
                <strong className="text-[#0F2942] block">Administrator (All Access)</strong>
                <span className="text-[10px] text-[#5A738E]">admin@grandstay.com • Admin@2026!</span>
              </div>
              <span className="text-[9px] font-semibold text-[#2F7FC1]">Use →</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
