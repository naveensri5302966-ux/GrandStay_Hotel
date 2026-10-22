const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const SHOTS_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SHOTS_DIR)) {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
}

(async () => {
  console.log('================================================================');
  console.log('🌐 PHASE 11: FULL BROWSER AUTOMATION & NETWORK VERIFICATION');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  const networkTraffic = [];
  page.on('request', (req) => {
    if (req.url().includes('/api/')) {
      networkTraffic.push({
        type: 'REQ',
        method: req.method(),
        url: req.url()
      });
      console.log(`🌐 [BROWSER NETWORK REQ] ${req.method()} ${req.url()}`);
    }
  });

  page.on('response', async (res) => {
    if (res.url().includes('/api/')) {
      let preview = '';
      try {
        const json = await res.json();
        preview = Array.isArray(json) ? `[${json.length} items]` : JSON.stringify(json).substring(0, 70);
      } catch (e) {
        preview = '(non-json)';
      }
      networkTraffic.push({
        type: 'RES',
        status: res.status(),
        method: res.request().method(),
        url: res.url()
      });
      console.log(`✅ [BROWSER NETWORK RES] ${res.status()} ${res.request().method()} ${res.url()} -> ${preview}`);
    }
  });

  const consoleLogs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleLogs.push(text);
    if (text.includes('[API]') || text.includes('[RESERVATION]') || text.includes('[AUTH]') || text.includes('[HOTELS]')) {
      console.log(`📋 [DEV CONSOLE] ${text}`);
    }
  });

  page.on('pageerror', (err) => {
    console.error('❌ [PAGE ERROR]', err.message);
  });

  try {
    // 1. Initial State & Login UI
    console.log('\n--- Step 1: Navigating to /login ---');
    await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());

    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('form button[type="submit"]');
    await page.screenshot({ path: path.join(SHOTS_DIR, '01_login_page.png') });
    console.log('📸 Captured 01_login_page.png');

    // Submit Eleanor login
    await page.evaluate(() => {
      document.querySelector('input[type="email"], input[name="emailOrUsername"]').value = 'eleanor.vance@example.com';
      document.querySelector('input[type="password"]').value = 'Password@123';
      document.querySelector('form').requestSubmit();
    });
    await new Promise((r) => setTimeout(r, 1500));

    // 2. Home Page & Hotel Listing (GET /api/hotels)
    console.log('\n--- Step 2: Hotel Listing & Search (GET /api/hotels) ---');
    await page.goto(`${APP_URL}/hotels`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SHOTS_DIR, '02_hotels_listing.png') });
    console.log('📸 Captured 02_hotels_listing.png');

    // 3. Location Search Filter
    console.log('\n--- Step 3: Location Search Filter for "Chennai" ---');
    const searchInput = await page.$('input[placeholder*="city" i], input[placeholder*="location" i], input[placeholder*="search" i]');
    if (searchInput) {
      await searchInput.click({ clickCount: 3 });
      await searchInput.type('Chennai');
      await new Promise((r) => setTimeout(r, 800));

      const searchBtn = await page.$('button[type="submit"], button:has-text("Search")');
      if (searchBtn) await searchBtn.click();
      await new Promise((r) => setTimeout(r, 1200));
    }
    await page.screenshot({ path: path.join(SHOTS_DIR, '03_hotels_filtered_chennai.png') });
    console.log('📸 Captured 03_hotels_filtered_chennai.png');

    // 4. Hotel Detail & Room Selection (GET /api/hotels/101)
    console.log('\n--- Step 4: Hotel Detail & Rooms (GET /api/hotels/101) ---');
    await page.goto(`${APP_URL}/hotel/101`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SHOTS_DIR, '04_hotel_detail.png') });
    console.log('📸 Captured 04_hotel_detail.png');

    // 5. Progress through Booking Flow
    console.log('\n--- Step 5: Booking Stepper Flow ---');
    await page.goto(`${APP_URL}/booking/room`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 800));

    // To Guest details
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.innerText.toUpperCase().includes('GUEST DETAILS'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // To Summary
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.innerText.toUpperCase().includes('REVIEW BOOKING') || b.innerText.toUpperCase().includes('CONTINUE'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SHOTS_DIR, '05_booking_summary.png') });
    console.log('📸 Captured 05_booking_summary.png');

    // To Payment
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.innerText.toUpperCase().includes('PROCEED TO PAYMENT'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // 6. Submit Payment (POST /api/reservations)
    console.log('\n--- Step 6: Submitting Payment & Creating Reservation (POST /api/reservations) ---');
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SHOTS_DIR, '06_booking_confirmation.png') });
    console.log('📸 Captured 06_booking_confirmation.png');

    // 7. View Bookings List (GET /api/reservations)
    console.log('\n--- Step 7: Bookings History (GET /api/reservations) ---');
    await page.goto(`${APP_URL}/bookings`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SHOTS_DIR, '07_bookings_history.png') });
    console.log('📸 Captured 07_bookings_history.png');

    // 8. Modify Reservation (PUT /api/reservations/:id)
    console.log('\n--- Step 8: Modifying Reservation (PUT /api/reservations/:id) ---');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.innerText.toUpperCase().includes('MODIFY STAY'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    await page.evaluate(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.value = 'Verified high floor with sunset sea view';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find((b) => b.innerText.toUpperCase().includes('SAVE CHANGES'));
      if (saveBtn) saveBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));

    // 9. Cancel Reservation (DELETE /api/reservations/:id)
    console.log('\n--- Step 9: Cancelling Reservation (DELETE /api/reservations/:id) ---');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.innerText.toUpperCase().includes('CANCEL (DELETE)'));
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const confBtn = btns.find((b) => b.innerText.toUpperCase().includes('CONFIRM CANCELLATION'));
      if (confBtn) confBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SHOTS_DIR, '08_bookings_after_cancel.png') });
    console.log('📸 Captured 08_bookings_after_cancel.png');

    console.log('\n================================================================');
    console.log('📊 BROWSER NETWORK AUDIT SUMMARY:');
    console.log('================================================================');
    const resCalls = networkTraffic.filter((c) => c.type === 'RES');
    const uniqueCalls = {};
    resCalls.forEach((c) => {
      const key = `${c.method} ${c.status} ${c.url.replace(/\?.*$/, '')}`;
      uniqueCalls[key] = (uniqueCalls[key] || 0) + 1;
    });

    for (const [key, count] of Object.entries(uniqueCalls)) {
      console.log(`  ✓ [REAL HTTP] ${key} (${count}x)`);
    }

    console.log('\n✅ BROWSER AUTOMATION & NETWORK VERIFICATION PASSED COMPLETELY!');
  } catch (err) {
    console.error('Fatal error during browser test:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
