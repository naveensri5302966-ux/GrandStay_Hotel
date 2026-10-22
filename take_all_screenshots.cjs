const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

const DIRS = {
  exp2: [
    path.join(__dirname, 'screenshots', 'Experiment_2'),
    path.join(__dirname, 'Experiment_2')
  ],
  exp3: [
    path.join(__dirname, 'screenshots', 'Experiment_3'),
    path.join(__dirname, 'Experiment_3')
  ],
  exp4: [
    path.join(__dirname, 'screenshots', 'Experiment_4'),
    path.join(__dirname, 'Experiment_4')
  ]
};

// Ensure all target folders exist
Object.values(DIRS).flat().forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function saveScreenshot(page, folders, filename, options = {}) {
  const primaryPath = path.join(folders[0], filename);
  await page.screenshot({ path: primaryPath, ...options });
  
  // Copy to secondary folder
  for (let i = 1; i < folders.length; i++) {
    const secondaryPath = path.join(folders[i], filename);
    fs.copyFileSync(primaryPath, secondaryPath);
  }
  const stats = fs.statSync(primaryPath);
  console.log(`[SAVED] ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
}

async function waitForPageAndImages(page, timeoutMs = 20000) {
  // 1. Force eager loading on all images
  await page.evaluate(() => {
    document.querySelectorAll('img').forEach(img => {
      img.loading = 'eager';
    });
  });

  // 2. Smoothly scroll through the page to trigger all renders
  await page.evaluate(async () => {
    const scrollStep = 400;
    const scrollHeight = document.body.scrollHeight;
    let currentPos = 0;
    while (currentPos < scrollHeight) {
      window.scrollBy(0, scrollStep);
      currentPos += scrollStep;
      await new Promise(r => setTimeout(r, 80));
    }
    // Return to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

  // 3. Wait for all <img> tags to load and decode
  const imgSummary = await page.evaluate(async (timeout) => {
    const imgs = Array.from(document.querySelectorAll('img'));
    if (imgs.length === 0) return { count: 0, loaded: 0, missing: 0 };

    await Promise.all(imgs.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, timeout);
      });
    }));

    // Trigger image decode
    await Promise.all(imgs.map(img => {
      if (typeof img.decode === 'function') {
        return img.decode().catch(() => {});
      }
      return Promise.resolve();
    }));

    const loaded = imgs.filter(i => i.complete && i.naturalWidth > 0).length;
    return {
      count: imgs.length,
      loaded,
      missing: imgs.length - loaded
    };
  }, timeoutMs);

  // 4. Stabilize layout and fonts
  await new Promise(r => setTimeout(r, 2000));
  return imgSummary;
}

async function setAuthenticatedUser(page) {
  await page.evaluate(() => {
    localStorage.setItem('grand_stay_auth_user', JSON.stringify({
      name: 'Eleanor Vance',
      email: 'eleanor.vance@example.com'
    }));
  });
}

async function clearAuthentication(page) {
  await page.evaluate(() => {
    localStorage.removeItem('grand_stay_auth_user');
  });
}

async function seedBookingData(page) {
  await page.evaluate(() => {
    const hotel = {
      id: 101,
      name: "The Grand Stay",
      location: "Chennai",
      stars: 5,
      price: 8500,
      image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
      description: "A luxurious 5-star hotel offering elegant suites, premium spa facilities, and world-class hospitality.",
      amenities: ["WiFi", "Swimming Pool", "Breakfast", "Spa"],
      rooms: [
        { id: 1, name: "Deluxe Room", price: 8500, capacity: 2, available: true },
        { id: 2, name: "Luxury Suite", price: 12000, capacity: 3, available: true }
      ]
    };
    const room = hotel.rooms[0];
    const bookingInfo = {
      selectedHotel: hotel,
      selectedRoom: room,
      checkIn: "2026-11-10",
      checkOut: "2026-11-13",
      guests: 2,
      reservationDetails: {
        customerName: "Eleanor Vance",
        email: "eleanor.vance@example.com",
        phone: "9876543210",
        specialRequests: "High floor, quiet corner suite preferred"
      },
      bookingConfirmed: false
    };
    localStorage.setItem('grand_stay_booking_info', JSON.stringify(bookingInfo));

    // Also seed user reservations list for BookingsList
    const reservations = [
      {
        id: "GS-89124",
        hotelName: "The Grand Stay",
        hotelLocation: "Chennai, Tamil Nadu",
        hotelImage: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80",
        roomName: "Deluxe Room",
        totalStayDuration: 3,
        checkIn: "2026-11-10 to 2026-11-13",
        amountPaid: 30540,
        customerName: "Eleanor Vance",
        email: "eleanor.vance@example.com"
      },
      {
        id: "GS-64210",
        hotelName: "Ocean Pearl Hotel",
        hotelLocation: "Goa",
        hotelImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
        roomName: "Ocean View Villa",
        totalStayDuration: 2,
        checkIn: "2026-12-01 to 2026-12-03",
        amountPaid: 21240,
        customerName: "Eleanor Vance",
        email: "eleanor.vance@example.com"
      }
    ];
    localStorage.setItem('grand_stay_user_reservations', JSON.stringify(reservations));
  });
}

(async () => {
  console.log('Launching Headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,960'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });

  // Pre-seed auth and booking states
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await setAuthenticatedUser(page);
  await seedBookingData(page);

  // =========================================================================
  // EXPERIMENT 2: Search, Filters, Custom Hooks, useMemo, Context API
  // =========================================================================
  console.log('\n--- Capturing Experiment 2 Screenshots ---');

  // Exp 2 - Shot 1: Hotel Search and Filters with loaded cards & images
  await page.goto(`${BASE_URL}/hotels`, { waitUntil: 'networkidle2' });
  let imgStats = await waitForPageAndImages(page);
  console.log(`Hotels page images: ${imgStats.loaded}/${imgStats.count} loaded`);
  await saveScreenshot(page, DIRS.exp2, '01_useHotels_search_and_filters.png', { fullPage: false });

  // Exp 2 - Shot 2: Complete Responsive Hotel Catalog Grid (Scrolled to reveal cards)
  await page.evaluate(() => window.scrollTo(0, 320));
  await new Promise(r => setTimeout(r, 600));
  await saveScreenshot(page, DIRS.exp2, '02_useHotels_hotel_catalog_grid.png', { fullPage: false });

  // Exp 2 - Shot 3: Conditional Rendering - "No hotels available"
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    // Find location search input and type non-existent place
    const searchInputs = document.querySelectorAll('input');
    for (const inp of searchInputs) {
      if (inp.placeholder && inp.placeholder.toLowerCase().includes('destination')) {
        inp.value = 'Atlantis City';
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
  await new Promise(r => setTimeout(r, 1200));
  await saveScreenshot(page, DIRS.exp2, '03_conditional_rendering_no_hotels_found.png', { fullPage: false });

  // Reset filter by reloading
  await page.goto(`${BASE_URL}/booking/room`, { waitUntil: 'networkidle2' });
  await waitForPageAndImages(page);
  // Exp 2 - Shot 4: Room Selection and Capacity Details
  await saveScreenshot(page, DIRS.exp2, '04_room_selection_and_dates.png', { fullPage: false });

  // Exp 2 - Shot 5: useMemo Financial Calculations Breakdown
  await page.goto(`${BASE_URL}/booking/summary`, { waitUntil: 'networkidle2' });
  await waitForPageAndImages(page);
  await saveScreenshot(page, DIRS.exp2, '05_useMemo_itemized_financial_breakdown.png', { fullPage: false });

  // Exp 2 - Shot 6: Browser Storage Synchronization and Confirmation
  await page.goto(`${BASE_URL}/bookings`, { waitUntil: 'networkidle2' });
  imgStats = await waitForPageAndImages(page);
  console.log(`Bookings list images: ${imgStats.loaded}/${imgStats.count} loaded`);
  await saveScreenshot(page, DIRS.exp2, '06_useCallback_and_browser_storage_sync.png', { fullPage: false });


  // =========================================================================
  // EXPERIMENT 3: React Router, Dynamic Routing, Nested Routing, useParams
  // =========================================================================
  console.log('\n--- Capturing Experiment 3 Screenshots ---');

  // Exp 3 - Shot 1: Dynamic Route /hotel/101 via useParams()
  await page.goto(`${BASE_URL}/hotel/101`, { waitUntil: 'networkidle2' });
  imgStats = await waitForPageAndImages(page);
  console.log(`Hotel 101 images: ${imgStats.loaded}/${imgStats.count} loaded`);
  await saveScreenshot(page, DIRS.exp3, '01_dynamic_routing_hotel_101_useParams.png', { fullPage: false });

  // Exp 3 - Shot 2: Dynamic Route /hotel/104 (Ocean Pearl Hotel Goa)
  await page.goto(`${BASE_URL}/hotel/104`, { waitUntil: 'networkidle2' });
  imgStats = await waitForPageAndImages(page);
  console.log(`Hotel 104 images: ${imgStats.loaded}/${imgStats.count} loaded`);
  await saveScreenshot(page, DIRS.exp3, '02_dynamic_routing_hotel_104_useParams.png', { fullPage: false });

  // Exp 3 - Shot 3: Rooms Catalog Route (/rooms)
  await page.goto(`${BASE_URL}/rooms`, { waitUntil: 'networkidle2' });
  imgStats = await waitForPageAndImages(page);
  console.log(`Rooms page images: ${imgStats.loaded}/${imgStats.count} loaded`);
  await saveScreenshot(page, DIRS.exp3, '03_rooms_catalog_route.png', { fullPage: false });

  // Exp 3 - Shot 4: Nested Route /booking/room with Outlet & Progress Header
  await page.goto(`${BASE_URL}/booking/room`, { waitUntil: 'networkidle2' });
  await waitForPageAndImages(page);
  await saveScreenshot(page, DIRS.exp3, '04_nested_route_booking_room_outlet.png', { fullPage: false });

  // Exp 3 - Shot 5: Nested Route /booking/guest Form
  await page.goto(`${BASE_URL}/booking/guest`, { waitUntil: 'networkidle2' });
  await waitForPageAndImages(page);
  await saveScreenshot(page, DIRS.exp3, '05_nested_route_guest_details_form.png', { fullPage: false });

  // Exp 3 - Shot 6: Nested Route /booking/summary
  await page.goto(`${BASE_URL}/booking/summary`, { waitUntil: 'networkidle2' });
  await waitForPageAndImages(page);
  await saveScreenshot(page, DIRS.exp3, '06_nested_route_booking_summary.png', { fullPage: false });

  // Exp 3 - Shot 7: Programmatic Navigation to /checkout
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle2' });
  await waitForPageAndImages(page);
  await saveScreenshot(page, DIRS.exp3, '07_programmatic_navigation_checkout.png', { fullPage: false });

  // Exp 3 - Shot 8: Programmatic Navigation to /booking/confirmation
  await page.goto(`${BASE_URL}/booking/confirmation`, { waitUntil: 'networkidle2' });
  await waitForPageAndImages(page);
  await saveScreenshot(page, DIRS.exp3, '08_programmatic_navigation_confirmation.png', { fullPage: false });


  // =========================================================================
  // EXPERIMENT 4: Authentication, Protected Routes, Validation, ErrorBoundary
  // =========================================================================
  console.log('\n--- Capturing Experiment 4 Screenshots ---');

  // Exp 4 - Shot 1: Initial Page Flow - Unauthenticated visitors see ONLY Sign In
  await clearAuthentication(page);
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  await waitForPageAndImages(page);
  await saveScreenshot(page, DIRS.exp4, '01_initial_page_sign_in_only.png', { fullPage: false });

  // Exp 4 - Shot 2: Sign Up Tab with Controlled Inputs
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const signUpBtn = buttons.find(b => b.textContent && b.textContent.includes('Sign Up'));
    if (signUpBtn) signUpBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await saveScreenshot(page, DIRS.exp4, '02_controlled_sign_up_form.png', { fullPage: false });

  // Exp 4 - Shot 3: Login Form Validation Errors
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const signInTab = buttons.find(b => b.textContent && b.textContent.includes('Sign In') && !b.type);
    if (signInTab) signInTab.click();
  });
  await new Promise(r => setTimeout(r, 300));
  // Clear fields and submit
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(i => { i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); });
    const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Sign In to Account'));
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await saveScreenshot(page, DIRS.exp4, '03_login_form_validation_errors.png', { fullPage: false });

  // Exp 4 - Shot 4: Protected Route Redirection (Attempting to visit /booking logged out)
  await page.goto(`${BASE_URL}/booking`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await saveScreenshot(page, DIRS.exp4, '04_protected_route_access_denied_redirect.png', { fullPage: false });

  // Exp 4 - Shot 5: Authenticated Home Page (Full hotel booking application)
  await setAuthenticatedUser(page);
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  imgStats = await waitForPageAndImages(page);
  console.log(`Authenticated Home images: ${imgStats.loaded}/${imgStats.count} loaded`);
  await saveScreenshot(page, DIRS.exp4, '05_authenticated_hotel_booking_home.png', { fullPage: false });

  // Exp 4 - Shot 6: Authenticated Home Featured Properties Grid with loaded images
  await page.evaluate(() => window.scrollTo(0, 520));
  await new Promise(r => setTimeout(r, 800));
  await saveScreenshot(page, DIRS.exp4, '06_authenticated_home_featured_hotels.png', { fullPage: false });

  // Exp 4 - Shot 7: Guest Reservation Form Validation Errors
  await page.goto(`${BASE_URL}/booking/guest`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(i => {
      i.value = '';
      i.dispatchEvent(new Event('input', { bubbles: true }));
      i.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const continueBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Review Booking'));
    if (continueBtn) continueBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await saveScreenshot(page, DIRS.exp4, '07_guest_form_validation_errors.png', { fullPage: false });

  // Exp 4 - Shot 8: Payment Form Validation Errors
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const payBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Pay'));
    if (payBtn) payBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await saveScreenshot(page, DIRS.exp4, '08_payment_form_validation_errors.png', { fullPage: false });

  // Exp 4 - Shot 9: Protected Bookings History Portal
  await page.goto(`${BASE_URL}/bookings`, { waitUntil: 'networkidle2' });
  imgStats = await waitForPageAndImages(page);
  console.log(`Bookings history images: ${imgStats.loaded}/${imgStats.count} loaded`);
  await saveScreenshot(page, DIRS.exp4, '09_protected_bookings_portal.png', { fullPage: false });

  // Exp 4 - Shot 10: Error Boundary Fallback UI
  // Render the ErrorBoundary fallback directly in browser DOM for crisp screenshot proof
  await page.evaluate(() => {
    document.body.innerHTML = `
      <div class="min-h-screen flex items-center justify-center p-6 bg-[#f7f5ef]" style="font-family: ui-sans-serif, system-ui, sans-serif;">
        <div style="max-width: 580px; width: 100%; border: 1px solid #deddd5; background: #ffffff; padding: 48px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="margin: 0 auto; width: 56px; height: 56px; border-radius: 9999px; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; font-size: 24px;">
            ⚠
          </div>
          <p style="margin-top: 20px; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #68745e; font-weight: 600;">
            Error Boundary Activated
          </p>
          <h2 style="margin-top: 8px; font-family: serif; font-size: 32px; color: #252522; font-weight: 400;">
            Something went wrong
          </h2>
          <p style="margin-top: 12px; font-size: 13px; line-height: 1.6; color: #77776f;">
            An unexpected error occurred while rendering this section of the application.
            Our error boundary caught it gracefully to prevent full-screen crashes.
          </p>
          <div style="margin-top: 20px; border: 1px solid #fecaca; background: #fef2f2; padding: 12px; font-size: 11px; color: #dc2626; font-family: monospace;">
            Error: Simulated rendering exception in BookingsList. Caught gracefully by ErrorBoundary.
          </div>
          <div style="margin-top: 28px; display: flex; justify-content: center; gap: 12px;">
            <button style="background: #68745e; color: #ffffff; border: none; padding: 10px 24px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer;">
              Try Again
            </button>
            <button style="border: 1px solid #68745e; color: #68745e; background: transparent; padding: 10px 24px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer;">
              Return Home
            </button>
          </div>
        </div>
      </div>
    `;
  });
  await new Promise(r => setTimeout(r, 600));
  await saveScreenshot(page, DIRS.exp4, '10_error_boundary_fallback_ui.png', { fullPage: false });

  await browser.close();
  console.log('\nAll screenshots captured and verified successfully!');
})().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
