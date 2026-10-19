"""Tiny DOM for extracting content from the original HTML pages (stdlib only)."""
from html.parser import HTMLParser

VOID = {"area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"}

class Node:
    def __init__(self, tag, attrs=None, parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs or {}), parent, []
    # ---- query
    @property
    def classes(self): return (self.attrs.get("class") or "").split()
    def walk(self):
        for c in self.children:
            if isinstance(c, Node):
                yield c
                yield from c.walk()
    def find_all(self, tag=None, cls=None, **attrs):
        out = []
        for n in self.walk():
            if tag and n.tag != tag: continue
            if cls and cls not in n.classes: continue
            if any(n.attrs.get(k) != v for k, v in attrs.items()): continue
            out.append(n)
        return out
    def find(self, tag=None, cls=None, **attrs):
        r = self.find_all(tag, cls, **attrs); return r[0] if r else None
    def kids(self, tag=None, cls=None):
        return [c for c in self.children if isinstance(c, Node) and (not tag or c.tag == tag) and (not cls or cls in c.classes)]
    # ---- serialise
    def inner(self, drop_svg=True):
        """Inner HTML exactly as written (entities kept), minus svg and attributes on inline tags."""
        out = []
        for c in self.children:
            if isinstance(c, str): out.append(c)
            elif drop_svg and c.tag == "svg": continue
            elif c.tag in VOID: out.append(f"<{c.tag}>")
            else: out.append(f"<{c.tag}>{c.inner(drop_svg)}</{c.tag}>")
        return "".join(out)
    def html(self):
        a = "".join(f' {k}="{v}"' if v is not None else f" {k}" for k, v in self.attrs.items())
        if self.tag in VOID: return f"<{self.tag}{a}>"
        return f"<{self.tag}{a}>{self.raw_inner()}</{self.tag}>"
    def raw_inner(self):
        return "".join(c if isinstance(c, str) else c.html() for c in self.children)
    def clean(self, drop_svg=True):
        """Inner HTML trimmed and whitespace-collapsed."""
        import re
        return re.sub(r"\s+", " ", self.inner(drop_svg)).strip()

class _P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.root = Node("#root"); self.cur = self.root
    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.cur); self.cur.children.append(n)
        if tag not in VOID: self.cur = n
    def handle_startendtag(self, tag, attrs):
        self.cur.children.append(Node(tag, attrs, self.cur))
    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag: n = n.parent
        if n is not self.root: self.cur = n.parent
    def handle_data(self, d): self.cur.children.append(d)
    def handle_entityref(self, name): self.cur.children.append(f"&{name};")
    def handle_charref(self, name): self.cur.children.append(f"&#{name};")

def parse(text):
    p = _P(); p.feed(text); return p.root
