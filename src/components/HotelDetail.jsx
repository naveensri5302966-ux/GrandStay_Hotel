import RoomSelection from "./RoomSelection";
import BookingSummary from "./BookingSummary";
import Payment from "./Payment";
import { useBookingContext } from "../context/BookingContext";

function HotelDetail() {
  // Consume directly from Context API (no prop drilling!)
  const {
    selectedHotel,
    goBack,
    selectedRoom,
    checkIn,
    checkOut,
    guests,
    bookingConfirmed,
    reservationDetails,
    totalStayDuration,
    finalBookingAmount,
    clearBooking
  } = useBookingContext();

  const hotel = selectedHotel;

  // IF NO HOTEL SELECTED
  if (!hotel) {
    return null;
  }

  // =========================================
  // BOOKING CONFIRMATION SCREEN
  // =========================================
  if (bookingConfirmed) {
    return (
      <main className="
        min-h-screen
        bg-[#f7f5ef]
        px-5
        py-8
        text-[#252522]
        md:px-10
        lg:px-16
      ">
        {/* BACK BUTTON */}
        <button
          onClick={goBack}
          className="
            mb-10
            text-[9px]
            tracking-[3px]
            text-[#68745e]
            transition
            hover:text-[#252522]
          "
        >
          ← BACK TO HOTELS
        </button>

        {/* CONFIRMATION CARD */}
        <div className="
          mx-auto
          max-w-4xl
          border
          border-[#deddd5]
          bg-white
          px-7
          py-14
          text-center
          md:px-14
          md:py-20
        ">
          {/* SUCCESS ICON */}
          <div className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-[#e6e9df]
            text-2xl
            text-[#68745e]
          ">
            ✓
          </div>

          <p className="
            mt-7
            text-[9px]
            tracking-[4px]
            text-[#68745e]
          ">
            BOOKING CONFIRMED & SYNCHRONIZED
          </p>

          <h1 className="
            mt-4
            font-serif
            text-4xl
            text-[#252522]
            md:text-6xl
          ">
            Your stay is booked.
          </h1>

          <p className="
            mx-auto
            mt-5
            max-w-xl
            text-sm
            leading-7
            text-[#77776f]
          ">
            Thank you for choosing {hotel.name}. Your reservation has been
            successfully synchronized with browser storage.
          </p>

          {/* BOOKING DETAILS */}
          <div className="
            mx-auto
            mt-10
            max-w-xl
            border
            border-[#deddd5]
            bg-[#f7f5ef]
            text-left
          ">
            {/* HOTEL */}
            <div className="
              border-b
              border-[#deddd5]
              p-6
            ">
              <p className="
                text-[8px]
                tracking-[3px]
                text-[#68745e]
              ">
                HOTEL
              </p>

              <h2 className="
                mt-2
                font-serif
                text-2xl
              ">
                {hotel.name}
              </h2>

              <p className="
                mt-1
                text-xs
                text-[#77776f]
              ">
                {hotel.location}
              </p>
            </div>

            {/* ROOM & GUESTS */}
            <div className="
              grid
              grid-cols-1
              border-b
              border-[#deddd5]
              sm:grid-cols-2
            ">
              <div className="
                border-b
                border-[#deddd5]
                p-6
                sm:border-b-0
                sm:border-r
              ">
                <p className="
                  text-[8px]
                  tracking-[3px]
                  text-[#999990]
                ">
                  ROOM TYPE
                </p>
                <p className="
                  mt-2
                  text-sm
                ">
                  {selectedRoom?.name || "Standard Room"}
                </p>
              </div>

              <div className="p-6">
                <p className="
                  text-[8px]
                  tracking-[3px]
                  text-[#999990]
                ">
                  GUESTS
                </p>
                <p className="
                  mt-2
                  text-sm
                ">
                  {guests} {guests === 1 ? "Guest" : "Guests"}
                </p>
              </div>
            </div>

            {/* DATES & DURATION */}
            <div className="
              grid
              grid-cols-1
              border-b
              border-[#deddd5]
              sm:grid-cols-3
            ">
              <div className="
                border-b
                border-[#deddd5]
                p-6
                sm:border-b-0
                sm:border-r
              ">
                <p className="
                  text-[8px]
                  tracking-[3px]
                  text-[#999990]
                ">
                  CHECK-IN
                </p>
                <p className="
                  mt-2
                  text-sm
                ">
                  {checkIn || "Standard"}
                </p>
              </div>

              <div className="
                border-b
                border-[#deddd5]
                p-6
                sm:border-b-0
                sm:border-r
              ">
                <p className="
                  text-[8px]
                  tracking-[3px]
                  text-[#999990]
                ">
                  CHECK-OUT
                </p>
                <p className="
                  mt-2
                  text-sm
                ">
                  {checkOut || "Standard"}
                </p>
              </div>

              <div className="p-6">
                <p className="
                  text-[8px]
                  tracking-[3px]
                  text-[#999990]
                ">
                  DURATION
                </p>
                <p className="
                  mt-2
                  text-sm
                ">
                  {totalStayDuration} Nights
                </p>
              </div>
            </div>

            {/* CUSTOMER DETAILS */}
            {reservationDetails && (
              <div className="
                border-b
                border-[#deddd5]
                p-6
              ">
                <p className="
                  text-[8px]
                  tracking-[3px]
                  text-[#68745e]
                ">
                  GUEST DETAILS
                </p>

                <p className="
                  mt-2
                  text-sm
                  font-medium
                ">
                  {reservationDetails.customerName}
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-[#77776f]
                ">
                  {reservationDetails.email} • {reservationDetails.phone}
                </p>
              </div>
            )}

            {/* TOTAL */}
            <div className="
              flex
              items-center
              justify-between
              gap-5
              p-6
            ">
              <div>
                <p className="
                  text-[8px]
                  tracking-[3px]
                  text-[#68745e]
                ">
                  FINAL BOOKING AMOUNT (PAID)
                </p>
              </div>

              <p className="
                font-serif
                text-2xl
                text-[#68745e]
              ">
                ₹{finalBookingAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={goBack}
              className="
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
              RETURN TO HOTELS
            </button>

            <button
              onClick={clearBooking}
              className="
                border
                border-[#deddd5]
                bg-white
                px-8
                py-4
                text-[9px]
                tracking-[3px]
                text-[#77776f]
                transition
                hover:border-red-500
                hover:text-red-500
              "
            >
              START NEW BOOKING
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =========================================
  // HOTEL DETAILS MAIN PAGE
  // =========================================
  return (
    <main className="
      min-h-screen
      bg-[#f7f5ef]
      text-[#252522]
    ">
      {/* TOP NAVIGATION */}
      <div className="
        px-5
        pt-8
        md:px-10
        lg:px-16
      ">
        <div className="
          mx-auto
          max-w-7xl
        ">
          <button
            onClick={goBack}
            className="
              text-[9px]
              tracking-[3px]
              text-[#68745e]
              transition
              hover:text-[#252522]
            "
          >
            ← BACK TO HOTELS
          </button>
        </div>
      </div>

      {/* HOTEL IMAGE HERO */}
      <div className="
        mx-auto
        mt-7
        max-w-7xl
        px-5
        md:px-10
        lg:px-16
      ">
        <div className="
          relative
          h-[400px]
          overflow-hidden
          md:h-[600px]
        ">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="
              h-full
              w-full
              object-cover
            "
          />

          {/* STAR BADGE */}
          <div className="
            absolute
            left-6
            top-6
            bg-[#30332c]/90
            px-5
            py-3
          ">
            <span className="
              text-sm
              tracking-[3px]
              text-white
            ">
              {"★".repeat(hotel.stars)}
            </span>
          </div>
        </div>
      </div>

      {/* HOTEL INFORMATION */}
      <div className="
        mx-auto
        max-w-7xl
        px-5
        md:px-10
        lg:px-16
      ">
        <div className="
          bg-white
          px-7
          py-12
          md:px-14
          md:py-16
        ">
          <p className="
            text-[9px]
            tracking-[4px]
            text-[#68745e]
          ">
            {hotel.location.toUpperCase()}
          </p>

          <h1 className="
            mt-4
            font-serif
            text-5xl
            leading-tight
            text-[#252522]
            md:text-7xl
          ">
            {hotel.name}
          </h1>

          <p className="
            mt-6
            max-w-2xl
            text-sm
            leading-7
            text-[#77776f]
          ">
            {hotel.description}
          </p>

          {/* AMENITIES */}
          <div className="
            mt-10
            border-t
            border-[#e0dfd8]
            pt-8
          ">
            <p className="
              text-[8px]
              tracking-[3px]
              text-[#68745e]
            ">
              AMENITIES
            </p>

            <div className="
              mt-5
              flex
              flex-wrap
              gap-3
            ">
              {hotel.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="
                    border
                    border-[#d8d7cf]
                    bg-[#f7f5ef]
                    px-5
                    py-3
                    text-xs
                    text-[#66665f]
                  "
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================================= */}
      {/* ROOM SELECTION (Consumes Context, no prop drilling!) */}
      {/* ================================= */}
      <RoomSelection />

      {/* ================================= */}
      {/* BOOKING SUMMARY (Consumes Context, no prop drilling!) */}
      {/* ================================= */}
      <BookingSummary />

      {/* ================================= */}
      {/* PAYMENT (Consumes Context, no prop drilling!) */}
      {/* ================================= */}
      <Payment />
    </main>
  );
}

export default HotelDetail;