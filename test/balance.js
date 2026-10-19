// 自動平衡測試：讓電腦用幾種策略各玩上百局，看過關率是否合理
// 執行：node test/balance.js
const Engine = require('../src/engine.js');
const Data = require('../src/data4.js');

function play(levelId, diff, seed, strategy) {
  let s = Engine.createLevel(Data, levelId, diff, seed);
  const rng = Engine.rngFor(seed, 0, 'strategy');
  while (!s.done) {
    let a;
    if (s.phase === 'shop') a = strategy.shop(s, rng);
    else if (s.phase === 'event') a = strategy.event(s, rng);
    else if (s.phase === 'night' && strategy.night) a = strategy.night(s, rng);
    else a = { type: 'next' };
    s = Engine.step(Data, s, a);
  }
  return s;
}

const prodOf = (s) => Data.products[Data.levels.find((l) => l.id === s.levelId).product];

const lvOf = (s) => Data.levels.find((l) => l.id === s.levelId);
const firstAllowed = (s) => { const ev = Data.events.find((e) => e.id === s.today.eventId); const o = Engine.optsOf(ev, s); return Math.max(0, o.findIndex((x) => Engine.optionAllowed(x, s))); };
// 會算的玩家：進貨剛好、參考價、客人多才請人、手上留 20,000 其他放活存
const strategies = {
  smart: {
    shop: (s) => { const p = prodOf(s), lv = lvOf(s); const cap = lv.capacity || Infinity; const hire = !!lv.staff && s.today.estimate > cap + 40; const want = Math.min(s.today.estimate, cap + (hire ? lv.staff.capacity : 0)); return { qty: Math.max(0, want - Engine.stockQty(s)), price: p.refPrice, hire }; },
    event: (s) => ({ opt: firstAllowed(s) }),
    night: (s) => ({ type: 'next', bank: { demand: Math.max(0, s.cash - 20000) }, insure: true }),
  },
  locker: { // 把錢全鎖進定存的人
    shop: (s) => { const p = prodOf(s), lv = lvOf(s); return { qty: Math.max(0, Math.min(s.today.estimate, lv.capacity || 1e9) - Engine.stockQty(s)), price: p.refPrice, hire: false }; },
    event: (s) => ({ opt: firstAllowed(s) }),
    night: (s) => ({ type: 'next', bank: { fixed: Math.max(0, s.cash - 3000) } }),
  },
  cautious: { // 少做一點、賣參考價
    shop: (s) => { const p = prodOf(s); return { qty: Math.max(0, Math.round(s.today.estimate * 0.85) - Engine.stockQty(s)), price: p.refPrice }; },
    event: (s) => ({ opt: 1 }),
  },
  random: {
    shop: (s, rng) => { const p = prodOf(s); return { qty: Math.round(rng() * 2 * s.today.estimate), price: Math.round(p.refPrice * (0.7 + rng() * 0.8)) }; },
    event: (s, rng) => ({ opt: Math.floor(rng() * 3) }),
    night: (s, rng) => ({ type: 'next', bank: { demand: Math.round(rng() * s.cash * 0.5), fixed: Math.round(rng() * s.cash * 0.3) } }),
  },
  greedy: { // 進很多、賣很貴
    shop: (s) => { const p = prodOf(s); return { qty: Math.round(s.today.estimate * 1.6), price: Math.round(p.refPrice * 1.3), hire: true }; },
    event: (s) => { const ev = Data.events.find((e) => e.id === s.today.eventId); const o = Engine.optsOf(ev, s); let i = o.length - 1; while (i > 0 && !Engine.optionAllowed(o[i], s)) i--; return { opt: i }; },
  },
  bulk: { // 第三關的陷阱：一次進到折扣門檻
    shop: (s) => { const p = prodOf(s); const have = Engine.stockQty(s); return { qty: have > 100 ? 0 : (p.bulk ? p.bulk.qty : s.today.estimate), price: p.refPrice }; },
    event: (s) => { const ev = Data.events.find((e) => e.id === s.today.eventId); const o = Engine.optsOf(ev, s); return { opt: Engine.optionAllowed(o[1] || o[0], s) ? Math.min(1, o.length - 1) : 0 }; },
  },
};

// 篇章三：投資策略（只在有市場的關卡生效）
const mkt = (s) => Data.levels.find((l) => l.id === s.levelId).market;
const spread = (s) => { const m = mkt(s); if (!m || s.day !== 3 || (s.market && Object.keys(s.market.holdings).length)) return undefined; const ids = m.products.filter((id) => !Data.market[id].trap); const each = Math.min(20000, Math.floor(Math.max(0, s.cash - 30000) / ids.length / 1000) * 1000); const t = {}; ids.forEach((id) => { t[id] = each; }); return t; };
const allin = (s, id) => { const m = mkt(s); if (!m || s.day !== 1) return undefined; const pick = id || m.products[m.products.length - 1]; return { [pick]: Math.floor(Math.max(0, s.cash - 15000) / 1000) * 1000 }; };
const panicSell = (s) => { const m = mkt(s); if (!m || !s.market) return undefined; const t = {}; let any = false; Object.keys(s.market.holdings).forEach((id) => { const h = s.market.hist[id]; if (h.length >= 2 && h[h.length - 1] < h[h.length - 2] * 0.92) { t[id] = -1e9; any = true; } }); return any ? t : undefined; };
Object.assign(strategies, {
  diversify: { shop: strategies.smart.shop, event: (s) => { const ev = Data.events.find((e) => e.id === s.today.eventId); const o = Engine.optsOf(ev, s); const i = o.findIndex((x) => /分三籃|不動|短天期|一半一半|不融資|換 20,000|現在先換|不買|不理|不買不賣|什麼都不做|問他|存款利息變多/.test(x.label) && Engine.optionAllowed(x, s)); return { opt: i >= 0 ? i : firstAllowed(s) }; }, night: (s) => ({ type: 'next', trades: spread(s), bank: { demand: Math.max(0, s.cash - 25000 - (spread(s) ? Object.values(spread(s)).reduce((a, b) => a + b, 0) : 0)) } }) },
  allin: { shop: strategies.smart.shop, event: (s) => { const ev = Data.events.find((e) => e.id === s.today.eventId); const o = Engine.optsOf(ev, s); const i = o.findIndex((x) => /全押|全買|全換|長天期|融資三倍|八成|交貨那天|買 50,000|買 30,000|攤平|把手上現金/.test(x.label) && Engine.optionAllowed(x, s)); let j = o.length - 1; while (j > 0 && !Engine.optionAllowed(o[j], s)) j--; return { opt: i >= 0 ? i : j }; }, night: (s) => ({ type: 'next', trades: allin(s), bank: { demand: s.day > 1 ? Math.max(0, s.cash - 25000) : 0 } }) },
  panic: { shop: strategies.smart.shop, event: (s) => { const ev = Data.events.find((e) => e.id === s.today.eventId); const o = Engine.optsOf(ev, s); const i = o.findIndex((x) => /全部賣掉|認賠|分三籃|一半一半|不融資/.test(x.label) && Engine.optionAllowed(x, s)); return { opt: i >= 0 ? i : firstAllowed(s) }; }, night: (s) => ({ type: 'next', trades: panicSell(s) || spread(s), bank: { demand: Math.max(0, s.cash - 25000 - (spread(s) ? Object.values(spread(s)).reduce((a, b) => a + b, 0) : 0)) } }) },
  noinvest: { shop: strategies.smart.shop, event: (s) => { const ev = Data.events.find((e) => e.id === s.today.eventId); const o = Engine.optsOf(ev, s); const i = o.findIndex((x) => /不買|不投資|不動|等央行|不碰|不換|不理|現在先換|不買不賣|什麼都不做|問他|存款利息變多/.test(x.label) && Engine.optionAllowed(x, s)); return { opt: i >= 0 ? i : firstAllowed(s) }; }, night: (s) => ({ type: 'next', bank: { demand: Math.max(0, s.cash - 20000) } }) },
});

// 篇章四：受害者（每次都上鉤）、懷疑者（每次都先查）
const VICTIM = /先投 20,000|繳稅解鎖|再投 10,000|裝起來入金|再入金|給他網銀|跟著投|相信她|跟銀行借 60,000|加入，買套組|拉兩個|借她 15,000|照做|去 ATM|投 30,000|馬上匯|幫阿嬤去銀行|幫阿嬤解定存/;
const SKEPTIC = /問老師|退群|不繳|先去主管機關|不理，打 165|跟客人說|問她平台|先見面|不用了|我睡一覺|問：「不拉人|婉拒|不拉，認賠|不借|掛掉|去主持人|不理，滑|陪阿嬤|給阿嬤一個讚|跟阿嬤道歉|幸好沒投/;
const pick = (s, re, fallbackLast) => { const ev = Data.events.find((e) => e.id === s.today.eventId); const o = Engine.optsOf(ev, s); const i = o.findIndex((x) => re.test(x.label) && Engine.optionAllowed(x, s)); if (i >= 0) return { opt: i }; if (!fallbackLast) return { opt: firstAllowed(s) }; let j = o.length - 1; while (j > 0 && !Engine.optionAllowed(o[j], s)) j--; return { opt: j }; };
Object.assign(strategies, {
  victim: { shop: strategies.smart.shop, event: (s) => pick(s, VICTIM, false), night: (s) => ({ type: 'next', bank: { demand: Math.max(0, s.cash - 45000) } }) },
  skeptic: { shop: strategies.smart.shop, event: (s) => pick(s, SKEPTIC, false), night: (s) => ({ type: 'next', bank: { demand: Math.max(0, s.cash - 25000) } }) },
});

const N = +process.env.N || 80;
const out = [];
for (const lv of Data.levels.filter((l) => !process.argv[2] || process.argv[2].split(',').includes(String(l.id)))) {
  for (const diff of Object.keys(Engine.DIFF)) {
    const row = { level: lv.id + ' ' + lv.title, diff: Engine.DIFF[diff].label };
    for (const [name, st] of Object.entries(strategies)) {
      const only = lv.chapter === 3 ? ['random','greedy','diversify','allin','panic','noinvest'] : lv.chapter === 4 ? ['random','greedy','victim','skeptic','noinvest'] : ['smart','locker','cautious','random','greedy','bulk'];
      if (!only.includes(name)) continue;
      let pass = 0, profit = 0, stars = 0, broke = 0;
      for (let i = 0; i < N; i++) {
        const s = play(lv.id, diff, 'seed-' + i, st);
        const r = Engine.settle(Data, s);
        if (r.passed) pass++;
        if (s.cash < 0) broke++;
        profit += r.profit; stars += r.stars;
      }
      row[name] = (100 * pass / N).toFixed(0) + '% (' + Math.round(profit / N) + ', ★' + (stars / N).toFixed(1) + ')';
    }
    out.push(row);
  }
}
console.table(out);

// 檢查決定性：同一種子、同一輸入，結果必須完全相同
const a = play(8, 'normal', 'det', strategies.random), b = play(8, 'normal', 'det', strategies.random);
if (JSON.stringify(a.history) !== JSON.stringify(b.history)) throw new Error('不是決定性的！');
// 檢查平行世界：每個重大決定都算得出替代結果
const r = Engine.settle(Data, a);
console.log('決定性 OK；平行世界數：', r.worlds.filter(Boolean).length, '/', a.replay.length, '；稱號：', r.title.name);
