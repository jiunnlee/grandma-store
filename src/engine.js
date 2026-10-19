/* 淘氣大亨：阿嬤的小店 — 遊戲引擎（純邏輯，瀏覽器與 Node 共用）
 * 設計重點：
 *  - 所有亂數都由 (seed, day, 用途) 決定，與玩家先前的選擇無關，
 *    因此「平行世界」回放只要換一個選項重跑，運氣完全相同，差異就是判斷。
 *  - step(data, state, action) 是純函式：回傳新的 state，不修改舊的。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Engine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- 亂數 ----------
  function hashStr(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rngFor(seed, day, salt) {
    return mulberry32(hashStr(String(seed) + '|' + day + '|' + salt));
  }

  const DIFF = {
    easy:   { label: '輕鬆', noise: 0.10, goalMul: 0.6, rentMul: 0.8, timer: 0 },
    normal: { label: '標準', noise: 0.20, goalMul: 1.0, rentMul: 1.0, timer: 0 },
    hard:   { label: '挑戰', noise: 0.30, goalMul: 1.2, rentMul: 1.15, timer: 20 },
  };

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // ---------- 建立關卡 ----------
  function createLevel(data, levelId, difficulty, seed) {
    const lv = data.levels.find((l) => l.id === levelId);
    if (!lv) throw new Error('沒有這一關：' + levelId);
    const d = DIFF[difficulty] || DIFF.normal;
    return {
      levelId, difficulty, seed: String(seed),
      day: 1, days: lv.days, phase: 'morning',
      cash: lv.startCash, pop: lv.startPop, stress: 10, credit: lv.startCredit === undefined ? 60 : lv.startCredit,
      goal: Math.round(lv.startCash + (lv.extraStart || 0) + lv.goalProfit * d.goalMul),
      rent: Math.round(lv.rent * d.rentMul),
      stock: [],               // [{qty, cost}] 進貨批次（含前一天剩下的）
      today: null,             // 今天的資訊
      scheduled: [],           // 延遲後果 [{day, cash, pop, stress, demandMult, text}]
      flags: Object.assign({}, lv.startFlags || {}),
      loans: (lv.startLoans || []).map((l) => Object.assign({}, l)),  // [{principal, daily, daysLeft, rate, name}]
      insured: !!lv.startInsured,
      priceLevel: 1,            // 物價水準（通膨用）
      usedEvents: [],
      actions: [],             // 玩家所有輸入，用來重播
      replay: [],              // 重大決定紀錄（結算用）
      history: [{ day: 0, cash: lv.startCash, pop: lv.startPop, stress: 10 }],
      dayRecords: [],
      learned: [],             // 學到的名詞
      nightLine: '',
      bank: { demand: 0, fixed: [] }, // 活存餘額、定存 [{amount, matureDay, rate}]
      done: false,
    };
  }

  // ---------- 工具 ----------
  function stockQty(s) { return s.stock.reduce((a, b) => a + b.qty, 0); }
  function stockCost(s) { return s.stock.reduce((a, b) => a + b.qty * b.cost, 0); }
  function levelOf(data, s) { return data.levels.find((l) => l.id === s.levelId); }
  function productOf(data, s) {
    const lv = levelOf(data, s);
    return data.products[lv.product];
  }
  function learn(s, terms) {
    (terms || []).forEach((t) => { if (!s.learned.includes(t)) s.learned.push(t); });
  }
  function bankOf(s) { if (!s.bank) s.bank = { demand: 0, fixed: [] }; return s.bank; }
  function bankCfgOf(lv, s) { return lv.bank ? Object.assign({}, lv.bank, s.bankOverride || {}) : null; }
  function loanOutstanding(s) { return (s.loans || []).reduce((a, l) => a + l.daily * l.daysLeft, 0); }
  // ---------- 虛構市場 ----------
  function marketOf(s) { if (!s.market) s.market = { prices: {}, hist: {}, holdings: {}, margin: 0, trades: [], fees: 0, dividends: 0 }; return s.market; }
  function marketProducts(data, lv) { return lv.market ? lv.market.products.map((id) => Object.assign({ id }, data.market[id])) : []; }
  function holdingValue(s, id) { const m = marketOf(s); const h = m.holdings[id]; return h ? h.units * (m.prices[id] || 0) : 0; }
  function holdingsValue(s) { const m = marketOf(s); return Object.keys(m.holdings).reduce((a, id) => a + holdingValue(s, id), 0); }
  function assets(s) { const b = bankOf(s); return Math.round(s.cash + b.demand + b.fixed.reduce((a, f) => a + f.amount, 0) - loanOutstanding(s) + holdingsValue(s) - (s.market ? s.market.margin : 0)); }
  // 用一筆現金買進（含買進手續費）
  function marketBuy(data, s, id, cash, why) {
    const m = marketOf(s); const p = data.market[id]; if (!p || cash <= 0 || !m.prices[id]) return 0;
    cash = Math.round(Math.min(cash, Math.max(0, s.cash)));
    if (cash <= 0) return 0;
    const fee = Math.round(cash * (p.buyFee || 0));
    const units = (cash - fee) / m.prices[id];
    const h = m.holdings[id] || { units: 0, cost: 0 };
    h.units += units; h.cost += cash; m.holdings[id] = h;
    s.cash -= cash; m.fees += fee;
    m.trades.push({ day: s.day, id, kind: 'buy', cash, units, price: m.prices[id], why: why || '' });
    learn(s, ['風險', '報酬']);
    return units;
  }
  // 賣出某個金額（或 'all' 全部）
  function marketSell(data, s, id, cash, why) {
    const m = marketOf(s); const h = m.holdings[id]; if (!h || !m.prices[id]) return 0;
    const p = data.market[id];
    if (p && p.freezeFrom && s.day >= p.freezeFrom && why !== '斷頭') { m.frozen = m.frozen || {}; m.frozen[id] = true; return 0; } // 假平台：出金被卡住
    const value = h.units * m.prices[id];
    const amt = cash === 'all' ? value : Math.min(cash, value);
    if (amt <= 0) return 0;
    const units = amt / m.prices[id];
    const frac = units / h.units;
    h.units -= units; h.cost = Math.round(h.cost * (1 - frac));
    if (h.units < 1e-6 || cash === 'all') delete m.holdings[id];
    s.cash += Math.round(amt);
    m.trades.push({ day: s.day, id, kind: 'sell', cash: Math.round(amt), units, price: m.prices[id], why: why || '' });
    return amt;
  }
  // 融資：還能借多少（自有資產 ×(倍數−1) − 已借）
  function marginRoom(lv, s) {
    if (!lv.market || !lv.market.margin) return 0;
    const m = marketOf(s); const equity = Math.max(0, s.cash + holdingsValue(s) - m.margin);
    return Math.max(0, Math.floor((equity * (lv.market.margin.maxMul - 1) - m.margin) / 1000) * 1000);
  }
  function marginBorrow(lv, s, amount, why) {
    const amt = Math.min(Math.max(0, Math.round(amount)), marginRoom(lv, s)); if (amt <= 0) return 0;
    const m = marketOf(s); m.margin += amt; s.cash += amt; m.trades.push({ day: s.day, kind: 'margin', cash: amt, why: why || '' }); learn(s, ['融資', '槓桿']); return amt;
  }
  function marginRepay(lv, s, amount) {
    const m = marketOf(s); const amt = Math.min(Math.max(0, Math.round(amount)), m.margin, Math.max(0, s.cash)); if (amt <= 0) return 0;
    m.margin -= amt; s.cash -= amt; m.trades.push({ day: s.day, kind: 'repay', cash: amt }); return amt;
  }
  // 信用越差，借錢越貴
  function creditMul(credit) { return credit >= 70 ? 0.8 : credit >= 50 ? 1 : credit >= 30 ? 1.5 : 2; }
  function loanTerms(lv, s, amount) {
    const cfg = lv.loan; const rate = cfg.rate * creditMul(s.credit);
    const total = Math.round(amount * (1 + rate * cfg.days));
    return { principal: amount, total, daily: Math.ceil(total / cfg.days), daysLeft: cfg.days, rate, days: cfg.days };
  }
  function makeLoan(lv, s, amount, name) {
    const t = loanTerms(lv, s, amount); t.name = name || '銀行貸款';
    s.loans = s.loans || []; s.loans.push(t); s.cash += amount; learn(s, ['貸款', '利息']);
    return t;
  }
  // 客人現在接受的參考價（通膨時大家都漲，客人會慢慢接受）
  function refPriceNow(data, s) {
    const prod = productOf(data, s); const pl = s.priceLevel || 1;
    const accept = s.flags.acceptRaise ? 1 : 0.5;
    const war = s.flags.priceWar ? 0.9 : 1; // 價格戰：客人只肯付九折
    return Math.round(prod.refPrice * (1 + (pl - 1) * accept) * war);
  }
  function branchOf(lv, s) { return lv.branch && s.flags.branch ? lv.branch[s.flags.branch] : null; }
  function optsOf(ev, s) { return typeof ev.options === 'function' ? ev.options(s) : ev.options; }
  function optionAllowed(opt, s) { return !(opt.minCash && s.cash < opt.minCash); }
  function capacityOf(lv, s) {
    let c = lv.capacity || Infinity;
    const br = branchOf(lv, s); if (br && br.capacity && c !== Infinity) c += br.capacity;
    if (lv.staff && s.today && s.today.hired && !s.today.absent) c += lv.staff.capacity;
    if (s.today && s.today.capacityAdd) c += s.today.capacityAdd;
    return c;
  }
  function unitCost(product, qty, s) {
    let c = product.cost * (s.priceLevel || 1);
    if (s.flags.costMul) c = c * s.flags.costMul;
    if (product.bulk && qty >= product.bulk.qty) c = c * (1 - product.bulk.discount);
    return Math.round(c * 10) / 10;
  }

  // 價格對客人數的影響（參考價為 1，貴了掉得快，便宜增得慢）
  function priceFactor(price, ref) {
    const r = ref / price;
    return r >= 1 ? Math.pow(r, 0.8) : Math.pow(r, 1.8);
  }

  function pickEvent(data, lv, s) {
    const climax = lv.climax && lv.climax.day === s.day ? data.events.find((e) => e.id === lv.climax.event) : null;
    if (climax) return climax;
    const fixedId = lv.fixedEvents && lv.fixedEvents[s.day];
    if (fixedId) return data.events.find((e) => e.id === fixedId);
    const rng = rngFor(s.seed, s.day, 'event');
    const pool = lv.pool
      .map((id) => data.events.find((e) => e.id === id))
      .filter((e) => e && !s.usedEvents.includes(e.id) && (!e.cond || e.cond(s)));
    if (!pool.length) return data.events.find((e) => e.id === 'quiet');
    return pool[Math.floor(rng() * pool.length)];
  }

  // 預估今天的客人（阿嬤會把這個講給玩家聽；只給區間，不給精確值）
  function estimateCustomers(data, s) {
    const lv = levelOf(data, s);
    const br = branchOf(lv, s);
    const base = lv.baseCustomers * (br ? br.demandMult : 1) * (0.5 + s.pop / 100) * (s.today ? s.today.demandMult : 1);
    return Math.round(base);
  }

  // ---------- 一步 ----------
  function step(data, prev, action) {
    const s = clone(prev);
    const lv = levelOf(data, s);
    const prod = productOf(data, s);
    const d = DIFF[s.difficulty] || DIFF.normal;
    if (s.done) return s;
    s.actions.push(action);

    switch (s.phase) {
      case 'morning': {
        // 延遲後果到期
        const bank = bankOf(s);
        const news0 = [];
        // 虛構市場：今天的行情（亂數只看種子與天數，和玩家做過什麼無關）
        if (lv.market) {
          const m = marketOf(s); const mk = lv.market;
          const noiseScale = d.noise / 0.2;
          const scripts = (mk.script && mk.script[s.day]) || [];
          if (Array.isArray(scripts) === false) { /* 單一物件也接受 */ }
          const list = Array.isArray(scripts) ? scripts : [scripts];
          mk.products.forEach((id) => {
            const p = data.market[id];
            if (m.prices[id] === undefined) { m.prices[id] = p.start; m.hist[id] = [p.start]; if (lv.startMarket && lv.startMarket[id]) { m.holdings[id] = { units: lv.startMarket[id] / p.start, cost: lv.startMarket[id] }; m.trades.push({ day: 0, id, kind: 'buy', cash: lv.startMarket[id], units: m.holdings[id].units, price: p.start, why: '上一關留下' }); } return; }
            const rng = rngFor(s.seed, s.day, 'mkt-' + id);
            let mult = 1 + (p.drift || 0) + (rng() * 2 - 1) * (p.vol || 0) * noiseScale;
            list.filter((x) => x.id === id && x.mult !== undefined).forEach((x) => { mult *= x.mult; });
            const np = Math.round(m.prices[id] * mult * 100) / 100;
            m.prices[id] = np; m.hist[id].push(np);
            // 配息／利息
            const h = m.holdings[id];
            if (h && p.payout) {
              if (p.payoutIn === 'units') { h.units *= 1 + p.payout; }
              else { const dv = Math.round(h.units * np * p.payout); if (dv > 0) { s.cash += dv; m.dividends += dv; news0.push({ icon: '💰', text: p.name + ' 配息入帳 +' + dv.toLocaleString() + ' 元。', cash: dv }); learn(s, ['股息']); } }
            }
            if (h && p.dailyFee) { h.units *= 1 - p.dailyFee; m.fees += Math.round(h.units * np * p.dailyFee); }
          });
          list.forEach((x) => { if (x.news) news0.push({ icon: x.icon || '📰', text: x.news, delayed: true }); if (x.bank) s.bankOverride = Object.assign({}, s.bankOverride || {}, x.bank); if (x.flag) s.flags[x.flag] = true; if (x.demandMult) { s.flags.scriptDemand = x.demandMult; } });
          // 融資利息與斷頭
          if (m.margin > 0) {
            const it = Math.round(m.margin * mk.margin.rate); m.margin += it;
            const hv = holdingsValue(s);
            if (hv < m.margin * mk.margin.maintain) {
              let got = 0;
              Object.keys(m.holdings).forEach((id) => { got += marketSell(data, s, id, 'all', '斷頭'); });
              const repay = Math.min(s.cash, m.margin); s.cash -= repay; const left = m.margin - repay; m.margin = 0;
              s.flags.liquidated = true; s.stress = clamp(s.stress + 30, 0, 100); s.credit = clamp(s.credit - 15, 0, 100);
              news0.push({ icon: '💥', text: '斷頭通知：持股跌到維持率以下，券商把你的部位全部賣掉還錢。' + (left > 0 ? '剩下的 ' + Math.round(left).toLocaleString() + ' 元差額券商先認列（信用重傷）。' : ''), delayed: true });
              learn(s, ['爆倉']);
            } else news0.push({ icon: '💳', text: '融資利息 ' + it.toLocaleString() + ' 元加進欠款，目前欠 ' + Math.round(m.margin).toLocaleString() + ' 元。' });
          }
        }
        const bankCfg = bankCfgOf(lv, s);
        if (lv.inflation && s.day >= (lv.inflation.fromDay || 2)) {
          const before = s.priceLevel || 1; s.priceLevel = Math.round(before * (1 + lv.inflation.daily) * 1000) / 1000;
          news0.push({ icon: '📈', text: '物價又漲了：進貨成本變成原本的 ' + Math.round(s.priceLevel * 100) + '%。' });
          learn(s, ['通膨']);
        }
        if (s.flags.skipRepay) { s.flags.skipRepay = false; s.flags.skippedOnce = true; }
        (s.loans || []).forEach((l) => {
          if (l.daysLeft <= 0) return;
          if (s.flags.skippedOnce && !l.skippedApplied) { l.skippedApplied = true; news0.push({ icon: '🙈', text: l.name + '：今天的還款你沒繳。' }); return; }
          const pay = l.daily;
          if (s.cash < pay) { const take = Math.min(bank.demand, pay - s.cash); bank.demand -= take; s.cash += take; }
          if (s.cash >= pay) { s.cash -= pay; l.daysLeft -= 1; s.credit = clamp(s.credit + 1, 0, 100); news0.push({ icon: '🏦', text: l.name + '：今天還款 ' + pay.toLocaleString() + ' 元' + (l.daysLeft ? '，還剩 ' + l.daysLeft + ' 期。' : '，全部還清！'), cash: -pay }); }
          else { l.missed = (l.missed || 0) + 1; s.credit = clamp(s.credit - 10, 0, 100); s.stress = clamp(s.stress + 8, 0, 100); const pen = Math.round(pay * 0.1); l.daily += Math.ceil(pen / Math.max(1, l.daysLeft)); news0.push({ icon: '⚠️', text: l.name + '：手上現金不夠還今天的 ' + pay.toLocaleString() + ' 元，延遲繳款。信用掉了，還多了 ' + pen.toLocaleString() + ' 元違約金。' }); learn(s, ['信用']); }
        });
        s.loans = (s.loans || []).filter((l) => l.daysLeft > 0);
        if (lv.insurance && s.insured) { s.cash -= lv.insurance.premium; news0.push({ icon: '🛡️', text: '店面保險保費 ' + lv.insurance.premium.toLocaleString() + ' 元。', cash: -lv.insurance.premium }); }
        if (bankCfg && bank.demand > 0) {
          const it = Math.round(bank.demand * bankCfg.demandRate);
          if (it > 0) { bank.demand += it; news0.push({ icon: '🏦', text: '活存利息入帳 +' + it.toLocaleString() + ' 元。' }); }
        }
        if (bankCfg && bank.fixed.length) {
          const matured = bank.fixed.filter((f) => f.matureDay <= s.day);
          bank.fixed = bank.fixed.filter((f) => f.matureDay > s.day);
          matured.forEach((f) => { const it = Math.round(f.amount * f.rate * f.days); s.cash += f.amount + it; news0.push({ icon: '🏦', text: '定存到期：本金 ' + f.amount.toLocaleString() + ' 元加利息 ' + it.toLocaleString() + ' 元回到手上。', cash: f.amount + it }); });
        }
        const due = s.scheduled.filter((x) => x.day === s.day);
        s.scheduled = s.scheduled.filter((x) => x.day !== s.day);
        const weatherRng = rngFor(s.seed, s.day, 'weather');
        const wr = weatherRng();
        let weather = wr < 0.18 ? 'rain' : wr < 0.3 ? 'hot' : 'sunny';
        if (lv.weather && lv.weather[s.day]) weather = lv.weather[s.day];
        const wMul = { rain: 0.7, hot: 1.15, sunny: 1.0, typhoon: 0 }[weather];
        let demandMult = wMul;
        const news = news0;
        if (weather === 'rain') news.push({ icon: '🌧️', text: '今天下雨，客人會少一些。' });
        if (weather === 'hot') news.push({ icon: '☀️', text: '今天很熱，路上人潮多。' });
        if (s.flags.scriptDemand) { demandMult *= s.flags.scriptDemand; delete s.flags.scriptDemand; }
        due.forEach((x) => {
          if (x.cash) s.cash += x.cash;
          if (x.stockAdd) s.stock.push({ qty: x.stockAdd.qty, cost: x.stockAdd.cost });
          if (x.fxCash && s.market) { const now = s.market.prices[x.fxCash.id] || x.fxCash.ref; const amt = Math.round(x.fxCash.amount * now / x.fxCash.ref); s.cash -= amt; news.push({ icon: '💱', text: x.fxCash.text + '以今天的匯率付了 ' + amt.toLocaleString() + ' 元' + (amt > x.fxCash.amount ? '（比當初多 ' + (amt - x.fxCash.amount).toLocaleString() + '）' : '（比當初少 ' + (x.fxCash.amount - amt).toLocaleString() + '）') + '。', delayed: true, cash: -amt }); }
          if (x.pop) s.pop = clamp(s.pop + x.pop, 0, 100);
          if (x.stress) s.stress = clamp(s.stress + x.stress, 0, 100);
          if (x.demandMult) demandMult *= x.demandMult;
          if (x.flag) s.flags[x.flag] = x.flagValue === undefined ? true : x.flagValue;
          if (x.text) news.push({ icon: x.icon || '📬', text: x.text, delayed: true, cash: x.cash || 0 });
          if (x.replayNote) {
            const r = s.replay.find((r) => r.id === x.replayNote.id);
            if (r) r.outcome = x.replayNote.text;
          }
        });
        // 明天的預告（讓玩家能預先規劃）
        const tomorrow = s.scheduled.filter((x) => x.day === s.day + 1 && x.forecast);
        tomorrow.forEach((x) => news.push({ icon: '🔮', text: x.forecast }));
        const ev = pickEvent(data, lv, s);
        s.usedEvents.push(ev.id);
        s.today = {
          weather, demandMult, news, eventId: ev.id,
          leftover: stockQty(s),
          estimate: null, hired: false, absent: false,
        };
        if (lv.demandByDay && lv.demandByDay[s.day]) { s.today.demandMult *= lv.demandByDay[s.day]; if (lv.demandByDay[s.day] < 0.9) news.push({ icon: '🍂', text: '淡季，路上人少。' }); }
        if (lv.weather && lv.weather[s.day] === 'typhoon') { s.today.demandMult = 0; s.today.closed = true; news.push({ icon: '🌀', text: '颱風天，全市停班停課，今天沒有客人。房租照付。' }); }
        s.today.estimate = estimateCustomers(data, s);
        s.phase = 'shop';
        break;
      }
      case 'shop': {
        const qty = Math.max(0, Math.round(action.qty || 0));
        const price = Math.max(1, Math.round(action.price || prod.refPrice));
        const uc = unitCost(prod, qty, s);
        const cost = Math.round(qty * uc);
        s.cash -= cost;
        if (s.cash < 0) { // 手上現金不夠，先從活存自動領（教學：錢要放對地方）
          const b = bankOf(s); const take = Math.min(b.demand, -s.cash); b.demand -= take; s.cash += take; s.today.autoWithdraw = take;
        }
        s.today.hired = !!(lv.staff && action.hire);
        if (qty > 0) s.stock.push({ qty, cost: uc });
        s.today.qty = qty; s.today.unitCost = uc; s.today.purchase = cost; s.today.price = price;
        learn(s, ['成本', '售價']);
        s.phase = 'event';
        break;
      }
      case 'event': {
        const ev = data.events.find((e) => e.id === s.today.eventId);
        const opts = optsOf(ev, s);
        let idx = clamp(action.opt | 0, 0, opts.length - 1);
        if (!optionAllowed(opts[idx], s)) idx = opts.findIndex((o) => optionAllowed(o, s));
        if (idx < 0) idx = 0;
        const opt = opts[idx];
        const allowedBefore = opts.map((o) => optionAllowed(o, s));
        const rng = rngFor(s.seed, s.day, 'event-roll');
        const roll = rng();
        const fx = typeof opt.effects === 'function' ? opt.effects(s, roll) : (opt.effects || {});
        const before = assets(s);
        if (fx.cash) s.cash += fx.cash;
        if (fx.pop) s.pop = clamp(s.pop + fx.pop, 0, 100);
        if (fx.stress) s.stress = clamp(s.stress + fx.stress, 0, 100);
        if (fx.credit) s.credit = clamp(s.credit + fx.credit, 0, 100);
        if (fx.demandMult) s.today.demandMult *= fx.demandMult;
        if (fx.stockAdd) s.stock.push({ qty: fx.stockAdd.qty, cost: fx.stockAdd.cost });
        if (fx.stockLose) { // 丟掉一部分庫存
          let lose = fx.stockLose; const kept = [];
          s.stock.forEach((b) => { const l = Math.min(b.qty, lose); lose -= l; if (b.qty - l > 0) kept.push({ qty: b.qty - l, cost: b.cost }); });
          s.stock = kept;
        }
        if (fx.flag) Object.assign(s.flags, fx.flag);
        if (fx.scamLoss) s.flags.scamLoss = (s.flags.scamLoss || 0) + fx.scamLoss;
        if (fx.dodge) s.flags.scamDodged = (s.flags.scamDodged || 0) + 1;
        if (fx.absent) s.today.absent = true;
        if (fx.borrow && lv.loan) makeLoan(lv, s, fx.borrow, fx.loanName);
        if (fx.insure !== undefined) s.insured = !!fx.insure;
        if (fx.priceLevel) s.priceLevel = Math.round((s.priceLevel || 1) * fx.priceLevel * 1000) / 1000;
        if (fx.capacityAdd) s.today.capacityAdd = (s.today.capacityAdd || 0) + fx.capacityAdd;
        if (fx.bankDemand) { bankOf(s).demand += fx.bankDemand; }
        if (fx.bankFixed) { const b = bankCfgOf(lv, s) || { fixedRate: 0.004, fixedDays: 3 }; bankOf(s).fixed.push({ amount: fx.bankFixed, matureDay: s.day + b.fixedDays, rate: b.fixedRate, days: b.fixedDays }); }
        if (fx.marketMult && s.market) { Object.keys(fx.marketMult).forEach((id) => { if (s.market.prices[id]) { s.market.prices[id] = Math.round(s.market.prices[id] * fx.marketMult[id] * 100) / 100; s.market.hist[id][s.market.hist[id].length - 1] = s.market.prices[id]; } }); }
        if (fx.marginBorrow) marginBorrow(lv, s, fx.marginBorrow, ev.title);
        (fx.invest || []).forEach((iv) => marketBuy(data, s, iv.id, iv.cash, ev.title));
        if (fx.sellAll && s.market) Object.keys(s.market.holdings).forEach((id) => marketSell(data, s, id, 'all', ev.title));
        (fx.sell || []).forEach((sv) => marketSell(data, s, sv.id, sv.cash || 'all', ev.title));
        if (s.cash < 0) { const b = bankOf(s); const take = Math.min(b.demand, -s.cash); b.demand -= take; s.cash += take; }
        (fx.schedule || []).forEach((sc) => s.scheduled.push(Object.assign({}, sc, { day: s.day + sc.after })));
        learn(s, ev.terms);
        const resultText = typeof opt.result === 'function' ? opt.result(s, roll, fx) : opt.result;
        s.today.eventChoice = idx;
        s.today.eventResult = resultText;
        s.today.eventDelta = assets(s) - before;
        if (!(typeof ev.minor === 'function' ? ev.minor(s) : ev.minor)) {
          s.replay.push({
            id: ev.id + '@' + s.day, day: s.day, eventId: ev.id, title: ev.title,
            choice: idx, label: opt.label, kind: opt.kind || 'judgement',
            known: ev.known || '', outcome: resultText, delta: assets(s) - before,
            verdict: typeof opt.verdict === 'function' ? opt.verdict(s, roll, fx) : (opt.verdict || ''),
            nOptions: opts.length, optionLabels: opts.map((o) => o.label), allowed: allowedBefore,
          });
        }
        s.phase = 'close';
        break;
      }
      case 'close': {
        const noiseRng = rngFor(s.seed, s.day, 'noise');
        const noise = 1 + (noiseRng() * 2 - 1) * d.noise;
        const price = s.today.price;
        const refNow = refPriceNow(data, s);
        const br = branchOf(lv, s);
        const rentToday = s.rent + (br ? br.rent : 0);
        let demand = lv.baseCustomers * (br ? br.demandMult : 1) * (0.5 + s.pop / 100) * s.today.demandMult * priceFactor(price, refNow) * noise;
        if (s.stress >= 80) demand *= 0.9;
        demand = Math.max(0, Math.round(demand));
        const have = stockQty(s);
        const cap = capacityOf(lv, s);
        const sold = Math.min(demand, have, cap);
        const wage = lv.staff && s.today.hired ? lv.staff.wage : 0;
        const revenue = sold * price;
        // 先賣舊貨（先進先出）
        let toSell = sold; let cogs = 0; const rest = [];
        s.stock.forEach((b) => {
          const take = Math.min(b.qty, toSell); toSell -= take; cogs += take * b.cost;
          if (b.qty - take > 0) rest.push({ qty: b.qty - take, cost: b.cost });
        });
        // 損耗
        let spoiled = 0, spoilCost = 0; const kept = [];
        rest.forEach((b) => {
          const lost = Math.round(b.qty * prod.spoil);
          spoiled += lost; spoilCost += lost * b.cost;
          if (b.qty - lost > 0) kept.push({ qty: b.qty - lost, cost: b.cost });
        });
        s.stock = kept;
        s.cash += revenue - rentToday - wage;
        if (s.cash < 0) { const b = bankOf(s); const take = Math.min(b.demand, -s.cash); b.demand -= take; s.cash += take; }
        // 人氣變化
        let popDelta = 0; const popWhy = [];
        if (price > refNow * 1.2) { popDelta -= 4; popWhy.push('客人嫌貴'); }
        else if (price < refNow * 0.85) { popDelta += 2; popWhy.push('便宜受歡迎'); }
        const servable = Math.min(have, cap);
        if (demand > servable * 1.25 && servable > 0) { popDelta -= 3; popWhy.push(cap < have ? '人手不夠，很多人等不到' : '很多人買不到'); }
        if (have === 0 && !s.today.closed) { popDelta -= 5; popWhy.push('今天沒東西賣'); }
        if (sold >= 20 && demand <= have) { popDelta += 1; popWhy.push('服務到每位客人'); }
        if (s.flags.popBoostDaily) popDelta += s.flags.popBoostDaily;
        s.pop = clamp(s.pop + popDelta, 0, 100);
        const dayProfit = revenue - s.today.purchase - rentToday - wage + (s.today.eventDelta || 0);
        let stressDelta = dayProfit < 0 ? 6 : -3;
        if (spoiled > 0.3 * (have || 1)) stressDelta += 4;
        s.stress = clamp(s.stress + stressDelta, 0, 100);
        const rec = {
          day: s.day, weather: s.today.weather, price, qty: s.today.qty, purchase: s.today.purchase,
          demand, sold, revenue, cogs: Math.round(cogs), spoiled, spoilCost: Math.round(spoilCost),
          rent: rentToday, wage, capacity: cap === Infinity ? null : cap, hired: s.today.hired, eventDelta: s.today.eventDelta || 0, profit: Math.round(dayProfit),
          leftover: stockQty(s), popDelta, popWhy, cashEnd: s.cash,
          eventId: s.today.eventId, eventChoice: s.today.eventChoice,
        };
        s.dayRecords.push(rec);
        s.today.record = rec;
        if (spoiled > 0) learn(s, ['損耗']);
        learn(s, ['利潤', '固定支出']);
        s.history.push({ day: s.day, cash: assets(s), pop: s.pop, stress: s.stress, hold: lv.market ? Math.round(holdingsValue(s)) : undefined });
        s.nightLine = nightLine(data, s, rec);
        s.phase = 'night';
        break;
      }
      case 'night': {
        if (action && action.borrow && lv.loan) {
          const out = (s.loans || []).reduce((a, l) => a + l.principal, 0);
          const amt = clamp(Math.round(action.borrow / 1000) * 1000, 0, Math.max(0, lv.loan.max - out));
          if (amt > 0) makeLoan(lv, s, amt);
        }
        if (action && action.insure !== undefined && lv.insurance) { s.insured = !!action.insure; if (s.insured) learn(s, ['保險']); }
        if (lv.market && action && (action.trades || action.marginBorrow || action.marginRepay)) {
          const m = marketOf(s); const t = action.trades || {};
          // 先賣、再還融資、再借、再買
          Object.keys(t).forEach((id) => { if (t[id] < 0 && lv.market.products.includes(id)) marketSell(data, s, id, -t[id] >= holdingValue(s, id) - 1 ? 'all' : -t[id]); });
          if (action.marginRepay) marginRepay(lv, s, action.marginRepay);
          if (action.marginBorrow) marginBorrow(lv, s, action.marginBorrow);
          Object.keys(t).forEach((id) => { if (t[id] > 0 && lv.market.products.includes(id)) marketBuy(data, s, id, t[id]); });
          if (m.margin > 0 && !s.flags.usedMargin) s.flags.usedMargin = true;
        }
        if (lv.bank && action && action.bank) {
          const b = bankOf(s); const a = action.bank; const cfg = bankCfgOf(lv, s);
          // 先解約（只拿回本金，沒有利息）
          (a.breakFixed || []).slice().sort((x, y) => y - x).forEach((i) => { const f = b.fixed[i]; if (f) { s.cash += f.amount; b.fixed.splice(i, 1); s.flags.brokeFixed = true; } });
          const w = clamp(Math.round(a.withdraw || 0), 0, b.demand); b.demand -= w; s.cash += w;
          const d = clamp(Math.round(a.demand || 0), 0, Math.max(0, s.cash)); s.cash -= d; b.demand += d;
          const f = clamp(Math.round(a.fixed || 0), 0, Math.max(0, s.cash));
          if (f > 0) { s.cash -= f; b.fixed.push({ amount: f, matureDay: s.day + cfg.fixedDays, rate: cfg.fixedRate, days: cfg.fixedDays }); learn(s, ['定存']); }
          if (d > 0) learn(s, ['活存']);
        }
        const hlast = s.history[s.history.length - 1]; hlast.cash = assets(s); if (lv.market) hlast.hold = Math.round(holdingsValue(s));
        if (s.day >= s.days || s.cash < 0) { s.done = true; s.phase = 'done'; }
        else { s.day += 1; s.phase = 'morning'; }
        break;
      }
    }
    return s;
  }

  function nightLine(data, s, rec) {
    const lines = data.nightLines;
    if (s.cash < 0) return lines.broke;
    if (rec.spoiled >= 30) return lines.spoil;
    if (rec.demand > rec.sold * 1.3 && rec.sold > 0) return lines.stockout;
    if (rec.profit > 0 && rec.spoiled === 0) return lines.good;
    if (rec.profit < 0) return lines.loss;
    return lines.ok;
  }

  // 用同一個種子、同一串輸入重跑（平行世界）
  function replay(data, levelId, difficulty, seed, actions) {
    let s = createLevel(data, levelId, difficulty, seed);
    for (const a of actions) { s = step(data, s, a); if (s.done) break; }
    // 若輸入用完還沒結束，用「照常做」把關卡跑完
    while (!s.done) s = step(data, s, defaultAction(data, s));
    return s;
  }
  function defaultAction(data, s) {
    const prod = productOf(data, s);
    const lv = levelOf(data, s);
    if (s.phase === 'shop') return { qty: Math.max(0, (s.today.estimate || 0) - stockQty(s)), price: prod.refPrice, hire: !!lv.staff };
    if (s.phase === 'event') { const o = optsOf(data.events.find((e) => e.id === s.today.eventId), s); const i = o.findIndex((x) => optionAllowed(x, s)); return { opt: Math.max(0, i) }; }
    return { type: 'next' };
  }

  // ---------- 結算 ----------
  function settle(data, s) {
    const lv = levelOf(data, s);
    let total = assets(s);
    let tax = 0;
    if (lv.tax) {
      const pre = total - lv.startCash - (lv.extraStart || 0);
      const rate = lv.tax.rate * (s.flags.records ? (1 - lv.tax.recordsDiscount) : 1);
      tax = Math.max(0, Math.round(pre * rate));
      if (s.flags.taxEvaded) tax = 0;
      total -= tax;
    }
    const passed = total >= s.goal && s.cash >= 0;
    const profit = total - lv.startCash - (lv.extraStart || 0);
    const goalProfit = s.goal - lv.startCash - (lv.extraStart || 0);
    let stars = 0;
    if (passed) stars = 1;
    if (passed && profit >= goalProfit * 1.3 && s.pop >= lv.startPop) stars = 2;
    if (passed && profit >= goalProfit * 1.7 && s.pop >= lv.startPop + 5) stars = 3;
    // 平行世界：每個重大決定換另一個選項重跑
    const worlds = s.replay.map((r) => {
      const idx = s.actions.findIndex((a, i) => a && a.opt !== undefined && actionDay(s.actions, i) === r.day);
      if (idx < 0) return null;
      const ev = data.events.find((e) => e.id === r.eventId);
      const nOpts = r.nOptions || optsOf(ev, s).length;
      const alts = []; for (let i = 0; i < nOpts; i++) if (i !== r.choice && (!r.allowed || r.allowed[i])) alts.push(i);
      const results = alts.map((i) => {
        const acts = s.actions.slice(); acts[idx] = { opt: i };
        const w = replay(data, s.levelId, s.difficulty, s.seed, acts);
        return { choice: i, label: r.optionLabels ? r.optionLabels[i] : optsOf(ev, s)[i].label, cash: assets(w), diff: assets(w) - total };
      });
      return { replayId: r.id, results };
    });
    const spoiledTotal = s.dayRecords.reduce((a, r) => a + r.spoiled, 0);
    const spoilCostTotal = s.dayRecords.reduce((a, r) => a + r.spoilCost, 0);
    const soldTotal = s.dayRecords.reduce((a, r) => a + r.sold, 0);
    const missedTotal = s.dayRecords.reduce((a, r) => a + Math.max(0, r.demand - r.sold), 0);
    const market = lv.market ? marketReport(data, lv, s) : null;
    const title = pickTitle(data, s, { passed, spoiledTotal, missedTotal, soldTotal, market });
    return {
      passed, stars, profit, goalProfit, title, total, tax, priceLevel: s.priceLevel || 1, loanOutstanding: loanOutstanding(s),
      spoiledTotal, spoilCostTotal, soldTotal, missedTotal, market,
      worlds, grandma: grandmaVerdict(data, lv, s, { passed, spoiledTotal, missedTotal, stars }),
    };
  }
  // 市場回顧：投資賺了多少、付了多少費用、有沒有恐慌賣出
  function marketReport(data, lv, s) {
    const m = marketOf(s);
    const invested = m.trades.filter((t) => t.kind === 'buy').reduce((a, t) => a + t.cash, 0);
    const sold = m.trades.filter((t) => t.kind === 'sell').reduce((a, t) => a + t.cash, 0);
    const held = Math.round(holdingsValue(s));
    const gain = sold + held - invested; // 配息另外算
    const panic = m.trades.filter((t) => t.kind === 'sell' && t.why !== '斷頭').filter((t) => {
      const h = m.hist[t.id]; const i = t.day - 1; // hist[0] 是第 1 天的價
      const before = h.slice(Math.max(0, i - 3), i); const peak = before.length ? Math.max(...before) : t.price;
      const later = h.slice(i + 1, Math.min(h.length, i + 4)); const rebound = later.length ? Math.max(...later) : t.price;
      return t.price <= peak * 0.9 && rebound >= t.price * 1.08;
    }).map((t) => ({ day: t.day, name: data.market[t.id].name, price: t.price, cash: t.cash }));
    const byProduct = lv.market.products.map((id) => {
      const p = data.market[id]; const buys = m.trades.filter((t) => t.id === id && t.kind === 'buy').reduce((a, t) => a + t.cash, 0);
      const sells = m.trades.filter((t) => t.id === id && t.kind === 'sell').reduce((a, t) => a + t.cash, 0);
      const h = m.hist[id] || []; return { id, name: p.name, icon: p.icon, start: h[0], end: h[h.length - 1], change: h.length ? (h[h.length - 1] / h[0] - 1) : 0, bought: buys, sold: sells, held: Math.round(holdingValue(s, id)) };
    });
    const nonZero = byProduct.filter((b) => b.bought > 0 && !data.market[b.id].fake).length;
    const scamLoss = byProduct.filter((b) => data.market[b.id].fake).reduce((a, b) => a + Math.max(0, b.bought - b.sold - b.held), 0) + (s.flags.scamLoss || 0);
    return { invested, sold, held, gain: Math.round(gain), fees: m.fees, dividends: m.dividends, panic, byProduct, products: nonZero, liquidated: !!s.flags.liquidated, usedMargin: !!s.flags.usedMargin, scamLoss: Math.round(scamLoss), frozen: Object.keys(m.frozen || {}) };
  }
  // actions 陣列裡第 i 個輸入發生在第幾天
  function actionDay(actions, i) {
    // 每一天固定五個輸入：morning-next, shop, event, close-next, night-next
    return Math.floor(i / 5) + 1;
  }
  function pickTitle(data, s, m) {
    const t = data.titles;
    if (s.cash < 0) return t.broke;
    if (!m.passed) return t.fail;
    if ((s.flags.scamLoss || 0) >= 10000 || (m.market && m.market.scamLoss >= 10000)) return t.scammed || t.stressed;
    if (s.flags.scamDodged && !(s.flags.scamLoss)) return t.alert || t.steady;
    if (m.market && m.market.liquidated) return t.liquidated || t.stressed;
    if (m.market && m.market.panic.length) return t.panic || t.stressed;
    if (m.market && m.market.products >= 3) return t.diversified || t.steady;
    if (s.flags.brokeFixed) return t.brokeFixed || t.steady;
    if (m.spoiledTotal > m.soldTotal * 0.3) return t.waste;
    if (m.missedTotal > m.soldTotal * 0.3) return t.stockout;
    if (s.stress >= 60) return t.stressed;
    if (s.pop >= 70) return t.popular;
    return t.steady;
  }
  function grandmaVerdict(data, lv, s, m) {
    const g = data.grandma;
    if (s.cash < 0) return g.broke;
    if (!m.passed) return (lv.verdict && lv.verdict.fail) || g.fail;
    if (m.stars === 3) return (lv.verdict && lv.verdict.great) || g.great;
    return (lv.verdict && lv.verdict.pass) || g.pass;
  }

  return { DIFF, createLevel, step, replay, settle, stockQty, stockCost, unitCost, priceFactor, estimateCustomers, defaultAction, rngFor, hashStr, clone, assets, optsOf, optionAllowed, capacityOf, bankOf, bankCfgOf, loanOutstanding, loanTerms, creditMul, refPriceNow, branchOf, marketOf, marketProducts, holdingValue, holdingsValue, marginRoom };
});
