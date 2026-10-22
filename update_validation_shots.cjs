const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

const DIRS_EXP4 = [
  path.join(__dirname, 'screenshots', 'Experiment_4'),
  path.join(__dirname, 'Experiment_4')
];

function saveToBoth(shotPathRel, buffer) {
  for (const d of DIRS_EXP4) {
    const full = path.join(d, shotPathRel);
    fs.writeFileSync(full, buffer);
    console.log(`Saved ${full}`);
  }
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,960']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });

  // 1. Login Form Validation Errors
  console.log('Capturing Login Form Validation Errors...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.removeItem('grand_stay_auth_user');
  });
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  
  // Make sure we are on sign in tab and clear inputs
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(i => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(i, '');
      i.dispatchEvent(new Event('input', { bubbles: true }));
      i.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    // Click submit
    const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Sign In & Access Hotel Booking'));
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  let buf = await page.screenshot();
  saveToBoth('03_login_form_validation_errors.png', buf);

  // Set Auth
  await page.evaluate(() => {
    localStorage.setItem('grand_stay_auth_user', JSON.stringify({ name: 'Eleanor Vance', email: 'eleanor.vance@example.com' }));
  });

  // 2. Guest Form Validation Errors
  console.log('Capturing Guest Details Form Validation Errors...');
  await page.goto(`${BASE_URL}/booking/guest`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(i => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(i, '');
      i.dispatchEvent(new Event('input', { bubbles: true }));
      i.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    // Click CONTINUE TO SUMMARY
    const continueBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('CONTINUE TO SUMMARY'));
    if (continueBtn) continueBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  buf = await page.screenshot();
  saveToBoth('07_guest_form_validation_errors.png', buf);

  // 3. Payment Form Validation Errors
  console.log('Capturing Payment Form Validation Errors...');
  await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    // Scroll down to submit button and click it
    const payBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('CONFIRM') || b.textContent.includes('PAY')));
    if (payBtn) {
      payBtn.scrollIntoView({ behavior: 'instant', block: 'center' });
      payBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 800));
  buf = await page.screenshot();
  saveToBoth('08_payment_form_validation_errors.png', buf);

  await browser.close();
  console.log('Validation error screenshots successfully updated!');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
