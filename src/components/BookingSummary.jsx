import { useBookingContext } from "../context/BookingContext";

function BookingSummary({ onContinue }) {
  // Consume directly from Context API (no prop drilling!)
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
    clearBooking
  } = useBookingContext();

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0
    })}`;
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      document.getElementById("payment")?.scrollIntoView({
        behavior: "smooth"
      });
    }
  };

  // =========================================
  // CONDITIONAL RENDERING 1: "Your booking is empty"
  // (when no hotel has been selected yet)
  // =========================================
  if (!selectedHotel) {
    return (
      <section
        id="booking-summary"
        className="
          bg-[#f0eee6]
          px-5
          py-20
          md:px-10
          lg:px-16
        "
      >
        <div className="
          mx-auto
          max-w-5xl
          border
          border-[#deddd5]
          bg-white
          p-12
          text-center
        ">
          <div className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[#eeece4]
            text-2xl
            text-[#68745e]
          ">
            📋
          </div>

          <p className="
            mt-6
            text-[9px]
            tracking-[4px]
            text-[#68745e]
          ">
            RESERVATION STATUS
          </p>

          <h2 className="
            mt-3
            font-serif
            text-4xl
            text-[#252522]
          ">
            Your booking is empty
          </h2>

          <p className="
            mx-auto
            mt-3
            max-w-md
            text-sm
            text-[#77776f]
          ">
            You haven't selected a hotel yet. Browse our handpicked hotels and select a destination to begin.
          </p>

          <a
            href="#hotels"
            className="
              mt-7
              inline-block
              border
              border-[#68745e]
              bg-[#68745e]
              px-8
              py-3.5
              text-[8px]
              tracking-[2px]
              text-white
              transition
              hover:bg-[#505b49]
            "
          >
            EXPLORE HOTELS
          </a>
        </div>
      </section>
    );
  }

  // =========================================
  // CONDITIONAL RENDERING 2: "Please select a room"
  // (when hotel is selected, but room is not yet selected)
  // =========================================
  if (!selectedRoom) {
    return (
      <section
        id="booking-summary"
        className="
          bg-[#f0eee6]
          px-5
          py-20
          md:px-10
          lg:px-16
        "
      >
        <div className="
          mx-auto
          max-w-5xl
          border
          border-[#deddd5]
          bg-white
          p-12
          text-center
        ">
          <div className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[#eeece4]
            text-2xl
            text-[#68745e]
          ">
            🛏️
          </div>

          <p className="
            mt-6
            text-[9px]
            tracking-[4px]
            text-[#68745e]
          ">
            ROOM REQUIRED
          </p>

          <h2 className="
            mt-3
            font-serif
            text-4xl
            text-[#252522]
          ">
            Please select a room
          </h2>

          <p className="
            mx-auto
            mt-3
            max-w-md
            text-sm
            text-[#77776f]
          ">
            You have selected <span className="font-semibold text-[#252522]">{selectedHotel.name}</span>. Please choose a room from the room options above to calculate duration and view itemized charges.
          </p>

          <a
            href="#rooms"
            className="
              mt-7
              inline-block
              border
              border-[#68745e]
              bg-[#68745e]
              px-8
              py-3.5
              text-[8px]
              tracking-[2px]
              text-white
              transition
              hover:bg-[#505b49]
            "
          >
            CHOOSE A ROOM
          </a>
        </div>
      </section>
    );
  }

  // =========================================
  // ACTIVE BOOKING SUMMARY CARD
  // (Both hotel and room are selected)
  // Displays all 5 useMemo calculated values:
  // 1. Total stay duration
  // 2. Room cost
  // 3. Taxes
  // 4. Additional charges
  // 5. Final booking amount
  // =========================================
  return (
    <section
      id="booking-summary"
      className="
        bg-[#f0eee6]
        px-5
        py-20
        text-[#252522]
        md:px-10
        lg:px-16
      "
    >
      <div className="
        mx-auto
        max-w-5xl
      ">
        {/* HEADER */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="
              text-[9px]
              tracking-[4px]
              text-[#68745e]
            ">
              YOUR RESERVATION BREAKDOWN
            </p>

            <h2 className="
              mt-3
              font-serif
              text-4xl
              text-[#252522]
              md:text-5xl
            ">
              Booking Summary
            </h2>
          </div>

          {/* CLEAR BOOKING BUTTON (useCallback) */}
          <button
            type="button"
            onClick={clearBooking}
            className="
              self-start
              border
              border-[#999990]
              bg-transparent
              px-4
              py-2
              text-[8px]
              tracking-[2px]
              text-[#77776f]
              transition
              hover:border-red-600
              hover:text-red-600
              sm:self-auto
            "
          >
            ✕ CLEAR BOOKING
          </button>
        </div>

        {/* SUMMARY CARD */}
        <div className="
          border
          border-[#deddd5]
          bg-white
          shadow-sm
        ">
          {/* HOTEL & ROOM INFO */}
          <div className="
            border-b
            border-[#e0dfd8]
            p-7
            md:p-10
          ">
            <div className="
              flex
              flex-col
              justify-between
              gap-6
              md:flex-row
            ">
              <div>
                <p className="
                  text-[8px]
                  tracking-[3px]
                  text-[#68745e]
                ">
                  HOTEL
                </p>

                <h3 className="
                  mt-2
                  font-serif
                  text-3xl
                  text-[#252522]
                ">
                  {selectedHotel.name}
                </h3>

                <p className="
                  mt-2
                  text-xs
                  text-[#77776f]
                ">
                  {selectedHotel.location} • {"★".repeat(selectedHotel.stars)}
                </p>
              </div>

              <div className="md:text-right">
                <p className="
                  text-[8px]
                  tracking-[3px]
                  text-[#68745e]
                ">
                  SELECTED ROOM
                </p>

                <p className="
                  mt-2
                  font-serif
                  text-2xl
                  text-[#252522]
                ">
                  {selectedRoom.name}
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-[#77776f]
                ">
                  Capacity: {selectedRoom.capacity} Guests
                </p>
              </div>
            </div>
          </div>

          {/* DATES & GUESTS */}
          <div className="
            grid
            grid-cols-1
            border-b
            border-[#e0dfd8]
            md:grid-cols-3
          ">
            <div className="
              border-b
              border-[#e0dfd8]
              p-7
              md:border-b-0
              md:border-r
            ">
              <p className="
                text-[8px]
                tracking-[3px]
                text-[#999990]
              ">
                CHECK-IN
              </p>
              <p className="
                mt-3
                text-sm
                font-medium
                text-[#44443e]
              ">
                {checkIn || "Date not selected"}
              </p>
            </div>

            <div className="
              border-b
              border-[#e0dfd8]
              p-7
              md:border-b-0
              md:border-r
            ">
              <p className="
                text-[8px]
                tracking-[3px]
                text-[#999990]
              ">
                CHECK-OUT
              </p>
              <p className="
                mt-3
                text-sm
                font-medium
                text-[#44443e]
              ">
                {checkOut || "Date not selected"}
              </p>
            </div>

            <div className="p-7">
              <p className="
                text-[8px]
                tracking-[3px]
                text-[#999990]
              ">
                RESERVED GUESTS
              </p>
              <p className="
                mt-3
                text-sm
                font-medium
                text-[#44443e]
              ">
                {guests} {guests === 1 ? "Guest" : "Guests"}
              </p>
            </div>
          </div>

          {/* ITEMIZED PRICING (Calculated via useMemo) */}
          <div className="
            p-7
            md:p-10
          ">
            <p className="
              text-[8px]
              tracking-[3px]
              text-[#68745e]
            ">
              ITEMIZED CHARGES (useMemo)
            </p>

            <div className="mt-6 space-y-4">
              {/* 1. Total stay duration */}
              <div className="
                flex
                items-center
                justify-between
                gap-5
              ">
                <span className="
                  text-sm
                  text-[#77776f]
                ">
                  Total stay duration:
                </span>
                <span className="
                  text-sm
                  font-medium
                  text-[#44443e]
                ">
                  {totalStayDuration} {totalStayDuration === 1 ? "Night" : "Nights"}
                </span>
              </div>

              {/* 2. Room cost */}
              <div className="
                flex
                items-center
                justify-between
                gap-5
              ">
                <span className="
                  text-sm
                  text-[#77776f]
                ">
                  Room cost ({formatPrice(selectedRoom.price)} × {totalStayDuration} nights):
                </span>
                <span className="
                  text-sm
                  font-medium
                  text-[#44443e]
                ">
                  {formatPrice(roomCost)}
                </span>
              </div>

              {/* 3. Taxes */}
              <div className="
                flex
                items-center
                justify-between
                gap-5
              ">
                <span className="
                  text-sm
                  text-[#77776f]
                ">
                  Taxes (12% GST):
                </span>
                <span className="
                  text-sm
                  font-medium
                  text-[#44443e]
                ">
                  {formatPrice(taxes)}
                </span>
              </div>

              {/* 4. Additional charges */}
              <div className="
                flex
                items-center
                justify-between
                gap-5
              ">
                <span className="
                  text-sm
                  text-[#77776f]
                ">
                  Additional charges (Resort & service fee):
                </span>
                <span className="
                  text-sm
                  font-medium
                  text-[#44443e]
                ">
                  {formatPrice(additionalCharges)}
                </span>
              </div>

              <div className="
                border-t
                border-[#deddd5]
                pt-4
              " />

              {/* 5. Final booking amount */}
              <div className="
                flex
                items-center
                justify-between
                gap-5
              ">
                <span className="
                  font-serif
                  text-lg
                  text-[#252522]
                ">
                  Final booking amount:
                </span>
                <span className="
                  font-serif
                  text-2xl
                  text-[#68745e]
                ">
                  {formatPrice(finalBookingAmount)}
                </span>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="
              mt-10
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            ">
              <span className="text-xs text-[#77776f]">
                Includes all taxes, resort amenities & complimentary breakfast.
              </span>

              <button
                type="button"
                onClick={handleContinue}
                className="
                  border
                  border-[#68745e]
                  bg-[#68745e]
                  px-8
                  py-4
                  text-[9px]
                  tracking-[3px]
                  text-white
                  transition
                  hover:bg-[#505b49]
                "
              >
                PROCEED TO PAYMENT →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BookingSummary;