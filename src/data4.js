/* 篇章四　暗流篇（第 25–32 關）：詐騙與防身術。
 * 騙子的話術照真實的寫，玩家才認得出來；只避開教人行騙的操作細節。所有平台、人物皆為虛構。 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data3.js'));
  else factory(root.GameData);
})(typeof self !== 'undefined' ? self : this, function (D) {
  'use strict';

  // 假平台：fake 表示 App 畫面上的數字是假的；freezeFrom 之後出金被卡住；劇本在某一天讓價格歸零（平台消失）
  Object.assign(D.market, {
    steady: { name: '穩賺寶 App', icon: '📱', risk: 5, start: 100, drift: 0.02, vol: 0, buyFee: 0, fake: true, freezeFrom: 5,
      what: '群組老師帶單，App 顯示每天穩穩 +2%。', source: '說不出來。App 上的數字是他們打的', note: '前三天真的讓你領得出來，這是誘餌。' },
    goldex: { name: '環球黃金交易所', icon: '🪙', risk: 5, start: 100, drift: 0.03, vol: 0.01, buyFee: 0, fake: true, freezeFrom: 4,
      what: '畫面和真的券商 App 一模一樣，但不在任何監管名單上。', source: '沒有。你的錢進了別人的戶頭', note: '官方 App 商店找不到，要從連結安裝。' },
    lovecoin: { name: '幸福幣', icon: '💞', risk: 5, start: 100, drift: 0.025, vol: 0.005, buyFee: 0, fake: true, freezeFrom: 6,
      what: '網友小雨說她在這裡賺到房子頭期款。', source: '小雨，或者說「小雨」背後的那群人', note: '帳面一直漲，出金時會要你補繳保證金。' },
    flash: { name: '閃電幣', icon: '⚡', risk: 5, start: 100, drift: 0.05, vol: 0.02, buyFee: 0, fake: true, freezeFrom: 4,
      what: '「只開放 24 小時的限量額度」。', source: '後面進場的人', note: '每天 +5% 是從後面的人的錢拿來付給前面的人。' },
    starfund: { name: '星光財富基金', icon: '🌟', risk: 5, start: 100, drift: 0.02, vol: 0.005, buyFee: 0, fake: true, freezeFrom: 5,
      what: '廣告裡知名主持人說他靠這個財富自由。', source: '主持人根本沒說過那些話', note: '影片是合成的。' },
    safegold: { name: '保本高息專案', icon: '🏦', risk: 5, start: 100, drift: 0.015, vol: 0, buyFee: 0, fake: true, freezeFrom: 4,
      what: '「銀行內部專案」，保本又每天 1.5%。', source: '銀行沒有這種東西', note: '保本和高息不會同時出現。' },
  });

  Object.assign(D.glossary, {
    '詐騙': { plain: '用假的事情騙你把錢交出去。', shop: '群組老師、假 App、網友、假銀行來電，形式不同，結局一樣：錢進了別人的戶頭。', real: '台灣的反詐專線是 165。任何人叫你轉錢，先掛掉，自己打 165 或銀行官方電話問。' },
    '出金': { plain: '把投資平台裡的錢領回自己的銀行帳戶。', shop: '穩賺寶前三天出金很順，第五天開始「審核中」，然後要你繳稅才能領。', real: '假平台最常見的特徵：入金容易，出金要繳各種費用。合法平台出金不會要你先繳錢。' },
    '殺豬盤': { plain: '先跟你交朋友、談感情，養熟了再帶你投資假平台。', shop: '小雨每天跟你聊三小時，第三週才提投資。', real: '網路上認識、沒見過面、很快就聊到投資的人，不管多溫柔，都是這個劇本。' },
    '老鼠會': { plain: '靠拉人加入收入會費來賺錢，不是靠賣東西。', shop: '健康套組三萬，拉一個人回五千。你的錢是上線的收入，你的收入要靠下線。', real: '問一句：不拉人，只賣產品能賺嗎？答不出來就是老鼠會。' },
    '假冒公務機關': { plain: '假裝是銀行、警察、檢察官、監理站打電話給你。', shop: '「您的帳戶涉及洗錢，請把錢轉到安全帳戶配合調查。」', real: '銀行、警察不會用電話要你轉帳、操作 ATM、或交出密碼。掛掉，自己打官方電話。' },
    '冷靜期': { plain: '大錢的決定先放一晚，明天再做。', shop: '「現在不投明天就沒額度了」，就是要你沒時間想。', real: '真的機會不會因為你多想一天就消失。催你的，都是在賣東西或騙你。' },
    '165': { plain: '台灣的反詐騙諮詢專線，24 小時都可以打。', shop: '阿嬤接到奇怪電話，你陪她打 165，三分鐘確認是詐騙。', real: '不確定的時候就打。問了不會怎樣，不問可能會怎樣。' },
    '個資': { plain: '身分證字號、銀行帳號、密碼、驗證碼，這些是你的個人資料。', shop: '客服說要你的網銀密碼「幫你處理」，真的客服不會問這個。', real: '驗證碼只有你自己用。任何人要你念驗證碼，就是詐騙。' },
  });

  D.characters.teacher = { name: '群組老師', color: '#8A4F7D' };
  D.characters.xiaoyu = { name: '小雨', color: '#D96C8A' };
  D.characters.caller = { name: '來電', color: '#555' };
  Object.assign(D.titles, {
    scammed: { name: '繳了學費', desc: '被騙走一筆錢。真實世界這筆通常拿不回來。' },
    alert: { name: '火眼金睛', desc: '騙子來了好幾次，一次都沒上鉤。' },
  });

  const EV = [
    // 25 保證獲利群組
    {
      id: 'groupInvite', title: '投資群組邀請', who: 'teacher', terms: ['保證獲利', '詐騙'],
      known: '合法投資一定寫風險，不會寫「保證」。群組前幾天讓你小賺出金，是為了讓你放大錢進去。',
      text: '一個客人把你拉進「財富自由 VIP 群」。群裡的老師每天貼對帳單：「跟單的同學今天又 +2%！穩賺寶 App 下載連結在這，保證獲利，不賺退費。」\n群裡幾十個人在刷「老師太神了」「今天出金 5 萬到帳」。',
      options: [
        { label: '先投 20,000 試試，賺了再加', kind: 'judgement', minCash: 20000, effects: { invest: [{ id: 'steady', cash: 20000 }], stress: -2 },
          result: 'App 畫面立刻顯示 +2%。老師私訊你：「同學眼光好。」', verdict: '前幾天真的會讓你領得到錢，這是誘餌。等你放大錢進去，出金就會「審核中」。' },
        { label: '問老師：「保證獲利寫在哪份合約？公司登記在哪？」', kind: 'judgement', effects: { dodge: true, stress: 1 },
          result: '老師沒回。十分鐘後你被踢出群組。', verdict: '合法的投資不會寫保證，也不怕你查公司登記。一問就踢人，答案就出來了。' },
        { label: '退群', kind: 'judgement', effects: { dodge: true, stress: -1 },
          result: '你按了退出。發財打了個呵欠。', verdict: '最省事的防身術。' },
      ],
    },
    {
      id: 'withdrawFail', title: '出金審核中', who: 'teacher', terms: ['出金', '詐騙'], minor: (s) => !(s.market && s.market.holdings.steady),
      known: '合法平台出金不會要你先繳錢。要你繳稅、保證金、解凍費才能領，就是騙。',
      text: (s) => s.market && s.market.holdings.steady ? '你按了出金，畫面顯示「審核中」。客服：「同學，您的帳戶獲利超過門檻，依規定要先繳 15% 的所得稅到指定帳戶，才能解鎖出金喔。」' : '群裡有人哭訴出金出不來，客服要他先繳 15% 稅。老師說：「那是他操作錯誤。」',
      options: (s) => s.market && s.market.holdings.steady ? [
        { label: '繳稅解鎖（15%，約 ' + Math.round(s.market.holdings.steady.units * s.market.prices.steady * 0.15).toLocaleString() + ' 元）', kind: 'judgement', effects: (st) => { const v = Math.round(st.market.holdings.steady.units * st.market.prices.steady * 0.15); return { cash: -Math.min(v, st.cash), scamLoss: Math.min(v, st.cash), stress: 6 }; },
          result: '繳了。客服：「審核需要 3 到 5 個工作天。」然後群組解散了。', verdict: '繳了稅還是領不到，因為根本沒有錢在裡面。要你先繳錢才能領錢，是假平台的共同台詞。' },
        { label: '不繳，截圖報警、打 165', kind: 'judgement', effects: { dodge: true, stress: 4, flag: { reported: true }, schedule: [{ after: 2, icon: '🚔', text: '警方聯絡你：帳戶已被列為警示帳戶。已經匯出去的錢很難追回，但至少不會再被騙。' }] },
          result: '165 的人員告訴你：這個 App 已經有三十幾件報案。', verdict: '裡面的錢大概回不來了，但你把損失停在這裡。' },
        { label: '再投 10,000「補足門檻」', kind: 'judgement', minCash: 10000, effects: { invest: [{ id: 'steady', cash: 10000 }], stress: 8 },
          result: '客服：「感謝配合，請再等等。」', verdict: '這是典型的加碼陷阱：每多一次「再一點點就能領」，你就多賠一筆。' },
      ] : [
        { label: '幸好沒投', kind: 'judgement', effects: { dodge: true, stress: -2 }, result: '你默默把群組的截圖存起來，以後給阿嬤看。', verdict: '' },
      ],
    },
    // 26 假 App
    {
      id: 'fakeApp', title: '一模一樣的 App', who: 'customer', terms: ['詐騙', '個資'],
      known: '合法券商的 App 在官方商店找得到，公司在主管機關名單上。從連結安裝的，不算。',
      text: '一個西裝客人給你看手機：「環球黃金交易所，畫面跟大券商一樣，黃金一天漲 3%。官方商店還沒上架，用這個連結裝就好。」\n畫面真的很專業，連客服都有真人。',
      options: [
        { label: '先去主管機關網站查這家公司有沒有登記', kind: 'judgement', effects: { dodge: true, stress: 1 },
          result: '查了三分鐘：沒有這家公司。客人說「那是因為他們在海外」，然後就不再來買東西了。', verdict: '合法的業者查得到。查不到的，再漂亮的 App 都是畫出來的。' },
        { label: '裝起來入金 20,000', kind: 'judgement', minCash: 20000, effects: { invest: [{ id: 'goldex', cash: 20000 }], stress: -1 },
          result: '黃金真的漲了。你開始每小時看一次。', verdict: '畫面上的漲跌不是行情，是他們打的數字。' },
        { label: '裝起來看看，先不放錢', kind: 'judgement', effects: { stress: 2, flag: { installedFake: true }, schedule: [{ after: 1, cash: -3000, icon: '📱', text: '那個 App 偷偷讀了你的簡訊驗證碼，刷了 3,000 元的小額付款。' }] },
          result: '裝了。它要了一堆權限，你都按了允許。', verdict: '來路不明的 App 不只騙錢，還會拿走你的簡訊和驗證碼。' },
      ],
    },
    {
      id: 'appSupport', title: '客服要你加碼', who: 'caller', terms: ['出金', '個資'], minor: (s) => !(s.market && s.market.holdings.goldex),
      known: '真的客服不會要你的網銀密碼，也不會要你加碼才能出金。',
      text: (s) => s.market && s.market.holdings.goldex ? '你想出金，客服很親切：「您的帳戶等級不足，升級 VIP 才能出金，只要再入金 20,000。或者您給我網銀帳號密碼，我幫您處理。」' : '客人回來了，說那個 App 出金要升級 VIP。你聽著，沒說話。',
      options: (s) => s.market && s.market.holdings.goldex ? [
        { label: '再入金 20,000 升級', kind: 'judgement', minCash: 20000, effects: { invest: [{ id: 'goldex', cash: 20000 }], stress: 8 }, result: '升級了。出金還是審核中。', verdict: '出金要先入金，邏輯上就不對。' },
        { label: '給他網銀帳密「幫我處理」', kind: 'judgement', effects: (st) => ({ cash: -Math.min(40000, Math.floor(st.cash * 0.6)), scamLoss: Math.min(40000, Math.floor(st.cash * 0.6)), stress: 15, credit: -10 }), result: '半小時後，你的帳戶少了一大筆。', verdict: '帳號密碼給出去，不只平台裡的錢，連銀行裡的也一起走。' },
        { label: '不理，打 165 和銀行', kind: 'judgement', effects: { dodge: true, stress: 4, flag: { reported: true } }, result: '銀行幫你把帳戶加了警示，165 記下了平台名字。', verdict: '停損。' },
      ] : [
        { label: '跟客人說：先打 165 問', kind: 'judgement', effects: { dodge: true, pop: 2 }, result: '客人將信將疑地去打了。隔天他回來謝你。', verdict: '' },
      ],
    },
    // 27 殺豬盤
    {
      id: 'pigIntro', title: '網友小雨', who: 'xiaoyu', minor: true, terms: ['殺豬盤'],
      text: '交友軟體上認識的小雨每天跟你聊天，問你店裡的事、發財的照片，還記得你喜歡的茶。她說她在海外做設計。',
      options: [
        { label: '繼續聊，很開心', effects: { stress: -3, flag: { pigTalk: true } }, result: '你們聊到半夜。' },
        { label: '聊歸聊，先約見面', effects: { stress: 0, flag: { pigAsk: true } }, result: '她說最近在海外，等回國一定約。' },
      ],
    },
    {
      id: 'pigInvest', title: '小雨的投資平台', who: 'xiaoyu', terms: ['殺豬盤', '詐騙'],
      known: '網路認識、沒見過面、聊得很好之後開始談投資，這是殺豬盤的固定劇本。',
      text: '小雨：「跟你說個秘密，我叔叔在幸福幣平台做內部，我這個月賺了 40 萬，頭期款有了。我不想你那麼辛苦開店……要不要我教你？小額就好。」\n她傳了她的獲利截圖，還有一張她在海邊的照片。',
      options: [
        { label: '跟著投 30,000', kind: 'judgement', minCash: 30000, effects: { invest: [{ id: 'lovecoin', cash: 30000 }], stress: -2 }, result: '她幫你一步一步操作。帳面當天就 +2.5%。', verdict: '她不是叔叔的姪女，她是劇本的一部分。帳面的數字也是。' },
        { label: '問她平台名字，自己去查', kind: 'judgement', effects: { dodge: true, stress: 2 }, result: '查到的第一頁就是 165 的警示。你把截圖傳給她，她秒刪帳號。', verdict: '查一下，三分鐘。你省下的是三萬。' },
        { label: '「我們先見面再說」', kind: 'judgement', effects: { dodge: true, stress: 3 }, result: '她說公司不准，然後開始冷淡。三天後消失。', verdict: '永遠見不到面的人，永遠不要跟她談錢。' },
      ],
    },
    {
      id: 'pigPressure', title: '幸福幣要補繳保證金', who: 'xiaoyu', terms: ['出金'], minor: (s) => !(s.market && s.market.holdings.lovecoin),
      known: '出金要先繳錢，就是假平台。',
      text: (s) => s.market && s.market.holdings.lovecoin ? '你想把賺的先領一點出來。平台：「出金需繳 20% 保證金。」小雨：「我也繳過，繳了就好了，相信我。」她的語氣第一次有點急。' : '小雨突然問你：「你是不是有在投資？要不要我幫你看看？」',
      options: (s) => s.market && s.market.holdings.lovecoin ? [
        { label: '相信她，繳保證金', kind: 'judgement', effects: (st) => { const v = Math.round(st.market.holdings.lovecoin.units * st.market.prices.lovecoin * 0.2); return { cash: -Math.min(v, st.cash), scamLoss: Math.min(v, st.cash), stress: 8 }; }, result: '繳了。平台顯示「審核中」。小雨說她要去開會。', verdict: '保證金之後還會有手續費、解凍費、稅。每一個都是「最後一次」。' },
        { label: '不繳，打 165', kind: 'judgement', effects: { dodge: true, stress: 6, flag: { reported: true } }, result: '165 的人聽到「幸福幣」就嘆了口氣。', verdict: '停損。感情騙局最難的是承認被騙，你做到了。' },
      ] : [
        { label: '「不用了，謝謝」', kind: 'judgement', effects: { dodge: true }, result: '她隔天沒再出現。', verdict: '' },
      ],
    },
    // 28 借錢投資
    {
      id: 'borrowInvest', title: '限量額度，只到今天', who: 'teacher', terms: ['冷靜期', '槓桿'],
      known: '真的機會不會催你。叫你借錢投資的，一定不是為你好。',
      text: '老師在群裡喊：「閃電幣內部額度只開放 24 小時！每天 +5%！沒錢的同學去借，三天就還得起，這種機會一輩子一次！」\n群裡有人貼了貸款 App 的截圖：「借了 10 萬，衝了！」',
      options: [
        { label: '跟銀行借 60,000 全投', kind: 'judgement', effects: { borrow: 60000, loanName: '投資貸款', invest: [{ id: 'flash', cash: 60000 }], stress: 6 }, result: '錢進去了，帳面每天漲。但從明天起每天要還一筆。', verdict: '借來的錢投進假平台：平台消失時，債還在。' },
        { label: '只投閒錢 10,000', kind: 'judgement', minCash: 10000, effects: { invest: [{ id: 'flash', cash: 10000 }], stress: 2 }, result: '你投了一萬。', verdict: '輸光也不痛的錢。但「每天 +5%」這句話本身，就應該讓你一毛都不投。' },
        { label: '「我睡一覺明天再說」', kind: 'judgement', effects: { dodge: true, stress: -2 }, result: '隔天醒來，群組已經解散了。', verdict: '冷靜期。催你的，都在騙你。' },
      ],
    },
    // 29 老鼠會
    {
      id: 'mlmIntro', title: '創業說明會', who: 'neighbor', terms: ['老鼠會'],
      known: '靠拉人賺錢而不是靠賣產品，就是老鼠會。',
      text: '玲姨穿得很正式：「我加入了一個健康事業！只要買 20,000 的健康套組就能當經銷商，拉一個人進來就回 4,000，拉五個就回本，之後躺著賺！」\n說明會上台的人開跑車來的。',
      options: [
        { label: '加入，買套組 20,000', kind: 'judgement', minCash: 20000, effects: { cash: -20000, scamLoss: 20000, stress: 3, flag: { mlm: true } }, result: '六箱「能量水」堆在店裡。', verdict: '你的兩萬是玲姨和她上線的收入。你要回本，得找五個人也付兩萬。' },
        { label: '問：「不拉人，只賣產品能賺嗎？」', kind: 'judgement', effects: { dodge: true, pop: -1 }, result: '台上的人說「當然可以」但講不出產品賣給誰。玲姨有點不高興。', verdict: '答不出來，就是老鼠會。' },
        { label: '婉拒，請她喝茶', kind: 'judgement', effects: { dodge: true, stress: 1 }, result: '玲姨說你沒有企圖心。', verdict: '' },
      ],
    },
    {
      id: 'mlmRecruit', title: '拉人回本', who: 'neighbor', terms: ['老鼠會'],
      known: '拉人進來，賠的是人情和別人的錢。',
      text: (s) => s.flags.mlm ? '上線催你：「這個月要拉兩個人才能保持經銷商資格。」你看著店裡的熟客。' : '玲姨來跟你借 15,000：「我要再買一組才能升級，升級就能拉更多人。」',
      options: (s) => s.flags.mlm ? [
        { label: '拉兩個熟客加入', kind: 'judgement', effects: { cash: 8000, pop: -12, stress: 6, schedule: [{ after: 2, pop: -8, icon: '😡', text: '兩個熟客發現回不了本，在街上說你的店騙人。' }] }, result: '兩個熟客各付了兩萬。你拿到八千。', verdict: '你拿回八千，賠掉了兩個熟客和整條街的口碑。' },
        { label: '不拉，認賠退出', kind: 'judgement', effects: { dodge: true, stress: 4, flag: { mlm: false } }, result: '六箱能量水送給了街口的狗。', verdict: '兩萬當學費。至少沒有把別人拖下水。' },
      ] : [
        { label: '借她 15,000', kind: 'luck', effects: { cash: -15000, scamLoss: 15000, stress: 3 }, result: '她說升級後一定還你。', verdict: '這筆錢進了她上線的口袋。' },
        { label: '不借，陪她算這個月到底賺了多少', kind: 'judgement', effects: { dodge: true, pop: 1, stress: 2 }, result: '算完她沉默很久，然後哭了。', verdict: '' },
      ],
    },
    // 30 冒充銀行
    {
      id: 'bankCall', title: '銀行打來的電話', who: 'caller', terms: ['假冒公務機關', '165'],
      known: '銀行和警察不會用電話要你轉帳、操作 ATM 或交出密碼。',
      text: '「您好，這裡是銀行防詐中心。您的帳戶涉及一宗洗錢案，檢察官已經發出監管命令。為了保護您的資產，請在一小時內把存款轉到我們提供的安全帳戶，案件結束會全數歸還。這通電話受偵查不公開限制，請勿告訴任何人。」\n對方報得出你的名字和身分證後四碼。',
      options: [
        { label: '照做，把錢轉到安全帳戶', kind: 'judgement', effects: (s) => { const v = Math.floor((s.cash + (s.bank ? s.bank.demand : 0)) * 0.7 / 1000) * 1000; return { cash: -v, scamLoss: v, stress: 15 }; }, result: '轉了。對方說「配合良好」。然後電話再也打不通。', verdict: '沒有「安全帳戶」這種東西。檢察官不會打電話叫你轉帳。' },
        { label: '掛掉，自己打銀行官方電話確認', kind: 'judgement', effects: { dodge: true, stress: 3 }, result: '銀行說他們沒有打過這通電話。你順手打了 165。', verdict: '掛掉、自己打回去，三十秒就拆穿。「不能告訴任何人」就是要你沒人可問。' },
        { label: '跟他吵：「你們憑什麼？」', kind: 'judgement', effects: { stress: 8, dodge: true }, result: '對方換了一個更兇的「檢察官」接電話。你吵了二十分鐘，最後掛掉。', verdict: '沒被騙，但浪費了二十分鐘和一堆壓力。直接掛比較好。' },
      ],
    },
    {
      id: 'atmCall', title: '網購設定錯誤', who: 'caller', terms: ['假冒公務機關', '個資'],
      known: 'ATM 只能領錢和轉帳，不能「解除設定」。',
      text: '「您好，這裡是某某購物客服。您上次的訂單因為工讀生操作錯誤，被設定成每月扣款 12 期。請您到 ATM 前，我們教您解除。」',
      options: [
        { label: '去 ATM 照指示操作', kind: 'judgement', effects: (s) => ({ cash: -Math.min(29000, Math.max(0, s.cash)), scamLoss: Math.min(29000, Math.max(0, s.cash)), stress: 12 }), result: '「解除」的過程中你按了幾個數字。那是轉帳。', verdict: 'ATM 沒有解除分期的功能。叫你去 ATM 的，都是要你轉帳。' },
        { label: '掛掉，自己去購物網站看訂單', kind: 'judgement', effects: { dodge: true, stress: 1 }, result: '訂單正常。你把來電號碼封鎖了。', verdict: '' },
      ],
    },
    // 31 假名人
    {
      id: 'celebAd', title: '名人也在用', who: 'customer', terms: ['詐騙', '保證獲利'],
      known: '名人代言可以合成。看官方帳號有沒有說，而不是看廣告。',
      text: '手機跳出廣告：知名主持人對著鏡頭說「我靠星光財富基金，一天賺一萬，你也可以」，下面幾千個留言都在謝老師。',
      options: [
        { label: '投 30,000', kind: 'judgement', minCash: 30000, effects: { invest: [{ id: 'starfund', cash: 30000 }], stress: -1 }, result: '帳面每天漲，你覺得主持人說得對。', verdict: '影片是合成的。主持人本人在官方帳號發了澄清，你沒看到。' },
        { label: '去主持人的官方帳號看他有沒有說過', kind: 'judgement', effects: { dodge: true }, result: '官方帳號置頂：「本人從未代言任何投資，請勿受騙。」', verdict: '三十秒的查證，省三萬。' },
        { label: '不理，滑過去', kind: 'judgement', effects: { dodge: true, stress: -1 }, result: '你滑掉了廣告。', verdict: '' },
      ],
    },
    {
      id: 'deepfakeCall', title: '表哥的聲音', who: 'caller', terms: ['個資', '165'],
      known: '聲音可以合成。急著要錢的電話，先掛掉打回本人確認。',
      text: '表哥打來，聲音一模一樣，很急：「我出車禍了，對方要先付 20,000 和解金，不然要告我。你先匯到這個帳戶，我手機快沒電了！」',
      options: [
        { label: '馬上匯 20,000', kind: 'judgement', minCash: 20000, effects: { cash: -20000, scamLoss: 20000, stress: 10 }, result: '匯了。半小時後表哥本人打來問你為什麼傳訊息問他有沒有出事。', verdict: '聲音是合成的，急是設計的。' },
        { label: '掛掉，打表哥本人的電話', kind: 'judgement', effects: { dodge: true, stress: 2 }, result: '表哥接了：「我在家看電視啊？」', verdict: '回撥本人，十秒拆穿。' },
      ],
    },
    // 32 關主戰：阿嬤差點被騙
    {
      id: 'grandmaCall', title: '阿嬤的電話', who: 'grandma', terms: ['假冒公務機關', '165'],
      known: '這一關的騙子找的是阿嬤。你要做的是陪她確認，不是罵她。',
      text: '阿嬤臉色發白：「剛剛有人打來說你表弟在外面欠錢被人押著，要我準備 30 萬，下午有人來拿。還叫我不要跟任何人說……」',
      options: [
        { label: '陪阿嬤打給表弟和 165', kind: 'judgement', effects: { dodge: true, stress: 3, pop: 2 }, result: '表弟在學校上課。165 說這叫「假綁架」。阿嬤坐下來喝了口茶。', verdict: '陪她確認，不是替她決定。她下次就會自己打。' },
        { label: '「阿嬤你怎麼這麼笨！」', kind: 'judgement', effects: { stress: 6, pop: -2, flag: { scoldedGrandma: true } }, result: '阿嬤不說話了。下午她還是偷偷去了銀行，幸好行員攔住她。', verdict: '罵她，她下次就不告訴你。被騙的人最怕的是被笑。' },
        { label: '幫阿嬤去銀行領 30 萬', kind: 'judgement', effects: (s) => { const v = Math.min(300000, Math.floor((s.cash + (s.bank ? s.bank.demand : 0)) * 0.8 / 1000) * 1000); return { cash: -v, scamLoss: v, stress: 15 }; }, result: '下午一個年輕人來拿走了錢。表弟晚上回家吃飯。', verdict: '「不要跟任何人說」就是要你沒人可問。先打一通電話。' },
      ],
    },
    {
      id: 'grandmaGold', title: '阿嬤的保本高息', who: 'grandma', terms: ['保證獲利', '冷靜期'],
      known: '保本和高息不會同時出現。',
      text: '阿嬤拿著一張單子：「銀行的小王說有個內部專案，保本、每天 1.5%，只給老客戶。我想把定存解掉放進去，你覺得呢？」\n你看了一眼：公司名稱不是銀行，帳戶是個人戶。',
      options: [
        { label: '陪阿嬤去銀行櫃台問', kind: 'judgement', effects: { dodge: true, stress: 2, pop: 1 }, result: '櫃台行員說銀行沒有這個專案，小王上個月已經離職。阿嬤把單子撕了。', verdict: '去櫃台、打官方電話，永遠比相信一張單子可靠。' },
        { label: '幫阿嬤解定存投進去 80,000', kind: 'judgement', minCash: 80000, effects: { invest: [{ id: 'safegold', cash: 80000 }], stress: 2 }, result: '阿嬤很高興，說以後利息給你買零食。', verdict: '保本高息不存在。帳戶是個人戶，更不用說。' },
        { label: '叫阿嬤不要碰，但沒解釋', kind: 'judgement', effects: { stress: 4, flag: { grandmaUnsure: true }, schedule: [{ after: 2, icon: '👵', text: '阿嬤還是偷偷匯了 20,000 去「試試看」。', cash: -20000 }] }, result: '阿嬤點點頭，但你看得出來她沒放棄。', verdict: '不解釋的「不要」沒有用。陪她去問，她才會真的放心。' },
      ],
    },
    {
      id: 'grandmaReveal', title: '騙子又打來了', who: 'grandma', terms: ['165'], minor: (s) => !s.flags.scoldedGrandma,
      known: '',
      text: (s) => s.flags.scoldedGrandma ? '電話又響了。阿嬤看了你一眼，沒接，也沒說話。' : '電話又響了。阿嬤看了來電顯示，自己按了掛斷，然後撥了 165。',
      options: (s) => s.flags.scoldedGrandma ? [
        { label: '跟阿嬤道歉，一起接', kind: 'judgement', effects: { dodge: true, stress: -4, pop: 2 }, result: '你們一起聽完整套劇本，然後一起笑出來。', verdict: '被騙不丟臉，不說才危險。你把阿嬤拉回來了。' },
        { label: '讓她自己處理', kind: 'judgement', effects: { stress: 2 }, result: '阿嬤沒接。但你不知道她晚上有沒有回撥。', verdict: '' },
      ] : [
        { label: '給阿嬤一個讚', kind: 'judgement', effects: { dodge: true, stress: -5, pop: 3 }, result: '阿嬤：「我早就知道了啦，考你的。」發財翻了個身。', verdict: '這一關真正的目標：讓阿嬤自己會打 165。' },
      ],
    },
  ];
  EV.forEach((e) => D.events.push(e));

  const BANK = { demandRate: 0.002, fixedRate: 0.006, fixedDays: 3 };
  const POOL = ['regular', 'catbook', 'students', 'rainplan', 'relative', 'rentUp', 'marketNews'];
  const gone = (id, day, text) => ({ [day]: [{ id, mult: 0, news: text, icon: '🕳️' }] });
  const LV = [
    {
      id: 25, chapter: 4, title: '保證獲利群組', theme: '群組帶單、假 App',
      product: 'onigiri', days: 7, startCash: 120000, startPop: 60, baseCustomers: 180, rent: 1200, goalProfit: 7000, bank: BANK,
      market: { products: ['bond', 'fund', 'steady'], script: gone('steady', 7, '穩賺寶 App 打不開了，群組解散，老師的帳號消失。') },
      climax: { day: 2, event: 'groupInvite' }, fixedEvents: { 5: 'withdrawFail' }, pool: POOL,
      intro: [
        { who: 'grandma', text: '暗流篇開始了。前面三篇教你怎麼賺，這一篇教你怎麼不被騙走。' },
        { who: 'grandma', text: '騙子不會寫「我是騙子」。他們會說「保證」「穩賺」「老師帶單」。聽到這幾個字，手先放回口袋。' },
        { who: 'cat', text: '（發財把手機推到地上。）' },
      ],
      verdict: { pass: '群組解散的時候，你的錢不在裡面。', great: '一問「合約在哪」就被踢出群，你省了三分鐘和幾萬塊。', fail: '出金要先繳錢，就是假平台。帳面上的獲利從來不是你的。' },
      lesson: '「保證獲利」本身就是警訊。合法投資一定寫風險，出金不需要先繳錢。',
    },
    {
      id: 26, chapter: 4, title: '一模一樣的 App', theme: '假投資平台',
      product: 'tea', days: 7, startCash: 120000, startPop: 60, baseCustomers: 190, rent: 1200, goalProfit: 7000, bank: BANK,
      market: { products: ['bond', 'fund', 'goldex'], script: gone('goldex', 6, '環球黃金交易所的網站變成空白頁。') },
      climax: { day: 2, event: 'fakeApp' }, fixedEvents: { 4: 'appSupport' }, pool: POOL,
      intro: [
        { who: 'grandma', text: '現在的假 App 做得比真的還漂亮。看外表看不出來，要看它有沒有登記。' },
        { who: 'grandma', text: '主管機關的名單是公開的，查一下三分鐘。查不到的，不管畫面多專業，都不要放錢。' },
      ],
      verdict: { pass: '你查了名單，或是沒放錢進去。', great: '一查就知道。你已經有了最重要的習慣：先查再投。', fail: '畫面不是證據，登記才是。而且不要把帳號密碼給任何「客服」。' },
      lesson: '投資平台先查有沒有登記。從連結安裝、不在官方商店的 App，不要裝；任何客服要你的密碼或驗證碼，就是詐騙。',
    },
    {
      id: 27, chapter: 4, title: '網友小雨', theme: '殺豬盤',
      product: 'braised', days: 7, startCash: 120000, startPop: 60, baseCustomers: 150, rent: 1200, goalProfit: 7000, bank: BANK,
      market: { products: ['bond', 'fund', 'lovecoin'], script: gone('lovecoin', 7, '幸福幣平台關閉。小雨的帳號不存在了。') },
      climax: { day: 3, event: 'pigInvest' }, fixedEvents: { 1: 'pigIntro', 5: 'pigPressure' }, pool: POOL,
      intro: [
        { who: 'grandma', text: '這週有個很溫柔的人會每天跟你聊天。' },
        { who: 'grandma', text: '我不反對你交朋友。但網路上認識、沒見過面的人，一提到投資，就是劇本。' },
      ],
      verdict: { pass: '她提投資的時候，你沒有跟。', great: '你去查了平台，或是堅持先見面。兩個都是對的。', fail: '感情是真的，平台是假的。沒見過面的人，不要跟她談錢。' },
      lesson: '殺豬盤的順序：先聊感情，再帶投資，最後要你補繳。網路認識、沒見過面、提投資，三個都中就是它。',
    },
    {
      id: 28, chapter: 4, title: '借錢也要上', theme: '借錢投資、冷靜期',
      product: 'soymilk', days: 7, startCash: 80000, startPop: 60, baseCustomers: 220, rent: 1000, goalProfit: 5000, bank: BANK,
      loan: { max: 60000, rate: 0.012, days: 6 },
      market: { products: ['bond', 'flash'], script: gone('flash', 5, '閃電幣平台「系統維護」，然後再也沒有開回來。') },
      climax: { day: 2, event: 'borrowInvest' }, pool: POOL,
      intro: [
        { who: 'grandma', text: '這一關的騙子最厲害的一招：催。「只到今天」「額度有限」「借錢也要上」。' },
        { who: 'grandma', text: '記住一個規則：大錢的決定，睡一覺再做。真的機會不會因為你多想一天就不見。' },
      ],
      verdict: { pass: '你沒有借錢去投一個說不出是什麼的東西。', great: '睡一覺，群組就解散了。冷靜期是最便宜的防身術。', fail: '借來的錢投進假平台，平台消失，債還在。這是最痛的一種。' },
      lesson: '催你的，都在騙你。永遠不要借錢投資，尤其是說「每天 +5%」的東西。',
    },
    {
      id: 29, chapter: 4, title: '創業說明會', theme: '老鼠會',
      product: 'bento', days: 7, startCash: 120000, startPop: 65, baseCustomers: 180, rent: 1200, capacity: 130, staff: { name: '小美', wage: 1200, capacity: 120 }, goalProfit: 30000, bank: BANK,
      climax: { day: 2, event: 'mlmIntro' }, fixedEvents: { 4: 'mlmRecruit' }, pool: POOL,
      intro: [
        { who: 'grandma', text: '玲姨最近變得很有精神，說她在「創業」。' },
        { who: 'grandma', text: '這一關考一個問題：這個事業的錢，是從賣東西來的，還是從拉人來的？' },
      ],
      verdict: { pass: '你沒有把三萬交出去，也沒有把熟客拉下水。', great: '一句「不拉人能賺嗎」，答不出來就是答案。', fail: '老鼠會的錢是後面的人付給前面的人。你拉的人，賠的是他們的錢和你的口碑。' },
      lesson: '靠拉人收入會費賺錢的，就是老鼠會。問：不拉人，只賣產品能賺嗎？',
    },
    {
      id: 30, chapter: 4, title: '銀行打來的電話', theme: '假冒銀行與公務機關',
      product: 'icecream', days: 7, startCash: 120000, startPop: 60, baseCustomers: 160, rent: 1200, goalProfit: 7000, bank: BANK,
      climax: { day: 2, event: 'bankCall' }, fixedEvents: { 4: 'atmCall' }, pool: POOL,
      intro: [
        { who: 'grandma', text: '這週會有人打電話來，說自己是銀行、是警察、是客服。' },
        { who: 'grandma', text: '記住：真的銀行和警察，不會在電話裡叫你轉帳、操作 ATM、或是交出密碼。掛掉，自己打官方電話。' },
      ],
      verdict: { pass: '你掛掉了。', great: '掛掉、自己打回去，兩通電話都是三十秒拆穿。', fail: '沒有「安全帳戶」，ATM 不能「解除設定」。下次先掛掉。' },
      lesson: '電話裡要你轉帳、去 ATM、給密碼的，一律掛掉，自己打官方電話或 165。',
    },
    {
      id: 31, chapter: 4, title: '名人也在用', theme: '假代言、假聲音',
      product: 'bento', days: 7, startCash: 120000, startPop: 60, baseCustomers: 200, rent: 1300, capacity: 130, staff: { name: '小美', wage: 1200, capacity: 120 }, goalProfit: 15000, bank: BANK,
      market: { products: ['bond', 'fund', 'starfund'], script: gone('starfund', 7, '星光財富基金的網站變成賣減肥茶的頁面。') },
      climax: { day: 2, event: 'celebAd' }, fixedEvents: { 4: 'deepfakeCall' }, pool: POOL,
      intro: [
        { who: 'grandma', text: '現在的影片可以把任何人的臉和聲音換上去。名人說的、親戚的聲音，都不一定是真的。' },
        { who: 'grandma', text: '方法一樣：回到本人去確認。看官方帳號，回撥本人的電話。' },
      ],
      verdict: { pass: '你去確認了本人。', great: '兩次都回到本人確認。三十秒，省七萬。', fail: '廣告和來電都可以合成。下次先去官方帳號看、打回本人電話。' },
      lesson: '臉和聲音都能合成。名人代言看官方帳號，親友急著要錢先回撥本人。',
    },
    {
      id: 32, chapter: 4, title: '阿嬤差點被騙', theme: '關主戰：保護家人',
      product: 'onigiri', days: 7, startCash: 150000, startPop: 65, baseCustomers: 200, rent: 1300, goalProfit: 9000, bank: BANK,
      market: { products: ['bond', 'fund', 'safegold'], script: gone('safegold', 7, '「保本高息專案」的帳戶被警方凍結，小王被通緝。') },
      climax: { day: 2, event: 'grandmaCall' }, fixedEvents: { 4: 'grandmaGold', 6: 'grandmaReveal' }, pool: POOL,
      intro: [
        { who: 'grandma', text: '最後一關。這次騙子找的不是你，是我。' },
        { who: 'player', text: '阿嬤你會被騙？' },
        { who: 'grandma', text: '誰都會。差別是旁邊有沒有人陪你打一通電話。' },
      ],
      verdict: { pass: '阿嬤的錢還在，而且她學會自己打 165 了。', great: '你陪她確認，沒有罵她。這比任何理財知識都重要。', fail: '被騙的人最怕被笑。陪她打電話，不要替她決定，也不要罵她。' },
      lesson: '保護家人的方法不是罵，是陪他們確認：打給本人、打官方電話、打 165。',
    },
  ];
  LV.forEach((l) => D.levels.push(l));

  D.chapters[3].next = '接下來是篇章四「暗流篇」：詐騙與防身術。';
  D.chapters[4] = {
    title: '篇章四　暗流篇', done: '你認得出保證獲利、假 App、殺豬盤、老鼠會、假銀行來電，也知道怎麼陪家人確認。', next: '四個篇章全部完成。多人模式與每週挑戰，下個版本見。',
    realCard: {
      title: '現實對照卡：防詐五問',
      intro: '任何人要你拿錢出來之前，先問這五個問題。有一個答不出來，就不要動：',
      items: [
        { k: '誰在催我', v: '「只到今天」「不能告訴別人」「現在不做就來不及」。真的機會不會催，催的都是在賣或在騙。' },
        { k: '查得到嗎', v: '公司有沒有登記、App 在不在官方商店、名人官方帳號有沒有說過。三分鐘查證，省幾萬。' },
        { k: '出金要先繳錢嗎', v: '要你先繳稅、保證金、解凍費、升級費才能領錢，就是假平台。' },
        { k: '見過本人嗎', v: '網路認識沒見過面就談投資的，是劇本。親友急著要錢的，回撥本人。' },
        { k: '誰可以問', v: '台灣反詐專線 165，24 小時。銀行官方電話在卡片背面。不確定就打。' },
      ],
      note: '這張卡的手法都是真實世界常見的類型，但遊戲裡的平台、人物、公司全部虛構。被騙了不丟臉，立刻打 165 和銀行，把損失停在那一刻。',
    },
  };
  return D;
});
