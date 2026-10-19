#!/usr/bin/env python3
"""
Extracts every piece of copy, link and SEO tag from the original site
(../content/pages/*.html) into studio/content/site.json.

The redesign renders ONLY from this file, so wording is copied mechanically,
never retyped. Re-run after editing the original pages:

    python3 scripts/extract-content.py
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from dom import parse, Node

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "content", "pages"))
OUT = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "content", "site.json"))
JS = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "public", "assets", "js", "main.js"))

def ws(s): return re.sub(r"\s+", " ", s).strip()

def html(n, keep_hidden=False):
    """Inner HTML, collapsed, without svg / decorative aria-hidden nodes."""
    if n is None: return None
    out = []
    for c in n.children:
        if isinstance(c, str): out.append(c); continue
        if c.tag == "svg": continue
        if not keep_hidden and c.attrs.get("aria-hidden") == "true": continue
        if c.tag == "br": out.append("<br>"); continue
        if c.tag in ("strong", "em", "b", "i", "small"):
            out.append(f"<{c.tag}>{html(c)}</{c.tag}>"); continue
        out.append(html(c))
    return ws("".join(out))

def html_except(n, *tags):
    """Inner HTML of n, skipping direct children with the given tags."""
    tmp = Node(n.tag, n.attrs); tmp.children = [c for c in n.children if isinstance(c, str) or c.tag not in tags]
    return html(tmp)

def svg(n):
    s = n.find("svg") if n else None
    return s.html() if s else None

def link(a):
    d = {"href": a.attrs.get("href"), "label": html(a)}
    for k in ("target", "rel", "aria-label"):
        if a.attrs.get(k): d[k] = a.attrs[k]
    return d

def chips(n): return [html(c) for c in n.find_all(cls="chip")] if n else []

def kin_lines(h1):
    return [{"html": html(i), "accent": "foil" in i.classes} for i in h1.find_all("i")]

def faq(sec):
    return {"label": html(sec.find(cls="label")),
            "items": [{"q": html(d.find("summary")), "a": html(d.find("p"))} for d in sec.find_all("details")]}

def cta(sec):
    btns = sec.find_all("a", cls="btn")
    return {"label": html(sec.find(cls="label")), "title": html(sec.find("h2")), "lede": html(sec.find("p")),
            "buttons": [link(a) for a in btns]}

def crumbs(sec):
    ol = sec.find("ol", cls="crumbs")
    if not ol: return []
    out = []
    for li in ol.kids("li"):
        a = li.find("a")
        out.append({"href": a.attrs["href"], "label": html(a)} if a else {"label": html(li)})
    return out

def phero(sec):
    lede = sec.find("p", cls="lede")
    return {"crumbs": crumbs(sec), "label": html(sec.find(cls="label")), "h1": kin_lines(sec.find("h1")),
            "lede": html(lede), "buttons": [link(a) for a in sec.find_all("a", cls="btn")]}

def head_meta(root):
    h = root.find("head")
    m = {"title": html(h.find("title")), "meta": [], "links": [], "jsonld": []}
    for n in h.find_all("meta"):
        if n.attrs.get("charset") or n.attrs.get("name") == "viewport": continue
        m["meta"].append({k: v for k, v in n.attrs.items()})
    for n in h.find_all("link"):
        if n.attrs.get("rel") == "canonical": m["canonical"] = n.attrs["href"]
    for s in h.find_all("script", type="application/ld+json"):
        m["jsonld"].append(s.raw_inner().strip())
    return m

def stats(n):
    out = []
    for s in n.find_all(cls="stat"):
        v = s.find(cls="stat__n"); span = v.find("span")
        d = {"value": html(v), "label": html(s.find(cls="stat__l"))}
        if span is not None and span.attrs.get("data-count"):
            d["count"] = span.attrs["data-count"]; d["suffix"] = span.attrs.get("data-suf", ""); d["prefix"] = span.attrs.get("data-pre", "")
        out.append(d)
    return out

def marquee(n):
    items = [html(b) for b in n.find_all("b")]
    uniq = []
    for i in items:
        if i in uniq: break
        uniq.append(i)
    return {"items": uniq, "repeat": len(items) // max(1, len(uniq))}

def industries(sec):
    out = {"label": html(sec.find(cls="label")), "title": html(sec.find("h2")),
           "lede": html(sec.find("p", cls="lede")), "items": []}
    for a in sec.find_all("article", cls="ind"):
        b = a.find(cls="ind__brands")
        out["items"].append({"num": html(a.find(cls="ind__i")), "icon": svg(a.find(cls="ind__i")),
            "title": html(a.find("h3")), "desc": html(a.find("p")),
            "brandsLabel": html(b.find("span")) if b else None,
            "brands": [html(li) for li in b.find_all("li")] if b else [],
            "tags": chips(a.find(cls="ind__tags"))})
    return out

def srows(sec):
    return [{"href": a.attrs["href"], "num": html(a.find(cls="srow__n")), "title": html(a.find("h3")),
             "desc": html(a.find(cls="srow__d").find("p")), "tags": chips(a.find(cls="srow__tags")),
             "more": html(a.find(cls="arrow"))} for a in sec.find_all("a", cls="srow")]

def split_head(sec):
    return {"label": html(sec.find(cls="label")), "title": html(sec.find("h2")), "lede": html(sec.find("p", cls="lede"))}

def cases(sec):
    out = []
    for a in sec.find_all("article", cls="case"):
        out.append({"chips": chips(a.find(cls="case__meta")), "title": html(a.find("h3")),
                    "desc": html(a.find("p")),
                    "nums": [{"value": html(n.find("b")), "label": html(n.find("span")) or ws(re.sub(r"<b>.*?</b>", "", html(n)))}
                             for n in a.find_all(cls="case__num")]})
    return out

def nav(root):
    hdr = root.find("header", cls="header"); mob = root.find(cls="mobile")
    primary = []
    for c in hdr.find("nav").kids():
        if c.tag == "a": primary.append({"href": c.attrs["href"], "label": html(c)})
        elif "nav__item" in c.classes:
            a = c.find("a"); panel = c.find(cls="nav__panel")
            primary.append({"href": a.attrs["href"], "label": html(a), "panel": [
                {"href": p.attrs["href"], "num": html(p.find("i")), "title": ws(re.sub(r"<small>.*?</small>", "", html_except(p, "i"))),
                 "note": html(p.find("small"))} for p in panel.kids("a")]})
    return {"skip": html(root.find("a", cls="skip")), "brand": html(hdr.find(cls="brand__name"), True),
            "brandAria": hdr.find("a", cls="brand").attrs.get("aria-label"),
            "brandMark": svg(hdr.find("a", cls="brand")),
            "primary": primary, "cta": link(hdr.find("a", cls="header__cta")),
            "menuLabel": hdr.find("button", cls="burger").attrs.get("aria-label"),
            "mobile": [dict(link(a), num=html(a.find("i")), label=html_except(a, "i"), sub="sub" in a.classes)
                       for a in mob.kids("a") if "btn" not in a.classes],
            "mobileCta": link(mob.find("a", cls="btn"))}

def footer(root):
    f = root.find("footer", cls="footer"); about = f.find(cls="footer__about")
    cols = []
    for h4 in f.find_all("h4"):
        ul = None
        sib = h4.parent.kids("ul")
        cols.append({"title": html(h4), "links": [link(li.find("a")) for li in sib[0].kids("li")]})
    bottom = f.find(cls="footer__bottom")
    spans = bottom.kids("span")
    return {"about": html(about.find("p")),
            "socials": [dict(link(a), icon=svg(a)) for a in about.find(cls="socials").kids("a")],
            "columns": cols,
            "copyright": html(spans[0]) if spans else None,
            "tagline": html(spans[1]) if len(spans) > 1 else None,
            "word": html(f.find(cls="footer__word"), True)}

def flow_steps():
    js = open(JS, encoding="utf-8").read()
    block = re.search(r"flowSteps\s*=\s*\[(.*?)\]", js, re.S).group(1)
    return re.findall(r"'([^']*)'", block)

def form_messages():
    js = open(JS, encoding="utf-8").read()
    return {"sent": re.search(r"status\.textContent = '(Thanks[^']*)'", js).group(1),
            "fallbackPrefix": re.search(r"status\.textContent = '(Opening[^']*)'", js).group(1),
            "fallbackSuffix": re.search(r"to \+ '([^']*)'", js).group(1)}

def page(path):
    root = parse(open(os.path.join(ROOT, path), encoding="utf-8").read())
    return root, root.find("main"), head_meta(root)

site = {"_source": "Generated by scripts/extract-content.py from ../content/pages — do not edit by hand."}

# ---------- home
root, main, meta = page("index.html")
site["nav"] = nav(root); site["footer"] = footer(root)
secs = main.kids("section"); mqs = main.kids("div", cls="marquee")
hero = secs[0]
site["home"] = {"meta": meta,
  "hero": {"pill": html(hero.find(cls="pill")), "h1": kin_lines(hero.find("h1")), "lede": html(hero.find("p", cls="lede")),
           "buttons": [link(a) for a in hero.find_all("a", cls="btn")], "stats": stats(hero)},
  "marquee": marquee(mqs[0]),
  "thesis": {"label": html(secs[1].find(cls="label")), "quote": html(secs[1].find("p", cls="thesis__q")),
             "notes": [html(p) for p in secs[1].find(cls="thesis__note").kids("p")]},
  "industries": industries(secs[2]),
  "services": dict(split_head(secs[3]), rows=srows(secs[3])),
  "flow": dict(split_head(secs[4]),
               nodes=[{"label": html(li.find(cls="flow__label")), "icon": svg(li.find(cls="flow__ico"))} for li in secs[4].find_all("li", cls="flow__node")],
               log=html(secs[4].find(cls="flow__log-line")), steps=flow_steps()),
  "work": dict(split_head(secs[5]), cases=cases(secs[5]), button=link(secs[5].find_all("a", cls="btn")[-1])),
  "process": dict(split_head(secs[6]), steps=[{"num": html(s.find(cls="step__n")), "title": html(s.find("h4")), "desc": html(s.find("p"))} for s in secs[6].find_all(cls="step")]),
  "marquee2": marquee(mqs[1]),
  "faq": faq(secs[7]),
}
site["cta"] = cta(secs[8])

# ---------- services index
root, main, meta = page("services/index.html"); secs = main.kids("section")
eng = secs[3]
site["servicesIndex"] = {"meta": meta, "hero": phero(secs[0]), "rows": srows(secs[1]),
  "industries": industries(secs[2]),
  "engagements": dict(split_head(eng), items=[{"tag": html(c.find(cls="chip")), "title": html(c.find("h3")), "desc": html(c.find("p")), "icon": svg(c.find(cls="card__ico"))} for c in eng.find_all(cls="card")]),
  "faq": faq(secs[4])}

# ---------- service detail pages
site["services"] = {}
for slug in ["seo", "paid-ads", "brand-building", "growth-marketing", "marketing-automation"]:
    root, main, meta = page(f"services/{slug}/index.html"); secs = main.kids("section")
    ov, wg, ap, fq, rel = secs[1], secs[2], secs[3], secs[4], secs[5]
    card = ov.find(cls="card")
    site["services"][slug] = {"meta": meta, "hero": phero(secs[0]),
      "overview": {"label": html(ov.find(cls="label")), "paras": [html(p) for p in ov.find(cls="prose").kids("p")],
                   "scopeLabel": html(card.find(cls="label")), "scope": [{"mark": html(li.find("span")), "text": html_except(li, "span")} for li in card.find_all("li")],
                   "terms": chips(card.find(cls="card__tags"))},
      "deliverables": dict(split_head(wg), items=[{"title": html(c.find("h3")), "desc": html(c.find("p")), "icon": svg(c.find(cls="card__ico"))} for c in wg.find_all(cls="card")]),
      "approach": {"label": html(ap.find(cls="label")), "title": html(ap.find("h2")), "paras": [html(p) for p in ap.find(cls="prose").kids("p")]},
      "faq": faq(fq),
      "related": dict(split_head(rel), items=[{"href": a.attrs["href"], "title": html(a.find("h3")), "desc": html(a.find("p")), "more": html(a.find(cls="arrow"))} for a in rel.find_all("a", cls="card")])}

# ---------- work
root, main, meta = page("work/index.html"); secs = main.kids("section")
site["work"] = {"meta": meta, "hero": phero(secs[0]), "stats": stats(secs[1]), "cases": cases(secs[2]), "faq": faq(secs[3])}

# ---------- about
root, main, meta = page("about/index.html"); secs = main.kids("section"); mq = main.kids("div", cls="marquee")
prof = secs[1]; facts = prof.find(cls="card")
site["about"] = {"meta": meta, "hero": phero(secs[0]),
  "profile": {"label": html(prof.find(cls="label")), "paras": [html(p) for p in prof.find(cls="prose").kids("p")],
              "factsLabel": html(facts.find(cls="label")),
              "facts": [{"term": html(li.find("strong")), "value": ws(html(li).replace("<strong>" + html(li.find("strong")) + "</strong>", "", 1)).removeprefix("<br>").strip()} for li in facts.find_all("li")],
              "button": link(facts.find("a", cls="btn"))},
  "marquee": marquee(mq[0]) if mq else None,
  "path": dict(split_head(secs[2]), steps=[{"year": html(s.find(cls="step__n")), "desc": html(s.find("p"))} for s in secs[2].find_all(cls="step")]),
  "principles": dict(split_head(secs[3]), items=[{"title": html(c.find("h3")), "desc": html(c.find("p")), "icon": svg(c.find(cls="card__ico"))} for c in secs[3].find_all(cls="card")]),
  "faq": faq(secs[4])}

# ---------- contact
root, main, meta = page("contact/index.html"); secs = main.kids("section")
c = secs[1]; form = c.find("form")
direct = []
for n in c.find(cls="contact-list").kids():
    d = {"title": html(n.find("b")), "note": html(n.find("small")), "icon": svg(n)}
    if n.tag == "a": d.update({k: v for k, v in link(n).items() if k != "label"})
    direct.append(d)
fields = []
for f in form.find_all(cls="field"):
    lab = f.find("label"); ctl = f.find("input") or f.find("select") or f.find("textarea")
    d = {"id": ctl.attrs.get("id"), "label": html(lab), "tag": ctl.tag, "name": ctl.attrs.get("name"),
         "type": ctl.attrs.get("type"), "required": "required" in ctl.attrs, "placeholder": ctl.attrs.get("placeholder"),
         "autocomplete": ctl.attrs.get("autocomplete"), "tabindex": ctl.attrs.get("tabindex")}
    if ctl.tag == "select": d["options"] = [html(o) for o in ctl.find_all("option")]
    d["honeypot"] = "f-website" == ctl.attrs.get("id")
    fields.append(d)
fit = c.find(cls="card")
site["contact"] = {"meta": meta, "hero": phero(secs[0]),
  "direct": {"label": html(c.find(cls="label")), "title": html(c.find("h2")), "lede": html(c.find("p", cls="muted")), "items": direct},
  "fit": {"label": html(fit.find(cls="label")), "text": html(fit.find("p"))},
  "form": {"to": form.attrs.get("data-to"), "fields": fields, "submit": html(form.find("button")),
           "note": html(form.find("p", cls="form-note")), "messages": form_messages()},
  "faq": faq(secs[2])}

# ---------- 404
root, main, meta = page("404.html")
site["notFound"] = {"meta": meta, "hero": phero(main.kids("section")[0])}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(site, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("wrote", OUT, os.path.getsize(OUT), "bytes")
