"""トップページ（index.html）の、content.js から JavaScript で書き込む部分を、
あらかじめ HTML の中にも書いておく（プリレンダー）。

なぜ：Google は JavaScript を動かしてから読むが、ChatGPT・Claude・Perplexity などの
AI のクローラーの多くは動かさない。書いておかないと、事業・メンバー・実績・団体概要が見えない。
表示は今までどおり main.js が同じ場所を描き直すので、見た目は変わらない。

使い方: content.js を直したら  python3 tools/prerender.py
（Google Chrome を使う。書き込んだ部分は <!--pre:ID--> 〜 <!--/pre:ID--> で囲まれ、次の実行で置き換わる）"""
import pathlib, re, subprocess, tempfile
import lxml.html

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / "index.html"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
IDS = ["hero-place", "hero-copy", "intro-label", "intro-heading", "intro-body", "stats", "svc-list",
       "msg-label", "msg-heading", "msg-body", "ledger", "products-list", "co-label", "co-heading",
       "co-table", "svc-contact", "svc-flow", "f-credits", "f-links", "f-vol", "f-colophon"]

def render():
    with tempfile.TemporaryDirectory() as tmp:
        out = subprocess.run([CHROME, "--headless=new", "--disable-gpu", f"--user-data-dir={tmp}",
                              "--virtual-time-budget=4000", "--dump-dom", PAGE.as_uri()],
                             capture_output=True, text=True, check=True).stdout
    return lxml.html.fromstring(out)

def inner(el):
    parts = [lxml.html.tostring(c, encoding="unicode", with_tail=True) for c in el]
    return (el.text or "").replace("&", "&amp;").replace("<", "&lt;") + "".join(parts)

def main():
    doc = render()
    src = PAGE.read_text(encoding="utf-8")
    done = []
    for i in IDS:
        found = doc.get_element_by_id(i, None)
        if found is None:
            continue
        html = inner(found).strip()
        if not html:
            continue
        block = f"<!--pre:{i}-->{html}<!--/pre:{i}-->"
        if f"<!--pre:{i}-->" in src:
            src = re.sub(rf"<!--pre:{re.escape(i)}-->.*?<!--/pre:{re.escape(i)}-->", lambda m: block, src, flags=re.S)
        else:
            pat = re.compile(rf'(<(\w+)\b[^>]*\bid="{re.escape(i)}"[^>]*>)\s*(</\2>)')
            if not pat.search(src):
                print("skip (中身があるか見つからない):", i)
                continue
            src = pat.sub(lambda m: m.group(1) + block + m.group(3), src, count=1)
        done.append(i)
    PAGE.write_text(src, encoding="utf-8")
    print("prerendered:", len(done), "blocks")

if __name__ == "__main__":
    main()
