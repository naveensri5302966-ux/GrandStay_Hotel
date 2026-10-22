const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.join(__dirname, 'output-evidence', '03_reservation_crud');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function captureLab() {
  console.log('🚀 Starting Comprehensive Puppeteer Lab Screenshot Capture...');
  
  // 1. Fetch genuine JWT token from Express server
  console.log('🔑 Authenticating against Express API /api/auth/login...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'eleanor.vance@example.com',
      password: 'Password@123'
    })
  });
  const loginData = await loginRes.json();
  const realToken = loginData.token;
  const realUser = loginData.user;
  console.log(`✅ Genuine JWT obtained for ${realUser.email}: ${realToken.substring(0, 25)}...`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1600,1100']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1100 });

    // 2. Set genuine user session in browser
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle2' });
    await page.evaluate((user, token) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('authToken', token);
    }, realUser, realToken);

    // 3. Navigate to Home and click EXP 3: CRUD LAB
    console.log('🧭 Navigating to Home and clicking EXP 3: CRUD LAB...');
    await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent.toLowerCase().includes('crud lab'));
      if (link) link.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Helper to click tab
    const clickTab = async (textPattern) => {
      await page.evaluate((pattern) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.toLowerCase().includes(pattern.toLowerCase()));
        if (btn) btn.click();
      }, textPattern);
      await new Promise(r => setTimeout(r, 800));
    };

    // 1. Overview Tab & Run Full CRUD Demo to turn all checks green
    console.log('📸 01: Running Full CRUD Demo with real JWT token...');
    await page.evaluate(() => {
      const fullDemoBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.toLowerCase().includes('run full crud demo'));
      if (fullDemoBtn) fullDemoBtn.click();
    });
    // Wait for demo sequence (6 steps * ~400ms)
    await new Promise(r => setTimeout(r, 4500));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01_crud_lab_overview.png') });

    // 2. Tab a: GET Hotels & Rooms
    console.log('📸 02: Capturing Tab a: GET Hotels & Rooms...');
    await clickTab('get hotels & rooms');
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02_get_hotels_rooms.png') });

    // 3. Tab b: POST Create Reservation
    console.log('📸 03: Capturing Tab b: POST Create...');
    await clickTab('post create');
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03_post_create_reservation.png') });

    // 4. Tab c: PUT / PATCH Update
    console.log('📸 04: Capturing Tab c: PUT / PATCH Update...');
    await clickTab('put / patch update');
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '04_put_patch_update.png') });

    // 5. Tab d: DELETE Cancel
    console.log('📸 05: Capturing Tab d: DELETE Cancel...');
    await clickTab('delete cancel');
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05_delete_cancellation.png') });

    // 6. Tab e: GET History
    console.log('📸 06: Capturing Tab e: GET History...');
    await clickTab('get history');
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06_get_history_audit.png') });

    // 7. Tab f: Errors & Loading
    console.log('📸 07: Capturing Tab f: Errors & Loading...');
    await clickTab('loading & error matrix');
    await new Promise(r => setTimeout(r, 600));
    // Trigger 409 conflict
    await page.evaluate(() => {
      const conflictBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.toLowerCase().includes('409 conflict'));
      if (conflictBtn) conflictBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07_error_conflict_handling.png') });

    // 8. REST API Live Network Inspector
    console.log('📸 08: Capturing Live REST Inspector...');
    await page.evaluate(() => {
      window.scrollTo(0, 1100);
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08_live_rest_inspector.png') });

    console.log('🎉 Done! All 8 detailed screenshots saved into:', OUTPUT_DIR);
  } catch (err) {
    console.error('❌ Error capturing screenshots:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

captureLab();
