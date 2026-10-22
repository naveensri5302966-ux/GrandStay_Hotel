const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  page.on('console', msg => console.log('LOG:', msg.text()));

  await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const email = document.querySelector('input[type="email"]');
    const pass = document.querySelector('input[type="password"]');
    if (email) email.value = 'eleanor.vance@example.com';
    if (pass) pass.value = 'password123';
    document.querySelector('form').requestSubmit();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.goto(`${APP_URL}/bookings`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const content = await page.evaluate(() => {
    const main = document.querySelector('main');
    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
    const h3s = Array.from(document.querySelectorAll('h3')).map(h => h.innerText.trim());
    return {
      buttons,
      h3s,
      textLength: main ? main.innerText.length : 0,
      preview: main ? main.innerText.substring(0, 300) : ''
    };
  });

  console.log('Bookings page inspection:', content);

  await browser.close();
})();
