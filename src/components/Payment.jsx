import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBookingContext } from "../context/BookingContext";
import reservationService from "../services/reservationService";
import Button from "./common/Button";
import Input from "./common/Input";

export function Payment({ onPaymentComplete }) {
  const navigate = useNavigate();
  const {
    selectedHotel,
    selectedRoom,
    checkIn,
    checkOut,
    guests,
    totalStayDuration,
    roomCost,
    taxes,
    additionalCharges,
    finalBookingAmount,
    reservationDetails,
    confirmBooking
  } = useBookingContext();

  const hotel = selectedHotel;
  const room = selectedRoom;

  // Billing and Payment fields
  const [customerName, setCustomerName] = useState(reservationDetails?.customerName || "Eleanor Vance");
  const [email, setEmail] = useState(reservationDetails?.email || "eleanor.vance@example.com");
  const [phone, setPhone] = useState(reservationDetails?.phone || "9876543210");
  const [billingAddress, setBillingAddress] = useState("42 Marine Promenade, Suite 4B, Chennai, TN");
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Card fields
  const [cardNumber, setCardNumber] = useState("4532 8921 7654 3210");
  const [expiryDate, setExpiryDate] = useState("12/28");
  const [cvv, setCvv] = useState("892");

  // State flags
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const formatPrice = (val) =>
    `₹${Number(val || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const handleCardNumber = (value) => {
    const numbersOnly = value.replace(/\D/g, "").slice(0, 16);
    const formatted = numbersOnly.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");

    // Contact Validation
    if (!customerName.trim() || !email.trim() || !phone.trim() || !billingAddress.trim()) {
      setError("Please complete all contact and billing address fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    // Card Validation
    if (paymentMethod === "card") {
      const cleanCard = cardNumber.replace(/\s/g, "");
      if (cleanCard.length !== 16) {
        setError("Please enter a valid 16-digit card number.");
        return;
      }
      if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
        setError("Please enter card expiry in MM/YY format.");
        return;
      }
      if (!/^[0-9]{3}$/.test(cvv)) {
        setError("Please enter a valid 3-digit CVV security code.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // EXPERIMENT 3 b: Create a hotel reservation using POST /reservations
      const reservationPayload = {
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelLocation: hotel.location,
        hotelImage: hotel.image,
        hotelStars: hotel.stars,
        roomId: room.id,
        roomName: room.name,
        checkIn,
        checkOut,
        totalStayDuration,
        guests,
        roomPrice: room.price,
        roomCost,
        taxes,
        additionalCharges,
        totalAmount: finalBookingAmount,
        customerName: customerName.trim(),
        email: email.trim(),
        phone: cleanPhone,
        billingAddress: billingAddress.trim(),
        specialRequests: reservationDetails?.specialRequests || "None",
        paymentMethod,
        paidAt: new Date().toISOString()
      };

      const createdReservation = await reservationService.createReservation(reservationPayload);

      confirmBooking({
        ...createdReservation,
        customerName: customerName.trim(),
        email: email.trim(),
        phone: cleanPhone,
        totalPaid: finalBookingAmount
      });

      if (onPaymentComplete) {
        onPaymentComplete(createdReservation);
      } else {
        navigate("/booking/confirmation");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to process payment and create reservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hotel || !room) {
    return (
      <section className="bg-[#F8FBFF] px-5 py-20 text-center text-[#0F2942]">
        <div className="mx-auto max-w-lg border border-[#D7E2EA] bg-white p-12 rounded-sm shadow-xs">
          <p className="text-[9px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
            Checkout Step
          </p>
          <h2 className="mt-2 font-serif text-3xl text-[#0F2942]">
            Your booking is empty
          </h2>
          <p className="mt-2 text-xs text-[#5A738E]">
            Please select a hotel and room before continuing to payment.
          </p>
          <div className="mt-6">
            <Link to="/hotels">
              <Button variant="primary">Browse Hotels</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#F8FBFF] px-5 py-16 md:px-10 lg:px-16 text-[#0F2942]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="text-[9px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
            Secure Checkout & REST API Reservation
          </p>
          <h1 className="mt-1 font-serif text-3xl md:text-4xl text-[#0F2942]">
            Payment & Confirmation
          </h1>
          <p className="mt-1 text-xs text-[#5A738E]">
            Complete payment to securely create your reservation record in the database.
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 p-4 rounded-xs text-xs text-red-700 flex items-center gap-2">
            <span>⚠</span> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Payment Form (2 cols) */}
          <form
            onSubmit={handlePayment}
            className="lg:col-span-2 border border-[#D7E2EA] bg-white p-6 sm:p-8 rounded-sm shadow-xs space-y-6"
          >
            {/* Customer Details */}
            <div>
              <h2 className="font-serif text-xl text-[#0F2942] border-b border-[#D7E2EA]/60 pb-3">
                1. Guest Contact & Billing Address
              </h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Phone (10 Digits)"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  label="Billing Address"
                  required
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-4">
              <h2 className="font-serif text-xl text-[#0F2942] border-b border-[#D7E2EA]/60 pb-3">
                2. Select Payment Method
              </h2>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { id: "card", label: "Credit / Debit Card", icon: "💳" },
                  { id: "upi", label: "UPI / QR Code", icon: "📱" },
                  { id: "netbanking", label: "Net Banking", icon: "🏦" }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 text-center border rounded-xs transition-colors flex flex-col items-center justify-center gap-1 ${
                      paymentMethod === m.id
                        ? "border-[#2F7FC1] bg-[#B7E3FF]/20 text-[#2F7FC1] font-semibold"
                        : "border-[#D7E2EA] bg-[#F8FBFF] text-[#5A738E] hover:border-[#2F7FC1]"
                    }`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-[10px] tracking-[0.5px] uppercase">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Card Inputs */}
              {paymentMethod === "card" && (
                <div className="mt-5 space-y-4 border border-[#D7E2EA] bg-[#F8FBFF] p-4 rounded-xs">
                  <Input
                    label="Card Number (16 Digits)"
                    value={cardNumber}
                    onChange={(e) => handleCardNumber(e.target.value)}
                    placeholder="4532 8921 7654 3210"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry (MM/YY)"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="12/28"
                      required
                    />
                    <Input
                      label="CVV (3 Digits)"
                      type="password"
                      maxLength={3}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      placeholder="•••"
                      required
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="mt-5 border border-[#D7E2EA] bg-[#F8FBFF] p-4 rounded-xs text-xs text-[#5A738E] text-center">
                  <p className="font-semibold text-[#0F2942]">Instant UPI Payment</p>
                  <p className="mt-1">Enter your UPI ID (e.g. eleanor@okaxis) to receive a collect request.</p>
                  <input
                    type="text"
                    defaultValue="eleanor@okaxis"
                    className="mt-3 w-full max-w-xs border border-[#D7E2EA] bg-white px-3 py-2 text-xs text-[#0F2942] rounded-xs outline-none"
                  />
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div className="mt-5 border border-[#D7E2EA] bg-[#F8FBFF] p-4 rounded-xs text-xs text-[#5A738E]">
                  <p className="font-semibold text-[#0F2942] mb-2">Select Your Bank</p>
                  <select className="w-full border border-[#D7E2EA] bg-white px-3 py-2 text-xs text-[#0F2942] rounded-xs outline-none">
                    <option>HDFC Bank</option>
                    <option>State Bank of India</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                  </select>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#D7E2EA]/60 flex items-center justify-between">
              <Link to="/booking/summary">
                <Button variant="outline" size="md">
                  ← Back to Summary
                </Button>
              </Link>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
              >
                Pay {formatPrice(finalBookingAmount)} & Confirm →
              </Button>
            </div>
          </form>

          {/* Booking Summary Sidebar (1 col) */}
          <div className="border border-[#D7E2EA] bg-white p-6 rounded-sm shadow-xs space-y-4">
            <h2 className="font-serif text-lg text-[#0F2942] border-b border-[#D7E2EA]/60 pb-3">
              Order Summary
            </h2>

            <div className="flex gap-3">
              <img
                src={hotel.image}
                alt={hotel.name}
                className="h-16 w-16 object-cover rounded-xs border border-[#D7E2EA]"
              />
              <div>
                <h3 className="font-serif text-base text-[#0F2942]">{hotel.name}</h3>
                <p className="text-xs text-[#5A738E]">{hotel.location}</p>
                <p className="text-xs font-semibold text-[#2F7FC1] mt-1">{room.name}</p>
              </div>
            </div>

            <div className="border-t border-[#D7E2EA]/60 pt-3 space-y-2 text-xs text-[#5A738E]">
              <div className="flex justify-between">
                <span>Check-in:</span>
                <span className="font-semibold text-[#0F2942]">{checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-out:</span>
                <span className="font-semibold text-[#0F2942]">{checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span>Stay Duration:</span>
                <span className="font-semibold text-[#0F2942]">{totalStayDuration} Nights</span>
              </div>
              <div className="flex justify-between">
                <span>Guests:</span>
                <span className="font-semibold text-[#0F2942]">{guests}</span>
              </div>
            </div>

            <div className="border-t border-[#D7E2EA]/60 pt-3 space-y-2 text-xs text-[#5A738E]">
              <div className="flex justify-between">
                <span>Room Charges:</span>
                <span className="text-[#0F2942]">{formatPrice(roomCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (12% GST):</span>
                <span className="text-[#0F2942]">{formatPrice(taxes)}</span>
              </div>
              <div className="flex justify-between">
                <span>Resort Fee:</span>
                <span className="text-[#0F2942]">{formatPrice(additionalCharges)}</span>
              </div>
            </div>

            <div className="border-t border-[#D7E2EA] pt-3 flex justify-between items-baseline">
              <span className="font-serif text-base text-[#0F2942]">Total Amount:</span>
              <span className="font-serif text-2xl font-bold text-[#2F7FC1]">
                {formatPrice(finalBookingAmount)}
              </span>
            </div>

            <div className="border-t border-[#D7E2EA]/60 pt-3 text-[10px] text-[#5A738E] text-center">
              🔒 256-Bit SSL Encrypted & Verified REST API
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Payment;