/* 淘氣大亨：阿嬤的小店 — 內容資料（關卡、商品、事件卡、名詞圖鑑、台詞）
 * 新增一關或一張事件卡，只要在這裡加資料，不用改引擎。
 * 所有商品、人物、公司都是虛構的。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GameData = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const products = {
    onigiri: { name: '阿嬤飯糰', unit: '顆', cost: 18, refPrice: 35, spoil: 1.0, icon: '🍙',
      note: '當天做當天賣，賣不完隔天就不能賣了。' },
    braised: { name: '滷味拼盤', unit: '份', cost: 28, refPrice: 55, spoil: 1.0, icon: '🍢',
      note: '滷一鍋香氣飄出去，人氣高的時候客人會排隊。' },
    tea: { name: '冬瓜茶', unit: '杯', cost: 9, refPrice: 25, spoil: 1.0, icon: '🧋',
      note: '早上煮一鍋，當天賣完。天氣越熱賣越好。' },
    icecream: { name: '手工冰淇淋', unit: '杯', cost: 15, refPrice: 45, spoil: 0.15, icon: '🍨',
      note: '放冰箱可以保存，每晚只壞一點點。熱天大賣，雨天沒人買。' },
    bento: { name: '阿嬤便當', unit: '個', cost: 40, refPrice: 85, spoil: 1.0, icon: '🍱',
      note: '一個人一天最多只做得出 130 個，再多就要請人幫忙。' },
    banana: { name: '進口香蕉', unit: '串', cost: 12, refPrice: 28, spoil: 0.5, bulk: { qty: 240, discount: 0.2 }, icon: '🍌',
      note: '可以放一兩天，但每晚大約會有一半變黑。一次進 240 串以上有八折。' },
  };

  // ---------- 名詞圖鑑 ----------
  const glossary = {
    '成本': { plain: '做出或買進一樣東西要花的錢。', shop: '一顆飯糰的米、海苔、人工加起來 18 元，這就是成本。', real: '現實裡任何商品、任何投資都有成本，買之前先問「這個要花我多少？」' },
    '售價': { plain: '你把東西賣給客人的價錢。', shop: '飯糰賣 35 元，35 就是售價。', real: '售價減成本才是你真正賺的，不要只看賣了多少錢。' },
    '利潤': { plain: '賣出去收到的錢，扣掉所有花掉的錢，剩下的才是利潤。', shop: '賣了 100 顆飯糰收 3,500，扣掉成本 1,800 和房租 800，利潤 900。', real: '公司財報的「淨利」就是這個概念。營收很大不代表有賺。' },
    '固定支出': { plain: '不管有沒有生意都要付的錢。', shop: '房租每天 800 元，下雨沒客人也照付。', real: '現實裡的房租、保險費、貸款月付都是固定支出，收入會晃，它不會。' },
    '損耗': { plain: '買進來卻賣不掉、壞掉、丟掉的東西，錢等於白花。', shop: '進 150 顆飯糰只賣 100 顆，剩下 50 顆隔天不能賣，900 元成本就沒了。', real: '投資也有損耗：手續費、過期的保單、放到變薄的現金。' },
    '人氣': { plain: '有多少人想來你店裡。人氣高，客人就多。', shop: '熟客幫你介紹朋友，人氣就上升；賣太貴或常常缺貨，人氣就掉。', real: '品牌價值、商譽，都是人氣的正式說法。' },
    '定價': { plain: '決定要賣多少錢。', shop: '賣貴一點每顆賺比較多，但客人會變少；賣便宜客人多，但每顆賺得少。', real: '定價沒有標準答案，重點是「每顆賺多少 × 賣幾顆」加起來最多。' },
    '口碑': { plain: '客人跟別人說你店好不好。', shop: '部落客寫一篇文，三天後才會有人看到來吃，這就是口碑的延遲。', real: '很多決定的效果不會立刻出現，耐心等結果也是一種能力。' },
    '庫存': { plain: '還沒賣出去、放在店裡的貨。', shop: '剩下的香蕉就是庫存，它會佔地方，還會慢慢變黑。', real: '手上的股票、未使用的點數也是一種庫存，放著不等於沒成本。' },
    '現金流': { plain: '錢進來和出去的節奏。手上有錢才付得出帳。', shop: '就算這個月整體有賺，房租到期那天手上沒現金，一樣很麻煩。', real: '很多公司是「帳上有賺、現金不夠」倒閉的。' },
    '保證獲利': { plain: '有人跟你說「一定賺」，這句話本身就是警訊。', shop: '隔壁阿姨說喝了神奇水一定升職，你會信嗎？投資也是一樣。', real: '合法的投資商品都會寫風險，沒有例外。' },
    '活存': { plain: '隨時可以領出來的存款，利息比較少。', shop: '把錢放銀行活存，明天要進貨隨時領，比放抽屜安全，還有一點點利息。', real: '現實的活存一年利率通常不到 1%。遊戲裡的利息刻意放大很多倍，讓你看得到差別。' },
    '定存': { plain: '約定一段時間不領的存款，利息比活存高；提前解約就拿不到利息。', shop: '定存三天，利息多三倍，但這三天冰箱壞了你會拿不出錢修。', real: '真實定存通常以月或年為單位。看說明書時要看：利率、期間、提前解約怎麼算。' },
    '利息': { plain: '把錢借給別人（或存在銀行）得到的報酬；跟別人借錢也要付利息。', shop: '活存 50,000 元，一天多 50 元，就是利息。', real: '利息是「錢會生錢」的起點，也是借錢真正的成本。' },
    '緊急預備金': { plain: '留著不動、專門應付意外的一筆錢。', shop: '颱風停業、冰箱壞掉，手上有現金的人才撐得過去。', real: '一般建議留三到六個月的生活費當預備金，放在隨時能領的地方。' },
    '預算': { plain: '事先決定一段時間可以花多少錢。', shop: '這週進貨最多花 12,000，超過就要有理由。', real: '記帳的目的不是省錢，是知道錢去了哪裡。' },
    '薪資': { plain: '請人工作要付的錢，是一種固定支出。', shop: '小美一天 1,200 元，她能多做 120 個便當。請她划不划算，看多賣的錢有沒有超過 1,200。', real: '公司最大的支出常常就是人事費。' },
    '產能': { plain: '一天最多做得出多少東西。', shop: '一個人一天最多 130 個便當，客人再多也賣不了更多，除非請人或買機器。', real: '擴張要花錢，但不擴張就卡在天花板。這是每個老闆都要算的。' },
    '壓力': { plain: '店長的心情。壓力太高會手忙腳亂，做決定的時間變短。', shop: '連續虧錢、貨壞掉，壓力就上升；順順賣完，壓力就下降。', real: '真實的理財也是，壓力大的時候最容易做出衝動決定。' },
  };

  // ---------- 事件卡 ----------
  // effects 可以是物件或 function(state, roll) 回傳物件
  // kind: 'judgement'（判斷）或 'luck'（運氣）
  const events = [
    {
      id: 'cans', title: '三箱快過期的罐頭', who: 'grandma', terms: ['成本', '損耗'],
      known: '罐頭成本早就付過了，三天後過期，現在沒賣就是零。',
      text: '阿嬤指著倉庫角落：「這三箱罐頭是我以前進的，後天就到期了。你看著辦。」\n一箱 60 罐，當初一罐 20 元進的。',
      options: [
        { label: '打五折特賣，今天清掉', kind: 'judgement',
          effects: { cash: 1800, pop: 2, stress: -2 },
          result: '貼出「阿嬤清倉 10 元」的紙板，路過的人搶著買，三箱全空。收回 1,800 元。',
          verdict: '成本早就花掉了，能收回多少算多少。這叫「沉沒成本不要留戀」。' },
        { label: '照原價 30 元慢慢賣', kind: 'judgement',
          effects: function (s, roll) {
            const sold = roll < 0.5 ? 40 : 70;
            return { cash: sold * 30, stress: 4, schedule: [{ after: 2, cash: 0, icon: '🗑️', text: '剩下的罐頭過期了，整箱丟掉。' }] };
          },
          result: function (s, roll) { const sold = roll < 0.5 ? 40 : 70; return '放在架上賣，兩天只賣出 ' + sold + ' 罐，收回 ' + (sold * 30).toLocaleString() + ' 元，其他的放到過期。'; },
          verdict: '想多賺一點沒錯，但時間不站在你這邊。快過期的東西，速度比價格重要。' },
        { label: '送給街坊鄰居', kind: 'judgement',
          effects: { pop: 8, stress: -4, schedule: [{ after: 2, pop: 3, icon: '💬', text: '鄰居說你人很好，帶朋友來捧場。', forecast: '聽說鄰居明天要帶朋友來。' }] },
          result: '阿嬤皺眉又笑了。鄰居們很開心，人氣上升，但一毛錢也沒收回。',
          verdict: '錢沒收回來，但人氣是真的。做生意不只算今天，這也是一種投資。' },
      ],
    },
    {
      id: 'blogger', title: '美食部落客突然來訪', who: 'customer', terms: ['口碑', '人氣'],
      known: '部落客的文章要幾天後才有人看到。',
      text: '一個拿著大相機的女生走進來：「我是『巷口吃什麼』的阿花，可以拍一下你的招牌嗎？」\n她暗示，如果今天的餐點「有誠意」，文章會寫得特別好。',
      options: [
        { label: '請她吃一份，順便多聊聊店的故事', kind: 'judgement',
          effects: { cash: -55, schedule: [{ after: 2, pop: 15, demandMult: 1.4, icon: '📱', text: '阿花的文章發了！「阿嬤的小店」被說是巷口最溫暖的店，今天很多人來。', forecast: '聽說阿花的文章明天會發。' }] },
          result: '阿花吃得很開心，說會好好寫。今天先少賺一份的錢。',
          verdict: '花一份的成本，換兩天後的一波客人。好的口碑會延遲出現，這次你等到了。' },
        { label: '照常收錢，不給特別待遇', kind: 'judgement',
          effects: { schedule: [{ after: 2, pop: 4, icon: '📱', text: '阿花的文章發了，寫得普通，來了幾個客人。' }] },
          result: '阿花付錢，拍了兩張照片就走了。',
          verdict: '不討好任何人也是一種風格，只是這次少了一波機會。' },
        { label: '塞紅包 2,000 元請她寫好一點', kind: 'luck',
          effects: function (s, roll) {
            if (roll < 0.5) return { cash: -2000, schedule: [{ after: 2, pop: 10, demandMult: 1.3, icon: '📱', text: '阿花的文章發了，誇得很用力，來了一波客人。' }] };
            return { cash: -2000, stress: 8, schedule: [{ after: 2, pop: -8, icon: '📱', text: '阿花寫了一篇「老闆想用紅包買好評」，人氣掉了。' }] };
          },
          result: function (s, roll) { return roll < 0.5 ? '阿花收下紅包，笑得很客氣。' : '阿花把紅包推回來，臉色有點怪。'; },
          verdict: '結果好壞是運氣，但「花錢買評價」這個判斷本身就有風險，而且 2,000 元是飯糰一天的利潤。' },
      ],
    },
    {
      id: 'banana', title: '一整箱香蕉變黑', who: 'cat', terms: ['庫存', '損耗'],
      known: '香蕉每晚會黑掉大約一半，放越久越不值錢。',
      text: '掀開今天送來的貨，有一箱香蕉已經黑了一半。發財在旁邊舔爪子，一臉事不關己。\n黑掉的那箱大約 40 串，看起來還能吃，就是賣相差。',
      options: [
        { label: '做成「香蕉牛奶」特價賣', kind: 'judgement',
          effects: { cash: 600, pop: 3, stress: -3, stockLose: 40 },
          result: '阿嬤翻出果汁機。黑香蕉其實最甜，一杯 30 元，賣出去收回 600 元。',
          verdict: '壞掉的貨不一定要丟，換個方式還能收回一些。這叫減少損耗。' },
        { label: '整箱丟掉，眼不見為淨', kind: 'judgement',
          effects: { stress: 5, stockLose: 40 },
          result: '40 串香蕉進了垃圾桶，成本 480 元跟著進去。',
          verdict: '丟掉最輕鬆，但也最貴。下次進貨時，記得香蕉放不久。' },
        { label: '混在好的裡面照常賣', kind: 'luck',
          effects: function (s, roll) {
            if (roll < 0.4) return { pop: -1 };
            return { pop: -10, stress: 8, schedule: [{ after: 1, demandMult: 0.8, icon: '😠', text: '昨天買到黑香蕉的客人在社群上抱怨，今天客人變少。' }] };
          },
          result: function (s, roll) { return roll < 0.4 ? '今天沒人發現……' : '一個阿姨當場挑出黑香蕉，大聲問「這也敢賣？」'; },
          verdict: '就算這次沒被發現，也是運氣。用信任去賭一箱香蕉，划不來。' },
      ],
    },
    {
      id: 'drawer', title: '阿嬤的抽屜', who: 'grandma', terms: ['活存', '定存', '利息'],
      known: '抽屜裡的錢不會生利息，而且會被偷。活存隨時能領；定存三天利息多，但提前解約沒利息。',
      text: '阿嬤拉開收銀機下面的抽屜，裡面居然有一疊舊鈔票：「這是我以前忘記的，三萬塊，給你。」\n她補了一句：「抽屜只能放零錢。錢要放好。」',
      options: [
        { label: '放進活存，要用隨時領', kind: 'judgement', effects: { bankDemand: 30000, stress: -3 },
          result: '你把三萬塊存進活存。每天會有一點利息，要用的時候隨時領得出來。', verdict: '安全又靈活。利息少一點沒關係，這筆錢什麼時候要用你還不知道。' },
        { label: '放三天定存，利息多', kind: 'judgement', effects: { bankFixed: 30000, stress: -1 },
          result: '你把三萬塊鎖進三天定存。這三天動不了，到期連本帶利回來。', verdict: '利息多是真的，但這三天如果突然要用錢，就只能解約拿本金。' },
        { label: '留在抽屜，方便', kind: 'judgement',
          effects: { cash: 30000, schedule: [{ after: 2, forecast: '阿嬤唸了一句：「後門的鎖壞了，記得修。」' }] },
          result: '三萬塊進了抽屜。阿嬤看了你一眼，沒說話。', verdict: '抽屜的錢不會生利息，還會被偷。阿嬤說「錢要放好」就是這個意思。' },
      ],
    },
    {
      id: 'thief', title: '後門沒鎖', who: 'cat', terms: ['活存'],
      known: '前兩天阿嬤就說後門的鎖壞了。放在銀行的錢偷不走。',
      text: '早上發現後門半開，抽屜被翻過。發財蹲在門口，一臉「我有叫」的表情。\n你數了數手上的現金……',
      options: (s) => {
        const lost = Math.min(8000, Math.round(s.cash * 0.1));
        return [
          { label: '報警，然後把鎖修好（花 800）', kind: 'judgement', effects: { cash: -lost - 800, stress: 6, flag: { lockFixed: true } },
            result: '抽屜少了 ' + lost.toLocaleString() + ' 元。鎖修好了，警察說會巡。', verdict: lost > 3000 ? '抽屜放太多現金了。放在銀行的錢，小偷拿不走。' : '手上現金不多，損失有限。這就是錢放對地方的差別。' },
          { label: '算了，自認倒楣', kind: 'judgement', effects: { cash: -lost, stress: 10, schedule: [{ after: 2, cash: -Math.max(2500, Math.round(lost / 2)), stress: 6, icon: '🚪', text: '後門又被翻了一次，少了 ' + Math.max(2500, Math.round(lost / 2)).toLocaleString() + ' 元。鎖還是沒修。' }] },
            result: '抽屜少了 ' + lost.toLocaleString() + ' 元。你嘆了口氣。', verdict: '鎖沒修，過兩天又被翻。該花的小錢不花，會變大錢。' },
        ];
      },
    },
    {
      id: 'typhoonWarn', title: '颱風警報', who: 'grandma', terms: ['緊急預備金', '固定支出'],
      known: '明天確定停業，沒有客人，但房租照付。今天進的冰淇淋可以放冰箱。',
      text: '電視上氣象主播很興奮：「明天颱風登陸，全市停班停課！」\n阿嬤：「明天沒生意，房租照樣要付。你手上留了多少錢？」',
      options: [
        { label: '今天照常，明天乖乖休息', kind: 'judgement', effects: { stress: 2 }, result: '你把冰箱塞滿，準備放一天假。', verdict: '停業一天不是災難，前提是手上留得住房租和後天的進貨錢。' },
        { label: '颱風前搶賣，今天多做五成', kind: 'judgement', effects: { demandMult: 1.3, stress: 4 }, result: '颱風前大家囤貨，今天客人特別多。', verdict: '颱風前的搶購是真的，但記得明天沒收入、後天還要進貨。' },
        { label: '明天偷偷開門賺風災財', kind: 'luck',
          effects: (s, roll) => roll < 0.5 ? { schedule: [{ after: 1, demandMult: 999, cash: 1500, icon: '🌀', text: '颱風天偷開門，附近居民真的來買，收了 1,500 元。' }] }
            : { schedule: [{ after: 1, cash: -2500, stress: 8, icon: '🌀', text: '颱風天開門，招牌被吹壞了，修理花 2,500 元。' }] },
          result: '你心裡打著小算盤。', verdict: '冒險有時賺有時賠，這次是運氣。問題是，這 1,500 值得拿招牌去賭嗎？' },
      ],
    },
    {
      id: 'fridge', title: '冰箱壞了', who: 'player', terms: ['緊急預備金', '現金流'],
      known: '修冰箱要馬上付 7,000 元現金。定存裡的錢拿不出來，除非解約。',
      text: '冰箱發出奇怪的聲音然後安靜了。師傅說：「壓縮機壞了，換一個 7,000，現金。」\n沒有冰箱，冰淇淋每天會化掉一半，客人也不想買。',
      options: [
        { label: '付 7,000 馬上修好', kind: 'judgement', minCash: 7000, effects: { cash: -7000, stress: 3 }, result: '師傅半小時修好。你鬆了一口氣。', verdict: '手上有現金的人，意外只是一筆開銷。這就是緊急預備金的意思。' },
        { label: '先不修，用冰桶撐', kind: 'judgement', effects: { stress: 10, flag: { noFridge: true }, schedule: [1, 2, 3, 4, 5, 6].map((d) => ({ after: d, demandMult: 0.4, icon: d <= 2 ? '🍨' : undefined, text: d === 1 ? '冰桶撐不住，一半的冰淇淋化掉，客人也少了。' : d === 2 ? '還是沒冰箱，生意只剩四成。' : undefined })) },
          result: '你買了三袋冰塊。師傅搖搖頭走了。', verdict: '付不出 7,000 的代價，是接下來每天少賺六成。手上現金不夠（或鎖在定存裡）的時候就會這樣。' },
        { label: '跟小馬借 7,000（三天後還 8,500）', kind: 'judgement', effects: { stress: 6, credit: -10, schedule: [{ after: 3, cash: -8500, icon: '💸', text: '小馬來收錢：連利息 8,500 元。', forecast: '小馬說明天要來收錢。' }] },
          result: '小馬爽快掏錢：「兄弟，三天後 8,500 喔。」冰箱修好了。', verdict: '借錢解決了今天，但 1,500 元利息是好幾天的利潤，信用也掉了。預備金就是為了不用走到這一步。' },
      ],
    },
    {
      id: 'catbook2', title: '貓咬壞帳本', who: 'cat', terms: ['預算', '利潤'],
      known: '帳本每天打烊都看得到。「今天的利潤」那一行加起來就是答案。',
      text: '發財把帳本咬掉一角，正好是這幾天的總計。阿嬤叉著腰：「不看帳本，你說，到目前為止總共賺了多少？」',
      options: (s) => {
        const sum = s.dayRecords.reduce((a, r) => a + r.profit, 0);
        const rng = Math.abs(Math.sin(s.day * 7 + sum)) ; // 用狀態決定錯誤選項的位置，重播時一致
        const wrong1 = Math.round((sum + 2600) / 100) * 100, wrong2 = Math.round((sum - 1900) / 100) * 100;
        const items = [
          { v: sum, ok: true }, { v: wrong1 }, { v: wrong2 },
        ];
        const order = rng < 0.33 ? [0, 1, 2] : rng < 0.66 ? [1, 0, 2] : [1, 2, 0];
        return order.map((i) => items[i]).map((it) => ({
          label: '大概 ' + it.v.toLocaleString() + ' 元', kind: 'judgement',
          effects: it.ok ? { pop: 2, stress: -6 } : { stress: 5 },
          result: it.ok ? '阿嬤點點頭：「有在看帳，不錯。」發財打了個呵欠。' : '阿嬤翻出備份：「是 ' + sum.toLocaleString() + ' 元。你都沒在看帳齁？」',
          verdict: it.ok ? '會看帳本的人，才知道自己賺不賺。這題你答對了。' : '帳本不是記給阿嬤看的，是記給你自己看的。每天打烊花十秒看一眼。',
        }));
      },
    },
    {
      id: 'signboard', title: '很帥的新招牌', who: 'xiaoma', terms: ['預算'],
      known: '新招牌 8,000 元，人氣會慢慢加。這一關剩下的天數有限。',
      text: '小馬帶來一個做招牌的朋友：「LED 的，會發光，8,000 而已！人氣一定爆。」',
      options: [
        { label: '買！人氣最重要', kind: 'judgement', effects: { cash: -8000, pop: 3, schedule: [{ after: 1, pop: 3, icon: '✨', text: '新招牌亮起來了，路過的人多看兩眼。' }, { after: 3, pop: 3 }] },
          result: '當天晚上招牌亮了，發財被嚇到。', verdict: '人氣是真的加了，但 8,000 元要賣很多天才賺得回來。「想要」和「需要」要分開。' },
        { label: '先記在願望清單，這關賺到再說', kind: 'judgement', effects: { stress: -1 }, result: '你在帳本最後一頁寫下「招牌 8,000」。小馬說你沒夢想。', verdict: '把想要的東西寫下來、等預算夠了再買，這就是預算。' },
      ],
    },
    {
      id: 'staffAbsent', title: '小美臨時請假', who: 'customer', terms: ['薪資', '產能'],
      known: '沒有小美，今天最多只做得出 130 個；小馬來幫忙 1,500 元，能多做 80 個。',
      text: '早上七點小美傳訊息：「老闆對不起，我發燒了，今天沒辦法去。」\n今天看起來客人會很多。',
      options: [
        { label: '自己撐，能做多少算多少', kind: 'judgement', effects: { absent: true, stress: 12 }, result: '你一個人從早忙到晚，手都在抖。', verdict: '省了工資，但產能卡住、壓力爆表，客人買不到也掉人氣。' },
        { label: '請小馬來幫忙（1,500 元）', kind: 'judgement', effects: { absent: true, cash: -1500, capacityAdd: 80, stress: 4 }, result: '小馬邊包便當邊講他的創業夢，但手腳還算快。', verdict: '多花 1,500 換 80 個便當的產能，划不划算要看今天客人多不多。' },
        { label: '提早打烊，少做一半', kind: 'judgement', effects: { absent: true, demandMult: 0.6, stress: -2 }, result: '你貼了「今日提早打烊」。有些客人撲空。', verdict: '最輕鬆的選項，代價是少賺一天和一點人氣。' },
      ],
    },
    {
      id: 'inspection', title: '阿嬤突擊檢查', who: 'grandma', terms: ['固定支出', '損耗', '緊急預備金'],
      known: '這是篇章一學過的東西。',
      text: '阿嬤突然出現在店門口，手裡拿著一張紙：「考你一題。下面哪一個，是不管有沒有客人都要付的錢？」',
      options: [
        { label: '進貨的錢', kind: 'judgement', effects: { stress: 4 }, result: '阿嬤：「沒客人你就不會進貨啊。」', verdict: '進貨是跟著生意走的變動支出，不是固定支出。' },
        { label: '房租和小美的薪水', kind: 'judgement', effects: { pop: 3, stress: -6 }, result: '阿嬤：「對。所以手上要留得住這些錢。」她從口袋掏出一顆糖給你。', verdict: '固定支出不管生意好壞都要付，這就是為什麼要留預備金。' },
        { label: '丟掉的香蕉', kind: 'judgement', effects: { stress: 4 }, result: '阿嬤：「那是損耗，是你進太多。」', verdict: '損耗是進貨決定造成的，能靠少進一點避免；固定支出避不掉。' },
      ],
    },
    {
      id: 'relative', title: '親戚來借錢', who: 'neighbor', minor: true,
      text: '遠房表哥突然出現：「借我 5,000，下個月還。」你上次見到他是三年前。',
      options: [
        { label: '借他 5,000', effects: { cash: -5000, pop: 1, stress: 2 }, result: '表哥感動地走了。阿嬤說：「借出去的錢，當作送的。」' },
        { label: '「我手上也緊，不好意思」', effects: { stress: 1 }, result: '表哥聳聳肩，去找下一個親戚。' },
      ],
    },
    {
      id: 'bulkTea', title: '大熱天的團購', who: 'customer', minor: true,
      text: '隔壁工地的工頭來問：「明天我們二十個人要訂冬瓜茶，有優惠嗎？」',
      options: [
        { label: '算他九折，明天多做', effects: { schedule: [{ after: 1, demandMult: 1.25, icon: '👷', text: '工地團購來了，一次拿走一大袋。', forecast: '明天工地要來拿團購。' }] }, result: '工頭說好，明天見。' },
        { label: '不打折，原價', effects: { schedule: [{ after: 1, demandMult: 1.1, icon: '👷', text: '工地來了幾個人，沒團購那麼多。' }] }, result: '工頭想了想：「那我們看情況。」' },
      ],
    },
    // ---- 共用事件 ----
    {
      id: 'regular', title: '熟客阿伯來聊天', who: 'customer', minor: true,
      text: '住隔壁的陳阿伯一早就來，買了一顆，接著講他年輕時的故事講了二十分鐘。',
      options: [
        { label: '陪他聊，順便問他喜歡吃什麼', effects: { pop: 3, stress: -2 }, result: '阿伯很開心，說明天帶孫子來。' },
        { label: '笑笑應付，趕快去顧店', effects: { pop: 0, stress: 1 }, result: '阿伯看了看你，默默走了。' },
      ],
    },
    {
      id: 'magicwater', title: '隔壁阿姨的神奇水', who: 'neighbor', terms: ['保證獲利'],
      known: '「保證」兩個字，就是最大的疑點。',
      text: '隔壁美容院的玲姨拎著一箱藍色瓶子進來：「這個喝了一定升職發財，我自己喝一個月了！你進一箱在店裡賣，保證賺！進貨價 3,000。」',
      options: [
        { label: '婉拒：「阿姨我先賣飯糰就好」', kind: 'judgement', effects: { stress: 1 }, result: '玲姨撇撇嘴：「你會後悔喔。」然後去找下一家。',
          verdict: '聽到「保證」就先停一下，這是最便宜的防詐。' },
        { label: '進一箱試試看', kind: 'judgement',
          effects: { cash: -3000, schedule: [{ after: 2, cash: 400, icon: '🧴', text: '神奇水三天只賣出 4 瓶，收回 400 元，其他的放在角落積灰塵。' }] },
          result: '一箱神奇水佔了半個櫃子。',
          verdict: '3,000 元換 400 元。「保證賺」的東西，通常只有賣給你的人在賺。' },
        { label: '再問問看：「哪裡有證明？」', kind: 'judgement', effects: { pop: 1 },
          result: '玲姨支支吾吾：「就……網路上都有啊。」然後說她趕時間。',
          verdict: '多問一句，對方講不出細節，答案就出來了。這招未來會一直用到。' },
      ],
    },
    {
      id: 'xiaoma', title: '小馬的進貨捷徑', who: 'xiaoma', terms: ['損耗'],
      known: '小馬的消息有時是真的，有時是坑。便宜一定有原因。',
      text: '小馬騎車衝進來：「我朋友倉庫要清貨，材料算你六折，但要今天付 1,500 現金，明天送到。這是最後一次機會！」',
      options: [
        { label: '付 1,500 搶便宜', kind: 'luck',
          effects: function (s, roll) {
            if (roll < 0.55) return { cash: -1500, schedule: [{ after: 1, flag: 'costMul', flagValue: 0.6, icon: '📦', text: '小馬的貨到了，品質還行！接下來三天進貨成本打六折。', forecast: '小馬說貨明天到。' }, { after: 4, flag: 'costMul', flagValue: 1 }] };
            return { cash: -1500, stress: 6, schedule: [{ after: 1, icon: '📦', text: '小馬的貨到了……一半是受潮的。只能用一部分。', flag: 'costMul', flagValue: 0.9, forecast: '小馬說貨明天到。' }, { after: 4, flag: 'costMul', flagValue: 1 }] };
          },
          result: '小馬收了錢，比了個讚就飆走了。', verdict: '結果好壞看運氣，但「今天就要付現金」的壓力本身就是警訊。' },
        { label: '問清楚貨從哪來，再說', kind: 'judgement', effects: { stress: 0 },
          result: '小馬講不太清楚，說「總之很便宜」。你說先不用。', verdict: '講不出來源的便宜貨，先不要。這次判斷對了。' },
      ],
    },
    {
      id: 'students', title: '學生團體預約', who: 'customer', minor: true,
      text: '附近高中的老師打電話來：「明天校外教學會經過，大概有 40 個學生會來買。」',
      options: [
        { label: '好的，明天多準備一點', effects: { schedule: [{ after: 1, demandMult: 1.3, icon: '🎒', text: '學生們來了！店門口擠滿人。', forecast: '明天有 40 個學生要來。' }] }, result: '你在帳本上記了一筆：明天多做。' },
        { label: '收到，但先不改計畫', effects: { schedule: [{ after: 1, demandMult: 1.3, icon: '🎒', text: '學生們來了！店門口擠滿人。' }] }, result: '你想說到時候再看。' },
      ],
    },
    {
      id: 'catbook', title: '貓咪賴在帳本上', who: 'cat', minor: true,
      text: '發財整隻攤在帳本上睡覺，你要記帳。',
      options: [
        { label: '讓牠睡，晚點再記', effects: { stress: -5 }, result: '發財翻了個身。你決定先去擦桌子，心情莫名變好。' },
        { label: '把牠抱開', effects: { stress: 2, pop: 1 }, result: '發財瞪你一眼，跳到門口的椅子上，路過的客人停下來拍照。' },
      ],
    },
    {
      id: 'rainplan', title: '氣象說明天大雨', who: 'grandma', minor: true,
      text: '阿嬤看著電視：「明天颱風外圍環流，大雨。」',
      options: [
        { label: '明天少做一點', effects: { schedule: [{ after: 1, forecast: '阿嬤說明天大雨，客人會少。', demandMult: 0.75 }] }, result: '你在帳本上畫了一朵雲。' },
        { label: '沒差啦，照常', effects: { schedule: [{ after: 1, demandMult: 0.75 }] }, result: '阿嬤哼了一聲。' },
      ],
    },
    {
      id: 'quiet', title: '平靜的一天', who: 'cat', minor: true,
      text: '今天沒什麼特別的事。發財在門口曬太陽。',
      options: [{ label: '也好', effects: { stress: -2 }, result: '偶爾平靜也不錯。' }],
    },
  ];

  // ---------- 關卡 ----------
  const levels = [
    {
      id: 1, chapter: 1, title: '開張大吉', theme: '成本、售價、利潤',
      product: 'onigiri', days: 5, startCash: 120000, startPop: 45, baseCustomers: 150, rent: 800,
      goalProfit: 5000,
      climax: { day: 2, event: 'cans' },
      pool: ['regular', 'catbook', 'students', 'magicwater', 'rainplan'],
      intro: [
        { who: 'grandma', text: '鑰匙給你。店裡剩三箱罐頭、一隻貓，還有我這張嘴。' },
        { who: 'grandma', text: '飯糰一顆成本 18 元，我都賣 35。你要賣多少、做幾顆，自己決定。' },
        { who: 'grandma', text: '記住一句話：賣不完的，就是虧掉的。五天後我來看帳。' },
        { who: 'player', text: '應該……沒問題吧？' },
      ],
      tutorial: true,
      verdict: {
        pass: '不錯嘛。你學會了一件事：收進來的錢不是你的，扣掉成本和房租，剩下的才是。',
        great: '哇，比我以前賣得還好。你知道「做幾顆」比「賣多貴」重要，這很厲害。',
        fail: '沒關係，第一次開店都這樣。回頭看看：是做太多丟掉了，還是賣太貴沒人買？',
      },
      lesson: '利潤 = 售價 × 賣出數量 − 成本 × 進貨數量 − 固定支出。進太多會丟，進太少會少賺。',
    },
    {
      id: 2, chapter: 1, title: '熟客與口碑', theme: '人氣與定價',
      product: 'braised', days: 6, startCash: 120000, startPop: 40, baseCustomers: 120, rent: 900,
      goalProfit: 7000,
      climax: { day: 2, event: 'blogger' },
      pool: ['regular', 'catbook', 'students', 'magicwater', 'xiaoma', 'rainplan'],
      intro: [
        { who: 'grandma', text: '這週換賣滷味。一份成本 28，我以前賣 55。' },
        { who: 'grandma', text: '滷味這種東西，靠的是回頭客。賣太貴客人會記得，常常缺貨客人也會記得。' },
        { who: 'grandma', text: '看好「人氣」那個數字。它掉下去很快，爬上來很慢。' },
      ],
      verdict: {
        pass: '人氣養起來了。你有沒有發現，有些決定要過幾天才看得到結果？',
        great: '客人排到巷口！你把價格、人氣、時間三件事一起想，這就是做生意。',
        fail: '人氣掉了，對吧？回頭看看是哪一天開始掉的，那天發生了什麼事。',
      },
      lesson: '人氣是慢慢累積的。定價太高、常缺貨都會掉人氣，而口碑的效果會延遲幾天才出現。',
    },
    {
      id: 3, chapter: 1, title: '進貨的學問', theme: '庫存與損耗',
      product: 'banana', days: 6, startCash: 120000, startPop: 50, baseCustomers: 150, rent: 800,
      goalProfit: 6000,
      climax: { day: 2, event: 'banana' },
      pool: ['regular', 'catbook', 'students', 'xiaoma', 'magicwater', 'rainplan'],
      intro: [
        { who: 'grandma', text: '這次賣香蕉。一串成本 12，賣 28。跟飯糰不一樣，香蕉可以放。' },
        { who: 'grandma', text: '但是每天晚上大概有一半會黑掉。一次進 240 串以上有八折，很誘人吧？' },
        { who: 'player', text: '八折耶，那當然要……等等，黑掉的也是我的錢。' },
        { who: 'grandma', text: '你開始會想了。' },
      ],
      verdict: {
        pass: '你沒被八折騙走。會算「便宜多少」和「壞掉多少」哪個大，就是會做生意了。',
        great: '庫存控制得漂亮。你知道嗎，很多大老闆就是倒在倉庫裡一堆賣不掉的貨。',
        fail: '是不是進太多了？便宜買進來，壞掉的還是錢。下次試試少量多次。',
      },
      lesson: '進貨便宜不等於划算，要把壞掉的損耗一起算進去。放得久的東西也不是免費放。',
    },
    {
      id: 4, chapter: 1, title: '第一桶金', theme: '活存與定存',
      product: 'tea', days: 6, startCash: 120000, startPop: 50, baseCustomers: 170, rent: 900,
      goalProfit: 5000, extraStart: 30000,
      bank: { demandRate: 0.002, fixedRate: 0.006, fixedDays: 3 },
      climax: { day: 2, event: 'drawer' },
      fixedEvents: { 3: 'thief' },
      pool: ['regular', 'catbook', 'students', 'magicwater', 'rainplan', 'bulkTea', 'relative'],
      intro: [
        { who: 'grandma', text: '賣了三週，你手上開始有錢了。錢放在抽屜，不會生小錢，還會被偷。' },
        { who: 'grandma', text: '從今天起，每天打烊可以把錢存進銀行。活存隨時領得出來；定存三天利息多，但中間不能動。' },
        { who: 'grandma', text: '記得手上要留明天進貨的錢。銀行的利息是我叫人放大給你看的，真實世界沒這麼多。' },
        { who: 'player', text: '所以……錢要放好，但也不能全鎖住？' },
      ],
      verdict: {
        pass: '錢放對地方了。利息雖然小，但它是「錢會生錢」的第一步。',
        great: '抽屜只剩零錢，該存的存、該留的留。這就是第一桶金的樣子。',
        fail: '錢是不是放錯地方了？被偷的、鎖住領不出來的，都算。',
      },
      lesson: '手上留夠用的現金，其他放活存；確定一段時間不會用到的錢才放定存。抽屜的錢沒利息還會丟。',
    },
    {
      id: 5, chapter: 1, title: '淡旺季', theme: '現金流、緊急預備金',
      product: 'icecream', days: 7, startCash: 120000, startPop: 50, baseCustomers: 140, rent: 1000,
      goalProfit: 6500,
      bank: { demandRate: 0.002, fixedRate: 0.006, fixedDays: 3 },
      weather: { 1: 'hot', 2: 'hot', 3: 'hot', 4: 'typhoon', 5: 'rain', 6: 'sunny', 7: 'hot' },
      climax: { day: 3, event: 'typhoonWarn' },
      fixedEvents: { 2: 'fridge' },
      pool: ['regular', 'catbook', 'magicwater', 'xiaoma', 'relative', 'students'],
      intro: [
        { who: 'grandma', text: '夏天賣冰，前幾天會熱到爆。但是你看新聞，週四有颱風。' },
        { who: 'grandma', text: '颱風天沒客人，房租照付。而且意外從來不挑日子。' },
        { who: 'grandma', text: '這關考一件事：手上留多少錢才夠？不要為了多一點利息，把錢全鎖進定存。' },
      ],
      verdict: {
        pass: '颱風過了，店還在，冰箱也修好了。你留的錢剛好夠，這就是預備金。',
        great: '旺季賺、淡季撐、意外扛得住。阿嬤年輕時就是這樣活下來的。',
        fail: '是不是錢全鎖住了，意外來的時候拿不出來？或是颱風前囤太多？',
      },
      lesson: '收入會晃，固定支出不會。留一筆隨時領得出來的緊急預備金，意外才不會變災難。',
    },
    {
      id: 6, chapter: 1, title: '記帳小英雄', theme: '預算與收支',
      product: 'braised', days: 6, startCash: 120000, startPop: 50, baseCustomers: 130, rent: 900,
      goalProfit: 7500,
      bank: { demandRate: 0.002, fixedRate: 0.006, fixedDays: 3 },
      climax: { day: 4, event: 'catbook2' },
      fixedEvents: { 2: 'signboard' },
      pool: ['regular', 'catbook', 'magicwater', 'xiaoma', 'relative', 'students', 'rainplan'],
      intro: [
        { who: 'grandma', text: '這週考你會不會看帳。每天打烊的帳本，花十秒看一眼。' },
        { who: 'grandma', text: '會有人來推銷你「想要」但不「需要」的東西。先問自己：這關的預算放得下嗎？' },
        { who: 'cat', text: '（發財盯著帳本的一角，舔了舔嘴。）' },
      ],
      verdict: {
        pass: '你有在看帳本。知道錢去了哪裡的人，不會莫名其妙變窮。',
        great: '每一塊錢都說得出去向，還守住了預算。記帳小英雄就是你。',
        fail: '這關不是運氣差，是花掉的比想的多。回頭翻翻帳本，錢去哪了？',
      },
      lesson: '記帳不是為了省，是為了知道錢去哪了。「想要」先寫進清單，預算夠了再買。',
    },
    {
      id: 7, chapter: 1, title: '夥伴來了', theme: '員工與薪資',
      product: 'bento', days: 6, startCash: 120000, startPop: 60, baseCustomers: 210, rent: 1000,
      capacity: 130, staff: { name: '小美', wage: 1200, capacity: 120 },
      goalProfit: 24000,
      bank: { demandRate: 0.002, fixedRate: 0.006, fixedDays: 3 },
      climax: { day: 3, event: 'staffAbsent' },
      pool: ['regular', 'catbook', 'magicwater', 'xiaoma', 'relative', 'students', 'rainplan'],
      intro: [
        { who: 'grandma', text: '生意變好了，客人比你做得出來的便當還多。一個人一天最多 130 個。' },
        { who: 'grandma', text: '隔壁的小美想來打工，一天 1,200，可以多做 120 個。請不請，每天早上你決定。' },
        { who: 'player', text: '多賣的錢比 1,200 多就划算……應該吧？' },
        { who: 'grandma', text: '對，但客人不多的日子呢？薪水還是要付。' },
      ],
      verdict: {
        pass: '你知道什麼時候該請人、什麼時候自己撐。薪資是固定支出，但也是產能。',
        great: '小美做得開心，你也賺得多。會用人的老闆，店才長得大。',
        fail: '是不是客人少的日子也請了人？或是客人多的日子沒請，白白讓人買不到？',
      },
      lesson: '請人是用固定的薪資換產能。多賣的利潤超過薪資才划算，預期客人少的日子就不要請。',
    },
    {
      id: 8, chapter: 1, title: '首年盤點', theme: '小結與關主事件',
      product: 'bento', days: 8, startCash: 120000, startPop: 55, baseCustomers: 200, rent: 1100,
      capacity: 130, staff: { name: '小美', wage: 1200, capacity: 120 },
      goalProfit: 26000, extraStart: 30000,
      bank: { demandRate: 0.002, fixedRate: 0.006, fixedDays: 3 },
      weather: { 5: 'rain' },
      climax: { day: 6, event: 'inspection' },
      fixedEvents: { 2: 'drawer', 3: 'thief', 5: 'fridge' },
      pool: ['regular', 'catbook', 'magicwater', 'xiaoma', 'relative', 'students', 'signboard'],
      intro: [
        { who: 'grandma', text: '一年了。這八天把你學過的全部混在一起：進貨、存錢、留預備金、請人。' },
        { who: 'grandma', text: '我會突擊檢查。不要緊張……好啦，緊張一點也沒關係。' },
        { who: 'cat', text: '（發財跳上桌子，坐在帳本上。）' },
      ],
      verdict: {
        pass: '第一年過了。你現在看帳本的眼神，跟一年前不一樣了。',
        great: '我把店交給你，沒交錯。下一條街的人已經在問這家店是誰開的。',
        fail: '一年學的東西很多，混在一起就亂了。沒關係，再盤一次，這次慢慢來。',
      },
      lesson: '篇章一的總複習：算利潤、養人氣、控庫存、錢放對地方、留預備金、看帳本、用人。',
    },
  ];

  const chapters = {
    1: {
      title: '篇章一　小店篇', done: '你看懂收支了，也知道為什麼要留一筆預備金。', next: '接下來是篇章二「街區篇」：通膨、複利、貸款、保險。',
      realCard: {
        title: '現實對照卡：銀行存款',
        intro: '遊戲裡的活存和定存，現實裡銀行也有。真的去看一份存款說明時，這幾項先找出來：',
        items: [
          { k: '利率', v: '一年給多少利息。遊戲裡刻意放大很多倍，現實通常是每年 1% 上下。' },
          { k: '期間', v: '定存要放多久：一個月、三個月、一年都有。' },
          { k: '提前解約', v: '中途要領怎麼算：通常利息打折或不給，本金不會少。' },
          { k: '存款保險', v: '銀行倒了，每家銀行的存款在一定額度內有保障。看清楚額度。' },
          { k: '警訊', v: '任何「保證比銀行高很多」又「隨時能領」的東西，先停下來問清楚。' },
        ],
        note: '這張卡不推薦任何銀行或商品。真的要存錢前，自己比較幾家。',
      },
    },
  };

  const nightLines = {
    good: '今天的飯都賣完了。發財在收銀機旁邊打呼。',
    ok: '普普通通的一天。阿嬤說：「平平的就是福。」',
    loss: '今天虧了一點。發財看了看空空的錢筒，又去睡了。',
    spoil: '垃圾桶裡的味道提醒你：進太多了。',
    stockout: '下午三點就賣光了，後面來的客人站在門口看了看就走。',
    broke: '錢筒空了。發財的表情變了。',
  };

  const titles = {
    broke: { name: '貓都嚇醒', desc: '資金見底，發財第一次睜大眼睛。' },
    fail: { name: '再接再厲', desc: '差一點。阿嬤說她第一年也沒賺。' },
    waste: { name: '垃圾桶大戶', desc: '丟掉的比賣掉的還多。' },
    stockout: { name: '太早打烊', desc: '客人來了，東西沒了。' },
    stressed: { name: '手忙腳亂', desc: '有賺，但整個人快散掉了。' },
    popular: { name: '巷口紅人', desc: '街坊鄰居都認得你。' },
    steady: { name: '穩穩的幸福', desc: '不多不少，剛剛好。' },
    brokeFixed: { name: '定存解約俠', desc: '有過關，但利息沒拿到，因為中途把定存解了。' },
  };

  const grandma = {
    pass: '好啦，過關。', great: '哇，這個我要跟隔壁炫耀。', fail: '沒關係，再來一次。',
    broke: '錢沒了就沒了，店還在，人還在。再來。',
  };

  const characters = {
    grandma: { name: '阿嬤', color: '#8E6BB0' },
    player: { name: '店長', color: '#2E86AB' },
    cat: { name: '發財', color: '#D98E32' },
    customer: { name: '客人', color: '#4FA66A' },
    neighbor: { name: '玲姨', color: '#D9533F' },
    xiaoma: { name: '小馬', color: '#E4572E' },
  };

  return { products, glossary, events, levels, chapters, nightLines, titles, grandma, characters };
});
