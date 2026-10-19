# Growth with Ajay — Studio redesign

A ground-up redesign of growthwithajay.com, built as its own Next.js app inside this repo.
The original site (repo root: `app/`, `content/pages/`, `public/`) is untouched.

## Design direction — "Operator's Ledger"

Ajay's pitch is *the marketer who builds the machine*. The site is art-directed like an
operator's ledger rather than an agency template:

- **Palette:** bone paper `#EEEAE1`, ink `#121310`, and a single signal colour, electric lime `#D7FF3B`,
  used only where something is "live": the highlighted claim, the active pipeline step, primary CTAs on ink.
- **Type:** Instrument Serif for claims and numbers, Geist for reading, Geist Mono for system labels.
- **Structure:** hairline rules and a 12-column grid with a left margin rail of section marks `(01)`;
  no card grids, no pills, no gradients.
- **Signature moments:** a stepped three-line masthead; the logo's wave drawn full-width with a lime packet
  travelling it; markets as expanding columns; services as a contents page that inverts to ink on hover;
  a live "See it run" pipeline; case studies as a sideways dossier rail; process as a rising staircase;
  engagement shapes that step up in commitment.

## Content is never retyped

`scripts/extract-content.py` parses the original pages in `../content/pages/` (plus the flow-log and
form-status strings in `../public/assets/js/main.js`) into `content/site.json`. Every page renders only
from that file, so wording, numbers, links, SEO meta and JSON-LD are copied mechanically.
`scripts/verify-content.py` then checks the rendered site against the originals (2,331 checks:
every text fragment, link, meta value and JSON-LD block).

If the original copy changes: `npm run content`, rebuild, `npm run verify`.

## Run

```bash
cd studio
npm install
npm run dev            # http://localhost:3200
npm run build && npm start
npm run verify         # with the server running: confirms all original content is present
```

Requires Node 20+ and Python 3 (stdlib only) for the content scripts.

## Contact form

Same behaviour as the original: posts to `/api/contact/` (copied unchanged), which sends mail via SMTP.
Copy `.env.example` to `.env.local` and fill in the SMTP settings. Without them the API answers 503 and the
form falls back to opening the visitor's email app, exactly like the current site.

## Structure

```
studio/
  app/                 routes: /, /services/, /services/[slug]/, /work/, /about/, /contact/, 404, /api/contact/
  components/          Header, Footer, PageHero, Ledger, Markets, ServiceIndex, FlowDemo, Dossiers, Staircase, Faq, Cta, ContactForm…
  content/site.json    generated content (do not edit by hand)
  lib/site.js          content access + metadata mapping
  scripts/             extract-content.py, verify-content.py, dom.py
  public/              favicons, OG image, robots.txt, sitemap.xml (copied from the original)
```

## Accessibility & motion

Semantic landmarks, one `h1` per page, skip link, visible focus states, keyboard-operable menu (Esc closes)
and market columns, native `<details>` for FAQs. All reveal/count/ticker/wave motion is disabled under
`prefers-reduced-motion`, and content is fully visible without JavaScript.

## Deploying

Not deployed. To ship it, point the host's root directory at `studio/` (build `npm run build`, start
`npm start`), or move its contents to the repo root in a separate change.
