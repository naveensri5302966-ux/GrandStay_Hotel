const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';

(async () => {
  console.log('--- Testing Real PUT & DELETE HTTP Requests via Browser UI ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  page.on('request', (req) => {
    if (req.url().includes('/api/reservations')) {
      console.log(`🌐 [NETWORK REQ] ${req.method()} ${req.url()}`);
    }
  });

  page.on('response', async (res) => {
    if (res.url().includes('/api/reservations')) {
      let dataPreview = '';
      try {
        const json = await res.json();
        dataPreview = JSON.stringify(json).substring(0, 100);
      } catch (e) {}
      console.log(`✅ [NETWORK RES] ${res.status()} ${res.request().method()} ${res.url()} -> ${dataPreview}`);
    }
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[RESERVATION]') || text.includes('[API]')) {
      console.log(`📋 ${text}`);
    }
  });

  // 1. Clear session to start fresh
  await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.clear();
  });

  // 2. Login
  console.log('\n--- Logging in ---');
  await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('form button[type="submit"]');
  await page.evaluate(() => {
    const email = document.querySelector('input[type="email"], input[name="emailOrUsername"]');
    if (email) email.value = 'eleanor.vance@example.com';
    const pass = document.querySelector('input[type="password"]');
    if (pass) pass.value = 'password123';
    document.querySelector('form').requestSubmit();
  });
  await new Promise((r) => setTimeout(r, 1500));

  // 3. Go to Bookings
  console.log('\n--- Navigating to /bookings ---');
  await page.goto(`${APP_URL}/bookings`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));

  // 4. Click "Modify Stay (PUT)"
  console.log('\n--- Clicking Modify Stay (PUT) ---');
  const modClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.innerText.toUpperCase().includes('MODIFY STAY'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked modify button:', modClicked);
  await new Promise((r) => setTimeout(r, 800));

  // 5. In modal, change special requests and click Save Changes (PUT)
  console.log('\n--- Submitting PUT update via modal ---');
  const saveClicked = await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = 'Special Sea View with Early 10AM Check-in';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const btns = Array.from(document.querySelectorAll('button'));
    const saveBtn = btns.find((b) => b.innerText.toUpperCase().includes('SAVE CHANGES'));
    if (saveBtn) {
      saveBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Save Changes (PUT):', saveClicked);
  await new Promise((r) => setTimeout(r, 2000));

  // 6. Click "Cancel (DELETE)"
  console.log('\n--- Clicking Cancel Stay (DELETE) ---');
  const cancelClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.innerText.toUpperCase().includes('CANCEL (DELETE)'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked initial cancel button:', cancelClicked);
  await new Promise((r) => setTimeout(r, 800));

  // 7. Confirm Cancellation in Modal
  console.log('\n--- Confirming cancellation in modal ---');
  const confirmCancelClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const confBtn = btns.find((b) => b.innerText.toUpperCase().includes('CONFIRM CANCELLATION'));
    if (confBtn) {
      confBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Confirm Cancellation (DELETE):', confirmCancelClicked);
  await new Promise((r) => setTimeout(r, 2000));

  console.log('\n--- Browser PUT and DELETE Verification Complete ---');
  await browser.close();
})();
