#!/usr/bin/env python3
"""
Content-preservation check: every text fragment, link, meta tag and JSON-LD block in the
original pages (legacy/content/pages) must appear unchanged in the rendered redesign.

    npm run build && npm start     # in another terminal
    python3 scripts/verify-content.py [http://localhost:3200]

Exits non-zero and lists anything missing.
"""
import html, os, re, sys, urllib.request
sys.path.insert(0, os.path.dirname(__file__))
from dom import parse

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3200").rstrip("/")
ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "legacy", "content", "pages"))
PAGES = {"/": "index.html", "/services/": "services/index.html", "/work/": "work/index.html",
         "/about/": "about/index.html", "/contact/": "contact/index.html", "/__missing__/": "404.html",
         **{f"/services/{s}/": f"services/{s}/index.html" for s in ["seo", "paid-ads", "brand-building", "growth-marketing", "marketing-automation"]}}
SKIP_TAGS = {"script", "style", "svg", "noscript", "head", "canvas"}
# aria-hidden nodes in the original (e.g. the decorative marquees) are ornament, not content, and are not required

def norm(s): return re.sub(r"\s+", " ", html.unescape(s)).strip()

def text_runs(node, out):
    for c in node.children:
        if isinstance(c, str):
            t = norm(c)
            if t: out.append(t)
        elif c.tag not in SKIP_TAGS and c.attrs.get("aria-hidden") != "true":
            text_runs(c, out)

def all_text(node):
    parts = []
    def walk(n):
        for c in n.children:
            if isinstance(c, str): parts.append(c)
            elif c.tag not in SKIP_TAGS: walk(c)
    walk(node)
    return norm(" ".join(parts))

def fetch(path):
    try:
        return urllib.request.urlopen(BASE + path).read().decode("utf-8")
    except urllib.error.HTTPError as e:   # the 404 page legitimately returns 404
        return e.read().decode("utf-8")

def meta_map(root):
    h = root.find("head"); m = {}
    t = h.find("title")
    if t: m["title"] = {norm(t.raw_inner())}
    for n in h.find_all("meta"):
        k = n.attrs.get("name") or n.attrs.get("property")
        if k and k not in ("viewport", "theme-color", "next-size-adjust"): m.setdefault(k, set()).add(norm(n.attrs.get("content", "")))
    c = h.find("link", rel="canonical")
    if c: m["canonical"] = {c.attrs["href"]}
    return m

failures, checked = [], 0
for path, src in PAGES.items():
    orig = parse(open(os.path.join(ROOT, src), encoding="utf-8").read())
    new_html = fetch(path); new = parse(new_html)
    # body copy: header, main and footer of the original
    body = orig.find("body"); runs = []
    text_runs(body, runs)
    haystack = all_text(new.find("body"))
    for r in dict.fromkeys(runs):
        checked += 1
        if r not in haystack: failures.append(f"{path}  TEXT  {r!r}")
    # links (href targets)
    new_hrefs = {a.attrs.get("href") for a in new.find_all("a")} | {a.attrs.get("href", "").rstrip("/") + "/" for a in new.find_all("a")}
    for a in body.find_all("a"):
        h = a.attrs.get("href")
        if h and h not in new_hrefs and h != "#main":
            failures.append(f"{path}  LINK  {h}")
        checked += 1
    # head metadata
    om, nm = meta_map(orig), meta_map(new)
    for k, vals in om.items():
        for v in vals:   # every original value must be present (Next may add its own extra tags)
            checked += 1
            if v not in nm.get(k, set()): failures.append(f"{path}  META  {k}: original={v!r} new={nm.get(k)!r}")
    # structured data, byte-for-byte
    for s in orig.find_all("script", type="application/ld+json"):
        checked += 1
        if s.raw_inner().strip() not in new_html: failures.append(f"{path}  JSON-LD  block missing")

print(f"checked {checked} items across {len(PAGES)} pages")
if failures:
    print(f"{len(failures)} problems:"); print("\n".join(failures)); sys.exit(1)
print("ALL ORIGINAL CONTENT PRESENT")
