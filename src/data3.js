/* 篇章三　城市篇（第 17–24 關）：第一次投資、分散、市場震盪、利率、股息、槓桿、匯率、泡沫。
 * 這個檔案把內容加進 GameData。所有投資商品都是虛構的，名字刻意帶「範例」或童話感，不是推薦。 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data2.js'));
  else factory(root.GameData);
})(typeof self !== 'undefined' ? self : this, function (D) {
  'use strict';

  // ---------- 虛構市場商品 ----------
  // start 起始價；drift 每天平均漲幅；vol 每天雜訊；buyFee 買進手續費；dailyFee 每天管理費（從持有的單位扣）；
  // payout 每天配息（現金）；payoutIn:'units' 表示利息直接加在持有單位上（外幣定存）
  D.market = {
    bond: { name: '城市債券', icon: '🏛️', risk: 1, start: 100, drift: 0.002, vol: 0.003, buyFee: 0.001,
      what: '借錢給城市政府，城市按時付利息。', source: '城市付的利息', note: '最穩，但升息的時候價格會跌一點。' },
    longbond: { name: '長天期城市債券', icon: '🏛️', risk: 2, start: 100, drift: 0.003, vol: 0.006, buyFee: 0.001, trap: true,
      what: '借給城市更久，利息多一點。', source: '城市付的利息', note: '放越久，利率一變，價格晃得越大。' },
    fund: { name: '範例均衡基金', icon: '🧺', risk: 2, start: 100, drift: 0.003, vol: 0.015, buyFee: 0.01, dailyFee: 0.0005,
      what: '一籃子債券加股票，由基金公司管理。', source: '籃子裡的東西漲跌', note: '買進收 1%，每天管理費 0.05%。' },
    wangfund: { name: '小王精選基金', icon: '🎩', risk: 3, start: 100, drift: 0.003, vol: 0.02, buyFee: 0.03, dailyFee: 0.003, hiddenFee: true, trap: true,
      what: '小王說的「專家精選」，內容其實和均衡基金差不多。', source: '籃子裡的東西漲跌', note: '買進收 3%，每天管理費 0.3%。小王不會主動講。' },
    etf: { name: '範例高股息 ETF', icon: '🐄', risk: 3, start: 100, drift: 0.002, vol: 0.02, buyFee: 0.002, payout: 0.007,
      what: '一籃子會配息的公司，像一頭每天擠得出奶的牛。', source: '公司賺的錢分給你', note: '每天配 0.7%，漲得慢。' },
    rocket: { name: '火箭科技', icon: '🚀', risk: 4, start: 100, drift: 0.01, vol: 0.06, buyFee: 0.002,
      what: '一家還沒賺錢、但大家都說會飛的公司。', source: '只有價差，沒有配息', note: '一天可以漲跌 6% 以上。' },
    coin: { name: '海幣（外幣定存）', icon: '🌊', risk: 3, start: 30, drift: 0, vol: 0.015, buyFee: 0.01, payout: 0.008, payoutIn: 'units',
      what: '換成海國的錢存起來，利率比本地高。', source: '海國銀行付的利息', note: '利息高，但換回來的匯率不一定是你換過去的那個。' },
    bean: { name: '神奇豆', icon: '🫘', risk: 5, start: 10, drift: 0, vol: 0.03, buyFee: 0, trap: true,
      what: '沒有人說得出它是什麼，但大家都在買。', source: '只有後面的人願意用更高價買', note: '沒有手續費，這就是誘餌。' },
  };

  Object.assign(D.glossary, {
    '風險': { plain: '結果和你預期不一樣的可能性。風險越高，賺或賠的幅度越大。', shop: '債券一天最多動 0.3%，火箭科技一天可以掉 6%。', real: '合法的投資商品都會標風險等級，先看那一格。' },
    '報酬': { plain: '投資賺回來的錢，通常用百分比講。', shop: '放 10,000 在均衡基金，一週後變 10,200，報酬 2%。', real: '看報酬要一起看風險和費用。只講報酬不講風險的，先懷疑。' },
    '手續費': { plain: '買賣或持有投資商品時，付給銀行或基金公司的錢。', shop: '小王精選基金買進收 3%，每天再收 0.3%，一週下來吃掉快 5%。', real: '費用是確定會付的，報酬是不確定的。說明書上「費用」那一欄一定要找出來。' },
    '分散': { plain: '不要把全部的錢放在同一個地方。', shop: '一籃雞蛋被貓打翻全碎；分三籃，貓只打翻一籃。', real: '分散的目的不是賺更多，是讓一次意外不會把你打倒。' },
    '波動': { plain: '價格上上下下的幅度。', shop: '地震那天基金跌 15%，三天後又回來了。沒賣的人只是看到帳面動了一下。', real: '波動不等於虧損。真正的虧損是在低點賣掉。' },
    '債券': { plain: '借錢給政府或公司的憑證，對方按時付利息、到期還本。', shop: '城市債券每天付一點利息，但央行升息時價格會跌。', real: '利率升，舊債券的價格跌；利率降，價格漲。放越久的債券動越大。' },
    '股息': { plain: '公司賺了錢，分一部分給持有股票的人。', shop: '高股息 ETF 每天配 0.7%，房租靠它撐；火箭科技不配息，只賭它漲。', real: '配息從哪裡來要看清楚：公司賺的錢，還是從你的本金拿出來還你。' },
    '融資': { plain: '向券商借錢買股票，用自己的一份錢買三份。', shop: '融資三倍買火箭科技，漲 10% 賺 30%；跌 10% 就賠 30%。', real: '融資有利息，而且跌到維持率以下會被強制賣出，叫做斷頭。' },
    '爆倉': { plain: '借錢投資的人，跌到某個程度被強制賣光，本金可能歸零。', shop: '火箭科技一天跌三成，券商把你的持股全賣了還債，手上剩不到一半。', real: '爆倉不是運氣差，是借太多的必然結果。問自己：跌三成我還活得下去嗎？' },
    '匯率': { plain: '一種錢換另一種錢的價格，每天在變。', shop: '海幣利率高，但換回來時匯率跌了，利息全被吃掉。', real: '外幣商品要算兩件事：利率，還有換回來時的匯率。' },
    '泡沫': { plain: '東西的價格遠遠超過它本身的價值，靠後面的人用更高價接手撐著。', shop: '神奇豆沒有人說得出它是什麼，但一週漲了三倍，然後一天跌八成。', real: '泡沫裡真的有人賺到錢，問題是你不知道自己是不是最後一棒。' },
  });

  D.characters.wang = { name: '理專小王', color: '#5B7DB1' };
  Object.assign(D.titles, {
    liquidated: { name: '一夜見底', desc: '融資被斷頭，看到了帳面歸零的樣子。' },
    panic: { name: '低點賣出俠', desc: '跌最深的那天賣掉，三天後它回來了。' },
    diversified: { name: '三個籃子', desc: '雞蛋分開放，貓只打翻一籃。' },
  });

  const minorMarket = { who: 'wang', minor: true, cond: (s) => !!(s.market && s.market.prices) };
  const EV = [
    {
      id: 'wangFund', title: '小王的精選基金', who: 'wang', terms: ['手續費', '報酬'],
      known: '合法的基金都有費用。買之前問清楚：買進收多少、每天收多少。',
      text: '小王帶著平板來：「阿嬤的店現金流這麼好，放抽屜太可惜。這檔『精選基金』是我們專家挑的，過去一個月漲了 8%！現在進場最好。」',
      options: [
        { label: '問他：「買進收多少？每天收多少？」', kind: 'judgement', effects: { flag: { askedFee: true }, stress: 1 },
          result: '小王笑容僵了半秒：「買進 3%，管理費……每天 0.3%。但是報酬會蓋過去啦！」你算了一下：一週光費用就快 5%。', verdict: '問對問題了。費用是確定的，報酬是不確定的。現在夜晚面板看得到他那檔基金的費用。' },
        { label: '聽起來不錯，先買 30,000', kind: 'judgement', minCash: 30000, effects: { invest: [{ id: 'wangfund', cash: 30000 }], stress: -1 },
          result: '小王手刀幫你下單。帳面立刻少了 900 元，他說那是「正常的」。', verdict: '沒問費用就買。買進 3% 加每天 0.3%，這檔基金要漲很多才追得回來。' },
        { label: '「我先把店顧好」', kind: 'judgement', effects: { stress: -1 },
          result: '小王說隨時歡迎。你晚上自己看了看夜晚面板裡的商品。', verdict: '不買不是錯。但有興趣的話，自己看說明書比聽小王講安全。' },
      ],
    },
    {
      id: 'basket', title: '一籃雞蛋', who: 'neighbor', terms: ['分散', '風險'],
      known: '火箭科技漲得快，但一天可以跌很多。分開放，一個出事不會全碎。',
      text: '玲姨興奮地揮手機：「火箭科技！我表妹的同事的朋友在裡面上班，說下週要發表新產品，一定漲！我把退休金都放進去了！」\n發財打翻了櫃檯上的一籃雞蛋。',
      options: [
        { label: '跟玲姨一樣，60,000 全押火箭科技', kind: 'judgement', minCash: 60000, effects: { invest: [{ id: 'rocket', cash: 60000 }], stress: 3 },
          result: '你把六萬全部放進火箭科技。玲姨跟你擊掌。', verdict: '全押一檔，漲的時候最爽，跌的時候最痛。你的結果全看一家公司。' },
        { label: '分三籃：債券、基金、火箭各 20,000', kind: 'judgement', minCash: 60000, effects: { invest: [{ id: 'bond', cash: 20000 }, { id: 'fund', cash: 20000 }, { id: 'rocket', cash: 20000 }], stress: 1 },
          result: '你把六萬分成三份。玲姨說你太保守。', verdict: '分散不是為了賺最多，是為了一籃打翻的時候還剩兩籃。' },
        { label: '先不投資，看看再說', kind: 'judgement', effects: { stress: -1 },
          result: '你繼續顧店。玲姨說你會後悔。', verdict: '不投資也是一種選擇，錢不會變少，但也不會長。' },
      ],
    },
    {
      id: 'quake', title: '地震之後', who: 'player', terms: ['波動', '風險'],
      known: '今天早上全部商品都跌了。歷史上大多數震盪會在幾天內回來，但沒有人保證。',
      text: '凌晨的地震把城市搖醒。沒人受傷，但市場一開盤全面下跌，店裡也只有平常一半的客人。\n小王傳訊息：「別怕，這種時候最忌諱亂動。」玲姨傳訊息：「快賣！！！」',
      options: [
        { label: '全部賣掉，落袋為安', kind: 'judgement', effects: { sellAll: true, stress: -2 },
          result: '你把手上的投資全部賣掉。帳面的跌幅變成真的了。', verdict: '跌的時候賣，帳面虧損就變成真的虧損。震盪不等於虧損，賣掉才是。' },
        { label: '不動，繼續顧店', kind: 'judgement', effects: { stress: 4 },
          result: '你關掉手機，去擦櫃檯。', verdict: '帳面的紅字看了很痛，但你沒有把它變成真的。' },
        { label: '趁便宜，再放 20,000 進均衡基金', kind: 'judgement', minCash: 20000, effects: { invest: [{ id: 'fund', cash: 20000 }], stress: 6 },
          result: '你在大家都在賣的時候買。手有點抖。', verdict: '跌的時候加碼需要兩件事：手上有閒錢，還有確定這不是會消失的東西。' },
      ],
    },
    {
      id: 'bondIntro', title: '小王的債券方案', who: 'wang', terms: ['債券', '利息'],
      known: '債券利率固定。長天期的利息多一點，但央行一調利率，它的價格晃得比較大。',
      text: '小王這次拿的是城市債券：「城市政府發的，很穩。長天期的利息多一半。你看新聞最近都在說要調利率，更要趁現在鎖住！」',
      options: [
        { label: '長天期債券 60,000，鎖住高利息', kind: 'judgement', minCash: 60000, effects: { invest: [{ id: 'longbond', cash: 60000 }] },
          result: '你買了長天期。小王說這是這週最聰明的決定。', verdict: '利息多一點，但利率一升，長天期跌最多。你把全部押在「利率不會升」上。' },
        { label: '短天期 30,000 就好，另一半留著', kind: 'judgement', minCash: 30000, effects: { invest: [{ id: 'bond', cash: 30000 }] },
          result: '你買了一半短天期。小王有點失望。', verdict: '利率要動的時候，短天期晃得小，手上留的現金還能在升息後買更好的定存。' },
        { label: '等央行說完再決定', kind: 'judgement', effects: {},
          result: '你說想先看新聞。', verdict: '不確定的時候等，是合理的。只是等也有代價：這幾天的利息沒拿到。' },
      ],
    },
    {
      id: 'rateQuiz', title: '記者的問題', who: 'customer', terms: ['債券', '利息'],
      known: '升息：存款利息變多、貸款變貴、舊債券的價格跌。',
      text: '央行今天早上宣布升息。電視台記者在店門口做街訪：「老闆，升息對你是好還是壞？」',
      options: [
        { label: '「存款利息變多，但手上的債券跌了。」', kind: 'judgement', effects: { pop: 3, stress: -2 }, result: '記者眼睛一亮，剪進晚間新聞。阿嬤在電視前很得意。', verdict: '完全正確。升息是兩面：存錢的人多拿利息，持有舊債券和借錢的人吃虧。' },
        { label: '「升息很好，什麼都會漲！」', kind: 'judgement', effects: { pop: -1, stress: 1 }, result: '記者禮貌地點頭，沒剪進去。', verdict: '升息讓存款利息變多，但債券價格是跌的，貸款也更貴。' },
        { label: '「不知道耶，我只賣東西。」', kind: 'judgement', effects: {}, result: '記者去問隔壁。', verdict: '利率是整個城市的錢的價格，開店的人也躲不掉它。' },
      ],
    },
    {
      id: 'duel', title: '張婆的火箭', who: 'neighbor', terms: ['股息', '現金流'],
      known: '這一關店租很貴，店本身幾乎不賺。高股息 ETF 每天配息入帳；火箭科技不配息，只有賣掉才拿得到錢。',
      text: '隔壁張婆的店和你一樣在付高房租。她把 80,000 全放進火箭科技：「等它漲一倍，我就退休！」\n她約你：「第 6 天比比看誰的錢多。」',
      options: [
        { label: '跟她一樣，80,000 全買火箭科技', kind: 'judgement', minCash: 80000, effects: { invest: [{ id: 'rocket', cash: 80000 }], stress: 3, schedule: [{ after: 4, icon: '🥊', text: '第 6 天到了，張婆來對帳。' }] },
          result: '你和張婆一起按下買進。', verdict: '火箭不配息，房租卻每天要付。你的錢都在帳面上，手上反而空了。' },
        { label: '80,000 買高股息 ETF，用配息付房租', kind: 'judgement', minCash: 80000, effects: { invest: [{ id: 'etf', cash: 80000 }], stress: 0, schedule: [{ after: 4, icon: '🥊', text: '第 6 天到了，張婆來對帳。' }] },
          result: '你選了每天會擠奶的那頭牛。張婆笑你沒志氣。', verdict: '每天進來的配息是現金流，房租要靠它。成長慢一點，但付得出帳。' },
        { label: '一半一半', kind: 'judgement', minCash: 80000, effects: { invest: [{ id: 'etf', cash: 40000 }, { id: 'rocket', cash: 40000 }], stress: 1, schedule: [{ after: 4, icon: '🥊', text: '第 6 天到了，張婆來對帳。' }] },
          result: '你各放一半。', verdict: '一半現金流、一半成長，是很多人實際的做法。' },
        { label: '先不投資，房租靠店撐', kind: 'judgement', effects: { stress: 2, schedule: [{ after: 4, icon: '🥊', text: '第 6 天到了，張婆來對帳。' }] },
          result: '你把錢留在銀行。', verdict: '不投資，房租就全靠店和活存利息。撐得住，但沒有多的進帳。' },
      ],
    },
    {
      id: 'marginOffer', title: '小王的融資方案', who: 'wang', terms: ['融資', '槓桿'],
      known: '融資：用自己的 1 份錢買 3 份。漲 10% 賺 30%，跌 10% 賠 30%；持股跌到欠款的 1.3 倍以下會被強制賣出。',
      text: '小王壓低聲音：「火箭科技下週要發表，這種機會不用融資太可惜。你出 1，我們借你 2，三倍買。利息一天 0.5% 而已。」',
      options: [
        { label: '融資三倍，全押火箭科技', kind: 'judgement', effects: (s) => ({ marginBorrow: Math.floor(s.cash * 2 / 1000) * 1000, invest: [{ id: 'rocket', cash: s.cash * 3 }], stress: 8 }),
          result: '你簽了融資合約。帳面上的火箭科技是你本金的三倍。', verdict: '三倍槓桿：跌三成就是本金歸零。你把「它不會跌三成」當成確定的事。' },
        { label: '不融資，用自己的錢買一半', kind: 'judgement', effects: (s) => ({ invest: [{ id: 'rocket', cash: Math.floor(s.cash * 0.5) }], stress: 2 }),
          result: '你用自己的錢買了一半。小王說你太保守。', verdict: '沒有借錢，跌多少都是帳面的，不會被斷頭。' },
        { label: '不碰', kind: 'judgement', effects: { stress: -1 },
          result: '你請小王喝了杯茶，然後送客。', verdict: '不碰也是答案。' },
      ],
    },
    {
      id: 'coinSales', title: '海幣定存', who: 'wang', terms: ['匯率', '利息'],
      known: '海幣定存利率每天 0.8%，比本地高很多。但匯率每天在變，換回來不一定划算。',
      text: '小王：「海國的定存利率是我們的四倍！錢放海幣，什麼都不用做就多 0.8% 一天。」\n阿嬤在旁邊問：「那換回來的時候呢？」小王假裝沒聽到。',
      options: [
        { label: '把八成的錢換成海幣', kind: 'judgement', effects: (s) => ({ invest: [{ id: 'coin', cash: Math.floor(s.cash * 0.8 / 1000) * 1000 }], stress: 2 }),
          result: '你換了一大筆海幣。小王很開心。', verdict: '利息是海幣算的，但你的房租和進貨是本地錢。匯率一動，利息可能全沒了，而且你手上的本地現金剩很少。' },
        { label: '換 20,000 試試', kind: 'judgement', minCash: 20000, effects: { invest: [{ id: 'coin', cash: 20000 }] },
          result: '你換了兩萬，當作學費。', verdict: '小額試，看匯率怎麼動，再決定要不要多放。' },
        { label: '不換', kind: 'judgement', effects: {},
          result: '阿嬤點頭。', verdict: '利率高的東西，先問它用什麼錢算。' },
      ],
    },
    {
      id: 'fxImport', title: '海外進貨的付款日', who: 'customer', terms: ['匯率'],
      known: '進貨商三天後交貨 600 杯的原料，貨款 6,000 元（平常要 9,000），要用海幣付。現在先換，匯率就定了；交貨再換，看那天的匯率。',
      text: '海國的進貨商報價：600 杯冰淇淋的原料只要 6,000 元（平常要 9,000），三天後到貨，但要用海幣付。\n「你要現在先換好海幣付清，還是交貨那天再換？」',
      options: [
        { label: '現在先換好付清，匯率鎖定', kind: 'judgement', minCash: 6000, effects: { cash: -6000, schedule: [{ after: 3, stockAdd: { qty: 600, cost: 10 }, icon: '📦', text: '海國的原料到了：600 杯冰淇淋進冰箱。' }] },
          result: '你今天就把海幣換好付了。三天後貨到。', verdict: '先換就是鎖定匯率。少一個不確定。' },
        { label: '交貨那天再換，說不定更便宜', kind: 'luck', effects: (s) => ({ schedule: [{ after: 3, fxCash: { amount: 6000, id: 'coin', ref: s.market.prices.coin, text: '海國原料到貨，' }, stockAdd: { qty: 600, cost: 10 }, icon: '📦', text: '600 杯冰淇淋進冰箱。' }] }),
          result: '你決定到時候再換。', verdict: '把貨款交給匯率決定，是在賭。賭贏少付一點，賭輸多付一大筆，而且是你不能選的時候。' },
      ],
    },
    {
      id: 'beanHype1', title: '神奇豆（一）', who: 'customer', terms: ['泡沫'],
      known: '沒人說得出神奇豆是什麼。它這週會漲，問題是什麼時候停。',
      text: '一個客人神秘兮兮地拿出一包豆子：「神奇豆，上週漲了一倍。全城都在買，你不買嗎？沒手續費喔。」',
      options: [
        { label: '買 10,000 試試', kind: 'judgement', minCash: 10000, effects: { invest: [{ id: 'bean', cash: 10000 }] }, result: '你買了一萬，當作買個熱鬧。', verdict: '小額試水可以，前提是輸光也不痛。' },
        { label: '不買', kind: 'judgement', effects: {}, result: '客人搖搖頭走了。', verdict: '說不出投資什麼的東西，不買是最安全的答案。' },
      ],
    },
    {
      id: 'beanHype2', title: '神奇豆（二）', who: 'neighbor', terms: ['泡沫'],
      known: '神奇豆昨天又漲了兩成。',
      text: '玲姨衝進來：「神奇豆！我賺了 30%！你不買真的會後悔！」',
      options: [
        { label: '買 30,000', kind: 'judgement', minCash: 30000, effects: { invest: [{ id: 'bean', cash: 30000 }], stress: 3 }, result: '你跟上了。', verdict: '看別人賺錢而進場，叫做追高。' },
        { label: '有買的話，賣掉一半', kind: 'judgement', effects: (s) => s.market && s.market.holdings.bean ? { sell: [{ id: 'bean', cash: Math.round(s.market.holdings.bean.units * s.market.prices.bean / 2) }] } : {}, result: '你把一部分獲利先拿回來。', verdict: '漲的時候拿回本金，剩下的就算歸零也不痛。' },
        { label: '不理她', kind: 'judgement', effects: {}, result: '玲姨說你會後悔。', verdict: '不是每一班車都要上。' },
      ],
    },
    {
      id: 'beanHype3', title: '神奇豆（三）', who: 'wang', terms: ['泡沫'],
      known: '連小王都來推了。',
      text: '小王：「連我都買了。我們銀行要出神奇豆基金了，你現在進，比別人早。」\n阿嬤：「它到底是什麼？」小王：「這不重要。」',
      options: [
        { label: '買 50,000', kind: 'judgement', minCash: 50000, effects: { invest: [{ id: 'bean', cash: 50000 }], stress: 5 }, result: '你下了一筆大的。', verdict: '「它是什麼不重要」就是泡沫的台詞。' },
        { label: '有買的話，全部賣掉', kind: 'judgement', effects: { sell: [{ id: 'bean' }] }, result: '你把神奇豆全賣了。', verdict: '在大家最瘋的時候離場，很難，但這就是方法。' },
        { label: '不買不賣', kind: 'judgement', effects: {}, result: '你看著小王走出去。', verdict: '不動也是一種選擇。' },
      ],
    },
    {
      id: 'beanPeak', title: '全城瘋搶', who: 'neighbor', terms: ['泡沫', '風險'],
      known: '神奇豆已經漲了快三倍。沒有人知道明天會怎樣。',
      text: '電視、巷口、連阿嬤的老姊妹都在講神奇豆。玲姨：「我把房子抵押了再買一筆！你要不要把明天的進貨錢也先押上？一天就回來了！」',
      options: [
        { label: '把手上現金全押上', kind: 'judgement', effects: (s) => ({ invest: [{ id: 'bean', cash: Math.floor(s.cash * 0.95) }], stress: 10 }), result: '你把店的進貨錢也放進去了。', verdict: '用明天要用的錢投資，就算它漲，你明天也沒貨可賣。' },
        { label: '有買的話，全部賣掉', kind: 'judgement', effects: { sell: [{ id: 'bean' }], stress: -3 }, result: '你全賣了，獲利入袋。玲姨說你膽小。', verdict: '最後一棒的錢，你沒有去搶。' },
        { label: '不買也不賣，顧店', kind: 'judgement', effects: { stress: 2 }, result: '你把電視關了。', verdict: '不動的代價是看著別人帳面賺錢，但你的店還在。' },
      ],
    },
    {
      id: 'beanCrash', title: '神奇豆崩盤', who: 'player', terms: ['泡沫'],
      known: '今天早上神奇豆跌了八成。',
      text: '一夜之間，神奇豆的價格剩下兩成。玲姨坐在店門口哭。小王的電話打不通。\n發財從櫃檯上推下一包豆子。',
      options: [
        { label: '有買的話，認賠賣光', kind: 'judgement', effects: { sell: [{ id: 'bean' }], stress: 5 }, result: '你把剩下的賣掉，拿回一點點。', verdict: '泡沫破了不會回來。認賠是止血。' },
        { label: '攤平：再買 20,000', kind: 'judgement', minCash: 20000, effects: { invest: [{ id: 'bean', cash: 20000 }], stress: 10 }, result: '你覺得它會反彈。', verdict: '攤平一個沒有價值的東西，只是把更多錢丟進去。' },
        { label: '什麼都不做', kind: 'judgement', effects: { stress: 3 }, result: '你去安慰玲姨。', verdict: '手上沒有的話，這就是最好的答案。' },
      ],
    },
    Object.assign({}, minorMarket, {
      id: 'marketNews', title: '市場小新聞', terms: ['波動'],
      text: '收音機在播財經新聞，主播的語氣很緊張。阿嬤把音量轉小：「每天都這樣講。」',
      options: [
        { label: '聽一下', effects: { stress: 2 }, result: '聽完更緊張了，但什麼也沒改變。' },
        { label: '關掉，顧店', effects: { stress: -2 }, result: '安靜多了。晚上再看一眼就好。' },
      ],
    }),
    Object.assign({}, minorMarket, {
      id: 'tipster', title: '客人的明牌', who: 'customer', terms: ['風險'],
      text: '一個常客小聲說：「我有內線，火箭科技明天一定漲。你要不要跟？」',
      options: [
        { label: '「謝謝，我不跟明牌。」', effects: { stress: -1 }, result: '常客聳聳肩。', verdict: '' },
        { label: '跟 10,000', minCash: 10000, effects: (s) => s.market.prices.rocket ? { invest: [{ id: 'rocket', cash: 10000 }], stress: 2 } : { stress: 1 }, result: '你跟了一萬。明天見分曉。' },
      ],
    }),
  ];
  EV.forEach((e) => D.events.push(e));

  const BANK = { demandRate: 0.002, fixedRate: 0.006, fixedDays: 3 };
  const POOL = ['regular', 'catbook', 'students', 'rainplan', 'relative', 'rentUp', 'marketNews', 'tipster'];
  const LV = [
    {
      id: 17, chapter: 3, title: '第一次投資', theme: '風險與報酬、費用',
      product: 'onigiri', days: 7, startCash: 150000, startPop: 60, baseCustomers: 180, rent: 1200,
      goalProfit: 7000, bank: BANK,
      market: { products: ['bond', 'fund', 'wangfund'] },
      climax: { day: 2, event: 'wangFund' },
      pool: POOL,
      intro: [
        { who: 'grandma', text: '搬進城裡了。這裡的銀行除了存錢，還賣一堆「商品」。我多給你 3 萬閒錢，打烊後可以試試。' },
        { who: 'grandma', text: '每一樣東西都有四個字要看：風險、報酬、費用、投資什麼。看不懂的就不要買。' },
        { who: 'wang', text: '阿嬤好！我是理專小王。有什麼問題都可以問我……費用的事比較複雜，之後再說。' },
        { who: 'grandma', text: '就是「之後再說」的那個要先問。' },
      ],
      verdict: { pass: '第一次投資，沒有被費用吃掉。', great: '你問了費用，也沒有把錢全放在一個地方。', fail: '看一下結算裡「付了多少費用」。報酬是不確定的，費用是確定的。' },
      lesson: '投資商品先看四件事：風險、報酬、費用、投資什麼。費用一定要問，因為它是唯一確定會發生的。',
    },
    {
      id: 18, chapter: 3, title: '雞蛋別放同個籃子', theme: '分散',
      product: 'braised', days: 7, startCash: 150000, startPop: 60, baseCustomers: 150, rent: 1200,
      goalProfit: 7000, bank: BANK,
      market: { products: ['bond', 'fund', 'rocket'], script: { 5: [{ id: 'rocket', mult: 0.65, news: '火箭科技的新產品發表會出包，股價一天跌四成。', icon: '💥' }] } },
      climax: { day: 2, event: 'basket' },
      pool: POOL,
      intro: [
        { who: 'grandma', text: '這週市場多了一檔「火箭科技」，漲得快，也跌得快。' },
        { who: 'grandma', text: '玲姨會來跟你說她全押了。你聽聽就好。' },
        { who: 'cat', text: '（發財盯著櫃檯上那籃雞蛋。）' },
      ],
      verdict: { pass: '籃子被打翻的時候，你還有別的籃子。', great: '分散、沒追高、店也顧好了。', fail: '是不是把錢全放在火箭科技？一個籃子翻了就全碎。' },
      lesson: '分散不是為了賺最多，是讓一次意外不會把你打倒。',
    },
    {
      id: 19, chapter: 3, title: '市場震盪', theme: '波動不等於虧損',
      product: 'tea', days: 7, startCash: 70000, startPop: 60, baseCustomers: 190, rent: 1200,
      goalProfit: 4000, extraStart: 80000, bank: BANK,
      startMarket: { bond: 30000, fund: 30000, rocket: 20000 },
      market: { products: ['bond', 'fund', 'rocket'], script: {
        3: [{ id: 'bond', mult: 0.97 }, { id: 'fund', mult: 0.85 }, { id: 'rocket', mult: 0.75, news: '凌晨地震，市場開盤全面重挫。', icon: '🌍', demandMult: 0.5 }],
        4: [{ id: 'fund', mult: 1.02, demandMult: 0.7 }],
        5: [{ id: 'fund', mult: 1.07 }, { id: 'rocket', mult: 1.15, news: '復原比想像快，市場大幅反彈。', icon: '📈' }],
        6: [{ id: 'fund', mult: 1.05 }, { id: 'rocket', mult: 1.1 }],
        7: [{ id: 'fund', mult: 1.02 }, { id: 'bond', mult: 1.01 }],
      } },
      climax: { day: 3, event: 'quake' },
      pool: POOL,
      intro: [
        { who: 'grandma', text: '你上一關留下的投資還在：債券 3 萬、基金 3 萬、火箭 2 萬。這週會有大事。' },
        { who: 'grandma', text: '記住：帳面上的數字跌了，不叫虧。賣掉的那一刻，才叫虧。' },
        { who: 'grandma', text: '所以這關考的不是你會不會算，是你會不會慌。' },
      ],
      verdict: { pass: '你沒有在最低點賣掉。', great: '震盪的時候你還顧得了店，甚至敢加碼。', fail: '是不是在跌最深那天賣了？看看三天後的價格。' },
      lesson: '波動不等於虧損。只要東西本身不會消失，帳面跌了不賣就不是真的虧。',
    },
    {
      id: 20, chapter: 3, title: '利率升降', theme: '債券與利率',
      product: 'soymilk', days: 7, startCash: 150000, startPop: 60, baseCustomers: 200, rent: 1200,
      goalProfit: 6500, bank: BANK,
      market: { products: ['bond', 'longbond'], script: {
        2: [{ news: '央行總裁：「下週會檢討利率。」', icon: '🏦' }],
        4: [{ id: 'bond', mult: 0.985 }, { id: 'longbond', mult: 0.9, news: '央行宣布升息！存款利率調高，舊債券價格下跌。', icon: '🏦', bank: { demandRate: 0.006, fixedRate: 0.015 } }],
      } },
      climax: { day: 4, event: 'rateQuiz' },
      fixedEvents: { 1: 'bondIntro' },
      pool: POOL,
      intro: [
        { who: 'grandma', text: '這週市場只有債券。債券就是借錢給城市，城市付利息。' },
        { who: 'grandma', text: '新聞說央行可能調利率。利率一升，新的存款比較好，舊的債券就沒人要，價格會跌。放越久的跌越多。' },
        { who: 'wang', text: '所以要趁現在鎖住長天期！' },
        { who: 'grandma', text: '……他講的是反的。' },
      ],
      verdict: { pass: '利率升的時候你沒有被長天期債券套住。', great: '升息後你還把錢放進更好的定存。', fail: '是不是把錢全放進長天期債券？利率一升它跌最多。' },
      lesson: '利率升，舊債券價格跌，存款利息變多，貸款變貴。放越久的債券對利率越敏感。',
    },
    {
      id: 21, chapter: 3, title: '股息與成長', theme: '現金流與成長的取捨',
      product: 'bento', days: 7, startCash: 120000, startPop: 55, baseCustomers: 90, rent: 2500,
      capacity: 130,
      goalProfit: 2500, extraStart: 0, bank: BANK,
      market: { products: ['etf', 'rocket'], script: {
        4: [{ id: 'rocket', mult: 0.88, news: '火箭科技宣布延後發表，股價回檔。', icon: '📉' }],
        6: [{ id: 'rocket', mult: 0.95 }],
      } },
      climax: { day: 2, event: 'duel' },
      pool: POOL,
      intro: [
        { who: 'grandma', text: '城裡的房租很貴，一天 2,500。店本身幾乎不賺，要靠投資的配息撐房租。' },
        { who: 'grandma', text: '高股息 ETF 每天配錢給你；火箭科技不配，只能等它漲再賣。' },
        { who: 'grandma', text: '張婆會來跟你比。比的不是誰的帳面大，是誰付得出房租。' },
      ],
      verdict: { pass: '房租付出來了，靠的是每天進來的現金。', great: '配息撐房租，店還有賺。張婆輸了。', fail: '是不是全買了不配息的東西？帳面再大，房租要現金。' },
      lesson: '成長型資產靠價差，配息型資產給現金流。要付固定支出的人，先看現金流。',
    },
    {
      id: 22, chapter: 3, title: '槓桿陷阱', theme: '融資與爆倉',
      product: 'icecream', days: 7, startCash: 100000, startPop: 60, baseCustomers: 150, rent: 1200,
      goalProfit: 9000, extraStart: 0, bank: BANK,
      market: { products: ['bond', 'rocket'], margin: { maxMul: 3, rate: 0.005, maintain: 1.3 }, script: {
        3: [{ id: 'rocket', mult: 1.12, news: '火箭科技發表會傳出好消息，股價大漲。', icon: '🚀' }],
        4: [{ id: 'rocket', mult: 1.05 }],
        5: [{ id: 'rocket', mult: 0.7, news: '火箭科技被爆財報造假，股價一天腰斬三成。', icon: '💥' }],
        6: [{ id: 'rocket', mult: 0.9 }],
        7: [{ id: 'rocket', mult: 1.05 }],
      } },
      climax: { day: 2, event: 'marginOffer' },
      pool: POOL,
      intro: [
        { who: 'grandma', text: '小王這次要教你「融資」：用你的 1 份錢買 3 份。' },
        { who: 'grandma', text: '漲 10% 你賺 30%，聽起來很棒。跌 10% 你賠 30%，跌 30% 就歸零，而且券商會在那之前把你的東西賣光。' },
        { who: 'grandma', text: '打烊後的面板也可以自己借。借之前，先問：跌三成，我還活得下去嗎？' },
      ],
      verdict: { pass: '你沒有被斷頭。', great: '完全沒碰融資，火箭科技跌三成也只是帳面。', fail: '斷頭的那天早上，你看到了帳面歸零。這是遊戲，真實世界還要補差額。' },
      lesson: '融資放大的是賠率，不只是賺率。借錢投資要先算：跌多少會被強制賣出？',
    },
    {
      id: 23, chapter: 3, title: '匯率與海外', theme: '外幣風險',
      product: 'icecream', days: 7, startCash: 120000, startPop: 60, baseCustomers: 160, rent: 1200,
      goalProfit: 20000, extraStart: 0, bank: BANK,
      market: { products: ['bond', 'coin'], script: {
        4: [{ id: 'coin', mult: 1.25, news: '海國出事，海幣一天升值 25%。', icon: '💱' }],
        6: [{ id: 'coin', mult: 0.72, news: '海國局勢反轉，海幣大跌。', icon: '💱' }],
      } },
      climax: { day: 2, event: 'fxImport' },
      fixedEvents: { 1: 'coinSales' },
      pool: POOL,
      intro: [
        { who: 'grandma', text: '這週會跟海國做生意。他們的錢叫海幣，1 海幣現在換 30 元，每天都在變。' },
        { who: 'grandma', text: '海幣定存利率很高，但你的房租和進貨是用本地錢付。' },
        { who: 'grandma', text: '記住：外幣要算兩次，一次利率，一次匯率。' },
      ],
      verdict: { pass: '匯率動的時候，你沒有把全部身家押在上面。', great: '該鎖匯率的鎖了，海幣也只放了閒錢。', fail: '是不是把大部分錢換成海幣，或是把貨款交給匯率決定？' },
      lesson: '外幣商品要同時看利率和匯率。要用本地錢付的帳，就不要讓它隨匯率晃。',
    },
    {
      id: 24, chapter: 3, title: '狂熱與泡沫', theme: '群體心理（關主戰）',
      product: 'bento', days: 7, startCash: 120000, startPop: 60, baseCustomers: 200, rent: 1300,
      capacity: 130, staff: { name: '小美', wage: 1200, capacity: 120 },
      goalProfit: 34000, extraStart: 0, bank: BANK,
      market: { products: ['bond', 'fund', 'bean'], script: {
        2: [{ id: 'bean', mult: 1.2, news: '神奇豆又漲了兩成。', icon: '🫘' }],
        3: [{ id: 'bean', mult: 1.2, news: '神奇豆再漲兩成，電視開始報。', icon: '🫘' }],
        4: [{ id: 'bean', mult: 1.25, news: '神奇豆漲到三倍，全城都在講。', icon: '🫘' }],
        5: [{ id: 'bean', mult: 1.15, news: '神奇豆創新高，但成交開始變少。', icon: '🫘' }],
        6: [{ id: 'bean', mult: 0.2, news: '神奇豆崩盤！一夜跌八成。', icon: '💥' }],
        7: [{ id: 'bean', mult: 0.9 }],
      } },
      climax: { day: 5, event: 'beanPeak' },
      fixedEvents: { 1: 'beanHype1', 2: 'beanHype2', 3: 'beanHype3', 6: 'beanCrash' },
      pool: POOL,
      intro: [
        { who: 'grandma', text: '城市篇最後一關。這週全城在瘋一種「神奇豆」，沒有人說得出它是什麼。' },
        { who: 'grandma', text: '它前面真的會漲。早進早出的人有賺。問題是你不知道自己是不是最後一棒。' },
        { who: 'player', text: '那……買一點，早點賣？' },
        { who: 'grandma', text: '可以。前提是輸光也不會影響明天進貨。' },
      ],
      verdict: { pass: '泡沫破的時候，你的店還在。', great: '你要嘛沒碰，要嘛早早離場。全城只有幾個人做到。', fail: '是不是追高了，或把進貨錢也押上去？結算的回放看一下你是第幾天買的。' },
      lesson: '泡沫裡真的有人賺錢，但沒有人知道自己是不是最後一棒。只用輸光也不痛的錢參加，而且說不出它是什麼的東西，不碰。',
    },
  ];
  LV.forEach((l) => D.levels.push(l));

  D.chapters[2].next = '接下來是篇章三「城市篇」：投資、分散、市場起伏、槓桿。';
  D.chapters[3] = {
    title: '篇章三　城市篇', done: '你會看風險、費用、分散，也知道帳面跌了不等於真的虧了。', next: '篇章四「暗流篇」（詐騙與防身術）下個版本見。',
    realCard: {
      title: '現實對照卡：投資商品說明書',
      intro: '真的去看一份基金或 ETF 的說明書時，先找這幾格。找不到，就不要買：',
      items: [
        { k: '費用', v: '買進手續費、每年管理費、賣出費用。遊戲用「每天」算是為了看得到，現實用「每年」。費用是唯一確定會發生的事。' },
        { k: '風險等級', v: '合法商品都有標示（例如 RR1 到 RR5）。等級越高，晃得越大。' },
        { k: '投資什麼', v: '裡面裝的是債券、股票、還是你看不懂的東西？看不懂的不買。' },
        { k: '配息來源', v: '配給你的錢是它賺的，還是從你的本金拿出來的？說明書會寫。' },
        { k: '過去績效', v: '每一份說明書都會寫「過去績效不代表未來」。這句話是真的。' },
        { k: '警訊', v: '「保證獲利」「內線」「現在不買就來不及」「它是什麼不重要」，聽到任何一句，先回家。' },
      ],
      note: '這張卡不推薦任何投資商品，遊戲裡的商品全部是虛構的。真的要投資前，自己看說明書，看不懂就問，問不清楚就不買。',
    },
  };
  return D;
});
