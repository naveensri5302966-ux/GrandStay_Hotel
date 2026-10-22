import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingContext } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import Input from "./common/Input";
import DatePicker from "./common/DatePicker";
import Button from "./common/Button";

export function GuestDetailsForm() {
  const {
    selectedRoom,
    checkIn,
    checkOut,
    guests,
    updateDates,
    updateGuests,
    reservationDetails,
    setReservationDetails
  } = useBookingContext();

  const { user } = useAuth();
  const navigate = useNavigate();

  // Controlled reservation form states
  const [formData, setFormData] = useState({
    fullName: reservationDetails?.customerName || user?.name || "Eleanor Vance",
    email: reservationDetails?.email || user?.email || "eleanor.vance@example.com",
    phone: reservationDetails?.phone || "9876543210",
    specialRequests: reservationDetails?.specialRequests || "High floor, quiet corner suite preferred",
    checkInDate: checkIn || "2026-11-10",
    checkOutDate: checkOut || "2026-11-13",
    guestCount: guests || 2
  });

  const [errors, setErrors] = useState({});

  // Field validation
  const validate = () => {
    const errs = {};

    // 1. Full name validation
    if (!formData.fullName.trim()) {
      errs.fullName = "Full name is required.";
    } else if (formData.fullName.trim().length < 2) {
      errs.fullName = "Full name must be at least 2 characters.";
    }

    // 2. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    // 3. Phone number validation
    const cleanPhone = formData.phone.replace(/[\s-]/g, "");
    if (!cleanPhone.trim()) {
      errs.phone = "Phone number is required.";
    } else if (!/^[0-9]{10}$/.test(cleanPhone)) {
      errs.phone = "Phone number must be exactly 10 digits.";
    }

    // 4. Check-in and check-out date validation
    if (!formData.checkInDate) {
      errs.checkInDate = "Check-in date is required.";
    }
    if (!formData.checkOutDate) {
      errs.checkOutDate = "Check-out date is required.";
    } else if (formData.checkInDate && formData.checkOutDate <= formData.checkInDate) {
      errs.checkOutDate = "Check-out date must be strictly after check-in date.";
    }

    // 5. Guest count validation
    const guestNum = Number(formData.guestCount);
    if (!guestNum || guestNum < 1) {
      errs.guestCount = "At least 1 guest is required.";
    } else if (selectedRoom && guestNum > selectedRoom.capacity) {
      errs.guestCount = `Selected room capacity is ${selectedRoom.capacity} guests.`;
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Update Zustand state
    updateDates(formData.checkInDate, formData.checkOutDate);
    updateGuests(Number(formData.guestCount));
    setReservationDetails({
      customerName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      specialRequests: formData.specialRequests.trim()
    });

    navigate("/booking/summary");
  };

  return (
    <div className="border border-[#D7E2EA] bg-white p-6 sm:p-10 rounded-sm shadow-xs">
      <div className="border-b border-[#D7E2EA]/60 pb-6">
        <p className="text-[9px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
          Step 2 of 3
        </p>
        <h2 className="mt-2 font-serif text-3xl text-[#0F2942]">
          Guest Details & Stay Preferences
        </h2>
        <p className="mt-1.5 text-xs text-[#5A738E]">
          Provide primary guest information for hotel registration, verification, and keycard issuance.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Full Name */}
          <Input
            label="Primary Guest Name"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. Eleanor Vance"
            error={errors.fullName}
          />

          {/* Email */}
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

          {/* Phone */}
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

          {/* Guest Count */}
          <Input
            label={`Number of Guests ${selectedRoom ? `(Max ${selectedRoom.capacity})` : ""}`}
            name="guestCount"
            type="number"
            min="1"
            max={selectedRoom ? selectedRoom.capacity : 6}
            required
            value={formData.guestCount}
            onChange={handleChange}
            error={errors.guestCount}
          />

          {/* Check-In Date */}
          <DatePicker
            label="Check-In Date"
            name="checkInDate"
            required
            min={new Date().toISOString().split("T")[0]}
            value={formData.checkInDate}
            onChange={handleChange}
            error={errors.checkInDate}
          />

          {/* Check-Out Date */}
          <DatePicker
            label="Check-Out Date"
            name="checkOutDate"
            required
            min={formData.checkInDate || new Date().toISOString().split("T")[0]}
            value={formData.checkOutDate}
            onChange={handleChange}
            error={errors.checkOutDate}
          />
        </div>

        {/* Special Requests */}
        <div className="w-full">
          <label className="text-[9px] font-semibold tracking-[1.5px] uppercase text-[#5A738E] block mb-1.5">
            Special Requests / Dietary Needs (Optional)
          </label>
          <textarea
            name="specialRequests"
            rows={3}
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="e.g. Quiet room, high floor, airport pickup assistance"
            className="w-full border border-[#D7E2EA] bg-[#F8FBFF] px-4 py-2.5 text-sm text-[#0F2942] outline-none focus:border-[#2F7FC1] focus:ring-1 focus:ring-[#7CC8FF] rounded-xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-[#D7E2EA]/60">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/booking/room")}
          >
            ← Back to Room Selection
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
          >
            Continue to Summary →
          </Button>
        </div>
      </form>
    </div>
  );
}

export default GuestDetailsForm;
