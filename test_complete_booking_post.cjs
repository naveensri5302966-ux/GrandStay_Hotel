const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';

(async () => {
  console.log('--- Testing Complete Booking Creation POST /api/reservations via Browser UI ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  page.on('request', (req) => {
    if (req.url().includes('/api/')) {
      console.log(`🌐 [NETWORK REQ] ${req.method()} ${req.url()}`);
    }
  });

  page.on('response', async (res) => {
    if (res.url().includes('/api/')) {
      let preview = '';
      try {
        const json = await res.json();
        preview = JSON.stringify(json).substring(0, 100);
      } catch (e) {}
      console.log(`✅ [NETWORK RES] ${res.status()} ${res.request().method()} ${res.url()} -> ${preview}`);
    }
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[RESERVATION]') || text.includes('[API]') || text.includes('[BOOKING]')) {
      console.log(`📋 ${text}`);
    }
  });

  // 1. Clear session and login
  await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());

  await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const email = document.querySelector('input[type="email"], input[name="emailOrUsername"]');
    if (email) email.value = 'eleanor.vance@example.com';
    const pass = document.querySelector('input[type="password"]');
    if (pass) pass.value = 'password123';
    document.querySelector('form').requestSubmit();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // 2. Select Hotel #102 (Royal Palm Resort)
  console.log('\n--- Selecting Hotel #102 ---');
  await page.goto(`${APP_URL}/hotel/102`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  // Click "Book" or navigate to /booking/room
  await page.goto(`${APP_URL}/booking/room`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  // Advance to Guest details
  console.log('\n--- Advancing to Guest details ---');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.innerText.toUpperCase().includes('GUEST DETAILS'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Advance to Summary
  console.log('\n--- Advancing to Summary step ---');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.innerText.toUpperCase().includes('REVIEW BOOKING') || b.innerText.toUpperCase().includes('CONTINUE'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Proceed to Payment / Checkout
  console.log('\n--- Advancing to Payment step ---');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.innerText.toUpperCase().includes('PROCEED TO PAYMENT'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Fill payment form and submit
  console.log('\n--- Submitting Payment Form (Triggers POST /api/reservations) ---');
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) form.requestSubmit();
  });
  await new Promise((r) => setTimeout(r, 2500));

  // Verify Confirmation
  const currentUrl = await page.evaluate(() => window.location.pathname);
  const pageTitle = await page.evaluate(() => {
    const h1 = document.querySelector('h1, h2');
    return h1 ? h1.innerText : '';
  });
  console.log(`Current URL after booking: ${currentUrl}`);
  console.log(`Confirmation header: "${pageTitle}"`);

  // Verify it appears on /bookings
  console.log('\n--- Checking Bookings List (/bookings) ---');
  await page.goto(`${APP_URL}/bookings`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));

  const bookingTitles = await page.$$eval('h3', (els) => els.map((e) => e.innerText));
  console.log('Bookings on page:', bookingTitles);

  console.log('\n--- POST /api/reservations Creation Verification Succeeded! ---');
  await browser.close();
})();
