// 用瀏覽器自動玩第 4 關（存錢）與第 7 關（請人）與第 8 關（篇章完成），檢查沒有錯誤並截圖
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 420, height: 860 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const shots = path.join(__dirname, '..', 'dist', 'shots'); fs.mkdirSync(shots, { recursive: true });
  const url = 'file://' + path.join(__dirname, '..', 'dist', 'standalone.html');
  await page.goto(url);
  // 注入存檔：全部解鎖、教學看過
  await page.evaluate(() => {
    const progress = {}; for (let i = 1; i <= 32; i++) progress[i] = { stars: 1, best: 125000 };
    localStorage.setItem('tycoon-grandma-save-v1', JSON.stringify({ difficulty: 'normal', progress, learned: [], tutorial: { hud: 1, shop: 1, event: 1, ledger: 1 }, current: null, seedCounter: 7 }));
  });
  for (const levelId of (process.argv[2] || '4,7,8').split(',').map(Number)) {
    await page.goto(url);
    await page.click('#btn-start');
    await page.click(`[data-level="${levelId}"]`);
    while (await page.$('#next')) await page.click('#next');
    let guard = 0, shotShop = false, shotNight = false, shotEv = false;
    while (guard++ < 120) {
      if (await page.$('#go-shop')) { await page.click('#go-shop'); continue; }
      if (await page.$('#open')) {
        if (await page.$('#hire')) { const est = await page.$eval('#qty', (e) => +e.max); if (!shotShop) { await page.screenshot({ path: `${shots}/L${levelId}-shop.png` }); shotShop = true; } }
        const chips = await page.$$('[data-qset]'); if (chips[1]) await chips[1].click();
        await page.click('#open'); continue;
      }
      if (await page.$('[data-opt]')) {
        if (!shotEv || levelId === 13) { await page.screenshot({ path: `${shots}/L${levelId}-event.png` }); shotEv = true; }
        const b = await page.$('[data-opt]:not([disabled])'); await b.click(); continue;
      }
      if (await page.$('#close-shop')) { await page.click('#close-shop'); continue; }
      if (await page.$('#to-night')) { await page.click('#to-night'); continue; }
      if (await page.$('#next-day')) {
        if (await page.$('#bk-d')) { await page.$eval('#bk-d', (e) => { e.value = Math.floor(+e.max * 0.6 / 1000) * 1000; e.dispatchEvent(new Event('input')); }); if (await page.$('#bk-f')) await page.$eval('#bk-f', (e) => { e.value = Math.min(+e.max, 10000); e.dispatchEvent(new Event('input')); }); }
        const tr = await page.$$('input.trade'); if (tr.length && !shotNight) { await tr[0].evaluate((e) => { e.value = Math.min(+e.max, 20000); e.dispatchEvent(new Event('input')); }); }
        if (await page.$('#ins-toggle')) { const on = await page.$eval('#ins-toggle', (e) => e.getAttribute('aria-pressed') === 'true'); if (!on) await page.click('#ins-toggle'); }
        if (!shotNight) { await page.screenshot({ path: `${shots}/L${levelId}-night.png`, fullPage: true }); shotNight = true; }
        await page.click('#next-day'); continue;
      }
      if (await page.$('#retry')) break;
      await page.waitForTimeout(50);
    }
    await page.screenshot({ path: `${shots}/L${levelId}-settle.png`, fullPage: true });
    const t = await page.innerText('#scr-settle');
    console.log(`--- 第 ${levelId} 關 ---\n` + t.split('\n').filter((l) => /過關|差一點|錢筒|總資產|賺了|稱號|篇章|如果選|繳稅|物價|投入|費用|恐慌|斷頭|籃子|被騙|審核/.test(l)).join('\n'));
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log('橫向溢出：', overflow, '；錯誤：', errors.length ? errors : '無');
  await browser.close();
  if (errors.length) process.exit(1);
})();
