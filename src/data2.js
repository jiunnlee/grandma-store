/* 篇章二　街區篇（第 9–16 關）：通膨、複利、貸款、保險、稅、信用。
 * 這個檔案把內容加進 GameData；引擎不用改。所有人物、公司、商品皆為虛構。 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data.js'));
  else factory(root.GameData);
})(typeof self !== 'undefined' ? self : this, function (D) {
  'use strict';

  Object.assign(D.products, {
    soymilk: { name: '手工豆漿', unit: '杯', cost: 8, refPrice: 20, spoil: 1.0, icon: '🥛', note: '每天現磨，當天賣完。原料黃豆的價格會跟著物價走。' },
  });

  Object.assign(D.glossary, {
    '通膨': { plain: '東西普遍變貴，同樣的錢買得到的變少。', shop: '黃豆一個月漲了 15%，豆漿不漲價，每杯賺的就變薄。', real: '現金放著不動，也會被通膨慢慢吃掉。這是為什麼錢不能只放抽屜。' },
    '複利': { plain: '利息再生利息。放越久，雪球滾越大。', shop: '阿嬤 30 年前存的 1 萬，每年利息加回本金，現在變 4 萬多；若利息不加回去，只有 2 萬 5。', real: '複利的關鍵是時間。早一點開始，比晚一點多存更有用。' },
    '貸款': { plain: '跟銀行借一筆錢，之後分期連本帶利還回去。', shop: '借 4 萬開分店，每天要還 7,000，連還 6 天。生意好壞，這筆都要付。', real: '看貸款要看：年利率、總共要還多少、幾期、提前還清有沒有違約金。' },
    '槓桿': { plain: '用借來的錢放大自己的本錢。賺會放大，賠也會放大。', shop: '借錢開分店，客人變多賺更多；但淡季一來，還款一毛都不能少。', real: '槓桿不是壞事，但要先問：最壞的情況我還付得出來嗎？' },
    '信用': { plain: '你過去有沒有按時還錢的紀錄。信用好，借錢便宜；信用差，借不到或很貴。', shop: '延遲繳款一次，信用就掉 10；接下來同樣借 1 萬，利息多一倍。', real: '現實裡有「信用報告」，銀行放款前都會查。按時繳費就是在累積信用。' },
    '保險': { plain: '每期付一點小錢，萬一出大事，由保險公司賠大錢。', shop: '每天 300 元保店面，後巷失火賠 1 萬 5 的時候，保險公司付。', real: '看保單要看：保什麼、不保什麼、自負額多少、等多久才生效。「什麼都保」的通常什麼都不保。' },
    '風險轉移': { plain: '把你扛不起的風險，花錢交給別人扛。', shop: '火災不常發生，但一發生就是 1 萬 5。保費讓你用小錢換不用一次賠大錢。', real: '保險、分散投資，都是風險轉移的做法。' },
    '稅': { plain: '賺了錢要繳一部分給政府，換來道路、學校、警察。', shop: '這關賺的錢要繳 10%。有留收據的話，可以少繳一點。', real: '真實的稅制複雜得多，但原則一樣：先了解規則、留好紀錄，不要逃稅。' },
    '違約金': { plain: '沒照約定做事（例如遲繳）要多付的錢。', shop: '還款日手上沒現金，延一天就多 10% 違約金，信用還會掉。', real: '違約金寫在合約裡，簽之前要看。' },
  });

  const EV = [
    {
      id: 'soyprice', title: '隔壁豆漿悄悄漲價', who: 'neighbor', terms: ['通膨', '定價'],
      known: '黃豆已經漲了，你的成本每天都在變貴。隔壁已經漲價，客人慢慢會習慣。',
      text: '玲姨壓低聲音：「隔壁阿發的豆漿昨天偷偷從 20 漲到 23，客人好像沒發現耶。」\n你看了看進貨單，黃豆真的一直在漲。',
      options: [
        { label: '跟著漲，客人會懂的', kind: 'judgement', effects: { flag: { acceptRaise: true }, pop: -2 },
          result: '你把價目表改了。有兩個客人嘀咕了一下，但還是買了。', verdict: '成本漲、大家都漲，你不漲就是自己吸收。跟著漲是對的，只是要記得之後定價也要跟上。' },
        { label: '縮小杯子，價格不動', kind: 'judgement', effects: { flag: { costMul: 0.85 }, schedule: [{ after: 2, pop: -6, icon: '🥤', text: '熟客發現杯子變小了，在群組裡抱怨「縮水豆漿」。' }] },
          result: '杯子換小一號。今天沒人發現。', verdict: '客人不是笨蛋，縮水比漲價更傷口碑。而且效果只是延後兩天出現。' },
        { label: '換便宜的供應商', kind: 'luck',
          effects: (s, roll) => roll < 0.5 ? { flag: { costMul: 0.8 }, result: 'ok' } : { flag: { costMul: 0.8 }, schedule: [{ after: 1, pop: -8, demandMult: 0.8, icon: '🤢', text: '新供應商的黃豆有怪味，客人喝了一口就不喝了。' }] },
          result: (s, roll) => roll < 0.5 ? '新供應商的黃豆便宜兩成，品質還可以。' : '新供應商的黃豆便宜兩成……味道怪怪的。', verdict: '換供應商能省成本，但品質是運氣。省下的錢夠不夠賠人氣？' },
      ],
    },
    {
      id: 'passbook', title: '阿嬤的老存摺', who: 'grandma', terms: ['複利', '利息'],
      known: '同樣 1 萬元、同樣利率，複利 30 年是 4 萬 3，單利只有 2 萬 5。差別只在利息有沒有加回本金。',
      text: '阿嬤翻出一本泛黃的存摺：「30 年前我存了 1 萬，利息每年都加回去再生利息。你猜現在多少？」\n存摺上寫著：43,219 元。\n「隔壁阿發同年存同樣的錢，利息每年領走花掉，他的本子現在還是 1 萬，領走的利息加起來才 1 萬 5。」',
      options: [
        { label: '領出來，放活存繼續滾', kind: 'judgement', effects: { bankDemand: 43000, stress: -3 }, result: '43,000 元進了活存，從今晚開始每天生利息，利息再生利息。', verdict: '你選了讓雪球繼續滾。時間是複利最好的朋友。' },
        { label: '領出來，放抽屜比較安心', kind: 'judgement', effects: { cash: 43000 }, result: '43,000 元現金放進抽屜。阿嬤嘆了口氣。', verdict: '放抽屜的錢，這幾天一毛利息都不會生。安心是心理的，利息是真的。' },
        { label: '先別領，到關卡結束再說', kind: 'judgement', effects: (s) => ({ schedule: [{ after: s.days - s.day, cash: 43000 + Math.round(43000 * 0.012 * (s.days - s.day)), icon: '📒', text: '老存摺到期，連本帶利 ' + (43000 + Math.round(43000 * 0.012 * (s.days - s.day))).toLocaleString() + ' 元。' }] }),
          result: '存摺還在阿嬤那邊。利息照算。', verdict: '繼續放著也行，只是這幾天手上錢少一點，要留意進貨的現金。' },
      ],
    },
    {
      id: 'cheapshop', title: '小馬找到超便宜店面', who: 'xiaoma', terms: ['貸款', '槓桿'],
      known: '貸款要每天還，連還 6 天。分店會多客人，但房租也變多。你的信用分數決定利率。',
      text: '小馬衝進來：「巷口那間空店面，房東急租，超便宜！開分店的話客人直接多一倍！」\n「裝潢加押金要 15,000，還要留一點週轉金。我知道你現金不多……但銀行可以貸 40,000 啊！這是最後一次機會！」',
      options: [
        { label: '不開，先把本店顧好', kind: 'judgement', effects: { stress: -2 }, result: '小馬說你沒夢想，然後去買了一杯豆漿。', verdict: '不借錢最安全，但這一關的目標是為「擴張」設的，不開分店很難達標。槓桿不是壞事，是工具。' },
        { label: '小額試水：借 20,000 開外帶窗口（裝潢 8,000）', kind: 'judgement', effects: { borrow: 20000, loanName: '窗口貸款', cash: -8000, flag: { branch: 'small' }, stress: 3 },
          result: '你借了 20,000，花 8,000 在巷口租了一個外帶窗口。從明天起每天要還款。', verdict: '小額的槓桿：多四成客人，每天還 3,600 左右。淡季也付得起，這是穩的選擇。' },
        { label: '全力貸款 40,000 開分店（裝潢 15,000）', kind: 'judgement', effects: { borrow: 40000, loanName: '分店貸款', cash: -15000, flag: { branch: 'big' }, stress: 8 },
          result: '你簽了貸款合約，分店三天後開張。小馬比你還興奮。', verdict: '大槓桿：客人多一倍，但每天還 7,200 左右加分店房租 1,000。生意好是賺，淡季來就危險。' },
      ],
    },
    {
      id: 'offseasonLoan', title: '淡季遇上還款日', who: 'xiaoma', terms: ['槓桿', '現金流', '違約金'],
      known: '貸款每天固定還 7,000；淡季客人只剩七成。再借只會把問題往後推。',
      text: '連續幾天客人變少，但貸款每天 7,000 一毛不少。小馬又出現：「我朋友可以再借你 20,000 撐一下，利息高一點點啦。」',
      options: [
        { label: '不再借，縮小進貨量撐過去', kind: 'judgement', effects: { stress: 4, flag: { tightMode: true } }, result: '你咬牙把每天的進貨減少，先確保付得出還款。', verdict: '淡季就是要縮：少進貨、保現金、按時還。你沒有用新債還舊債。' },
        { label: '再借 20,000（利率是銀行的三倍）', kind: 'judgement', effects: (s) => ({ borrow: 20000, loanName: '小馬朋友的錢', stress: 6, credit: -5 }), result: '錢是到了，但從明天起每天多一筆還款。', verdict: '用更貴的債還便宜的債，是最常見的滾雪球方式，只是雪球是往下滾。' },
        { label: '這幾天先不還，等旺季再補', kind: 'judgement', effects: { bankDemand: 0, flag: { skipRepay: true }, schedule: [{ after: 1, cash: -2100, stress: 10, credit: -15, icon: '⚠️', text: '銀行來電：延遲繳款，違約金 2,100 元，信用紀錄留下一筆。' }] },
          result: '你把還款通知翻過去不看。', verdict: '遲繳的代價不只違約金，信用掉了，下次借錢全部變貴。' },
      ],
    },
    {
      id: 'insureSales', title: '玲姨的超值保單', who: 'neighbor', terms: ['保險', '保證獲利'],
      known: '真正的保單會寫清楚保什麼、不保什麼、自負額。',
      text: '玲姨拿出一張花花綠綠的單子：「我表妹在賣這個，一年才 500，什麼都保！火災、水災、客人跌倒、連貓生病都保！」',
      options: [
        { label: '問她：「不保什麼？自負額多少？」', kind: 'judgement', effects: { pop: 1 }, result: '玲姨翻了半天：「這個……應該都保吧？」然後說她要去燙頭髮。', verdict: '講不出「不保什麼」的保單，通常什麼都不保。你問對問題了。' },
        { label: '500 而已，買一張安心', kind: 'judgement', effects: { cash: -500, flag: { fakeInsurance: true } }, result: '你拿到一張影印的「保證書」。', verdict: '500 元買到的是一張影印紙。真的出事時你會發現它什麼都不賠。' },
        { label: '不用了，我去問正規的店面保險', kind: 'judgement', effects: { stress: -1 }, result: '你記下了要去保險公司問清楚。打烊後可以在存錢面板買店面保險。', verdict: '保險要買正規的，而且要自己看條款。' },
      ],
    },
    {
      id: 'fire', title: '後巷小火災', who: 'player', terms: ['保險', '風險轉移'],
      known: '有買店面保險的話，自負額 2,000，其餘保險公司賠。沒保險就是全額自己付。',
      text: '半夜後巷的電線走火，燒到儲藏室。還好人沒事，但修理加損失估計要 15,000 元。',
      options: (s) => s.insured ? [
        { label: '打給保險公司，付自負額 2,000', kind: 'judgement', effects: { cash: -2000, stress: 5, stockLose: 60 }, result: '保險公司派人來看，三天內理賠 13,000。你只付了 2,000。', verdict: '這就是保險：每天幾百塊，換來出事時不用一次掏一萬五。' },
      ] : s.flags.fakeInsurance ? [
        { label: '打給玲姨表妹的「保險」', kind: 'judgement', effects: { cash: -15000, stress: 15, stockLose: 60 }, result: '電話打不通。玲姨說她表妹「最近比較忙」。你自己付了 15,000。', verdict: '假保單的代價：500 元加 15,000 元。真正的保險會寫清楚保什麼。' },
        { label: '自己付 15,000 修', kind: 'judgement', minCash: 15000, effects: { cash: -15000, stress: 12, stockLose: 60 }, result: '你掏了 15,000。心很痛。', verdict: '沒保險，風險全部自己扛。還好你手上有現金。' },
        { label: '跟銀行借 15,000 修', kind: 'judgement', effects: { borrow: 15000, loanName: '修繕貸款', cash: -15000, stress: 10, stockLose: 60 }, result: '貸款下來了，修也修了，接下來每天多一筆還款。', verdict: '沒保險又沒現金，只好借。這一次意外會跟著你還好幾天。' },
      ] : [
        { label: '自己付 15,000 修', kind: 'judgement', minCash: 15000, effects: { cash: -15000, stress: 12, stockLose: 60 }, result: '你掏了 15,000。心很痛。', verdict: '沒保險，風險全部自己扛。還好你手上有現金；每天 300 的保費現在看起來很便宜吧？' },
        { label: '跟銀行借 15,000 修', kind: 'judgement', effects: { borrow: 15000, loanName: '修繕貸款', cash: -15000, stress: 10, stockLose: 60 }, result: '貸款下來了，修也修了，接下來每天多一筆還款。', verdict: '沒保險又沒現金，只好借。這一次意外會跟著你還好幾天。' },
        { label: '先不修，用另一半的空間', kind: 'judgement', effects: { stress: 10, stockLose: 60, schedule: [1, 2, 3].map((d) => ({ after: d, demandMult: 0.6, icon: d === 1 ? '🔥' : undefined, text: d === 1 ? '焦味還在，客人站在門口猶豫。' : undefined })) }, result: '焦黑的牆就那樣留著。', verdict: '不修看起來省錢，其實是用接下來幾天的客人在付。' },
      ],
    },
    {
      id: 'receipt', title: '客人要收據', who: 'customer', terms: ['稅'],
      known: '這一關賺的錢要繳 10% 的稅。有完整紀錄可以少繳。',
      text: '一個上班族買了十杯要開收據報帳。你翻了翻抽屜，收據本在哪？\n阿嬤：「進貨單、收據都要留著，報稅的時候用得到。」',
      options: [
        { label: '從今天起每一筆都留紀錄', kind: 'judgement', effects: { flag: { records: true }, stress: 2 }, result: '你買了一本收據本和一個資料夾。', verdict: '有紀錄，報稅時可以合法少繳。這是最便宜的省稅方法。' },
        { label: '太麻煩了，先不管', kind: 'judgement', effects: { stress: -1 }, result: '客人沒拿到收據，走了。', verdict: '紀錄不留，報稅時就只能照最高的算。' },
      ],
    },
    {
      id: 'taxchaos', title: '報稅季大混亂', who: 'grandma', terms: ['稅'],
      known: '這一關賺的錢要繳 10% 的稅。請會計不會出錯；自己報可能錯；不報可能被查。',
      text: '整條街的老闆都在罵報稅。阿嬤把一疊單子放在你面前：「要嘛請會計，要嘛自己來，要嘛……我不建議第三種。」',
      options: [
        { label: '請會計幫忙（1,500 元）', kind: 'judgement', effects: { cash: -1500, stress: -4, flag: { accountant: true } }, result: '會計小姐半小時整理好，還幫你找到兩筆可以扣的。', verdict: '專業的事花小錢請專業的人，不出錯也不被罰。' },
        { label: '自己報', kind: 'luck', effects: (s, roll) => roll < 0.7 ? { stress: 6 } : { stress: 10, schedule: [{ after: 2, cash: -2000, icon: '📮', text: '稅務機關來信：申報有誤，補稅加罰款 2,000 元。' }] },
          result: (s, roll) => roll < 0.7 ? '你熬夜填完了，應該沒錯……吧？' : '你熬夜填完了。兩天後收到補稅通知。', verdict: '自己報省了 1,500，但有三成機率出錯。划不划算看你有多少時間。' },
        { label: '不報，誰會查小店', kind: 'luck', effects: (s, roll) => roll < 0.5 ? { flag: { taxEvaded: true } } : { stress: 15, credit: -20, schedule: [{ after: 2, cash: -8000, icon: '🚨', text: '稅務機關查帳：漏報，補稅加罰款 8,000 元，紀錄留案。' }] },
          result: (s, roll) => roll < 0.5 ? '這一關沒人來查。' : '兩天後，兩個穿西裝的人來店裡「了解一下」。', verdict: '就算這次沒被查，也是運氣。被查到的罰款是稅的好幾倍，信用還會留紀錄。' },
      ],
    },
    {
      id: 'creditcheck', title: '銀行的信用分數', who: 'customer', terms: ['信用', '利息'],
      known: '信用分數決定你借錢的利率。按時還款會慢慢回升。',
      text: '銀行的小姐很客氣：「老闆，您之前有一筆遲繳紀錄，目前信用分數 45。同樣借 1 萬，您的利息會比信用 70 分的人貴一倍。」\n「如果先把舊的 5,000 欠款結清，分數可以回到 60。」',
      options: [
        { label: '先結清舊帳 5,000', kind: 'judgement', effects: { cash: -5000, credit: 15, stress: -3 }, result: '結清了。小姐說下週分數會更新。', verdict: '花 5,000 把信用修好，之後借錢便宜很多。這筆錢其實是投資。' },
        { label: '先不管，反正不一定要借', kind: 'judgement', effects: {}, result: '你把單子收進口袋。', verdict: '信用壞了沒修，等真的要借錢時才會發現有多貴。' },
      ],
    },
    {
      id: 'relativeBig', title: '表哥要借 15,000', who: 'neighbor', terms: ['信用'],
      known: '借錢給人要當作可能拿不回來；當保證人等於他不還你就要還。',
      text: '表哥又來了，這次很急：「借我 15,000，或是你當我的保證人去跟銀行借也可以，下個月一定還！」',
      options: [
        { label: '婉拒：「我自己也有貸款要還」', kind: 'judgement', effects: { stress: 2, pop: -1 }, result: '表哥嘀咕了一句「沒人情味」就走了。', verdict: '拒絕親戚很難，但保住的是你的店。' },
        { label: '借他 15,000，先講好還款日', kind: 'luck', effects: (s, roll) => roll < 0.4 ? { cash: -15000, schedule: [{ after: 4, cash: 15000, icon: '🙏', text: '表哥真的還錢了！15,000 元回到手上。' }] } : { cash: -15000, stress: 8, schedule: [{ after: 4, icon: '📵', text: '還款日到了，表哥的電話打不通。' }] },
          result: '表哥拿了錢，說四天後還。', verdict: '借給親友的錢，有四成機率回來，六成變成「不好意思開口要」。借之前當作送的。' },
        { label: '當他的保證人', kind: 'luck', effects: (s, roll) => roll < 0.4 ? { stress: 3 } : { stress: 12, credit: -20, schedule: [{ after: 4, cash: -16500, icon: '🏦', text: '銀行來電：表哥沒還，保證人要代償 16,500 元（含利息）。你的信用也留下紀錄。' }] },
          result: '你在銀行的表格上簽了名。', verdict: '保證人不是「幫忙簽個名」，是他不還你就要還，連利息一起，信用還跟著掉。' },
      ],
    },
    {
      id: 'expo', title: '全街店家聯合活動', who: 'customer', terms: ['人氣', '定價'],
      known: '合作要出錢，但整條街的客人會變多好幾天。價格戰只有自己便宜，別人也會跟。',
      text: '街區自治會的會長來拜訪：「週末辦街區博覽會，每家出 8,000 做宣傳和舞台。阿發說他不出，要自己打八折搶客。你呢？」',
      options: [
        { label: '出 8,000，一起把街區做大', kind: 'judgement', effects: { cash: -8000, pop: 4, schedule: [1, 2, 3, 4].map((d) => ({ after: d, demandMult: 1.4, pop: 2, icon: d === 1 ? '🎪' : undefined, text: d === 1 ? '博覽會開始！整條街都是人。' : undefined })) },
          result: '會長很高興。阿發在對面冷笑。', verdict: '合作把餅做大，四天多四成客人。8,000 元很快賺回來。' },
        { label: '不出錢，跟阿發一樣打八折', kind: 'judgement', effects: { flag: { priceWar: true }, pop: 2, schedule: [{ after: 2, pop: -5, icon: '⚔️', text: '阿發看你打八折，改打七折。客人在兩家之間跑來跑去，兩家都沒賺。' }] },
          result: '價格戰開打。', verdict: '價格戰是最容易開始、最難收尾的競爭。對手永遠可以再便宜一點。' },
        { label: '出 12,000 當主辦，舞台放你店門口', kind: 'judgement', effects: { cash: -12000, pop: 6, stress: 8, schedule: [1, 2, 3, 4].map((d) => ({ after: d, demandMult: 1.6, pop: 3, icon: d === 1 ? '🎪' : undefined, text: d === 1 ? '博覽會開始！舞台就在你店門口，排隊排到巷口。' : undefined })) },
          result: '你忙到沒時間吃飯，但人潮真的來了。', verdict: '多出 4,000 換更多人潮和壓力。有產能撐得住的話，這是最賺的。' },
      ],
    },
    {
      id: 'rentUp', title: '房東要漲房租', who: 'neighbor', minor: true, terms: ['固定支出', '通膨'],
      text: '房東傳訊息：「物價都在漲，下個月房租要調 10%。」',
      options: [
        { label: '好好談：簽長約換少漲', effects: { stress: 3, schedule: [{ after: 1, icon: '🏠', text: '房東答應只漲 5%，但要簽一年。' }] }, result: '房東想了一天。' },
        { label: '接受', effects: { stress: 1 }, result: '你回了「好」。固定支出又多了一點。' },
      ],
    },
    {
      id: 'wangIntro', title: '理專小王的名片', who: 'customer', minor: true,
      text: '一個西裝筆挺的男生買了豆漿，順手遞上名片：「我是銀行的小王，您店裡現金流這麼好，有興趣聊聊理財嗎？手續費我們很透明的。」',
      options: [
        { label: '收下名片，之後再說', effects: { stress: 0 }, result: '名片夾進帳本。（篇章三再見。）' },
        { label: '「我先把店顧好」', effects: { stress: -1 }, result: '小王笑容不變：「隨時歡迎。」' },
      ],
    },
  ];
  EV.forEach((e) => D.events.push(e));

  const BANK = { demandRate: 0.002, fixedRate: 0.006, fixedDays: 3 };
  const LOAN = { max: 60000, rate: 0.012, days: 6 };
  const LV = [
    {
      id: 9, chapter: 2, title: '物價漲了', theme: '通膨',
      product: 'soymilk', days: 7, startCash: 120000, startPop: 55, baseCustomers: 200, rent: 1000,
      goalProfit: 6000, bank: BANK,
      inflation: { daily: 0.03, fromDay: 2 },
      climax: { day: 2, event: 'soyprice' },
      pool: ['regular', 'catbook', 'students', 'rentUp', 'wangIntro', 'magicwater', 'relative'],
      intro: [
        { who: 'grandma', text: '搬到街區了，這裡人多，但什麼都貴。這週賣豆漿，黃豆的價格一天比一天高。' },
        { who: 'grandma', text: '成本漲了，你的售價不跟著動，每杯賺的就越來越薄。注意看「每杯賺」那個數字。' },
        { who: 'player', text: '可是漲價客人會跑掉……' },
        { who: 'grandma', text: '大家都在漲的時候，客人會習慣。這就是通膨。' },
      ],
      verdict: { pass: '你有跟著物價調整，沒有被通膨吃掉。', great: '成本漲多少、價格就跟多少，客人還留著。這是很多老店做不到的。', fail: '看一下每天的「每杯賺」，是不是越來越少？成本漲了，售價要跟。' },
      lesson: '通膨讓同樣的錢買得更少。成本漲了，定價要跟上；放著不動的現金也會變薄。',
    },
    {
      id: 10, chapter: 2, title: '複利的魔法', theme: '複利',
      product: 'onigiri', days: 8, startCash: 120000, startPop: 55, baseCustomers: 170, rent: 1000,
      goalProfit: 9000, extraStart: 43000,
      bank: { demandRate: 0.012, fixedRate: 0.02, fixedDays: 3 },
      climax: { day: 3, event: 'passbook' },
      pool: ['regular', 'catbook', 'students', 'rainplan', 'wangIntro', 'relative', 'magicwater'],
      intro: [
        { who: 'grandma', text: '這週的銀行是我年輕時存錢的那家，利息特別好：活存每天 1.2%，而且利息會自動加回本金再生利息。' },
        { who: 'grandma', text: '這叫複利。重點不是利率多高，是「利息再生利息」和「放多久」。' },
        { who: 'grandma', text: '現實的銀行沒這麼好，這週是讓你看清楚雪球怎麼滾。' },
      ],
      verdict: { pass: '雪球滾起來了。你看到利息生利息的樣子了嗎？', great: '錢早早放進去、一直放著，就是複利最喜歡的玩法。', fail: '錢是不是一直放在抽屜？放進活存的那天起，它才開始滾。' },
      lesson: '複利 = 利息再生利息。越早開始、放越久，差距越大。這週的利率是放大的，現實要用「年」來看。',
    },
    {
      id: 11, chapter: 2, title: '貸款開分店', theme: '槓桿、利息',
      product: 'bento', days: 8, startCash: 60000, startPop: 60, baseCustomers: 160, rent: 1000,
      capacity: 130, staff: { name: '小美', wage: 1200, capacity: 120 },
      branch: { small: { demandMult: 1.4, rent: 500, capacity: 80 }, big: { demandMult: 2.0, rent: 1000, capacity: 200 } },
      goalProfit: 45000, bank: BANK, loan: LOAN,
      climax: { day: 2, event: 'cheapshop' },
      pool: ['regular', 'catbook', 'students', 'rainplan', 'wangIntro', 'relative', 'rentUp'],
      intro: [
        { who: 'grandma', text: '你手上只有 6 萬，但小馬說有個開分店的機會。' },
        { who: 'grandma', text: '借錢不是罪，借了還不出來才是。貸款每天固定還，生意好壞它都在。' },
        { who: 'grandma', text: '打烊後的存錢面板可以跟銀行借錢，也看得到每天要還多少。借之前先算：最差的日子付得出來嗎？' },
      ],
      verdict: { pass: '借了錢、還了錢，店也變大了。這就是槓桿用得對的樣子。', great: '分店開起來、貸款按時還、人氣還在漲。你會用別人的錢做自己的生意了。', fail: '每天的還款和分店房租，是不是比多賺的還多？槓桿放大賺，也放大賠。' },
      lesson: '貸款是固定的，營收是浮動的。借之前先算最壞情況付不付得出來，而且要看利率和總還款。',
    },
    {
      id: 12, chapter: 2, title: '還款壓力', theme: '固定支出與浮動營收',
      product: 'bento', days: 7, startCash: 40000, startPop: 60, baseCustomers: 200, rent: 1000,
      capacity: 130, staff: { name: '小美', wage: 1200, capacity: 120 },
      branch: { big: { demandMult: 2.0, rent: 1000, capacity: 200 } },
      startFlags: { branch: 'big' }, startLoans: [{ name: '分店貸款', principal: 40000, daily: 7000, daysLeft: 6, rate: 0.012 }],
      demandByDay: { 2: 0.75, 3: 0.7, 4: 0.7, 5: 0.75 },
      goalProfit: 40000, extraStart: -42000, bank: BANK, loan: { max: 20000, rate: 0.036, days: 5 },
      climax: { day: 3, event: 'offseasonLoan' },
      pool: ['regular', 'catbook', 'rainplan', 'relative', 'rentUp', 'wangIntro'],
      intro: [
        { who: 'grandma', text: '分店開了，貸款每天要還 7,000，還有 6 期。然後……淡季來了。' },
        { who: 'grandma', text: '客人會少三成，但還款一毛不少。這週考的是：固定支出不動，營收晃的時候，你怎麼撐。' },
        { who: 'player', text: '少進一點貨、留現金還款、不要再借……對吧？' },
        { who: 'grandma', text: '你說得出來，看你做不做得到。' },
      ],
      verdict: { pass: '淡季撐過去了，貸款也按時還。固定支出壓力最大的時候，現金就是命。', great: '一期都沒遲繳，淡季還有賺。你已經知道怎麼跟固定支出相處了。', fail: '是不是遲繳了，或是用更貴的債去還債？淡季的解法是縮，不是借。' },
      lesson: '固定支出不會因為生意差就變少。淡季要縮進貨、保現金、按時還款，不要用新債還舊債。',
    },
    {
      id: 13, chapter: 2, title: '保險是什麼', theme: '風險轉移',
      product: 'braised', days: 7, startCash: 120000, startPop: 55, baseCustomers: 140, rent: 1000,
      goalProfit: 7000, bank: BANK, loan: LOAN,
      insurance: { premium: 300, name: '店面火險' },
      climax: { day: 4, event: 'fire' },
      fixedEvents: { 2: 'insureSales' },
      pool: ['regular', 'catbook', 'students', 'rainplan', 'relative', 'wangIntro'],
      intro: [
        { who: 'grandma', text: '街區的老房子，電線都舊了。這週打烊後可以買店面火險，一天 300。' },
        { who: 'grandma', text: '保險不是投資，是用小錢把你扛不起的風險交給別人扛。' },
        { who: 'grandma', text: '會有人來賣你「什麼都保」的東西。記得問：不保什麼？自負額多少？' },
      ],
      verdict: { pass: '火災來的時候你沒有倒。不管是保險還是預備金，你準備了。', great: '買對了保險，自負額 2,000 就解決一萬五的事。這是風險轉移。', fail: '一萬五的意外一次打掉一週的利潤。每天 300 的保費，現在看起來便宜嗎？' },
      lesson: '保險用小錢轉移大風險。看保單要看：保什麼、不保什麼、自負額。「什麼都保」通常什麼都不保。',
    },
    {
      id: 14, chapter: 2, title: '稅與帳', theme: '稅的基本概念',
      product: 'tea', days: 7, startCash: 120000, startPop: 55, baseCustomers: 190, rent: 1000,
      goalProfit: 7500, bank: BANK,
      tax: { rate: 0.1, recordsDiscount: 0.4 },
      climax: { day: 5, event: 'taxchaos' },
      fixedEvents: { 2: 'receipt' },
      pool: ['regular', 'catbook', 'students', 'rainplan', 'relative', 'wangIntro', 'rentUp'],
      intro: [
        { who: 'grandma', text: '賺了錢要繳稅，這週結算時會扣掉利潤的 10%。有留紀錄的話可以少扣四成。' },
        { who: 'grandma', text: '稅不是懲罰，是道路、路燈、警察的錢。但該省的要省，該留的紀錄要留。' },
        { who: 'cat', text: '（發財坐在收據本上。）' },
      ],
      verdict: { pass: '稅繳了，帳清了，剩下的才是真的你的。', great: '有紀錄、有會計、沒出錯。你是整條街最會報稅的老闆。', fail: '是不是沒留紀錄，或是被罰款了？稅這種事，規矩先搞懂比省錢重要。' },
      lesson: '賺的錢要繳一部分稅。留好紀錄可以合法少繳；逃稅被查到的罰款是稅的好幾倍。',
    },
    {
      id: 15, chapter: 2, title: '信用與借貸', theme: '信用紀錄、借錢成本',
      product: 'onigiri', days: 7, startCash: 50000, startPop: 55, baseCustomers: 180, rent: 1000,
      startCredit: 45,
      goalProfit: 7000, bank: BANK, loan: LOAN,
      climax: { day: 3, event: 'relativeBig' },
      fixedEvents: { 1: 'creditcheck' },
      pool: ['regular', 'catbook', 'students', 'rainplan', 'wangIntro', 'rentUp', 'xiaoma'],
      intro: [
        { who: 'grandma', text: '你之前遲繳過一次，信用分數掉到 45。這週你會發現，同樣借錢，你比別人貴。' },
        { who: 'grandma', text: '信用是慢慢累積的：按時還一期加一點，遲繳一次掉一大截。' },
        { who: 'grandma', text: '還有，親戚會來借錢。借出去的錢，當作送的；當保證人，當作自己借的。' },
      ],
      verdict: { pass: '信用慢慢回來了。按時還錢這件小事，決定你以後借錢多貴。', great: '信用修好、親戚的坑也沒跳。你知道「人情」和「錢」要分開算了。', fail: '是不是當了保證人，或是又遲繳了？信用掉下去很快，爬上來很慢。' },
      lesson: '信用好，借錢便宜；信用差，借錢貴或借不到。按時還款累積信用；借給親友當作送的，保證人等於自己借。',
    },
    {
      id: 16, chapter: 2, title: '街區博覽會', theme: '合作與競爭關主戰',
      product: 'bento', days: 8, startCash: 100000, startPop: 60, baseCustomers: 200, rent: 1100,
      capacity: 130, staff: { name: '小美', wage: 1200, capacity: 120 },
      branch: { small: { demandMult: 1.4, rent: 500, capacity: 80 } },
      startFlags: { branch: 'small' },
      goalProfit: 30000, bank: BANK, loan: LOAN, insurance: { premium: 300, name: '店面火險' },
      inflation: { daily: 0.02, fromDay: 3 },
      tax: { rate: 0.1, recordsDiscount: 0.4 },
      climax: { day: 2, event: 'expo' },
      fixedEvents: { 4: 'fire', 6: 'receipt' },
      pool: ['regular', 'catbook', 'students', 'rainplan', 'relative', 'wangIntro', 'rentUp', 'xiaoma', 'magicwater'],
      intro: [
        { who: 'grandma', text: '街區篇的最後一關。物價在漲、火險要不要買、稅要繳，還有整條街的博覽會。' },
        { who: 'grandma', text: '對面的阿發想打價格戰。你可以跟他拚，也可以跟大家合作把街做大。' },
        { who: 'player', text: '合作……但我也想贏。' },
        { who: 'grandma', text: '把餅做大的人，分到的通常比搶餅的人多。' },
      ],
      verdict: { pass: '街區篇過關。你會算通膨、懂複利、借得起也還得起、保了該保的、繳了該繳的。', great: '整條街都知道阿嬤的小店是誰在顧了。下一步，是城市。', fail: '最後一關把所有東西混在一起，亂了很正常。回去看看是哪一塊漏了。' },
      lesson: '篇章二總複習：通膨要調價、複利靠時間、貸款看最壞情況、保險轉移大風險、稅要留紀錄、信用靠按時還。',
    },
  ];
  LV.forEach((l) => D.levels.push(l));

  D.chapters[2] = {
    title: '篇章二　街區篇', done: '你理解通膨、複利，也知道借錢的成本了。', next: '篇章三「城市篇」（投資、分散、市場起伏、槓桿）下個版本見。',
    realCard: {
      title: '現實對照卡：貸款與保險',
      intro: '遊戲裡的貸款和保險，現實裡也有。真的去看一份合約時，這幾項先找出來：',
      items: [
        { k: '年利率', v: '貸款真正的價格。遊戲用「每天」算是為了看得到，現實用「每年」。數字小不代表便宜，要看總費用。' },
        { k: '總還款', v: '本金加利息加手續費，全部加起來要還多少。這個數字比月付金額更重要。' },
        { k: '期數', v: '要還多久。期數越長月付越低，但總利息越多。' },
        { k: '提前清償', v: '想早點還完，有沒有違約金。' },
        { k: '保什麼', v: '保單第一頁通常寫保什麼；更重要的是翻到後面看「不保事項」和「自負額」。' },
        { k: '警訊', v: '「什麼都保」「保證賺」「今天就要簽」，三句話聽到任何一句，先回家。' },
      ],
      note: '這張卡不推薦任何銀行、貸款或保險商品。簽約前自己比較，看不懂就問，問不清楚就不簽。',
    },
  };
  return D;
});
