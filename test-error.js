const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', exception => {
    console.log(`Uncaught exception: "${exception}"`);
  });

  await page.goto('https://lapak-jas-merah.vercel.app/', { waitUntil: 'networkidle' });
  
  await browser.close();
})();
