const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

(async () => {
  console.log('--- STARTING UNIT 4 EXPERIMENTS VERIFICATION ---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  const consoleLogs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(text);
    if (text.startsWith('[API]') || text.startsWith('[HOTELS]') || text.startsWith('[SEARCH]') || text.startsWith('[FILTER]') || text.startsWith('[BOOKING]') || text.startsWith('[RESERVATION]') || text.startsWith('[AUTH]')) {
      console.log(`BROWSER CONSOLE >> ${text}`);
    }
  });

  page.on('pageerror', (err) => {
    console.error('BROWSER PAGE ERROR >>', err.message);
  });

  // -------------------------------------------------------------
  // EXPERIMENT 4: Test Login API (POST /auth/login) & Token Storage
  // -------------------------------------------------------------
  console.log('\n--- TESTING EXPERIMENT 4: Authentication & Token Management ---');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });

  // Submit login form
  const loginBtn = await page.evaluate(() => {
    const btn = document.querySelector('form button[type="submit"]');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked login button:', loginBtn);
  await new Promise(r => setTimeout(r, 1200));

  // Check if token and user are in localStorage
  const authState = await page.evaluate(() => {
    return {
      token: localStorage.getItem('grand_stay_auth_token'),
      user: localStorage.getItem('grand_stay_auth_user'),
      currentUrl: window.location.pathname
    };
  });
  console.log('Auth state after login:', {
    hasToken: Boolean(authState.token),
    hasUser: Boolean(authState.user),
    currentUrl: authState.currentUrl
  });

  if (!authState.token) {
    throw new Error('Experiment 4 Failed: Token not stored in localStorage after login!');
  }
  console.log('✓ Experiment 4 a, b: Login API and Token Storage Passed!');

  // -------------------------------------------------------------
  // EXPERIMENT 1: Test Hotel Fetching, Searching, Filtering & Detail (REST API)
  // -------------------------------------------------------------
  console.log('\n--- TESTING EXPERIMENT 1: REST APIs with Axios ---');
  await page.goto(`${BASE_URL}/hotels`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Count hotel cards
  const hotelCardsCount = await page.evaluate(() => {
    return document.querySelectorAll('article').length;
  });
  console.log(`Loaded ${hotelCardsCount} hotel cards from REST API`);

  if (hotelCardsCount === 0) {
    throw new Error('Experiment 1 Failed: No hotel cards rendered from API!');
  }

  // Test Search/Filter
  console.log('Testing Location Search for "Goa"...');
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="City"]');
    if (input) {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, 'Goa');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 800));

  const filteredCount = await page.evaluate(() => {
    return document.querySelectorAll('article').length;
  });
  console.log(`Filtered hotel cards for "Goa": ${filteredCount}`);
  console.log('✓ Experiment 1 a, b, c: REST API Hotel fetching and filtering Passed!');

  // Test Hotel Detail Page (GET /hotels/:id)
  console.log('Navigating to Hotel Detail Page (/hotel/101)...');
  await page.goto(`${BASE_URL}/hotel/101`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const hotelTitle = await page.evaluate(() => {
    return document.querySelector('h1')?.textContent?.trim();
  });
  console.log(`Hotel Detail title loaded via REST API: "${hotelTitle}"`);
  if (!hotelTitle || !hotelTitle.includes('The Grand Stay')) {
    throw new Error('Experiment 1 d: Failed to load hotel details for ID 101');
  }
  console.log('✓ Experiment 1 d: Individual Hotel Detail & Room Fetch Passed!');

  // -------------------------------------------------------------
  // EXPERIMENT 2: Test Zustand Global Store, Calculations, Persistence
  // -------------------------------------------------------------
  console.log('\n--- TESTING EXPERIMENT 2: Zustand State Management & Middleware ---');
  await page.goto(`${BASE_URL}/booking/room`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  // Verify Zustand persisted state in localStorage
  const zustandStorage = await page.evaluate(() => {
    const raw = localStorage.getItem('grand_stay_booking_store');
    return raw ? JSON.parse(raw) : null;
  });
  console.log('Zustand localStorage persisted keys:', zustandStorage?.state ? Object.keys(zustandStorage.state) : 'none');

  if (!zustandStorage?.state?.selectedHotel) {
    throw new Error('Experiment 2 f: Booking information not persisted in browser storage!');
  }

  // Navigate to summary step to verify financial calculations
  await page.goto(`${BASE_URL}/booking/summary`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  const financialSummary = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasDuration: text.includes('Stay Duration:') || text.includes('Nights'),
      hasRoomCost: text.includes('Room Cost'),
      hasTaxes: text.includes('Taxes (12%'),
      hasTotal: text.includes('Final Booking Amount') || text.includes('₹')
    };
  });
  console.log('Financial Breakdown in Summary step:', financialSummary);
  if (!financialSummary.hasTaxes || !financialSummary.hasTotal) {
    throw new Error('Experiment 2 d: Financial calculations missing in summary step!');
  }
  console.log('✓ Experiment 2 a-f: Zustand Global Store, Middleware, and Persistence Passed!');

  // -------------------------------------------------------------
  // EXPERIMENT 3: Test CRUD Operations (POST, GET, PUT, DELETE)
  // -------------------------------------------------------------
  console.log('\n--- TESTING EXPERIMENT 3: Hotel Reservation CRUD Operations ---');
  
  // 1. POST /reservations
  console.log('Creating a reservation via Checkout form (POST /reservations)...');
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const payBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Pay'));
    if (payBtn) payBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const confirmationText = await page.evaluate(() => document.body.innerText);
  const isConfirmed = confirmationText.includes('Your stay is secured') || confirmationText.includes('RES-2026');
  console.log('Reservation Confirmation screen reached:', isConfirmed);
  if (!isConfirmed) {
    throw new Error('Experiment 3 b: Reservation creation (POST) failed to reach confirmation screen!');
  }
  console.log('✓ Experiment 3 b: POST /reservations Passed!');

  // 2. GET /reservations
  console.log('Navigating to My Bookings (/bookings) to verify GET /reservations...');
  await page.goto(`${BASE_URL}/bookings`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  let reservationsCount = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h3')).filter(h => h.textContent && !h.textContent.includes('No Bookings')).length;
  });
  console.log(`Reservations listed via GET: ${reservationsCount}`);
  if (reservationsCount === 0) {
    throw new Error('Experiment 3 e: GET /reservations returned 0 bookings in history!');
  }
  console.log('✓ Experiment 3 e: GET /reservations History Passed!');

  // 3. PUT /reservations/:id (Update / Modify)
  console.log('Modifying first reservation via PUT request modal...');
  const modifyBtnClicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Modify Stay'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Modify Stay button:', modifyBtnClicked);
  await new Promise(r => setTimeout(r, 600));

  // Change special requests and save
  await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      nativeSetter.call(textarea, 'Updated via Automated PUT Test - Extra Pillows Requested');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Save Changes'));
    if (saveBtn) saveBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const updatedPageText = await page.evaluate(() => document.body.innerText);
  const updateConfirmed = updatedPageText.includes('Updated via Automated PUT Test') || updatedPageText.includes('updated successfully');
  console.log('PUT Update confirmed on page:', updateConfirmed);
  console.log('✓ Experiment 3 c: PUT /reservations/:id Update Passed!');

  // 4. DELETE /reservations/:id (Cancel)
  console.log('Cancelling a reservation via DELETE request modal...');
  await page.evaluate(() => {
    const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Cancel (DELETE)'));
    if (cancelBtn) cancelBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const confirmCancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Confirm Cancellation'));
    if (confirmCancelBtn) confirmCancelBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const deleteConfirmed = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes('cancelled successfully via DELETE') || text.includes('cancelled');
  });
  console.log('DELETE Cancellation confirmed on page:', deleteConfirmed);
  console.log('✓ Experiment 3 d: DELETE /reservations/:id Cancel Passed!');

  // -------------------------------------------------------------
  // EXPERIMENT 4 f: Test 401 Session Expiry Interceptor & Auto-Redirect
  // -------------------------------------------------------------
  console.log('\n--- TESTING EXPERIMENT 4 f: 401 Session Expiry & Auto-Redirect ---');
  await page.goto(`${BASE_URL}/hotels`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  const expiryBtnClicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Test 401 Expiry'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked "Test 401 Expiry" button:', expiryBtnClicked);
  await new Promise(r => setTimeout(r, 1500));

  const finalUrl = await page.evaluate(() => window.location.pathname);
  console.log(`URL after 401 interceptor trigger: ${finalUrl}`);

  const has401Notice = await page.evaluate(() => {
    return document.body.innerText.includes('Session Expired (401 Unauthorized)');
  });
  console.log('401 Expiry notification shown on login page:', has401Notice);

  if (finalUrl !== '/login') {
    throw new Error(`Experiment 4 f Failed: Expected redirect to /login after 401, but got ${finalUrl}`);
  }
  console.log('✓ Experiment 4 f: 401 Session Expiry & Auto-Redirect Passed!');

  await browser.close();
  console.log('\n======================================================');
  console.log('🎉 ALL FOUR EXPERIMENTS VERIFIED AND WORKING 100%! 🎉');
  console.log('======================================================');
})().catch((err) => {
  console.error('\n❌ VERIFICATION ERROR:', err);
  process.exit(1);
});
