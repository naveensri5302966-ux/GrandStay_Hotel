const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';

(async () => {
  console.log('================================================================');
  console.log('🚀 FULL END-TO-END CRUD & AUTH REST API NETWORK VERIFICATION');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  const networkLog = [];
  page.on('request', (req) => {
    if (req.url().includes('/api/')) {
      networkLog.push({
        event: 'REQUEST',
        method: req.method(),
        url: req.url()
      });
      console.log(`🌐 [REQ] ${req.method()} ${req.url()}`);
    }
  });

  page.on('response', async (res) => {
    if (res.url().includes('/api/')) {
      let bodyText = '';
      try {
        const json = await res.json();
        bodyText = JSON.stringify(json).substring(0, 100);
      } catch (e) {
        bodyText = '(non-json)';
      }
      networkLog.push({
        event: 'RESPONSE',
        status: res.status(),
        method: res.request().method(),
        url: res.url()
      });
      console.log(`✅ [RES] ${res.status()} ${res.request().method()} ${res.url()} -> ${bodyText}`);
    }
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[API]') || text.includes('[RESERVATION]') || text.includes('[AUTH]')) {
      console.log(`📋 [LOG] ${text}`);
    }
  });

  try {
    // 1. LOGIN
    console.log('\n--- 1. Performing Genuine Login (POST /api/auth/login) ---');
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      const email = document.querySelector('input[type="email"], input[name="email"]');
      const pass = document.querySelector('input[type="password"]');
      if (email) email.value = 'eleanor.vance@example.com';
      if (pass) pass.value = 'password123';
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // 2. HOTEL DETAIL & ROOM SELECTION
    console.log('\n--- 2. Fetching Hotel Details (GET /api/hotels/101) ---');
    await page.goto(`${APP_URL}/hotel/101`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    // Click "Select Room & Book"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const bookBtn = btns.find((b) => b.innerText.includes('Book') || b.innerText.includes('Select Room'));
      if (bookBtn) bookBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // 3. BOOKING STEP 1 -> STEP 2 (Room -> Guest)
    console.log('\n--- 3. Progressing through Booking Flow ---');
    await page.goto(`${APP_URL}/booking/room`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 800));

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cont = btns.find((b) => b.innerText.includes('Guest Details'));
      if (cont) cont.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // 4. BOOKING STEP 2 -> STEP 3 (Guest -> Summary)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cont = btns.find((b) => b.innerText.includes('Review Booking') || b.innerText.includes('Continue'));
      if (cont) cont.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // 5. BOOKING SUMMARY -> PAYMENT (Summary -> Checkout)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cont = btns.find((b) => b.innerText.includes('Proceed to Payment') || b.innerText.includes('Payment'));
      if (cont) cont.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // 6. CONFIRM PAYMENT -> TRIGGERS POST /api/reservations
    console.log('\n--- 4. Submitting Reservation Creation (POST /api/reservations) ---');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const payBtn = btns.find((b) => b.innerText.includes('Pay') || b.innerText.includes('Confirm'));
      if (payBtn) payBtn.click();
    });
    await new Promise((r) => setTimeout(r, 2000));

    // 7. VIEW RESERVATIONS LIST
    console.log('\n--- 5. Viewing Reservations History (GET /api/reservations) ---');
    await page.goto(`${APP_URL}/bookings`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    // 8. TRIGGER UPDATE MODAL (PUT /api/reservations/:id)
    console.log('\n--- 6. Modifying Reservation (PUT /api/reservations/:id) ---');
    const openMod = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const modBtn = btns.find((b) => b.innerText.includes('Modify Stay'));
      if (modBtn) {
        modBtn.click();
        return true;
      }
      return false;
    });
    console.log('Opened modify modal:', openMod);
    await new Promise((r) => setTimeout(r, 800));

    // Submit update form
    const submittedMod = await page.evaluate(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.value = 'Updated via REST API: VIP high floor requested';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find((b) => b.innerText.includes('Save Changes'));
      if (saveBtn) {
        saveBtn.click();
        return true;
      }
      return false;
    });
    console.log('Submitted modify form:', submittedMod);
    await new Promise((r) => setTimeout(r, 1500));

    // 9. TRIGGER CANCEL (DELETE /api/reservations/:id)
    console.log('\n--- 7. Cancelling Reservation (DELETE /api/reservations/:id) ---');
    const openCancel = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const canBtn = btns.find((b) => b.innerText.includes('Cancel (DELETE)'));
      if (canBtn) {
        canBtn.click();
        return true;
      }
      return false;
    });
    console.log('Opened cancel confirmation modal:', openCancel);
    await new Promise((r) => setTimeout(r, 800));

    // Confirm cancel
    const confirmedCancel = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const confBtn = btns.find((b) => b.innerText.includes('Confirm Cancellation'));
      if (confBtn) {
        confBtn.click();
        return true;
      }
      return false;
    });
    console.log('Confirmed deletion:', confirmedCancel);
    await new Promise((r) => setTimeout(r, 2000));

    // 10. TEST 401 UNAUTHORIZED HANDLING
    console.log('\n--- 8. Testing 401 Unauthorized & Session Revocation ---');
    await page.evaluate(() => {
      localStorage.setItem('grand_stay_auth_token', 'expired-token-123456');
    });
    // Attempt to access bookings or protected resource with expired token
    await page.goto(`${APP_URL}/bookings`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    const finalPath = await page.evaluate(() => window.location.pathname);
    const tokenAfter401 = await page.evaluate(() => localStorage.getItem('grand_stay_auth_token'));
    console.log(`Current URL after 401: ${finalPath}`);
    console.log(`Token cleared after 401: ${tokenAfter401 === null}`);

    console.log('\n================================================================');
    console.log('📊 FINAL HTTP METHODS TESTED IN REAL BACKEND MODE:');
    console.log('================================================================');
    const responses = networkLog.filter((l) => l.event === 'RESPONSE');
    const methods = new Set(responses.map((r) => `${r.method} ${r.status}`));
    for (const m of methods) {
      console.log(`  ✓ ${m}`);
    }

  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    await browser.close();
  }
})();
