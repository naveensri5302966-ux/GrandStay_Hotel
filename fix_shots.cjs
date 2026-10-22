const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,960']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });
  
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('grand_stay_auth_user', JSON.stringify({ name: 'Eleanor Vance', email: 'eleanor.vance@example.com' }));
  });
  await page.goto('http://localhost:5173/hotels', { waitUntil: 'networkidle2' });
  
  // Set range slider to 3000 to trigger "No hotels available"
  await page.evaluate(() => {
    const range = document.querySelector('input[type="range"]');
    if (range) {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(range, '3000');
      range.dispatchEvent(new Event('input', { bubbles: true }));
      range.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  await new Promise(r => setTimeout(r, 1200));
  const shotPath = 'screenshots/Experiment_2/03_conditional_rendering_no_hotels_found.png';
  await page.screenshot({ path: shotPath });
  fs.copyFileSync(shotPath, 'Experiment_2/03_conditional_rendering_no_hotels_found.png');
  console.log('03_conditional_rendering_no_hotels_found.png updated!');

  await browser.close();
})().catch(err => {
  console.error('Error in fix_shots:', err);
  process.exit(1);
});
