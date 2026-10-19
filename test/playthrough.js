// 用瀏覽器自動玩一遍：第 1 關從頭到結算，順便截圖
// 執行：node test/playthrough.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 860 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const shots = path.join(__dirname, '..', 'dist', 'shots');
  require('fs').mkdirSync(shots, { recursive: true });
  await page.goto('file://' + path.join(__dirname, '..', 'dist', 'standalone.html'));
  await page.waitForSelector('#btn-start');
  await page.screenshot({ path: shots + '/01-title.png' });
  await page.click('[data-diff="normal"]');
  await page.click('#btn-start');
  await page.screenshot({ path: shots + '/02-map.png' });
  await page.click('[data-level="1"]');
  await page.screenshot({ path: shots + '/03-intro.png' });
  while (await page.$('#next')) { await page.click('#next'); }
  await page.screenshot({ path: shots + '/04-morning.png' });
  let day = 0, guard = 0;
  while (guard++ < 60) {
    if (await page.$('#go-shop')) { await page.click('#go-shop'); if (day === 0) await page.screenshot({ path: shots + '/05-shop.png' }); continue; }
    if (await page.$('#open')) { await page.click('[data-qset]:nth-child(2)'); await page.click('#open'); if (day === 0) await page.screenshot({ path: shots + '/06-event.png' }); continue; }
    if (await page.$('[data-opt]')) { await page.click('[data-opt="0"]'); if (day === 1) await page.screenshot({ path: shots + '/07-event-result.png' }); continue; }
    if (await page.$('#close-shop')) { await page.click('#close-shop'); if (day === 0) await page.screenshot({ path: shots + '/08-ledger.png' }); continue; }
    if (await page.$('#to-night')) { await page.click('#to-night'); continue; }
    if (await page.$('#next-day')) { day++; if (day === 1) await page.screenshot({ path: shots + '/09-night.png' }); await page.click('#next-day'); continue; }
    if (await page.$('#retry')) break;
    await page.waitForTimeout(100);
  }
  await page.screenshot({ path: shots + '/10-settle.png', fullPage: true });
  const text = await page.innerText('#scr-settle');
  console.log(text.slice(0, 600));
  // 圖鑑
  await page.click('#to-map, #next-level');
  await page.goto('file://' + path.join(__dirname, '..', 'dist', 'standalone.html'));
  await page.click('#btn-glossary');
  await page.screenshot({ path: shots + '/11-glossary.png' });
  await page.click('.term-card[data-term]');
  await page.screenshot({ path: shots + '/12-term.png' });
  // 深色
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('file://' + path.join(__dirname, '..', 'dist', 'standalone.html'));
  await page.screenshot({ path: shots + '/13-dark.png' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log('橫向溢出：', overflow, '；錯誤：', errors.length ? errors : '無');
  await browser.close();
  if (errors.length) process.exit(1);
})();
