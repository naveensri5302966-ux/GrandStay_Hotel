/**
 * Unit Test Suite for Experiment 2: Booking State Management & Financial Calculations
 */
function calculateBookingFinancials(selectedRoom, checkIn, checkOut) {
  if (!checkIn || !checkOut) {
    return {
      totalStayDuration: 0,
      roomCost: 0,
      taxes: 0,
      additionalCharges: 0,
      finalBookingAmount: 0
    };
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return {
      totalStayDuration: 0,
      roomCost: 0,
      taxes: 0,
      additionalCharges: 0,
      finalBookingAmount: 0,
      error: "Invalid date range: Check-out must be after check-in"
    };
  }

  const diffTime = end.getTime() - start.getTime();
  const rawNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const totalStayDuration = rawNights > 0 ? rawNights : 0;

  const roomPrice = selectedRoom?.price || 0;
  const roomCost = totalStayDuration > 0 ? roomPrice * totalStayDuration : 0;
  const taxes = roomCost > 0 ? Math.round(roomCost * 0.12) : 0; // 12% GST
  const additionalCharges = roomCost > 0 ? 500 : 0; // ₹500 Flat Resort & Concierge Fee
  const finalBookingAmount = roomCost > 0 ? roomCost + taxes + additionalCharges : 0;

  return {
    totalStayDuration,
    roomCost,
    taxes,
    additionalCharges,
    finalBookingAmount
  };
}

function runCalculationTests() {
  console.log('================================================================');
  console.log('🧮 PHASE 4 / EXPERIMENT 2: FINANCIAL & DATE CALCULATIONS TESTS');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title, condition, detail = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${title} ${detail ? '(' + detail + ')' : ''}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title} ${detail ? '(' + detail + ')' : ''}`);
      failed++;
    }
  }

  const mockDeluxe = { id: 1, name: 'Deluxe Room', price: 8500 };
  const mockSuite = { id: 2, name: 'Luxury Suite', price: 12000 };

  // 1. Same-month stay calculation
  const res1 = calculateBookingFinancials(mockDeluxe, '2026-11-10', '2026-11-13');
  assert('Same-month stay (10-13 Nov) is exactly 3 nights', res1.totalStayDuration === 3);
  assert('Room cost is ₹25,500 (8500 * 3)', res1.roomCost === 25500);
  assert('12% GST is ₹3,060 (25500 * 0.12)', res1.taxes === 3060);
  assert('Resort fee is ₹500', res1.additionalCharges === 500);
  assert('Final total is ₹29,060 (25500 + 3060 + 500)', res1.finalBookingAmount === 29060);

  // 2. Cross-month boundary (Nov 28 to Dec 3) -> 5 nights
  const res2 = calculateBookingFinancials(mockSuite, '2026-11-28', '2026-12-03');
  assert('Cross-month boundary (28 Nov to 3 Dec) is exactly 5 nights', res2.totalStayDuration === 5);
  assert('Suite cost is ₹60,000 (12000 * 5)', res2.roomCost === 60000);
  assert('12% GST on ₹60,000 is ₹7,200', res2.taxes === 7200);
  assert('Final total is ₹67,700 (60000 + 7200 + 500)', res2.finalBookingAmount === 67700);

  // 3. Cross-year boundary (30 Dec 2026 to 03 Jan 2027) -> 4 nights
  const res3 = calculateBookingFinancials(mockDeluxe, '2026-12-30', '2027-01-03');
  assert('Cross-year boundary (30 Dec 2026 to 3 Jan 2027) is exactly 4 nights', res3.totalStayDuration === 4);
  assert('Room cost is ₹34,000 (8500 * 4)', res3.roomCost === 34000);
  assert('12% GST is ₹4,080', res3.taxes === 4080);
  assert('Final total is ₹38,580', res3.finalBookingAmount === 38580);

  // 4. Leap year / Feb month boundary (26 Feb to 02 Mar non-leap year 2027) -> 4 nights
  const res4 = calculateBookingFinancials(mockDeluxe, '2027-02-26', '2027-03-02');
  assert('Feb to Mar boundary (26 Feb to 2 Mar 2027) is 4 nights', res4.totalStayDuration === 4);

  // 5. Invalid date ranges: Check-out before Check-in
  const resInvalid1 = calculateBookingFinancials(mockDeluxe, '2026-11-15', '2026-11-10');
  assert('Check-out before Check-in yields 0 nights and error', resInvalid1.totalStayDuration === 0 && Boolean(resInvalid1.error));
  assert('Invalid date range results in ₹0 total amount', resInvalid1.finalBookingAmount === 0);

  // 6. Zero-night stays (Check-out equals Check-in)
  const resInvalid2 = calculateBookingFinancials(mockDeluxe, '2026-11-10', '2026-11-10');
  assert('Same-day check-in and check-out yields 0 nights', resInvalid2.totalStayDuration === 0);
  assert('Zero-night stay results in ₹0 total', resInvalid2.finalBookingAmount === 0);

  // 7. Missing room or dates handling
  const resEmpty = calculateBookingFinancials(null, null, null);
  assert('Empty inputs cleanly return 0 values without throwing', resEmpty.finalBookingAmount === 0 && resEmpty.roomCost === 0);

  // 8. Floating-point precision check
  const oddPriceRoom = { id: 3, name: 'Boutique Room', price: 7777 };
  const resOdd = calculateBookingFinancials(oddPriceRoom, '2026-11-10', '2026-11-13');
  assert('Odd room cost is exact integer (7777 * 3 = 23331)', resOdd.roomCost === 23331);
  assert('Taxes are rounded integer without floating point decimals', Number.isInteger(resOdd.taxes));
  assert('Total amount is rounded integer', Number.isInteger(resOdd.finalBookingAmount));

  console.log('\n================================================================');
  console.log(`📊 CALCULATION TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runCalculationTests();
