import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Loading from "./components/common/Loading";

import Header from "./components/Header";
import Footer from "./components/Footer";

// Lazy-loaded routes for optimal bundle code splitting (Scenario 9 Experiment 2 a & b)
const Home = lazy(() => import("./components/Home"));
const HotelList = lazy(() => import("./components/HotelList"));
const HotelDetailPage = lazy(() => import("./components/HotelDetailPage"));
const RoomsPage = lazy(() => import("./components/RoomsPage"));
const BookingLayout = lazy(() => import("./components/BookingLayout"));
const BookingRoomStep = lazy(() => import("./components/BookingRoomStep"));
const GuestDetailsForm = lazy(() => import("./components/GuestDetailsForm"));
const BookingSummaryStep = lazy(() => import("./components/BookingSummaryStep"));
const CheckoutPage = lazy(() => import("./components/CheckoutPage"));
const BookingConfirmation = lazy(() => import("./components/BookingConfirmation"));
const BookingsList = lazy(() => import("./components/BookingsList"));
const Login = lazy(() => import("./components/Login"));
const Experiment3Lab = lazy(() => import("./components/Experiment3Lab"));

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BookingProvider>
          <BrowserRouter>
            <div className="flex min-h-screen flex-col bg-[#F8FBFF] text-[#0F2942]">
              {/* Site-wide Navigation Header */}
              <Header />

              {/* Main Routing Area with Suspense Lazy Loading */}
              <div className="flex-1">
                <Suspense
                  fallback={
                    <div className="flex min-h-[50vh] items-center justify-center p-12">
                      <Loading message="Loading travel destination & package..." />
                    </div>
                  }
                >
                  <Routes>
                    {/* Public Authentication Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Public Hotel Browsing & Details Routes (Experiment 1) */}
                    <Route path="/" element={<Home />} />
                    <Route path="/hotels" element={<HotelList />} />
                    <Route path="/hotel/:id" element={<HotelDetailPage />} />
                    <Route path="/rooms" element={<RoomsPage />} />

                    {/* Experiment 3: CRUD Operations Lab Dashboard */}
                    <Route path="/crud-lab" element={<Experiment3Lab />} />
                    <Route path="/experiment-3" element={<Experiment3Lab />} />

                    {/* Protected Nested Booking Routes */}
                    <Route
                      path="/booking"
                      element={
                        <ProtectedRoute>
                          <BookingLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Navigate to="/booking/room" replace />} />
                      <Route path="room" element={<BookingRoomStep />} />
                      <Route path="guest" element={<GuestDetailsForm />} />
                      <Route path="summary" element={<BookingSummaryStep />} />
                      <Route path="confirmation" element={<BookingConfirmation />} />
                    </Route>

                    {/* Protected Checkout & Payment Routes */}
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute>
                          <CheckoutPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/payment"
                      element={
                        <ProtectedRoute>
                          <CheckoutPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Protected Bookings History (CRUD view, edit, cancel) */}
                    <Route
                      path="/bookings"
                      element={
                        <ProtectedRoute>
                          <BookingsList />
                        </ProtectedRoute>
                      }
                    />

                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </div>

              {/* Site-wide Footer */}
              <Footer />
            </div>
          </BrowserRouter>
        </BookingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
