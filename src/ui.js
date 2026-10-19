/* 淘氣大亨：阿嬤的小店 — 介面（純 DOM，不用框架） */
(function () {
  'use strict';
  const E = window.Engine, D = window.GameData, SceneSVG = window.Scene;
  const $ = (sel, el) => (el || document).querySelector(sel);
  const app = $('#app');
  const fmt = (n) => (Math.round(n)).toLocaleString('zh-Hant-TW');
  const money = (n) => '$' + fmt(n);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- 存檔 ----------
  const SAVE_KEY = 'tycoon-grandma-save-v1';
  const save = loadSave();
  function loadSave() {
    const base = { difficulty: 'easy', progress: {}, learned: [], tutorial: {}, current: null, seedCounter: 1 };
    try { const raw = localStorage.getItem(SAVE_KEY); if (raw) return Object.assign(base, JSON.parse(raw)); } catch (e) { /* 私密視窗等情況 */ }
    return base;
  }
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* 忽略 */ } }
  function resetSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} Object.assign(save, { difficulty: 'easy', progress: {}, learned: [], tutorial: {}, current: null, seedCounter: 1 }); }

  // ---------- 名詞 ----------
  const termNames = Object.keys(D.glossary);
  function withTerms(text) {
    // 把文字裡出現的名詞變成可點的「看不懂按鈕」（每個名詞只標第一次）
    let html = esc(text);
    termNames.forEach((t) => {
      const i = html.indexOf(t);
      if (i >= 0) html = html.slice(0, i) + `<button class="term" type="button" data-term="${t}">${t}</button>` + html.slice(i + t.length);
    });
    return html;
  }
  function learnTerm(t) { if (D.glossary[t] && !save.learned.includes(t)) { save.learned.push(t); persist(); toast('📖 圖鑑新增：' + t); } }
  function showTerm(t) {
    const g = D.glossary[t]; if (!g) return;
    learnTerm(t);
    sheet(`<h3>${esc(t)}</h3>
      <div class="row"><div class="icon">💬</div><div><div class="k">白話說</div><div>${esc(g.plain)}</div></div></div>
      <div class="row"><div class="icon">🏪</div><div><div class="k">用開店比喻</div><div>${esc(g.shop)}</div></div></div>
      <div class="row"><div class="icon">🌏</div><div><div class="k">現實對照</div><div>${esc(g.real)}</div></div></div>
      <button class="btn secondary block" data-close>知道了</button>`);
  }
  function sheet(inner) {
    closeSheet();
    const wrap = document.createElement('div'); wrap.className = 'sheet-backdrop'; wrap.id = 'sheet';
    wrap.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${inner}</div>`;
    wrap.addEventListener('click', (e) => { if (e.target === wrap || e.target.closest('[data-close]')) closeSheet(); });
    document.body.appendChild(wrap);
  }
  function closeSheet() { const s = $('#sheet'); if (s) s.remove(); }
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
    setTimeout(() => t.remove(), 1800);
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button.term, .help-btn'); if (b && b.dataset.term) { e.preventDefault(); showTerm(b.dataset.term); }
  });

  // ---------- 畫面切換 ----------
  const screens = {};
  function show(name, html) {
    app.innerHTML = `<section class="screen fade-in" id="scr-${name}">${html}</section>`;
    window.scrollTo({ top: 0 });
    screens.current = name;
  }

  // ---------- 標題 ----------
  function titleScreen() {
    const hasCurrent = !!save.current;
    const diff = save.difficulty;
    show('title', `
      <div class="scene" data-time="morning">${SceneSVG.render({ time: 'morning', cat: 'sleep' })}</div>
      <div class="logo">
        <div class="kicker">淘氣大亨</div>
        <h1>阿嬤的小店</h1>
        <div class="sub">用虛擬的錢，學真實的道理。不碰真錢。</div>
      </div>
      <div class="panel">
        <div class="field"><label>難度 <span class="muted">新手建議輕鬆</span></label>
          <div class="diff-row">${Object.entries(E.DIFF).map(([k, v]) => `<button class="chip" data-diff="${k}" aria-pressed="${diff === k}">${v.label}</button>`).join('')}</div>
          <div class="muted" id="diff-desc"></div>
        </div>
        <div class="btn-row">
          ${hasCurrent ? `<button class="btn gold" id="btn-continue">繼續上次的一天</button>` : ''}
          <button class="btn" id="btn-start">${Object.keys(save.progress).length ? '選擇關卡' : '開始'}</button>
        </div>
        <div class="btn-row">
          <button class="btn secondary" id="btn-glossary">📖 名詞圖鑑 <span class="muted">${save.learned.length}/${termNames.length}</span></button>
          <button class="btn secondary" id="btn-settings">⚙️ 設定</button>
        </div>
      </div>
      <p class="footer-note">遊戲裡的商品、人物、公司全部是虛構的，不代表任何真實投資。垂直切片版：篇章一 第 1–3 關。</p>
    `);
    const descs = { easy: '客人數比較穩定，過關門檻低，事件沒有倒數。', normal: '客人數會波動，門檻正常。', hard: '波動大、房租高，事件卡有 20 秒倒數。' };
    $('#diff-desc').textContent = descs[diff];
    app.querySelectorAll('[data-diff]').forEach((b) => b.addEventListener('click', () => { save.difficulty = b.dataset.diff; persist(); titleScreen(); }));
    $('#btn-start').addEventListener('click', mapScreen);
    if (hasCurrent) $('#btn-continue').addEventListener('click', () => resumeLevel());
    $('#btn-glossary').addEventListener('click', glossaryScreen);
    $('#btn-settings').addEventListener('click', settingsScreen);
  }

  // ---------- 關卡地圖 ----------
  const upcoming = [];
  function unlocked(id) { return id === 1 || !!(save.progress[id - 1] && save.progress[id - 1].stars > 0); }
  function mapScreen() {
    show('map', `
      <div class="topbar"><button class="back" id="back">‹ 回首頁</button><span class="muted">難度：${E.DIFF[save.difficulty].label}</span></div>
      ${[{ n: 1, t: '篇章一　小店篇', m: '溫馨為主', d: '每一關五到八天，一關約 10 分鐘。第 4 關起可以存錢，第 7 關起可以請人。' }, { n: 2, t: '篇章二　街區篇', m: '溫馨加搞笑', d: '通膨、複利、貸款、保險、稅、信用。打烊後的面板會多出貸款與保險。' }, { n: 3, t: '篇章三　城市篇', m: '搞笑加一點緊張', d: '第一次投資、分散、市場震盪、利率、股息、槓桿、匯率、泡沫。打烊後可以買賣虛構的投資商品，過關看總資產。' }, { n: 4, t: '篇章四　暗流篇', m: '緊張加一點溫馨', d: '保證獲利群組、假 App、殺豬盤、借錢投資、老鼠會、假銀行來電、假代言，最後是阿嬤差點被騙。騙子的話術照真的寫，認得出來才有用。' }].map((ch) => `<div class="panel">
        <div class="chapter-head"><h2>${ch.t}</h2><span class="muted">${ch.m}</span></div>
        <p class="muted">${ch.d}</p>
        <div class="levels">
          ${D.levels.filter((l) => l.chapter === ch.n).map((lv) => { const p = save.progress[lv.id]; const ok = unlocked(lv.id); return `
            <button class="level-card" data-level="${lv.id}" ${ok ? '' : 'disabled'}>
              <div class="no">${lv.id}</div>
              <div><div class="t">${esc(lv.title)}</div><div class="s">${esc(lv.theme)}${p ? ` · 最佳 ${money(p.best)}` : ''}</div></div>
              <div class="stars">${p ? '★'.repeat(p.stars) + '<span style="opacity:.3">' + '★'.repeat(3 - p.stars) + '</span>' : (ok ? '' : '🔒')}</div>
            </button>`; }).join('')}
          ${ch.n === 4 ? upcoming.map((u) => `<button class="level-card" disabled><div class="no">${u.id}</div><div><div class="t">${u.title}</div><div class="s">${u.theme} · 下個版本</div></div><div class="stars">🔒</div></button>`).join('') : ''}
        </div>
      </div>`).join('')}
    `);
    $('#back').addEventListener('click', titleScreen);
    app.querySelectorAll('[data-level]').forEach((b) => b.addEventListener('click', () => startLevel(+b.dataset.level)));
  }

  // ---------- 關卡流程 ----------
  let G = null; // { state, view, levelId }
  function startLevel(levelId) {
    const lv = D.levels.find((l) => l.id === levelId);
    const seed = 'L' + levelId + '-' + save.difficulty + '-' + (save.seedCounter++);
    const state = E.createLevel(D, levelId, save.difficulty, seed);
    G = { state, view: 'intro', introIdx: 0, lastCash: state.cash, lastPop: state.pop, lastStress: state.stress };
    save.current = null; persist();
    introScreen(lv);
  }
  function resumeLevel() {
    const c = save.current; if (!c) return titleScreen();
    G = { state: c.state, view: c.view, lastCash: c.state.cash, lastPop: c.state.pop, lastStress: c.state.stress };
    renderPlay();
  }
  function saveCurrent() { if (G && !G.state.done) { save.current = { state: G.state, view: G.view }; } else { save.current = null; } persist(); }

  function introScreen(lv) {
    const line = lv.intro[G.introIdx];
    const ch = D.characters[line.who];
    const last = G.introIdx >= lv.intro.length - 1;
    show('intro', `
      <div class="scene" data-time="morning">${SceneSVG.render({ time: 'morning', cat: 'sleep' })}</div>
      <div class="panel">
        <div class="eyebrow">第 ${lv.id} 關　${esc(lv.title)}</div>
        <div class="dialog"><div class="avatar">${avatarOf(line.who)}</div><div class="bubble"><div class="who" style="color:${ch.color}">${ch.name}</div><div class="text">${withTerms(line.text)}</div></div></div>
        <div class="preview">
          <div class="kv"><div class="k">起始資金</div><div class="v">${money(lv.startCash)}</div></div>
          <div class="kv"><div class="k">過關目標</div><div class="v">${money(G.state.goal)}</div></div>
          <div class="kv"><div class="k">天數</div><div class="v">${lv.days} 天</div></div>
          <div class="kv"><div class="k">商品</div><div class="v">${D.products[lv.product].icon} ${D.products[lv.product].name}</div></div>
        </div>
        <button class="btn block" id="next">${last ? '開始第一天' : '繼續 ›'}</button>
      </div>`);
    $('#next').addEventListener('click', () => {
      if (last) { G.view = 'morning'; stepNext(); } else { G.introIdx++; introScreen(lv); }
    });
  }
  function avatarOf(who) { return { grandma: '👵', player: '🧢', cat: '🐱', customer: '🙋', neighbor: '💁‍♀️', xiaoma: '🏍️', wang: '🎩' }[who] || '🙂'; }

  function stepNext() { doStep({ type: 'next' }); }
  function doStep(action) {
    G.lastCash = G.state.cash; G.lastPop = G.state.pop; G.lastStress = G.state.stress;
    G.state = E.step(D, G.state, action);
    // 新的一天：早晨的資訊由引擎算出來（天氣、新聞、今天的事件）
    if (G.state.phase === 'morning' && !G.state.done) G.state = E.step(D, G.state, { type: 'next' });
    G.state.learned.forEach(learnTerm);
    // 由引擎的 phase 決定要顯示的畫面
    G.view = { shop: 'morning', event: 'event', close: 'eventResult', night: 'ledger', done: 'settle' }[G.state.phase];
    saveCurrent();
    renderPlay();
  }

  function timeOf(view) { return { morning: 'morning', shop: 'morning', event: 'noon', eventResult: 'noon', ledger: 'evening', night: 'night' }[view] || 'morning'; }
  function catMood(s) { return s.cash < 0 ? 'shock' : s.stress >= 60 ? 'awake' : 'sleep'; }

  function lvOf(s) { return D.levels.find((l) => l.id === s.levelId); }
  function hud(s) {
    const d = (now, before, suffix) => { const x = now - before; if (!x) return ''; return `<span class="delta ${x > 0 ? 'up' : 'down'}">${x > 0 ? '+' : ''}${suffix ? fmt(x) : x}</span>`; };
    const stat = (k, label, value, bar, delta, term) => `<div class="stat" data-k="${k}"><div class="label"><span>${label}</span><button class="help-btn" data-term="${term}" aria-label="${label}是什麼？">?</button></div><div class="value">${value}</div>${bar !== null ? `<div class="bar"><i style="width:${bar}%"></i></div>` : ''}${delta}</div>`;
    return `<div class="hud">
      ${stat('cash', '資金', money(s.cash), null, d(s.cash, G.lastCash, true), '利潤')}
      ${stat('pop', '人氣', s.pop, s.pop, d(s.pop, G.lastPop), '人氣')}
      ${stat('stress', '壓力', s.stress, s.stress, d(s.stress, G.lastStress), '壓力')}
      ${stat('credit', '信用', s.credit, s.credit, '', '現金流')}
    </div>
    ${lvOf(s).bank ? `<div class="bankline"><span>🏦 活存 <b class="num">${money(E.bankOf(s).demand)}</b></span><span>🔒 定存 <b class="num">${money(E.bankOf(s).fixed.reduce((a, f) => a + f.amount, 0))}</b></span>${E.loanOutstanding(s) ? `<span>💳 待還 <b class="num">${money(E.loanOutstanding(s))}</b></span>` : ''}${lvOf(s).insurance ? `<span>🛡️ ${s.insured ? '已投保' : '未投保'}</span>` : ''}${lvOf(s).market ? `<span>📊 持股 <b class="num">${money(E.holdingsValue(s))}</b></span>` : ''}${s.market && s.market.margin > 0 ? `<span>🧨 融資欠款 <b class="num">${money(s.market.margin)}</b></span>` : ''}${(s.priceLevel || 1) > 1 ? `<span>📈 物價 <b class="num">${Math.round(s.priceLevel * 100)}%</b></span>` : ''}<span>總資產 <b class="num">${money(E.assets(s))}</b> / 目標 ${money(s.goal)}</span></div>` : ''}`;
  }

  function renderPlay() {
    const s = G.state, lv = D.levels.find((l) => l.id === s.levelId), prod = D.products[lv.product];
    if (G.view === 'settle') return settleScreen();
    const weatherIcon = s.today ? { rain: '🌧️', hot: '☀️', sunny: '⛅' }[s.today.weather] : '';
    const time = timeOf(G.view);
    const body = {
      morning: viewMorning, shop: viewShop, event: viewEvent, eventResult: viewEventResult, ledger: viewLedger, night: viewNight,
    }[G.view](s, lv, prod);
    show('play', `
      <div class="scene" data-time="${time}">${SceneSVG.render({ time, cat: catMood(s), grandma: G.view !== 'event' })}
        <div class="day-badge">第 ${s.day} / ${s.days} 天 · ${{ morning: '早晨', noon: '中午', evening: '打烊', night: '夜晚' }[time]}</div>
        <div class="weather-badge">${weatherIcon}</div>
      </div>
      ${hud(s)}
      <div class="panel" id="panel">${body}</div>
      <div class="btn-row"><button class="btn secondary" id="btn-quit">暫停回首頁（會保留進度）</button></div>
    `);
    $('#btn-quit').addEventListener('click', () => { saveCurrent(); titleScreen(); });
    bindView(s, lv, prod);
  }

  // 教學（第一次玩才出現）
  function coach(key, text) {
    if (save.tutorial[key]) return '';
    return `<div class="coach" data-coach="${key}"><div class="icon">👵</div><div class="text">${withTerms(text)}</div><button class="chip" data-coach-ok="${key}">知道了</button></div>`;
  }
  function bindCoach() {
    app.querySelectorAll('[data-coach-ok]').forEach((b) => b.addEventListener('click', () => { save.tutorial[b.dataset.coachOk] = true; persist(); b.closest('.coach').remove(); }));
  }

  // --- 早晨 ---
  function viewMorning(s, lv, prod) {
    const t = s.today;
    const have = E.stockQty(s);
    return `
      <div class="eyebrow">早晨 · 看看今天</div>
      ${coach('hud', '上面四個數字：資金是你手上的錢，人氣決定客人多少，壓力太高會手忙腳亂。看不懂的字點一下「?」或底線，我會解釋。')}
      <div class="news">
        ${t.news.length ? t.news.map((n) => `<div class="news-item ${n.delayed ? 'delayed' : ''}"><div class="icon">${n.icon}</div><div>${withTerms(n.text)}${n.cash ? ` <b class="num">(${n.cash > 0 ? '+' : ''}${fmt(n.cash)})</b>` : ''}</div></div>`).join('') : `<div class="news-item"><div class="icon">📰</div><div>今天沒什麼新聞，天氣不錯。</div></div>`}
        ${have > 0 ? `<div class="news-item"><div class="icon">📦</div><div>店裡還有昨天剩下的 ${prod.name} <b>${have} ${prod.unit}</b>（庫存）。</div></div>` : ''}
      </div>
      <div class="dialog"><div class="avatar">👵</div><div class="bubble"><div class="who" style="color:${D.characters.grandma.color}">阿嬤</div><div class="text">${withTerms(morningLine(s, lv))}</div></div></div>
      <button class="btn block" id="go-shop">去準備開店 ›</button>`;
  }
  function morningLine(s, lv) {
    if (s.today.closed) return '颱風天，今天不用進貨也沒客人。房租照付，休息一天吧。';
    const est = s.today.estimate;
    const lo = Math.round(est * 0.85), hi = Math.round(est * 1.15);
    if (s.day === 1) return `第一天，我看今天大概會來 ${lo} 到 ${hi} 個客人。做太多會丟，做太少會少賺，你自己拿捏。`;
    const y = s.dayRecords[s.dayRecords.length - 1];
    let line = `昨天來了 ${y.demand} 個客人、賣出 ${y.sold} ${D.products[lv.product].unit}。今天我估大概 ${lo} 到 ${hi} 個。`;
    if (y.spoiled > 0) line += ` 昨天丟了 ${y.spoiled} ${D.products[lv.product].unit}，心痛喔。`;
    if (y.demand > y.sold * 1.2) line += ' 昨天有人買不到，人氣會掉。';
    return line;
  }

  // --- 開店 ---
  function viewShop(s, lv, prod) {
    const est = s.today.estimate, have = E.stockQty(s);
    if (s.today.closed) return `
      <div class="eyebrow">颱風天 · 停業</div>
      <div class="news-item"><div class="icon">🌀</div><div>全市停班停課，今天沒有客人。房租 ${money(s.rent)} 照付。冰箱裡還有 ${have} ${prod.unit}。</div></div>
      <button class="btn block" id="open">休息一天 ›</button>`;
    const max = Math.max(60, Math.round(est * 2.2));
    const def = Math.max(0, est - have);
    const affordable = s.cash + (lv.bank ? E.bankOf(s).demand : 0);
    const refNow = E.refPriceNow(D, s);
    const prices = [0.8, 0.9, 1, 1.15, 1.3].map((m) => Math.round(refNow * m));
    const costNow = E.unitCost(prod, 0, s);
    return `
      <div class="eyebrow">開店 · 進貨與定價</div>
      ${coach('shop', `今天要做幾${prod.unit}、賣多少錢，這兩件事決定今天賺不賺。成本每${prod.unit} ${prod.cost} 元，我以前賣 ${prod.refPrice}。進貨的錢現在就要付。`)}
      ${costNow !== prod.cost ? `<div class="tip"><div class="icon">📈</div><div>現在每${prod.unit}成本 <b>${costNow}</b> 元（原本 ${prod.cost}）。客人目前能接受的價格大約 <b>${refNow}</b> 元。</div></div>` : ''}
      <p class="muted">${prod.icon} ${esc(prod.name)}：${withTerms(prod.note)}${have ? `　目前庫存 ${have} ${prod.unit}。` : ''}</p>
      <div class="field">
        <label><span>進貨數量（${prod.unit}）</span><span class="muted">阿嬤估 ${Math.round(est * 0.85)}–${Math.round(est * 1.15)} 位客人</span></label>
        <div class="stepper">
          <button type="button" data-q="-10" aria-label="減少 10">−</button>
          <input type="range" id="qty" min="0" max="${max}" step="5" value="${def}" aria-label="進貨數量">
          <button type="button" data-q="10" aria-label="增加 10">+</button>
          <div class="val num" id="qty-val">${def}</div>
        </div>
        <div class="chips">
          <button class="chip" data-qset="${Math.max(0, Math.round(est * 0.8) - have)}">保守</button>
          <button class="chip" data-qset="${def}">剛好</button>
          <button class="chip" data-qset="${Math.max(0, Math.round(est * 1.25) - have)}">多一點</button>
          ${prod.bulk ? `<button class="chip" data-qset="${prod.bulk.qty}">${prod.bulk.qty}（${Math.round((1 - prod.bulk.discount) * 10)}折）</button>` : ''}
        </div>
      </div>
      ${lv.staff ? `<div class="field"><label><span>人手</span><span class="muted">你一個人一天最多 ${lv.capacity} ${prod.unit}</span></label>
        <div class="chips"><button class="chip" id="hire" aria-pressed="${est > lv.capacity + 40}">請${lv.staff.name}來上班（+${lv.staff.capacity} ${prod.unit}，薪資 ${money(lv.staff.wage)}）</button></div></div>` : ''}
      <div class="field">
        <label><span>售價（每${prod.unit}）</span><span class="muted">參考價 ${refNow} 元</span></label>
        <div class="chips" id="prices">${prices.map((p) => `<button class="chip" data-p="${p}" aria-pressed="${p === refNow}">${p} 元</button>`).join('')}</div>
      </div>
      <div class="preview">
        <div class="kv"><div class="k">進貨要付</div><div class="v num" id="pv-cost">—</div></div>
        <div class="kv"><div class="k">每${prod.unit}賺</div><div class="v num" id="pv-margin">—</div></div>
        <div class="kv"><div class="k">全部賣完可收</div><div class="v num" id="pv-rev">—</div></div>
        <div class="kv"><div class="k">今天房租</div><div class="v num">−${money(s.rent)}</div></div>
      </div>
      <div class="tip"><div class="icon">👵</div><div id="pv-tip"></div></div>
      <button class="btn block" id="open">開始營業 ›</button>`;
  }
  function bindShop(s, lv, prod) {
    const qty = $('#qty'), qv = $('#qty-val');
    const refNow = E.refPriceNow(D, s);
    let price = refNow;
    const est = s.today.estimate, have = E.stockQty(s);
    const hireBtn = $('#hire');
    const hired = () => !!(hireBtn && hireBtn.getAttribute('aria-pressed') === 'true');
    const affordable = s.cash + (lv.bank ? E.bankOf(s).demand : 0);
    const update = () => {
      let q = +qty.value;
      const ucTry = E.unitCost(prod, q, s);
      if (q * ucTry > affordable) { q = Math.floor(affordable / ucTry / 5) * 5; qty.value = q; toast('錢不夠，最多只能進 ' + q + ' ' + prod.unit); }
      qv.textContent = q;
      const uc = E.unitCost(prod, q, s);
      const cap = (lv.capacity || Infinity) + (hired() ? lv.staff.capacity : 0);
      const total = q + have;
      $('#pv-cost').textContent = '−' + money(q * uc) + (uc < prod.cost ? ' 🏷️' : '');
      $('#pv-margin').textContent = (price - uc) + ' 元';
      $('#pv-rev').textContent = money(total * price);
      let tip;
      const pf = E.priceFactor(price, refNow);
      const expect = Math.round(est * pf);
      if (total === 0) tip = '一個都不做？那今天房租還是要付喔。';
      else if (total > cap) tip = `${hired() ? '就算有' + lv.staff.name : '你一個人'}一天最多做 ${cap} ${prod.unit}，多的 ${total - cap} ${prod.unit}會做不出來。`;
      else if (lv.staff && hired() && expect < lv.capacity) tip = `我估只有 ${expect} 個客人，你自己就做得完，請${lv.staff.name}的 ${money(lv.staff.wage)} 會白花。`;
      else if (lv.staff && !hired() && expect > lv.capacity + 30) tip = `我估 ${expect} 個客人，你一個人最多 ${lv.capacity}，剩下的會買不到。`;
      else if (total > expect * 1.4) tip = `我估賣 ${expect} 左右，你準備 ${total}，剩下的${prod.spoil >= 1 ? '明天就不能賣了' : '會慢慢壞掉'}。`;
      else if (total < expect * 0.7) tip = `我估賣 ${expect} 左右，你只準備 ${total}，有客人會買不到，人氣會掉。`;
      else if (price > refNow * 1.2) tip = '賣這麼貴，每顆賺多，但客人會變少，而且會記得。';
      else if (price < refNow * 0.85) tip = '便宜賣客人多，但每顆賺很少，算一算划不划算。';
      else tip = `照這樣，賣得順的話今天大概賺 ${money(Math.min(expect, total, cap) * price - q * uc - s.rent - (hired() ? lv.staff.wage : 0))}。`;
      if (s.cash < q * uc) tip += `（手上現金不夠，會自動從活存領 ${money(q * uc - s.cash)}。）`;
      $('#pv-tip').innerHTML = withTerms(tip);
    };
    qty.addEventListener('input', update);
    app.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => { qty.value = Math.max(0, Math.min(+qty.max, +qty.value + +b.dataset.q)); update(); }));
    app.querySelectorAll('[data-qset]').forEach((b) => b.addEventListener('click', () => { const v = +b.dataset.qset; if (v > +qty.max) qty.max = v; qty.value = v; update(); }));
    app.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => { price = +b.dataset.p; app.querySelectorAll('[data-p]').forEach((x) => x.setAttribute('aria-pressed', x === b)); update(); }));
    if (hireBtn) hireBtn.addEventListener('click', () => { hireBtn.setAttribute('aria-pressed', !hired()); update(); });
    $('#open').addEventListener('click', () => { G.view = 'shop'; doStep({ qty: +qty.value, price, hire: hired() }); });
    update();
  }

  // --- 事件 ---
  let timerHandle = null;
  function viewEvent(s) {
    const ev = D.events.find((e) => e.id === s.today.eventId);
    const ch = D.characters[ev.who] || D.characters.customer;
    const secs = eventSeconds(s);
    return `
      <div class="eyebrow">中午 · 發生了一件事</div>
      ${coach('event', '每天中午會有一件事。選項沒有標準答案，但後果有的馬上出現，有的要過幾天。結算時我們一起回頭看。')}
      <div class="card-ev">
        <div class="title">${esc(ev.title)}</div>
        <div class="dialog"><div class="avatar">${avatarOf(ev.who)}</div><div class="bubble"><div class="who" style="color:${ch.color}">${ch.name}</div><div class="text">${withTerms(typeof ev.text === 'function' ? ev.text(s) : ev.text)}</div></div></div>
        ${secs ? `<div class="timer" aria-label="倒數"><i id="timer-bar"></i></div><div class="muted" id="timer-txt">壓力大，要快點決定：${secs} 秒</div>` : ''}
        <div class="options">${E.optsOf(ev, s).map((o, i) => { const ok = E.optionAllowed(o, s); return `<button class="opt" data-opt="${i}" ${ok ? '' : 'disabled'}><span class="l">${esc(o.label)}</span>${!ok ? `<span class="k">💸 手上現金不夠（需要 ${money(o.minCash)}，你有 ${money(s.cash)}）</span>` : o.kind === 'luck' ? '<span class="k">🎲 結果看運氣</span>' : ''}</button>`; }).join('')}</div>
      </div>`;
  }
  function eventSeconds(s) { const d = E.DIFF[s.difficulty]; if (s.stress >= 60) return 15; return d.timer || 0; }
  function bindEvent(s) {
    const choose = (i) => { clearInterval(timerHandle); timerHandle = null; doStep({ opt: i }); };
    app.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', () => choose(+b.dataset.opt)));
    const secs = eventSeconds(s);
    if (secs) {
      let left = secs; const bar = $('#timer-bar'), txt = $('#timer-txt');
      requestAnimationFrame(() => { bar.style.transition = `width ${secs}s linear`; bar.style.width = '0%'; });
      timerHandle = setInterval(() => { left--; if (txt) txt.textContent = `壓力大，要快點決定：${left} 秒`; if (left <= 0) { toast('來不及想，隨手選了第一個'); const first = app.querySelector('[data-opt]:not([disabled])'); choose(first ? +first.dataset.opt : 0); } }, 1000);
    }
  }
  function viewEventResult(s) {
    const ev = D.events.find((e) => e.id === s.today.eventId);
    const rp = s.replay.find((r) => r.day === s.day) || {};
    const opt = { label: rp.label || E.optsOf(ev, s)[s.today.eventChoice].label };
    const delta = s.today.eventDelta;
    return `
      <div class="eyebrow">中午 · 你選了「${esc(opt.label)}」</div>
      <div class="result-box ${delta > 0 ? 'delta-up' : delta < 0 ? 'delta-down' : ''}">${withTerms(s.today.eventResult)}${delta ? `\n<b class="num">資金 ${delta > 0 ? '+' : ''}${fmt(delta)}</b>` : ''}</div>
      ${ev.known ? `<p class="muted">💡 當時你知道的事：${withTerms(ev.known)}</p>` : ''}
      <button class="btn block" id="close-shop">打烊結算 ›</button>`;
  }

  // --- 帳本 ---
  function viewLedger(s, lv, prod) {
    const r = s.today.record;
    const row = (k, v, cls) => `<tr><td>${k}</td><td class="${cls || ''}">${v}</td></tr>`;
    const sign = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n));
    return `
      <div class="eyebrow">打烊 · 今天的帳</div>
      ${coach('ledger', '這就是帳本。收進來的錢不是利潤，要扣掉進貨和房租。最下面那一行才是今天真的賺或賠。')}
      <p class="muted">${s.today.closed ? '颱風天停業，' : ''}來了 ${r.demand} 位客人，賣出 ${r.sold} ${prod.unit}${r.demand > r.sold ? `，有 ${r.demand - r.sold} 位買不到${r.capacity && r.sold >= r.capacity ? '（做不出來，產能 ' + r.capacity + '）' : ''}` : ''}${r.spoiled ? `，丟掉 ${r.spoiled} ${prod.unit}` : ''}${r.leftover ? `，剩 ${r.leftover} ${prod.unit}留到明天` : ''}。</p>
      <table class="ledger">
        ${row('營收（' + r.sold + ' × ' + r.price + '）', sign(r.revenue), 'pos')}
        ${row('進貨（成本）', sign(-r.purchase), 'neg')}
        ${row('房租（固定支出）', sign(-r.rent), 'neg')}
        ${r.wage ? row(lv.staff.name + '的薪資（固定支出）', sign(-r.wage), 'neg') : ''}
        ${r.eventDelta ? row('中午的事', sign(r.eventDelta), r.eventDelta > 0 ? 'pos' : 'neg') : ''}
        ${r.spoilCost ? row('其中丟掉的（損耗）', '（' + fmt(r.spoilCost) + '）', 'neg') : ''}
        <tr class="total"><td>今天的利潤</td><td class="${r.profit >= 0 ? 'pos' : 'neg'}">${sign(r.profit)}</td></tr>
      </table>
      ${r.popWhy.length ? `<p class="muted">人氣 ${r.popDelta > 0 ? '+' : ''}${r.popDelta}：${r.popWhy.join('、')}</p>` : ''}
      ${s.today.autoWithdraw ? `<p class="muted">🏦 手上現金不夠進貨，自動從活存領了 ${money(s.today.autoWithdraw)}。</p>` : ''}
      <button class="btn block" id="to-night">休息 ›</button>`;
  }
  function viewNight(s, lv) {
    const last = s.day >= s.days || s.cash < 0;
    const total = E.assets(s);
    const b = E.bankOf(s);
    const bank = lv.bank && !last ? `
      ${coach('bank', `打烊後可以存錢。活存隨時領得出來，每天利息 ${(lv.bank.demandRate * 100).toFixed(1)}%；定存鎖 ${lv.bank.fixedDays} 天，每天 ${(lv.bank.fixedRate * 100).toFixed(1)}%，中途解約沒利息。記得手上留明天進貨的錢。`)}
      <div class="bank">
        <div class="preview">
          <div class="kv"><div class="k">手上現金（抽屜）</div><div class="v num" id="bk-cash">${money(s.cash)}</div></div>
          <div class="kv"><div class="k">活存</div><div class="v num" id="bk-demand">${money(b.demand)}</div></div>
        </div>
        <div class="field"><label><span>存進活存</span><span class="muted num" id="bk-d-val">0</span></label>
          <input type="range" id="bk-d" min="0" max="${Math.max(0, s.cash)}" step="1000" value="0" aria-label="存進活存"></div>
        <div class="field"><label><span>存進定存（${lv.bank.fixedDays} 天後才能動）</span><span class="muted num" id="bk-f-val">0</span></label>
          <input type="range" id="bk-f" min="0" max="${Math.max(0, s.cash)}" step="1000" value="0" aria-label="存進定存"></div>
        ${b.demand > 0 ? `<div class="field"><label><span>從活存領回手上</span><span class="muted num" id="bk-w-val">0</span></label>
          <input type="range" id="bk-w" min="0" max="${b.demand}" step="1000" value="0" aria-label="從活存領回"></div>` : ''}
        ${b.fixed.length ? `<div class="field"><label>定存中</label>${b.fixed.map((f, i) => `<div class="news-item"><div class="icon">🔒</div><div>${money(f.amount)}，第 ${f.matureDay} 天到期，利息約 ${money(f.amount * f.rate * f.days)}　<button class="chip" data-break="${i}">提前解約（沒利息）</button></div></div>`).join('')}</div>` : ''}
        <p class="muted" id="bk-tip">明天進貨大概要 ${money(Math.round(s.today.estimate * E.unitCost(D.products[lv.product], 0, s)))} 左右${(s.loans || []).length ? `，加上還款 ${money((s.loans || []).reduce((a, l) => a + l.daily, 0))}` : ''}，手上要留夠。</p>
      </div>
      ${lv.market ? marketPanel(s, lv) : ''}
      ${lv.loan ? loanPanel(s, lv) : ''}
      ${lv.insurance ? `<div class="bank"><div class="field"><label><span>🛡️ ${lv.insurance.name}</span><span class="muted">每天 ${money(lv.insurance.premium)}</span></label>
        <div class="chips"><button class="chip" id="ins-toggle" aria-pressed="${s.insured}">${s.insured ? '已投保（點一下取消）' : '投保（明天起每天扣保費）'}</button></div>
        <p class="muted">保火災等意外，自負額 2,000。「什麼都保」的不算。</p></div></div>` : ''}` : '';
    return `
      <div class="eyebrow">夜晚 · 第 ${s.day} 天結束</div>
      <div class="dialog"><div class="avatar">🐱</div><div class="bubble"><div class="who" style="color:${D.characters.cat.color}">發財 & 阿嬤</div><div class="text">${withTerms(s.nightLine)}</div></div></div>
      ${bank}
      <p class="muted">目前${lv.bank ? '總資產' : '資金'} ${money(total)}，目標 ${money(s.goal)}${total >= s.goal ? ' ✅ 已達標，守住就好' : `，還差 ${money(s.goal - total)}`}。</p>
      <button class="btn block ${last ? 'gold' : ''}" id="next-day">${last ? '看結算 ›' : '睡覺，迎接第 ' + (s.day + 1) + ' 天 ›'}</button>`;
  }

  // --- 投資面板（篇章三） ---
  function spark(hist, w, h) {
    if (!hist || hist.length < 2) return '';
    const lo = Math.min(...hist), hi = Math.max(...hist), span = Math.max(1e-9, hi - lo);
    const pts = hist.map((v, i) => `${(i / (hist.length - 1) * w).toFixed(1)},${(h - 2 - (v - lo) / span * (h - 4)).toFixed(1)}`).join(' ');
    const up = hist[hist.length - 1] >= hist[0];
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${up ? 'var(--good)' : 'var(--bad)'}" stroke-width="2" stroke-linejoin="round"/></svg>`;
  }
  function riskStars(n) { return '<span class="risk">' + '●'.repeat(n) + '<span style="opacity:.25">' + '●'.repeat(5 - n) + '</span></span>'; }
  function feeLine(p, s) {
    if (p.hiddenFee && !s.flags.askedFee) return '費用：小王沒說。<b>你沒問。</b>';
    const parts = [];
    if (p.buyFee) parts.push((p.id === 'coin' ? '換匯價差 ' : '買進 ') + (p.buyFee * 100).toFixed(1) + '%');
    if (p.dailyFee) parts.push('每天管理費 ' + (p.dailyFee * 100).toFixed(2) + '%');
    if (p.payout) parts.push((p.payoutIn === 'units' ? '利息每天 ' : '配息每天 ') + (p.payout * 100).toFixed(1) + '%');
    return '費用：' + (parts.length ? parts.join('、') : '無（小心，免費的最貴）');
  }
  function marketPanel(s, lv) {
    const m = E.marketOf(s); const prods = E.marketProducts(D, lv);
    const mg = lv.market.margin; const room = mg ? E.marginRoom(lv, s) : 0;
    return `<div class="bank market">
      ${coach('market', '打烊後可以把閒錢放進這些虛構的投資商品。每一樣都看四件事：風險（幾顆點）、今天漲跌、費用、投資什麼。過關看總資產，帳面跌了沒賣不算輸。手上要留明天進貨的錢。')}
      <div class="field"><label><span>📊 投資（全部虛構）</span><span class="muted">持股 ${money(E.holdingsValue(s))}</span></label></div>
      ${prods.map((p) => { const h = m.hist[p.id] || []; const price = m.prices[p.id]; const prev = h.length > 1 ? h[h.length - 2] : price; const chg = prev ? (price / prev - 1) * 100 : 0; const hold = E.holdingValue(s, p.id); const held = m.holdings[p.id]; const frozen = p.freezeFrom && s.day >= p.freezeFrom && hold > 0;
        return `<div class="mkt-card" data-mkt="${p.id}">
          <div class="mkt-head"><div class="mkt-name">${p.icon} <b>${esc(p.name)}</b> ${riskStars(p.risk)}</div><div class="mkt-price num">${fmt(price)} <span class="${chg >= 0 ? 'up' : 'down'}">${chg >= 0 ? '▲' : '▼'}${Math.abs(chg).toFixed(1)}%</span></div></div>
          <div class="mkt-body">${spark(h, 120, 32)}<div class="muted mkt-desc">${withTerms(p.what)}　<span class="muted">配息來源：${esc(p.source)}</span><br>${feeLine(p, s)}</div></div>
          <div class="mkt-hold muted">持有 <b class="num">${money(hold)}</b>${held && held.cost ? `（投入 ${money(held.cost)}，${hold >= held.cost ? '+' : '−'}${fmt(Math.abs(hold - held.cost))}）` : ''}</div>
          ${frozen ? `<div class="tip"><div class="icon">⏳</div><div>出金申請「審核中」。客服說要再等等。</div></div>` : ''}
          <div class="field"><label><span>${hold > 0 && !frozen ? '賣出 ◂　▸ 買進' : '買進'}</span><span class="muted num" id="tr-${p.id}-val">0</span></label>
            <input type="range" class="trade" id="tr-${p.id}" data-id="${p.id}" min="${frozen ? 0 : -Math.floor(hold / 1000) * 1000}" max="${Math.max(0, Math.floor(s.cash / 1000) * 1000)}" step="1000" value="0" aria-label="${esc(p.name)} 買賣金額"></div>
        </div>`; }).join('')}
      ${mg ? `<div class="field"><label><span>🧨 融資（向券商借錢買）</span><span class="muted">利息每天 ${(mg.rate * 100).toFixed(1)}%，欠款 ${money(m.margin)}</span></label>
        <p class="muted">最多用自己的 1 份買 ${mg.maxMul} 份。持股跌到欠款的 ${mg.maintain} 倍以下會被強制賣光（斷頭）。</p>
        ${room > 0 ? `<label><span>借多少</span><span class="muted num" id="mg-val">0</span></label><input type="range" id="mg" min="0" max="${room}" step="1000" value="0" aria-label="融資借款">` : ''}
        ${m.margin > 0 ? `<label><span>還多少</span><span class="muted num" id="mg-r-val">0</span></label><input type="range" id="mg-r" min="0" max="${Math.min(Math.floor(m.margin / 1000) * 1000 + 1000, Math.floor(s.cash / 1000) * 1000)}" step="1000" value="0" aria-label="償還融資">` : ''}
      </div>` : ''}
      <p class="muted" id="mkt-tip">買賣在睡覺前成交，用今天的價格。</p>
    </div>`;
  }
  function loanPanel(s, lv) {
    const loans = s.loans || [];
    const out = loans.reduce((a, l) => a + l.principal, 0);
    const room = Math.max(0, lv.loan.max - out);
    const t = E.loanTerms(lv, s, 10000);
    return `<div class="bank">
      ${coach('loan', `這裡可以跟銀行借錢。借了之後每天早上自動還一期，連還 ${lv.loan.days} 天；手上沒現金就會延遲，信用會掉。借之前先看總共要還多少。`)}
      <div class="field"><label><span>💳 銀行貸款</span><span class="muted">信用 ${s.credit}，利率 ${(t.rate * 100).toFixed(1)}%／天</span></label>
      ${loans.length ? loans.map((l) => `<div class="news-item"><div class="icon">💳</div><div>${esc(l.name)}：每天還 ${money(l.daily)}，還剩 ${l.daysLeft} 期（共 ${money(l.daily * l.daysLeft)}）</div></div>`).join('') : '<p class="muted">目前沒有貸款。</p>'}
      ${room > 0 ? `<label><span>要借多少</span><span class="muted num" id="ln-val">0</span></label>
        <input type="range" id="ln" min="0" max="${room}" step="5000" value="0" aria-label="借款金額">
        <p class="muted" id="ln-tip">借 10,000 的話，${lv.loan.days} 天總共要還 ${money(t.total)}（每天 ${money(t.daily)}）。</p>` : `<p class="muted">已達借款上限 ${money(lv.loan.max)}。</p>`}
      </div></div>`;
  }
  function bindNight(s, lv) {
    const breaks = [];
    const ln = $('#ln');
    if (ln) ln.addEventListener('input', () => { const v = +ln.value; $('#ln-val').textContent = money(v); if (v > 0) { const t = E.loanTerms(lv, s, v); $('#ln-tip').textContent = `借 ${money(v)}，${lv.loan.days} 天總共要還 ${money(t.total)}（每天 ${money(t.daily)}，利息 ${money(t.total - v)}）。`; } });
    const ins = $('#ins-toggle');
    if (ins) ins.addEventListener('click', () => { const on = ins.getAttribute('aria-pressed') !== 'true'; ins.setAttribute('aria-pressed', on); ins.textContent = on ? '已投保（點一下取消）' : '投保（明天起每天扣保費）'; });
    const d = $('#bk-d'), f = $('#bk-f'), w = $('#bk-w');
    const trades = Array.from(app.querySelectorAll('input.trade')); const mg = $('#mg'), mgr = $('#mg-r');
    const tradeNet = () => trades.reduce((a, t) => a + (+t.value), 0) + (mgr ? +mgr.value : 0) - (mg ? +mg.value : 0);
    const updTrades = () => { trades.forEach((t) => { const v = +t.value; $('#tr-' + t.dataset.id + '-val').textContent = (v > 0 ? '買 ' : v < 0 ? '賣 ' : '') + money(Math.abs(v)); }); if (mg) $('#mg-val').textContent = money(+mg.value); if (mgr) $('#mg-r-val').textContent = money(+mgr.value); const net = tradeNet(); const tip = $('#mkt-tip'); if (tip) tip.textContent = net > 0 ? `買進共 ${money(net)}，睡醒後手上剩 ${money(s.cash - net)}。記得留明天進貨的錢。` : net < 0 ? `賣出共 ${money(-net)}，睡醒後手上 ${money(s.cash - net)}。` : '買賣在睡覺前成交，用今天的價格。'; };
    trades.concat([mg, mgr].filter(Boolean)).forEach((t) => t.addEventListener('input', () => { const buyTotal = trades.reduce((a, x) => a + Math.max(0, +x.value), 0) + (mgr ? +mgr.value : 0); const avail = s.cash + (mg ? +mg.value : 0) + trades.reduce((a, x) => a + Math.max(0, -x.value), 0); if (buyTotal > avail && +t.value > 0) t.value = Math.max(0, +t.value - (buyTotal - avail)); updTrades(); if (d) upd(); }));
    const upd = () => {
      if (!d) return;
      let dv = +d.value, fv = +f.value, wv = w ? +w.value : 0;
      if (dv + fv > s.cash) { fv = Math.max(0, s.cash - dv); f.value = fv; }
      $('#bk-d-val').textContent = money(dv); $('#bk-f-val').textContent = money(fv); if (w) $('#bk-w-val').textContent = money(wv);
      $('#bk-cash').textContent = money(s.cash - dv - fv + wv);
      $('#bk-demand').textContent = money(E.bankOf(s).demand + dv - wv);
    };
    [d, f, w].forEach((el) => el && el.addEventListener('input', upd));
    app.querySelectorAll('[data-break]').forEach((btn) => btn.addEventListener('click', () => { breaks.push(+btn.dataset.break); btn.textContent = '已解約'; btn.disabled = true; }));
    $('#next-day').addEventListener('click', () => {
      G.view = 'night';
      const bank = d ? { demand: +d.value, fixed: +f.value, withdraw: w ? +w.value : 0, breakFixed: breaks } : undefined;
      const a = { type: 'next' };
      if (bank) a.bank = bank;
      if (ln && +ln.value > 0) a.borrow = +ln.value;
      if (ins) a.insure = ins.getAttribute('aria-pressed') === 'true';
      if (trades.length) { const t = {}; trades.forEach((x) => { if (+x.value) t[x.dataset.id] = +x.value; }); if (Object.keys(t).length) a.trades = t; }
      if (mg && +mg.value > 0) a.marginBorrow = +mg.value;
      if (mgr && +mgr.value > 0) a.marginRepay = +mgr.value;
      doStep(a);
    });
    updTrades(); upd();
  }
  function bindView(s, lv, prod) {
    bindCoach();
    if (G.view === 'morning') $('#go-shop').addEventListener('click', () => { G.view = 'shop'; renderPlay(); });
    if (G.view === 'shop') { if (s.today.closed) $('#open').addEventListener('click', () => { G.view = 'shop'; doStep({ qty: 0, price: prod.refPrice, hire: false }); }); else bindShop(s, lv, prod); }
    if (G.view === 'event') bindEvent(s);
    if (G.view === 'eventResult') $('#close-shop').addEventListener('click', () => { G.view = 'eventResult'; stepNext(); });
    if (G.view === 'ledger') $('#to-night').addEventListener('click', () => { G.view = 'night'; renderPlay(); });
    if (G.view === 'night') bindNight(s, lv);
  }

  // ---------- 結算 ----------
  function settleScreen() {
    const s = G.state, lv = D.levels.find((l) => l.id === s.levelId), prod = D.products[lv.product];
    const r = E.settle(D, s);
    // 存進度
    const p = save.progress[lv.id] || { stars: 0, best: -Infinity };
    if (r.passed) { p.stars = Math.max(p.stars, r.stars); }
    p.best = Math.max(p.best === -Infinity ? r.total : p.best, r.total);
    save.progress[lv.id] = p; save.current = null; persist();
    const newTerms = s.learned.filter((t) => D.glossary[t]);
    show('settle', `
      <div class="scene" data-time="${r.passed ? 'morning' : 'evening'}">${SceneSVG.render({ time: r.passed ? 'morning' : 'evening', cat: s.cash < 0 ? 'shock' : 'sleep' })}</div>
      <div class="panel">
        <div class="settle-hero">
          <div class="eyebrow">第 ${lv.id} 關　${esc(lv.title)}　結算</div>
          <div class="stars" aria-label="${r.stars} 顆星">${'★'.repeat(r.stars)}<span style="opacity:.25">${'★'.repeat(3 - r.stars)}</span></div>
          <h2>${r.passed ? '過關！' : s.cash < 0 ? '錢筒空了' : '差一點'}</h2>
          <div><span class="title-badge">稱號：${esc(r.title.name)}</span></div>
          <p class="muted">${esc(r.title.desc)}</p>
        </div>
        ${lv.bank ? `<p class="muted" style="text-align:center">總資產 ${money(r.total)}（手上 ${money(s.cash)} + 銀行 ${money(E.bankOf(s).demand + E.bankOf(s).fixed.reduce((a, f) => a + f.amount, 0))}${r.market ? ` + 持股 ${money(r.market.held)}` : ''}${r.market && s.market.margin ? ` − 融資欠款 ${money(s.market.margin)}` : ''}${r.loanOutstanding ? ` − 未還貸款 ${money(r.loanOutstanding)}` : ''}${r.tax ? ` − 稅 ${money(r.tax)}` : ''}）</p>` : ''}
        ${r.priceLevel > 1 ? `<p class="muted" style="text-align:center">📈 這關物價漲了 ${Math.round((r.priceLevel - 1) * 100)}%：沒動的 10 萬現金，現在只買得到以前 ${Math.round(100 / r.priceLevel)}% 的貨。</p>` : ''}
        ${lv.tax ? `<p class="muted" style="text-align:center">🧾 繳稅 ${money(r.tax)}${s.flags.records ? '（有留紀錄，少繳四成）' : ''}${s.flags.taxEvaded ? '（這次沒被查到，純屬運氣）' : ''}</p>` : ''}
        <div class="preview">
          <div class="kv"><div class="k">${lv.days} 天賺了</div><div class="v num ${r.profit >= 0 ? '' : ''}" style="color:${r.profit >= 0 ? 'var(--good)' : 'var(--bad)'}">${r.profit >= 0 ? '+' : ''}${fmt(r.profit)}</div></div>
          <div class="kv"><div class="k">目標</div><div class="v num">+${fmt(r.goalProfit)}</div></div>
          <div class="kv"><div class="k">賣出</div><div class="v num">${r.soldTotal} ${prod.unit}</div></div>
          <div class="kv"><div class="k">丟掉</div><div class="v num">${r.spoiledTotal} ${prod.unit}（${money(r.spoilCostTotal)}）</div></div>
        </div>
      </div>
      <div class="panel">
        <h3>資金曲線</h3>
        ${chart(s)}
        <p class="muted">金色的點是你做重大決定的那幾天。${lv.market ? '虛線是持股市值（自己的比例尺，從底線往上）。' : ''}</p>
      </div>
      ${r.market ? marketSummary(r.market, s) : (s.flags.scamLoss ? `<div class="panel"><div class="tip"><div class="icon">🕳️</div><div>這關被騙走 <b>${money(s.flags.scamLoss)}</b>。真實世界這種錢通常拿不回來，能做的是立刻打 165 和銀行，把損失停在那一刻。</div></div></div>` : '')}
      <div class="panel">
        <h3>決策回放</h3>
        ${s.replay.length ? s.replay.map((rp, i) => replayItem(rp, r.worlds[i])).join('') : '<p class="muted">這一關沒有重大決定。</p>'}
        <h3>進貨回顧</h3>
        <div class="muted">${s.dayRecords.map((d) => `第 ${d.day} 天：進 ${d.qty}、賣 ${d.sold}${d.spoiled ? `、丟 ${d.spoiled}` : ''}${d.demand > d.sold ? `、少賣 ${d.demand - d.sold}` : ''}`).join('<br>')}</div>
      </div>
      ${r.passed && D.chapters[lv.chapter] && lv.id === Math.max(...D.levels.filter((l) => l.chapter === lv.chapter).map((l) => l.id)) ? chapterCard(D.chapters[lv.chapter]) : ''}
      <div class="panel">
        <div class="dialog"><div class="avatar">👵</div><div class="bubble"><div class="who" style="color:${D.characters.grandma.color}">阿嬤的評語</div><div class="text">${withTerms(r.grandma)}</div></div></div>
        <div class="tip"><div class="icon">📌</div><div>${withTerms(lv.lesson)}</div></div>
        ${newTerms.length ? `<p class="muted">📖 這關出現的名詞：${newTerms.map((t) => `<button class="term" data-term="${t}">${t}</button>`).join('　')}</p>` : ''}
        <div class="btn-row">
          <button class="btn secondary" id="retry">再玩一次</button>
          ${r.passed && D.levels.some((l) => l.id === lv.id + 1) ? `<button class="btn gold" id="next-level">下一關 ›</button>` : `<button class="btn" id="to-map">回關卡表</button>`}
        </div>
        <p class="footer-note">這是模擬，數字是虛構的。真實世界的成本、人氣與運氣比這裡複雜得多。</p>
      </div>`);
    $('#retry').addEventListener('click', () => startLevel(lv.id));
    const nl = $('#next-level'); if (nl) nl.addEventListener('click', () => startLevel(lv.id + 1));
    const tm = $('#to-map'); if (tm) tm.addEventListener('click', mapScreen);
  }
  function marketSummary(mk, s) {
    const rows = mk.byProduct.filter((b) => b.bought > 0 || b.held > 0).map((b) => `<div class="row-kv"><b>${b.icon} ${esc(b.name)}</b><span>投入 ${money(b.bought)}，拿回 ${money(b.sold + b.held)}（${b.sold + b.held >= b.bought ? '+' : '−'}${fmt(Math.abs(b.sold + b.held - b.bought))}）；這檔本身這關 ${b.change >= 0 ? '漲' : '跌'} ${Math.abs(b.change * 100).toFixed(0)}%</span></div>`).join('');
    return `<div class="panel">
      <h3>投資回顧</h3>
      ${mk.invested ? `<div class="preview">
        <div class="kv"><div class="k">投入</div><div class="v num">${money(mk.invested)}</div></div>
        <div class="kv"><div class="k">賺／賠</div><div class="v num" style="color:${mk.gain >= 0 ? 'var(--good)' : 'var(--bad)'}">${mk.gain >= 0 ? '+' : '−'}${fmt(Math.abs(mk.gain))}</div></div>
        <div class="kv"><div class="k">付了多少費用</div><div class="v num">${money(mk.fees)}</div></div>
        <div class="kv"><div class="k">收到配息／利息</div><div class="v num">${money(mk.dividends)}</div></div>
      </div>${rows}` : '<p class="muted">這一關你沒有投資。錢沒變少，也沒長大。</p>'}
      ${mk.scamLoss ? `<div class="tip"><div class="icon">🕳️</div><div>這關被騙走 <b>${money(mk.scamLoss)}</b>${mk.frozen.length ? '，還有一筆在「審核中」的平台裡，平台已經消失' : ''}。真實世界這種錢通常拿不回來，能做的是立刻打 165 和銀行，把損失停在那一刻。</div></div>` : ''}
      ${mk.liquidated ? `<div class="tip"><div class="icon">💥</div><div>這關你被<button class="term" data-term="爆倉">斷頭</button>了：券商在你最慘的那天把持股全賣掉。借來的錢放大的不是運氣，是賠率。</div></div>` : ''}
      ${mk.panic.length ? `<div class="tip"><div class="icon">😱</div><div>恐慌賣出 ${mk.panic.length} 次：${mk.panic.map((p) => `第 ${p.day} 天賣掉 ${esc(p.name)}（${money(p.cash)}），三天內它又漲回去了`).join('；')}。<button class="term" data-term="波動">波動</button>不等於虧損，賣掉才是。</div></div>` : ''}
      ${!mk.liquidated && !mk.panic.length && mk.products >= 3 ? `<div class="tip"><div class="icon">🧺</div><div>你把錢分在 ${mk.products} 個籃子裡。</div></div>` : ''}
    </div>`;
  }
  function replayItem(rp, world) {
    const worlds = world ? world.results.map((w) => `<div class="world">如果選「${esc(w.label)}」：最後總資產 ${money(w.cash)}（${w.diff >= 0 ? '+' : '−'}${fmt(Math.abs(w.diff))}）</div>`).join('') : '';
    return `<div class="replay-item">
      <div class="head"><b>第 ${rp.day} 天 · ${esc(rp.title)}</b><span class="tag ${rp.kind}">${rp.kind === 'luck' ? '運氣' : '判斷'}</span></div>
      <div>你選了「${esc(rp.label)}」${rp.delta ? `，當下資金 ${rp.delta > 0 ? '+' : ''}${fmt(rp.delta)}` : ''}。</div>
      ${rp.verdict ? `<div class="muted">👵 ${withTerms(rp.verdict)}</div>` : ''}
      ${worlds}
    </div>`;
  }
  function chapterCard(ch) {
    const rc = ch.realCard;
    return `<div class="panel chapter-done">
      <div class="eyebrow">🎉 ${esc(ch.title)} 完成</div>
      <h2>${esc(ch.done)}</h2>
      <div class="card-ev"><div class="title">${esc(rc.title)}</div><p class="muted">${esc(rc.intro)}</p>
        ${rc.items.map((it) => `<div class="row-kv"><b>${esc(it.k)}</b><span>${esc(it.v)}</span></div>`).join('')}
        <p class="muted">${esc(rc.note)}</p></div>
      <p class="muted">${esc(ch.next || '')}</p>
    </div>`;
  }
  function chart(s) {
    const W = 520, H = 180, padL = 56, padR = 16, padT = 16, padB = 28;
    const pts = s.history;
    const ys = pts.map((p) => p.cash).concat([s.goal]);
    const lo = Math.min(...ys), hi = Math.max(...ys);
    const span = Math.max(1, hi - lo);
    const x = (d) => padL + (d / Math.max(1, s.days)) * (W - padL - padR);
    const y = (c) => padT + (1 - (c - lo) / span) * (H - padT - padB);
    const decisionDays = new Set(s.replay.map((r) => r.day));
    const line = pts.map((p) => `${x(p.day).toFixed(1)},${y(p.cash).toFixed(1)}`).join(' ');
    const area = `${x(0).toFixed(1)},${y(lo).toFixed(1)} ${line} ${x(pts[pts.length - 1].day).toFixed(1)},${y(lo).toFixed(1)}`;
    const ticks = [lo, (lo + hi) / 2, hi];
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="資金曲線">
      ${ticks.map((t) => `<line x1="${padL}" x2="${W - padR}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}" stroke="var(--line)" stroke-width="1"/><text x="${padL - 6}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="var(--ink-2)">${fmt(t / 1000)}k</text>`).join('')}
      <line x1="${padL}" x2="${W - padR}" y1="${y(s.goal).toFixed(1)}" y2="${y(s.goal).toFixed(1)}" stroke="var(--good)" stroke-dasharray="4 4"/>
      <text x="${W - padR}" y="${(y(s.goal) - 4).toFixed(1)}" text-anchor="end" font-size="11" fill="var(--good)">目標</text>
      <polygon points="${area}" fill="var(--primary)" opacity=".12"/>
      <polyline points="${line}" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linejoin="round"/>
      ${pts.some((p) => p.hold) ? `<polyline points="${(() => { const mh = Math.max(1, ...pts.map((p) => p.hold || 0)); const yh = (h) => (H - padB) - (h / mh) * (H - padT - padB) * 0.45; return pts.map((p) => `${x(p.day).toFixed(1)},${yh(p.hold || 0).toFixed(1)}`).join(' '); })()}" fill="none" stroke="var(--gold)" stroke-width="2" stroke-dasharray="5 3"/><text x="${W - padR}" y="${H - padB - 6}" text-anchor="end" font-size="11" fill="var(--gold-ink)" style="paint-order:stroke" stroke="var(--surface)" stroke-width="3">虛線：持股市值</text>` : ''}
      ${pts.map((p) => `<circle cx="${x(p.day).toFixed(1)}" cy="${y(p.cash).toFixed(1)}" r="${decisionDays.has(p.day) ? 6 : 3.5}" fill="${decisionDays.has(p.day) ? 'var(--gold)' : 'var(--primary)'}" stroke="var(--surface)" stroke-width="1.5"/>`).join('')}
      ${pts.map((p) => `<text x="${x(p.day).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="var(--ink-2)">${p.day === 0 ? '開始' : '第' + p.day + '天'}</text>`).join('')}
    </svg>`;
  }

  // ---------- 圖鑑 ----------
  function glossaryScreen() {
    show('glossary', `
      <div class="topbar"><button class="back" id="back">‹ 回首頁</button><span class="muted">已收集 ${save.learned.length}/${termNames.length}</span></div>
      <div class="panel">
        <h2>📖 名詞圖鑑</h2>
        <p class="muted">玩到的名詞會自動收進來。每個都有白話說法、開店比喻和現實對照。</p>
        <div class="terms">${termNames.map((t) => { const k = save.learned.includes(t); return `<button class="term-card" ${k ? `data-term="${t}"` : 'disabled'}><div class="n">${k ? esc(t) : '？？？'}</div><div class="p">${k ? esc(D.glossary[t].plain) : '還沒遇到'}</div></button>`; }).join('')}</div>
      </div>`);
    $('#back').addEventListener('click', titleScreen);
    app.querySelectorAll('.term-card[data-term]').forEach((b) => b.addEventListener('click', () => showTerm(b.dataset.term)));
  }

  // ---------- 設定 ----------
  function settingsScreen() {
    show('settings', `
      <div class="topbar"><button class="back" id="back">‹ 回首頁</button></div>
      <div class="panel">
        <h2>⚙️ 設定</h2>
        <div class="field"><label>難度</label>
          <div class="diff-row">${Object.entries(E.DIFF).map(([k, v]) => `<button class="chip" data-diff="${k}" aria-pressed="${save.difficulty === k}">${v.label}</button>`).join('')}</div>
        </div>
        <div class="field"><label>存檔</label>
          <p class="muted">進度存在這個瀏覽器裡。換裝置不會帶著走（帳號同步是之後的功能）。</p>
          <button class="btn secondary" id="reset">清除所有進度</button>
          <div id="reset-confirm" hidden class="tip"><div class="icon">⚠️</div><div>確定要清掉關卡進度、圖鑑和教學紀錄嗎？<div class="btn-row" style="margin-top:8px"><button class="btn secondary" id="reset-no">取消</button><button class="btn" id="reset-yes" style="background:var(--roof)">確定清除</button></div></div></div>
        </div>
        <div class="field"><label>關於</label>
          <p class="muted">《淘氣大亨：阿嬤的小店》是給理財新手的經營模擬遊戲。所有商品、人物、公司都是虛構的，不推薦任何真實投資；遊戲裡學到的是觀念，真要投資前仍要自己多查資料。</p>
          <p class="muted">這個版本：四個篇章共 32 關。資料驅動的關卡與事件、固定種子的市場、延遲後果、決策回放與平行世界。</p>
        </div>
      </div>`);
    $('#back').addEventListener('click', titleScreen);
    app.querySelectorAll('[data-diff]').forEach((b) => b.addEventListener('click', () => { save.difficulty = b.dataset.diff; persist(); settingsScreen(); }));
    $('#reset').addEventListener('click', () => { $('#reset-confirm').hidden = false; });
    $('#reset-no').addEventListener('click', () => { $('#reset-confirm').hidden = true; });
    $('#reset-yes').addEventListener('click', () => { resetSave(); toast('已清除'); titleScreen(); });
  }

  // ---------- 啟動 ----------
  function boot() { titleScreen(); }
  if (window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(boot); else boot();
})();
