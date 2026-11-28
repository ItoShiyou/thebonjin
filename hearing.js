/* THE BONJIN — hearing.js（名刺 × ホームページのヒアリング）
   - 質問は下の STEPS に並べる。ここを直せば、画面・確認画面・届くメールが全部そろって変わる
   - 1画面＝1ステップ。入力はこの端末（localStorage）に自動保存し、閉じても続きから答えられる
   - 送信は FormSubmit 経由で itwoshiyou+thebonjin@gmail.com に届く（form.js と同じ宛先）
     メールは「STEP名｜質問」と「回答」の表になる。件名に受付番号・プラン・お名前が入る
   - URL の ?plan=student / ?plan=general で、最初に選ばれるプランを決められる */
(function () {
  "use strict";

  var TO = "itwoshiyou+thebonjin@gmail.com";
  var ENDPOINT = "https://formsubmit.co/ajax/" + TO;
  var MAILTO = "itwoshiyou@gmail.com";
  var KEY = "bonjin-hearing-v1";
  var MIN_ABOUT = 5; // 「好きなもの」「人物像」で、合わせて答えてほしい問いの数

  var PLANS = {
    general: { name: "名刺 × ホームページ", price: "税込7,500円" },
    student: { name: "学割 名刺＋ホームページ", price: "税込4,980円" }
  };

  var PURPOSES = ["営業・仕事の紹介", "企業や団体との交流", "経営者・起業家としての活動", "個人事業・副業",
    "交流会・イベント", "クリエイター・アーティスト活動", "自分のブランディング", "就職・インターン・キャリア",
    "学会・研究", "サークル・学生団体", "プライベートでの交流", "その他"];

  var IMPRESSIONS = [
    ["信頼・ビジネス", ["誠実", "知的", "信頼できる", "専門性が高い", "仕事ができる", "品格がある", "落ち着いている", "堅実"]],
    ["人柄・親しみ", ["親しみやすい", "優しい", "温かい", "明るい", "面白い", "自然体", "柔軟", "話しかけやすい"]],
    ["個性・独自性", ["個性的", "記憶に残る", "芸術的", "遊び心がある", "自由", "ミステリアス", "独創的", "印象的"]],
    ["活力・新しさ", ["行動力がある", "若々しい", "革新的", "力強い", "挑戦的", "洗練されている", "スピード感がある", "エネルギッシュ"]],
    ["美しさ・質感", ["上品", "高級感がある", "美しい", "シンプル", "繊細", "重厚", "スタイリッシュ", "ナチュラル"]]
  ];

  var SCALES = [
    ["ビジネス重視", "自己表現重視"], ["落ち着いた", "大胆な"], ["伝統的", "新しい"], ["真面目", "遊び心がある"],
    ["読みやすさ重視", "個性重視"], ["装飾が少ない", "装飾が多い"], ["柔らかい", "力強い"]
  ];

  /* 名刺に載せる項目。from があるものは基本情報の答えをそのまま使う（もう一度は聞かない） */
  var CARD = [
    { k: "name", label: "氏名", from: "name", fixed: true },
    { k: "kana", label: "ふりがな", from: "kana" },
    { k: "roman", label: "ローマ字表記", ph: "例：Hanako Miyazaki" },
    { k: "org", label: "会社名・屋号・学校名", from: "org" },
    { k: "title", label: "肩書き・役職・学部学年", from: "title" },
    { k: "job", label: "仕事・活動の一言紹介", ph: "例：写真と映像の制作" },
    { k: "tel", label: "電話番号", ph: "例：090-0000-0000", type: "tel" },
    { k: "mail", label: "メールアドレス", from: "email" },
    { k: "addr", label: "住所", ph: "市区町村までだけ、なども可" },
    { k: "web", label: "いまあるホームページ", ph: "https://" },
    { k: "insta", label: "Instagram", ph: "@ から、または URL" },
    { k: "x", label: "X", ph: "@ から、または URL" },
    { k: "sns", label: "そのほかのSNS（YouTube・TikTok・note・LinkedIn・公式LINE など）", ph: "サービス名と @ や URL" },
    { k: "photo", label: "顔写真", note: "写真は、確認メールへの返信で送ってください" },
    { k: "logo", label: "ロゴ", note: "ロゴは、確認メールへの返信で送ってください" },
    { k: "other", label: "そのほか載せたいもの", ph: "例：資格、座右の銘" }
  ];

  var PRI = [["must", "必ず載せる"], ["want", "できれば載せる"], ["free", "デザインしだいで省いてよい"]];

  var STEPS = [
    {
      id: "start", name: "はじめに", en: "Start",
      title: "あなたのことを、<br class=\"sp\">教えてください。",
      lead: "デザインの希望ではなく、あなた自身のことを聞かせてください。好きなもの、大切にしていること、渡す相手にどう思われたいか。その答えを、色や線、余白、文字の組み方に置き換えて、一枚の名刺とホームページをつくります。",
      fields: [
        { k: "plan", type: "radio", cls: "plan", label: "申し込むプラン", req: true, options: [
          ["general", "<span class=\"hr-plan-n\">名刺 × ホームページ</span><span class=\"hr-plan-p\"><b>7,500</b>円<small>税込</small></span>"],
          ["student", "<span class=\"hr-plan-n\">学割<small>学生・新社会人</small></span><span class=\"hr-plan-p\"><b>4,980</b>円<small>税込</small></span>"]] },
        { type: "info", html:
          "<dl class=\"hr-spec\">" +
          "<div><dt>含まれるもの</dt><dd>名刺のデザイン・両面カラー印刷100枚、スマホ用のホームページ（1ページ）、QRコード、デザインに込めた意味の説明</dd></div>" +
          "<div><dt>修正</dt><dd>2回まで</dd></div>" +
          "<div><dt>送料</dt><dd>送料込み（全国どこでも、追加のお支払いはありません）</dd></div>" +
          "<div><dt>かかる時間</dt><dd>このヒアリングは10〜15分ほど。答えにくい問いは飛ばせます</dd></div>" +
          "</dl>" +
          "<p class=\"hr-flow-t\">このあとの流れ</p>" +
          "<ol class=\"hr-flow\"><li><b>このページで答えて送る</b>10〜15分</li><li><b>確認のメールが届く</b>載せる内容などを確認します</li><li><b>OKなら、お支払い</b>送ってすぐには、お金はかかりません</li><li><b>制作開始</b>デザインをメールでお見せします</li></ol>" }
      ]
    },
    {
      id: "basic", name: "基本情報", en: "About you",
      title: "まずは、基本のこと。",
      fields: [
        { k: "name", label: "お名前", req: true, ac: "name", ph: "例：宮崎 花子" },
        { k: "kana", label: "ふりがな", req: true, ph: "例：みやざき はなこ" },
        { k: "email", label: "メールアドレス", type: "email", req: true, ac: "email", hint: "確認のメールをお送りします" },
        { k: "school", label: "学校・学年", req: true, ph: "新社会人の方は、勤め先と入社した年", show: function (s) { return s.plan === "student"; } },
        { k: "org", label: "会社名・屋号・所属", ph: "なければ空欄で" },
        { k: "title", label: "肩書き・役職", ph: "例：デザイナー、代表、工学部3年" },
        { k: "work", label: "いまの仕事・活動", type: "textarea", req: true, ph: "例：宮崎市で、写真と映像の制作をしています。最近は店舗の撮影が多いです" },
        { k: "purpose", label: "名刺を使う場面", type: "checks", req: true, options: PURPOSES, hint: "いくつでも" },
        { k: "who", label: "名刺を渡す相手は、どんな人ですか？", type: "textarea", ph: "例：飲食店のオーナー、同じ業界の人" },
        { k: "after", label: "渡したあと、相手にどうしてほしいですか？", type: "textarea", ph: "例：覚えていてほしい／SNSを見てほしい／仕事の相談をしてほしい／会話のきっかけにしたい" },
        { k: "why_now", label: "今回、名刺をつくろうと思った理由", type: "textarea", more: true, ph: "例：独立したので／いまの名刺が気に入っていない" }
      ]
    },
    {
      id: "likes", name: "好きなもの", en: "Favorites", about: true,
      title: "好きなものを、<br class=\"sp\">教えてください。",
      lead: "単語だけでも大丈夫です。好きなものをそのまま絵にするのではなく、色や質感、空気感のヒントにします。",
      fields: [
        { k: "hobby", label: "好きなこと・趣味", type: "textarea", ph: "例：星を見ること、深夜の読書" },
        { k: "hobby_why", label: "それの、どんなところが好きですか？", type: "textarea", ph: "例：静かで、自分だけの時間になるところ", show: function (s) { return !!s.hobby; } },
        { k: "now", label: "最近、夢中になっていること", ph: "例：フィルムカメラ" },
        { k: "color", label: "好きな色", ph: "例：深い紺色、くすんだ緑" },
        { k: "place", label: "好きな場所・風景", ph: "例：冬の朝の海、古い喫茶店" },
        { k: "culture", label: "好きな音楽・映画・漫画・本", type: "textarea", ph: "例：ジャズ、宮崎駿の映画" },
        { k: "symbol", label: "自分を象徴するものは？", ph: "例：いつも持っている万年筆" },
        { k: "season", label: "好きな季節・時間帯", more: true, ph: "例：秋の夕方" },
        { k: "fashion", label: "好きな服装・ブランド", more: true, ph: "例：古着、無印良品" },
        { k: "nature", label: "好きな動物・植物", more: true },
        { k: "arch", label: "好きな建築・インテリア", more: true, ph: "例：木造の古民家、北欧の家具" },
        { k: "food", label: "好きな食べ物・飲み物", more: true, ph: "例：浅煎りのコーヒー" },
        { k: "texture", label: "好きな素材・質感", more: true, ph: "例：ざらっとした紙、木、真鍮" },
        { k: "collect", label: "つい集めてしまうもの", more: true },
        { k: "memory", label: "思い入れのある場所や物", type: "textarea", more: true },
        { k: "dislike", label: "苦手なもの・嫌いなもの", more: true, ph: "デザインで避けるために使います" }
      ]
    },
    {
      id: "person", name: "人物像", en: "Character", about: true,
      title: "どんな人ですか？",
      lead: "答えにくい問いは、飛ばしてください。ここでの答えを、そのまま名刺に載せることはありません。",
      fields: [
        { k: "words3", label: "自分を3つの言葉で表すと？", ph: "例：好奇心、慎重、のんびり" },
        { k: "others", label: "周りから、どんな人だと言われますか？", ph: "例：話しやすい、こだわりが強い" },
        { k: "value", label: "大切にしていること", type: "textarea", ph: "仕事でも、暮らしでも" },
        { k: "moment", label: "自分らしいと感じるのは、どんなとき？", type: "textarea" },
        { k: "remember", label: "初対面の人に、覚えてもらいたいこと", type: "textarea" },
        { k: "motto", label: "好きな言葉・座右の銘", more: true },
        { k: "strength", label: "自分の長所", more: true },
        { k: "differ", label: "ほかの人と少し違うと思うところ", type: "textarea", more: true },
        { k: "future", label: "これから、やってみたいこと", type: "textarea", more: true },
        { k: "respect", label: "尊敬している人", more: true },
        { k: "metaphor", label: "自分を何かにたとえると？", more: true, ph: "例：夜の灯台" },
        { k: "message", label: "名刺を通じて、伝えたいこと", type: "textarea", more: true }
      ]
    },
    {
      id: "impression", name: "与えたい印象", en: "Impression",
      title: "渡した相手に、<br class=\"sp\">どう思われたいですか？",
      lead: "あなたの好きなものと、仕事で見せたい顔は、ちがっていてかまいません。ここで選んだ印象を軸に、好きなものをどこまで出すかを決めます。",
      fields: [
        { k: "imp", type: "chips", label: "3〜5個えらんでください", req: true, min: 3, max: 5 },
        { k: "imp_top", type: "pickFrom", from: "imp", label: "その中で、いちばん大事なものは？", req: true },
        { k: "imp_other", label: "ほかに、言葉にしたい印象があれば", ph: "例：近所の頼れるお兄さん" }
      ]
    },
    {
      id: "range", name: "表現の幅", en: "Range",
      title: "どこまで、<br class=\"sp\">任せてもらえますか？",
      lead: "迷ったら「おまかせ」のままで大丈夫です。",
      fields: [
        { k: "freedom", type: "radio", label: "デザインの自由度", req: true, options: [
          "完全におまかせしたい", "基本は任せたいが、一部だけ希望がある", "自分の希望を、ある程度反映してほしい", "具体的に指定したいことがある"] },
        { k: "wish", label: "希望・指定したいこと", type: "textarea", show: function (s) { return !!s.freedom && s.freedom !== "完全におまかせしたい"; }, ph: "例：縦型にしたい、紺色を使ってほしい" },
        { k: "express", type: "radio", label: "趣味や個性の出し方", options: ["はっきり出してよい", "さりげなく", "抽象的に（言われないと気づかないくらい）", "おまかせ"] },
        { k: "scale", type: "scales", label: "方向性（どちら寄りか）" },
        { k: "ng_color", label: "使ってほしくない色", more: true },
        { k: "ng_motif", label: "使ってほしくないモチーフ・避けたい雰囲気", type: "textarea", more: true },
        { k: "rule", label: "会社のデザインの決まり（必須のロゴ・色など）", type: "textarea", more: true }
      ]
    },
    {
      id: "card", name: "載せる情報", en: "On the card",
      title: "名刺に、<br class=\"sp\">何を載せますか？",
      lead: "載せたい項目にチェックを入れてください。入りきらない分は、ホームページの方に載せます。",
      fields: [
        { k: "card", type: "card", label: "名刺に載せる項目" },
        { k: "qr", type: "radio", label: "QRコードの行き先", req: true, options: ["今回つくるホームページ（おすすめ）", "ほかのURL", "QRコードは要らない"] },
        { k: "qr_url", label: "QRコードの行き先のURL", type: "url", req: true, ph: "https://", show: function (s) { return s.qr === "ほかのURL"; } },
        { k: "catch", type: "radio", label: "キャッチコピー（一言の紹介文）", options: ["自分で決めたい", "THE BONJIN に提案してほしい", "載せない"] },
        { k: "catch_txt", label: "キャッチコピー", show: function (s) { return s.catch === "自分で決めたい"; } },
        { k: "page", label: "ホームページに載せたいこと", type: "textarea", ph: "例：自己紹介、作品3つ、料金、問い合わせ先。決まっていなければ空欄で" }
      ]
    },
    {
      id: "material", name: "素材・参考", en: "Materials",
      title: "手元にある素材と、<br class=\"sp\">参考になるもの。",
      fields: [
        { k: "assets", type: "checks", label: "手元にあるもの", options: ["いま使っている名刺", "ロゴ", "顔写真", "好きな写真・画像", "参考にしたいデザイン", "会社のデザインの決まり"], hint: "ファイルは、確認メールへの返信で送ってください" },
        { k: "urls", label: "参考になるURL", type: "textarea", ph: "SNS、好きなブランドのサイト、いいなと思ったデザインなど。1行に1つ" },
        { k: "use", type: "radio", label: "送ってもらう写真や画像の使い方", options: ["名刺やページに使ってよい", "雰囲気の参考にするだけ", "送ったときに伝える"] }
      ]
    },
    {
      id: "delivery", name: "受け取り", en: "Delivery",
      title: "仕上がりの受け取り。",
      fields: [
        { type: "info", html: "<dl class=\"hr-spec\"><div><dt>名刺</dt><dd>日本の標準サイズ（91×55mm）・両面カラー・100枚</dd></div><div><dt>ホームページ</dt><dd>スマホ用の1ページ（独自ドメインは含みません）</dd></div><div><dt>お届け</dt><dd>郵送でお届けします。<b>送料込み</b>です（全国どこでも追加料金なし）</dd></div></dl>" },
        { k: "dir", type: "radio", label: "名刺の向き", options: ["横型", "縦型", "おまかせ"] },
        { k: "ship_name", label: "送り先のお名前", hint: "お名前と同じなら空欄で" },
        { k: "zip", label: "郵便番号", req: true, ac: "postal-code", ph: "例：880-0000" },
        { k: "address", label: "住所（建物名・部屋番号まで）", type: "textarea", req: true, ac: "street-address" },
        { k: "ship_tel", label: "配送用の電話番号", type: "tel", req: true, ac: "tel" },
        { k: "due", label: "いつまでに欲しいですか？", ph: "例：12月10日の交流会まで／特になし" },
        { k: "receipt", type: "radio", label: "領収書", options: ["不要", "必要"] },
        { k: "receipt_to", label: "領収書の宛名", show: function (s) { return s.receipt === "必要"; } },
        { k: "note", label: "そのほか、伝えておきたいこと", type: "textarea" }
      ]
    },
    {
      id: "confirm", name: "確認", en: "Confirm",
      title: "最後に、<br class=\"sp\">内容を確かめてください。",
      fields: [
        { type: "summary" },
        { k: "agree", type: "checks", label: "確認", req: true, all: true, options: [
          "名刺に載せる情報（名前・連絡先など）に、まちがいがありません",
          "送る写真やロゴは、自分で使ってよいものです",
          "このあと確認のメールが届き、OKのあとにお支払い・制作開始になることを確認しました",
          "回答は、この名刺とホームページの制作のためだけに使われることを確認しました（送信は外部のサービス FormSubmit を経由します）"] },
        { k: "publish", type: "radio", label: "制作事例としての紹介（任意）", options: ["紹介してよい（名前や連絡先は伏せる）", "紹介しないでほしい"], hint: "選ばなくても申し込めます" }
      ]
    }
  ];


  /* ---------- 状態 ---------- */
  var state = {}, cur = 0;
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && saved.v) { state = saved.v; cur = Math.min(saved.step || 0, STEPS.length - 1); }
  } catch (e) {}
  var resumed = cur > 0 || Object.keys(state).length > 1;
  var qp = (location.search.match(/[?&]plan=(student|general)/) || [])[1];
  if (qp && !state.plan) state.plan = qp;
  if (!state.plan) state.plan = "general";
  if (!state.card_on_name) state.card_on_name = true;

  var saveTimer, finished = false;
  function save() {
    clearTimeout(saveTimer);
    if (finished) return;
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(KEY, JSON.stringify({ v: state, step: cur, t: Date.now() })); } catch (e) {}
    }, 250);
  }

  /* ---------- 描画 ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); };
  var uid = 0;

  function fieldHTML(f) {
    var id = "f-" + (f.k || "x") + "-" + (uid++);
    var req = f.req ? "<i class=\"hr-req\">必須</i>" : "";
    var head = "<p class=\"hr-q\" id=\"" + id + "-l\">" + esc(f.label) + req + "</p>" + (f.hint ? "<p class=\"hr-hint\">" + esc(f.hint) + "</p>" : "");
    var v = state[f.k];
    var h = "";
    switch (f.type) {
      case "info": return "<div class=\"hr-info\">" + f.html + "</div>";
      case "summary": return "<div class=\"hr-summary\" id=\"hr-summary\"></div>";
      case "textarea":
        h = "<label class=\"hr-q\" for=\"" + id + "\">" + esc(f.label) + req + "</label>" + (f.hint ? "<p class=\"hr-hint\">" + esc(f.hint) + "</p>" : "") +
          "<textarea id=\"" + id + "\" data-k=\"" + f.k + "\" rows=\"3\"" + (f.ph ? " placeholder=\"" + esc(f.ph) + "\"" : "") + ">" + esc(v) + "</textarea>";
        break;
      case "radio":
      case "checks":
        var multi = f.type === "checks";
        h = head + "<div class=\"hr-opts" + (multi ? (f.all ? " long" : " multi") : "") + (f.cls ? " " + f.cls : "") + "\" role=\"" + (multi ? "group" : "radiogroup") + "\" aria-labelledby=\"" + id + "-l\">" +
          f.options.map(function (o) {
            var val = Array.isArray(o) ? o[0] : o, lab = Array.isArray(o) ? o[1] : esc(o);
            var on = multi ? (v || []).indexOf(val) >= 0 : v === val;
            return "<label class=\"hr-opt\"><input type=\"" + (multi ? "checkbox" : "radio") + "\" name=\"" + id + "\" data-k=\"" + f.k + "\" value=\"" + esc(val) + "\"" + (on ? " checked" : "") + "><span>" + lab + "</span></label>";
          }).join("") + "</div>";
        break;
      case "chips":
        h = head + "<p class=\"hr-hint\">いま <b class=\"hr-chipcount\">" + ((v || []).length) + "</b> 個</p>" + IMPRESSIONS.map(function (g) {
          return "<div class=\"hr-chipgroup\"><p class=\"hr-chipg en\">" + esc(g[0]) + "</p><div class=\"hr-chips\">" + g[1].map(function (w) {
            return "<label class=\"hr-chip\"><input type=\"checkbox\" data-k=\"" + f.k + "\" value=\"" + esc(w) + "\"" + ((v || []).indexOf(w) >= 0 ? " checked" : "") + "><span>" + esc(w) + "</span></label>";
          }).join("") + "</div></div>";
        }).join("");
        break;
      case "pickFrom":
        h = head + "<div class=\"hr-opts hr-pick\" data-pick=\"" + f.k + "\" data-from=\"" + f.from + "\" role=\"radiogroup\" aria-labelledby=\"" + id + "-l\"></div>";
        break;
      case "scales":
        h = head + "<div class=\"hr-scales\">" + SCALES.map(function (p, i) {
          var key = "scale_" + i, sv = state[key] || "おまかせ";
          return "<fieldset class=\"hr-scale\"><legend><span>" + esc(p[0]) + "</span><span>" + esc(p[1]) + "</span></legend><div class=\"hr-scale-row\">" +
            ["1", "2", "3", "4", "5"].map(function (n) {
              return "<label><input type=\"radio\" name=\"" + key + "\" data-k=\"" + key + "\" value=\"" + n + "\"" + (sv === n ? " checked" : "") + "><span aria-label=\"" + n + "\"></span></label>";
            }).join("") + "<label class=\"hr-auto\"><input type=\"radio\" name=\"" + key + "\" data-k=\"" + key + "\" value=\"おまかせ\"" + (sv === "おまかせ" ? " checked" : "") + "><span>おまかせ</span></label></div></fieldset>";
        }).join("") + "</div>";
        break;
      case "card":
        h = head + "<div class=\"hr-card\">" + CARD.map(function (c) {
          var on = !!state["card_on_" + c.k];
          var body = "";
          if (c.from) body = "<p class=\"hr-from\" data-from=\"" + c.from + "\"></p>";
          else if (c.note) body = "<p class=\"hr-hint\">" + esc(c.note) + "</p>";
          else body = "<input type=\"" + (c.type || "text") + "\" data-k=\"card_val_" + c.k + "\" value=\"" + esc(state["card_val_" + c.k]) + "\" placeholder=\"" + esc(c.ph || "") + "\" aria-label=\"" + esc(c.label) + "\">";
          var pri = c.fixed ? "" : "<select data-k=\"card_pri_" + c.k + "\" aria-label=\"" + esc(c.label) + "の優先度\">" + PRI.map(function (p) {
            return "<option value=\"" + p[0] + "\"" + ((state["card_pri_" + c.k] || "must") === p[0] ? " selected" : "") + ">" + p[1] + "</option>";
          }).join("") + "</select>";
          return "<div class=\"hr-card-row" + (on ? " on" : "") + "\"><label class=\"hr-opt\"><input type=\"checkbox\" data-k=\"card_on_" + c.k + "\"" + (on ? " checked" : "") + (c.fixed ? " disabled" : "") + "><span>" + esc(c.label) + (c.fixed ? "（必ず載せます）" : "") + "</span></label>" +
            "<div class=\"hr-card-in\">" + body + pri + "</div></div>";
        }).join("") + "</div>";
        break;
      default:
        h = "<label class=\"hr-q\" for=\"" + id + "\">" + esc(f.label) + req + "</label>" + (f.hint ? "<p class=\"hr-hint\">" + esc(f.hint) + "</p>" : "") +
          "<input id=\"" + id + "\" type=\"" + (f.type || "text") + "\" data-k=\"" + f.k + "\" value=\"" + esc(v) + "\"" + (f.ac ? " autocomplete=\"" + f.ac + "\"" : "") + (f.ph ? " placeholder=\"" + esc(f.ph) + "\"" : "") + ">";
    }
    return h + "<p class=\"hr-err\" role=\"alert\"></p>";
  }

  function render() {
    var root = $("hr-steps");
    root.innerHTML = STEPS.map(function (s, i) {
      var main = s.fields.filter(function (f) { return !f.more; });
      var more = s.fields.filter(function (f) { return f.more; });
      var wrap = function (f) { return "<div class=\"hr-field" + (f.k && f.label ? " is-q" : "") + "\" data-f=\"" + (f.k || "") + "\">" + fieldHTML(f) + "</div>"; };
      return "<section class=\"hr-step\" data-i=\"" + i + "\" hidden aria-labelledby=\"hr-t-" + i + "\">" +
        "<header class=\"hr-head\"><p class=\"hr-num en\">" + (i < 9 ? "0" : "") + (i + 1) + "</p><div><p class=\"hr-name\">" + esc(s.name) + "<span class=\"en\">" + esc(s.en) + "</span></p>" +
        "<h1 class=\"hr-title\" id=\"hr-t-" + i + "\" tabindex=\"-1\">" + s.title + "</h1></div></header>" +
        (s.lead ? "<p class=\"hr-lead\">" + s.lead + "</p>" : "") +
        (s.about ? "<p class=\"hr-about-count\">「好きなもの」と「人物像」で、合わせて " + MIN_ABOUT + " 問以上答えてください。いま <b class=\"hr-about-n\">0</b> 問</p>" : "") +
        main.map(wrap).join("") +
        (more.length ? "<details class=\"hr-more\"" + (more.some(function (f) { return filled(state[f.k]); }) ? " open" : "") + "><summary>もっと答える（任意・" + more.length + "問）</summary>" + more.map(wrap).join("") + "</details>" : "") +
        "</section>";
    }).join("");
    refresh();
  }

  function filled(v) { return Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim()); }

  function fieldDef(k) {
    for (var i = 0; i < STEPS.length; i++) for (var j = 0; j < STEPS[i].fields.length; j++) if (STEPS[i].fields[j].k === k) return STEPS[i].fields[j];
    return null;
  }

  function aboutCount() {
    var n = 0;
    STEPS.forEach(function (s) { if (s.about) s.fields.forEach(function (f) { if (filled(state[f.k])) n++; }); });
    return n;
  }

  /* 表示・非表示、件数、引き継ぎ表示などを今の答えに合わせる */
  function refresh() {
    document.querySelectorAll(".hr-field").forEach(function (el) {
      var f = fieldDef(el.getAttribute("data-f"));
      if (f && f.show) el.hidden = !f.show(state);
    });
    document.querySelectorAll(".hr-about-n").forEach(function (b) { b.textContent = aboutCount(); });
    document.querySelectorAll(".hr-chipcount").forEach(function (b) { b.textContent = (state.imp || []).length; });
    document.querySelectorAll(".hr-pick").forEach(function (box) {
      var k = box.getAttribute("data-pick"), list = state[box.getAttribute("data-from")] || [];
      if (state[k] && list.indexOf(state[k]) < 0) delete state[k];
      box.innerHTML = list.length ? list.map(function (w) {
        return "<label class=\"hr-opt\"><input type=\"radio\" name=\"pick-" + k + "\" data-k=\"" + k + "\" value=\"" + esc(w) + "\"" + (state[k] === w ? " checked" : "") + "><span>" + esc(w) + "</span></label>";
      }).join("") : "<p class=\"hr-hint\">上で選ぶと、ここに出てきます。</p>";
    });
    document.querySelectorAll(".hr-from").forEach(function (p) {
      var v = state[p.getAttribute("data-from")];
      p.textContent = v ? "＝ " + v + "（基本情報の答え）" : "基本情報で入力した内容を使います";
    });
    document.querySelectorAll(".hr-card-row").forEach(function (row) {
      var cb = row.querySelector("input[type=checkbox]");
      row.classList.toggle("on", cb.checked);
    });
  }

  function show(i, focus) {
    cur = i;
    document.querySelectorAll(".hr-step").forEach(function (s) { s.hidden = +s.getAttribute("data-i") !== i; });
    var s = STEPS[i];
    $("hr-count").textContent = (i < 9 ? "0" : "") + (i + 1) + " / " + STEPS.length;
    $("hr-stepname").textContent = s.name;
    $("hr-bar").style.width = ((i + 1) / STEPS.length * 100) + "%";
    $("hr-back").hidden = i === 0;
    $("hr-next").textContent = i === STEPS.length - 1 ? "この内容で送る" : (i === 0 ? "はじめる" : "次へ");
    if (s.id === "confirm") summary();
    save();
    window.scrollTo({ top: 0, behavior: "instant" });
    if (focus) { var t = $("hr-t-" + i); if (t) t.focus({ preventScroll: true }); }
  }

  /* ---------- 入力 ---------- */
  function onInput(e) {
    var el = e.target, k = el.getAttribute("data-k");
    if (!k) return;
    if (el.type === "checkbox" && !/^card_on_/.test(k)) {
      var list = (state[k] || []).slice(), i = list.indexOf(el.value);
      if (el.checked && i < 0) list.push(el.value);
      if (!el.checked && i >= 0) list.splice(i, 1);
      var f = fieldDef(k);
      if (f && f.max && list.length > f.max) { el.checked = false; list.pop(); flash(el, f.max + "個までです"); }
      state[k] = list;
    } else if (el.type === "checkbox") {
      state[k] = el.checked;
    } else {
      state[k] = el.value;
    }
    var fe = el.closest(".hr-field");
    if (fe) { fe.classList.remove("bad"); var er = fe.querySelector(".hr-err"); if (er) er.textContent = ""; }
    refresh();
    save();
    $("hr-saved").textContent = "保存しました";
  }
  function flash(el, msg) {
    var fe = el.closest(".hr-field"), er = fe && fe.querySelector(".hr-err");
    if (er) er.textContent = msg;
  }

  /* ---------- 確認 ---------- */
  function validate(i) {
    var s = STEPS[i], first = null;
    var mark = function (k, msg) {
      var fe = document.querySelector(".hr-step[data-i=\"" + i + "\"] .hr-field[data-f=\"" + k + "\"]");
      if (!fe) return;
      fe.classList.add("bad");
      fe.querySelector(".hr-err").textContent = msg;
      if (fe.closest("details")) fe.closest("details").open = true;
      if (!first) first = fe;
    };
    s.fields.forEach(function (f) {
      if (!f.k || (f.show && !f.show(state))) return;
      var v = state[f.k];
      if (f.req && !f.optionalWhenSame && !filled(v)) return mark(f.k, f.type === "radio" || f.type === "pickFrom" ? "ひとつ選んでください" : (f.type === "checks" ? "ひとつ以上選んでください" : "入力してください"));
      if (f.type === "email" && filled(v) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return mark(f.k, "メールアドレスの形を確かめてください");
      if (f.type === "url" && filled(v) && !/^https?:\/\/\S+$/.test(v)) return mark(f.k, "https:// から始まるURLを入れてください");
      if (f.min && (v || []).length < f.min) return mark(f.k, f.min + "個以上えらんでください（いま " + (v || []).length + " 個）");
      if (f.all && (v || []).length < f.options.length) return mark(f.k, "すべてにチェックを入れてください");
    });
    if (s.id === "person" && aboutCount() < MIN_ABOUT) {
      var box = document.querySelector(".hr-step[data-i=\"" + i + "\"] .hr-about-count");
      box.classList.add("bad");
      box.innerHTML = "あと <b>" + (MIN_ABOUT - aboutCount()) + "</b> 問、答えてください。「好きなもの」に戻って答えても大丈夫です。（いま <b class=\"hr-about-n\">" + aboutCount() + "</b> 問）";
      if (!first) first = box;
    }
    if (first) {
      first.scrollIntoView({ behavior: "smooth", block: "center" });
      var inp = first.querySelector && first.querySelector("input,textarea,select");
      if (inp) setTimeout(function () { inp.focus({ preventScroll: true }); }, 300);
      return false;
    }
    return true;
  }

  /* ---------- 回答をまとめる（確認画面・メール共通） ---------- */
  function fmt(f, v) {
    if (Array.isArray(v)) return v.join("、");
    if (f && f.options) {
      for (var i = 0; i < f.options.length; i++) {
        var o = f.options[i];
        if (Array.isArray(o) && o[0] === v) return o[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
      }
    }
    return String(v);
  }

  function collect() {
    var out = [];
    STEPS.forEach(function (s, si) {
      var rows = [];
      s.fields.forEach(function (f) {
        if (!f.k || (f.show && !f.show(state)) || f.k === "agree") return;
        if (f.type === "scales") {
          SCALES.forEach(function (p, i) {
            var v = state["scale_" + i] || "おまかせ";
            if (v !== "おまかせ") rows.push([p[0] + " ⇄ " + p[1], v + "（1＝" + p[0] + "、5＝" + p[1] + "）"]);
          });
          return;
        }
        if (f.type === "card") {
          CARD.forEach(function (c) {
            if (!state["card_on_" + c.k]) return;
            var val = c.from ? (state[c.from] || "") : (c.note ? "あり（素材はメールで）" : (state["card_val_" + c.k] || "（未入力）"));
            var pri = c.fixed ? "必ず載せる" : PRI.filter(function (p) { return p[0] === (state["card_pri_" + c.k] || "must"); })[0][1];
            rows.push(["名刺：" + c.label, val + "　［" + pri + "］"]);
          });
          return;
        }
        var v = state[f.k];
        if (f.k === "ship_name" && !filled(v)) v = state.name;
        if (filled(v)) rows.push([f.label, fmt(f, v)]);
      });
      if (rows.length) out.push({ i: si, name: s.name, rows: rows });
    });
    return out;
  }

  function summary() {
    var box = $("hr-summary");
    if (!box) return;
    box.innerHTML = collect().filter(function (g) { return STEPS[g.i].id !== "confirm"; }).map(function (g) {
      return "<div class=\"hr-sum\"><div class=\"hr-sum-h\"><p>" + esc(g.name) + "</p><button type=\"button\" data-go=\"" + g.i + "\">直す</button></div><dl>" +
        g.rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]).replace(/\n/g, "<br>") + "</dd></div>"; }).join("") + "</dl></div>";
    }).join("");
  }

  /* ---------- 送信 ---------- */
  function orderNo() {
    var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; };
    var r = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "BJ-" + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + "-" + r;
  }
  function stamp() {
    var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "/" + p(d.getMonth() + 1) + "/" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  function plainText(no) {
    return "受付番号：" + no + "\n" + collect().map(function (g) {
      return "■ " + g.name + "\n" + g.rows.map(function (r) { return "・" + r[0] + "：" + r[1]; }).join("\n");
    }).join("\n\n");
  }

  function send() {
    if (document.querySelector("[name=_honey]").value) return;
    var btn = $("hr-next");
    var no = state._no || (state._no = orderNo());
    var plan = PLANS[state.plan] || PLANS.general;
    var data = {};
    data["受付番号"] = no;
    data["プラン"] = plan.name + "（" + plan.price + "）";
    data["制作メモ"] = "最優先の印象：" + (state.imp_top || "—") + "／印象：" + (state.imp || []).join("・") +
      "／自由度：" + (state.freedom || "—") + "／個性の出し方：" + (state.express || "—") + "／使う場面：" + (state.purpose || []).join("・");
    collect().forEach(function (g) {
      if (STEPS[g.i].id === "start") return; // プランは上の「プラン」に入れてある
      g.rows.forEach(function (r) {
        var key = g.name + "｜" + r[0], n = 2;
        while (data[key]) key = g.name + "｜" + r[0] + " (" + (n++) + ")";
        data[key] = r[1];
      });
    });
    data["送信日時"] = stamp();
    data._subject = "【ヒアリング " + no + "】" + plan.name + "｜" + (state.name || "お名前なし") + " さま";
    data._template = "table";
    data._captcha = "false";
    if (state.email) data._replyto = state.email;

    btn.disabled = true; btn.textContent = "送信しています…";
    var err = $("hr-send-err");
    if (err) err.remove();

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (j) {
        if (!res.ok || String(j.success) === "false") throw new Error(j.message || res.status);
      });
    }).then(function () {
      finished = true;
      clearTimeout(saveTimer);
      try { localStorage.removeItem(KEY); } catch (e) {}
      $("hr-form").hidden = true;
      document.querySelector(".hr-progress").hidden = true;
      $("hr-resume").hidden = true;
      $("hr-done-no").textContent = no;
      $("hr-done-mail").textContent = state.email || "ご入力のメールアドレス";
      $("hr-done").hidden = false;
      window.scrollTo({ top: 0, behavior: "instant" });
      $("hr-done").focus();
    }).catch(function () {
      btn.disabled = false; btn.textContent = "もう一度送る";
      var text = plainText(no);
      var p = document.createElement("div");
      p.id = "hr-send-err";
      p.className = "hr-send-err";
      p.setAttribute("role", "alert");
      p.innerHTML = "うまく送信できませんでした。回答はこの端末に残っています。<br>時間をおいてもう一度送るか、" +
        "<button type=\"button\" id=\"hr-copy\">回答をコピー</button>して、<a href=\"mailto:" + MAILTO + "?subject=" + encodeURIComponent(data._subject) + "\">メール</a>に貼り付けて送ってください。";
      $("hr-nav").after(p);
      $("hr-copy").addEventListener("click", function () {
        var done = function () { $("hr-copy").textContent = "コピーしました"; };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { window.prompt("この内容をコピーしてください", text); });
        else window.prompt("この内容をコピーしてください", text);
      });
    });
  }

  /* ---------- 起動 ---------- */
  render();
  var form = $("hr-form");
  form.addEventListener("input", onInput);
  form.addEventListener("change", onInput);
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "checkbox" && e.target.type !== "radio") e.preventDefault();
  });
  form.addEventListener("click", function (e) {
    var go = e.target.closest("[data-go]");
    if (go) show(+go.getAttribute("data-go"), true);
  });
  $("hr-next").addEventListener("click", function () {
    if (!validate(cur)) return;
    if (cur === STEPS.length - 1) send();
    else show(cur + 1, true);
  });
  $("hr-back").addEventListener("click", function () { if (cur > 0) show(cur - 1, true); });
  if (resumed) {
    $("hr-resume").hidden = false;
    $("hr-reset").addEventListener("click", function () {
      if (!window.confirm("入力した内容を消して、最初からやり直しますか？")) return;
      try { localStorage.removeItem(KEY); } catch (e) {}
      location.href = location.pathname + (state.plan ? "?plan=" + state.plan : "");
    });
  }
  show(cur, false);
})();
