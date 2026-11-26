"""ページごとの SEO・AIO 用の <head> を書き換える。
使い方: python3 tools/seo.py   （BASE を変えれば独自ドメインに一括で切り替わる）"""
import json, re, html, pathlib
BASE = "https://itoshiyou.github.io/thebonjin/"
ROOT = pathlib.Path(__file__).resolve().parent.parent
ORG_ID = BASE + "#org"
JP = {"@type": "Country", "name": "日本"}
ORG = {
  "@type": "Organization", "@id": ORG_ID, "name": "THE BONJIN", "alternateName": ["ザ・ボンジン", "凡人"],
  "url": BASE, "logo": BASE + "assets/logo.jpg", "contactPoint": {"@type": "ContactPoint", "contactType": "仕事の依頼・相談", "url": BASE + "web.html#contact", "areaServed": "JP", "availableLanguage": "ja"},
  "description": "宮崎を拠点に、ゲームとアプリを作る学生の開発集団。ホームページ・名刺の制作、AIでの業務改善、iPhoneアプリ・ゲーム開発を全国からオンラインで受け付けている。",
  "address": {"@type": "PostalAddress", "addressRegion": "宮崎県", "addressCountry": "JP"},
  "areaServed": JP,
  "member": [{"@id": BASE + "members/ozono.html#person"}, {"@id": BASE + "members/gitpullpull.html#person"}],
  "sameAs": ["https://line.me/R/ti/p/@629zrowt", "https://github.com/ItoShiyou/thebonjin"],
}
OZONO = {"@type": "Person", "@id": BASE + "members/ozono.html#person", "name": "尾薗圭亮", "alternateName": "OZONO KEITO",
  "jobTitle": "運営・企画・制作", "affiliation": {"@type": "CollegeOrUniversity", "name": "宮崎大学 医学部医学科"},
  "alumniOf": {"@type": "CollegeOrUniversity", "name": "電気通信大学"}, "worksFor": {"@id": ORG_ID},
  "sameAs": ["https://x.com/itoushiyou", "https://www.instagram.com/keito_ozono/", "https://github.com/itoshiyou", "https://note.com/kohs2021"]}
UBU = {"@type": "Person", "@id": BASE + "members/gitpullpull.html#person", "name": "生方", "alternateName": "gitpullpull",
  "jobTitle": "技術的サポート", "affiliation": {"@type": "CollegeOrUniversity", "name": "東洋大学"}, "worksFor": {"@id": ORG_ID},
  "award": "人工知能学会 全国大会優秀賞（2026・単著）",
  "sameAs": ["https://x.com/gitpullpull", "https://github.com/gitpullpull", "https://arxiv.org/abs/2602.21786"]}
APPS = [("ロウソク行脚","https://apps.apple.com/jp/app/id6822286730","GameApplication"),("光の窓割り","https://apps.apple.com/jp/app/id6824348602","GameApplication"),
  ("Focus Wave","https://apps.apple.com/jp/app/id6824796019","LifestyleApplication"),("おもいで百貨店","https://apps.apple.com/jp/app/id6829372905","GameApplication"),
  ("ハンダン","https://apps.apple.com/jp/app/id6831944228","EducationalApplication"),("つみあげ出前","https://apps.apple.com/jp/app/id6829997215","GameApplication")]

def service(name, stype, desc, url, price=None, audience=None):
    d = {"@type": "Service", "@id": url + "#service", "name": name, "serviceType": stype, "description": desc,
         "provider": {"@id": ORG_ID}, "areaServed": JP, "url": url,
         "availableChannel": {"@type": "ServiceChannel", "serviceUrl": url + "#contact", "name": "フォーム・メール・オンライン"}}
    if price: d["offers"] = {"@type": "Offer", "price": str(price), "priceCurrency": "JPY", "url": url, "availability": "https://schema.org/InStock"}
    if audience: d["audience"] = {"@type": "Audience", "audienceType": audience}
    return d

PAGES = {
 "index.html": dict(path="", crumb=None,
   title="THE BONJIN｜宮崎の学生開発集団 — 名刺・ホームページ・アプリ制作（全国オンライン対応）",
   desc="宮崎の学生開発集団 THE BONJIN。名刺×ホームページ（税込7,500円・学割4,980円）、ホームページ制作、中小企業のAI業務改善、iPhoneアプリ・ゲーム開発。全国どこからでもオンラインで相談できます。",
   extra=lambda u: [ORG, OZONO, UBU, {"@type": "WebSite", "@id": BASE + "#website", "url": BASE, "name": "THE BONJIN", "inLanguage": "ja", "publisher": {"@id": ORG_ID}},
     {"@type": "OfferCatalog", "name": "THE BONJIN の事業", "itemListElement": [
       {"@type": "Offer", "itemOffered": {"@id": BASE + "web.html#service"}, "price": "7500", "priceCurrency": "JPY"},
       {"@type": "Offer", "itemOffered": {"@id": BASE + "student.html#service"}, "price": "4980", "priceCurrency": "JPY"},
       {"@type": "Offer", "itemOffered": {"@id": BASE + "ai.html#service"}},
       {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "ホームページ制作（応相談）"}},
       {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "iPhoneアプリ開発"}},
       {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "ゲーム開発"}},
       {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Tシャツ制作（準備中）"}}]}]),
 "web.html": dict(path="web.html", crumb="名刺 × ホームページ",
   title="名刺とホームページ制作 税込7,500円｜全国オンライン対応 — THE BONJIN",
   desc="名刺とホームページを同じデザインで制作。税込7,500円（名刺100枚の印刷代込み・修正2回まで）。宮崎の学生開発集団 THE BONJIN が、全国どこからでもオンラインで対応します。相談は無料。",
   extra=lambda u: [service("名刺×ホームページ同時制作", "名刺・ホームページ制作", "名刺とスマホ向けホームページを同じデザインでつくる。名刺100枚の印刷代込み、修正2回まで。", u, 7500, "個人・フリーランス・店舗・中小企業")]),
 "student.html": dict(path="student.html", crumb="学割 名刺＋ホームページ",
   title="学割 名刺＋ホームページ 税込4,980円｜学生・新社会人向け・全国対応 — THE BONJIN",
   desc="学生・新社会人のための、名刺とホームページのセット。学割 税込4,980円ポッキリ（名刺100枚の印刷代込み）、修正2回まで。宮崎の学生開発集団 THE BONJIN が、全国どこからでもオンラインで受け付けます。",
   extra=lambda u: [service("学割 名刺＋ホームページ", "名刺・ホームページ制作（学割）", "学生・新社会人向けの名刺とホームページのセット。名刺100枚の印刷代込み、修正2回まで、独自ドメインなし。", u, 4980, "学生・新社会人")]),
 "ai.html": dict(path="ai.html", crumb="AI業務改善支援",
   title="中小企業のAI業務改善支援｜初回ヒアリング無料・全国オンライン対応 — THE BONJIN",
   desc="中小企業の現場の困りごとを聞き、AIで試せる仕事を一緒に選びます。まず一つの業務で試し、社内で使えるテンプレートと手順書にまとめます。初回ヒアリング無料、全国オンライン対応（宮崎県内は対面も可）。",
   extra=lambda u: [service("AI業務改善支援", "中小企業向けAI活用・業務改善の支援", "現場の困りごとを聞き取り、AIで試せる業務を選んで試作し、社内で使えるテンプレートと手順書にまとめる。初回ヒアリング無料。", u, None, "中小企業")]),
 "apps.html": dict(path="apps.html", crumb="アプリ",
   title="アプリ一覧（App Store 公開中6本）— THE BONJIN",
   desc="THE BONJIN の尾薗圭亮が App Store で公開中のiPhoneアプリ全6本。ロウソク行脚、光の窓割り、Focus Wave、おもいで百貨店、ハンダン、つみあげ出前。アプリ・ゲームの開発依頼も受け付けています。",
   extra=lambda u: [{"@type": "ItemList", "name": "App Store 公開中のアプリ", "itemListElement": [
     {"@type": "ListItem", "position": i + 1, "item": {"@type": "MobileApplication", "name": n, "url": l, "applicationCategory": c, "operatingSystem": "iOS", "author": {"@id": BASE + "members/ozono.html#person"}}}
     for i, (n, l, c) in enumerate(APPS)]}]),
 "members/ozono.html": dict(path="members/ozono.html", crumb="尾薗圭亮",
   title="尾薗圭亮（宮崎大学医学部）— THE BONJIN",
   desc="尾薗圭亮（OZONO KEITO）。宮崎大学医学部医学科。THE BONJIN の運営・企画・制作を担当。App Store に自作アプリ6本を公開中。",
   extra=lambda u: [dict(OZONO, url=u)]),
 "members/gitpullpull.html": dict(path="members/gitpullpull.html", crumb="生方（gitpullpull）",
   title="生方（gitpullpull）— THE BONJIN",
   desc="生方（東洋大学）。gitpullpull 名義で活動する ML Engineer。小型LLMの推論効率化「D-CoT」で人工知能学会 全国大会優秀賞（2026・単著）。THE BONJIN では技術的サポートを担当。",
   extra=lambda u: [dict(UBU, url=u)]),
}

def faq(text):
    qs = re.findall(r"<details><summary>(.*?)</summary>(.*?)</details>", text, re.S)
    clean = lambda h: html.unescape(re.sub(r"<[^>]+>", "", h)).strip()
    return [{"@type": "Question", "name": clean(q), "acceptedAnswer": {"@type": "Answer", "text": clean(a)}} for q, a in qs]

for f, d in PAGES.items():
    p = ROOT / f; s = p.read_text(encoding="utf-8")
    url = BASE + d["path"]
    graph = d["extra"](url)
    g = {"@type": "WebPage", "@id": url + "#webpage", "url": url, "name": d["title"], "description": d["desc"], "inLanguage": "ja", "isPartOf": {"@id": BASE + "#website"}, "about": {"@id": ORG_ID}}
    graph.append(g)
    if d["crumb"]:
        graph.append({"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "THE BONJIN", "item": BASE},
            {"@type": "ListItem", "position": 2, "name": d["crumb"], "item": url}]})
    q = faq(s)
    if q: graph.append({"@type": "FAQPage", "@id": url + "#faq", "mainEntity": q})
    ld = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, separators=(",", ":"))
    e = html.escape
    s = re.sub(r"<title>.*?</title>", "<title>" + e(d["title"], False) + "</title>", s, 1, re.S)
    s = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="' + e(d["desc"]) + '">', s, 1)
    s = re.sub(r'\n<link rel="canonical"[^>]*>', "", s)
    s = s.replace('<meta property="og:type"', '<link rel="canonical" href="' + url + '">\n<meta property="og:type"', 1)
    s = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="' + e(d["title"]) + '">', s, 1)
    s = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="' + e(d["desc"]) + '">', s, 1)
    s = re.sub(r'<meta property="og:url" content="[^"]*">', '<meta property="og:url" content="' + url + '">', s, 1)
    s = re.sub(r'<meta property="og:image" content="[^"]*">', '<meta property="og:image" content="' + BASE + 'assets/poster2.png">', s, 1)
    s = re.sub(r'\n<script type="application/ld\+json">.*?</script>', "", s, flags=re.S)
    s = s.replace("</head>", '<script type="application/ld+json">' + ld + "</script>\n</head>", 1)
    p.write_text(s, encoding="utf-8")
    print(f, "faq:", len(q))

# ---- robots.txt / sitemap.xml / llms.txt ----
import datetime
today = datetime.date.today().isoformat()
pri = {"": "1.0", "web.html": "0.9", "student.html": "0.9", "ai.html": "0.9", "apps.html": "0.6"}
(ROOT / "sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(
    f"  <url><loc>{BASE + d['path']}</loc><lastmod>{today}</lastmod><priority>{pri.get(d['path'], '0.5')}</priority></url>\n" for d in PAGES.values()) + "</urlset>\n", encoding="utf-8")
(ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /shots/\n\nSitemap: {BASE}sitemap.xml\n", encoding="utf-8")
(ROOT / "llms.txt").write_text(f"""# THE BONJIN（ザ・ボンジン）

> 宮崎を拠点に、ゲームとアプリを作る学生の開発集団。名刺とホームページの制作、中小企業のAI業務改善、iPhoneアプリ・ゲーム開発を、全国からオンラインで受け付けている（宮崎県内は対面も可）。相談は無料。

- 拠点：宮崎県（宮崎大学）／東京
- 対応エリア：日本全国（オンライン）
- 相談の窓口：各サービスページの相談フォーム（例：{BASE}web.html#contact）
- 公式LINE：https://line.me/R/ti/p/@629zrowt

## サービスと料金

- [名刺 × ホームページ]({BASE}web.html)：名刺とスマホ向けホームページを同じデザインで制作。税込7,500円（名刺100枚の印刷代込み、修正2回まで、独自ドメインは含まない）。会社のホームページ単体は応相談。
- [学割 名刺＋ホームページ]({BASE}student.html)：学生・新社会人向け。税込4,980円ポッキリ（名刺100枚の印刷代込み、修正2回まで、独自ドメインなし）。
- [AI業務改善支援]({BASE}ai.html)：中小企業向け。現場の困りごとを聞き取り、AIで試せる業務を一つ選んで試作し、社内で使えるテンプレートと手順書にまとめる。初回ヒアリング無料。使うツールが決まっていなくても相談できる。
- アプリ開発・ゲーム開発・システム開発：企画から App Store 公開まで。料金は応相談。
- Tシャツ制作：準備中。

## 実績

- [App Store 公開中のアプリ 6本]({BASE}apps.html)：ロウソク行脚／光の窓割り／Focus Wave／おもいで百貨店／ハンダン／つみあげ出前
- D-CoT（小型LLMの推論効率化の研究）：人工知能学会 全国大会優秀賞（2026・単著、gitpullpull）https://arxiv.org/abs/2602.21786

## メンバー

- [尾薗圭亮]({BASE}members/ozono.html)：運営・企画・制作。宮崎大学医学部医学科。
- [生方]({BASE}members/gitpullpull.html)：技術的サポート。東洋大学。gitpullpull 名義でも活動。
- サブメンバー：梶川、gitpullpull、伊藤しよう

## よくある質問

- 宮崎県外からでも頼める？ → はい。やりとりはフォーム・メール・オンラインで行い、全国から受け付ける。
- 文章や写真がなくても頼める？ → はい。何を載せるかの整理から一緒に考える。
- 学生に任せて大丈夫？ → 聞き取り・試作・説明は学生チームが担当する。詳しくは各ページの「よくある質問」を参照。
""", encoding="utf-8")
