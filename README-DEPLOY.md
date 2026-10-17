# growthwithajay.com - deploy & edit guide

## Next.js deployment

The site runs as a Next.js application with Node.js server rendering, static route generation, and a Node.js contact API.

```bash
npm install
npm run build
npm start
```

Set the SMTP variables from `.env.example` in the hosting provider before enabling contact delivery. Page markup lives in `content/pages/` and is consumed by the Next route; assets are served from `public/`.

PHP is not part of the application and is not required by the contact form.

**Positioning:** *Most marketers talk about AI. I ship the agent.* The site argues that Ajay isn't just a strategist who recommends automation — he builds the n8n workflows and AI agents himself, across Web3, real estate and fashion. He is explicitly **not** a software engineer and doesn't build products or apps; what he builds is the automation layer around marketing. Keep that honesty line intact if you edit the copy (see the "Are you a developer?" FAQ on the About and Automation pages) — it's what makes the claim credible instead of oversold.

---

## 1. Deploy the Next.js app

1. Use a Node.js host that supports Next.js server deployments.
2. Set the build command to `npm run build` and the start command to `npm start`.
3. Set the SMTP variables from `.env.example` in the host environment.
4. Configure the domain and HTTPS in the hosting provider.

```
content/pages/       # page content consumed by the Next catch-all route
app/                 # Next layouts, routes, and the contact API
public/              # browser-served assets and metadata files
```

---

## 2. Swap the placeholders — **do this before you promote the site**

| Find | Replace with | Where |
|---|---|---|
| `growth.ajaykumar@gmail.com` | your real inbox | every page + `contact-handler.php` |
| `918188878005` | WhatsApp number, country code, no `+` or spaces | every page |
| `+91 81888 78005` | display version | `contact/index.html` |
| `https://www.linkedin.com/in/ajaykumar` | your LinkedIn | every page |
| `https://x.com/growthwithajay` | your X (or delete the link) | every page |
| `https://www.instagram.com/growthwithajay` | your Instagram (or delete) | every page |
| `Available for Q4 2026` | current availability | home hero, about, contact |

**These are invented — replace or delete them:**

- **Every case-study number.** All six studies in `work/index.html` (three repeat on the home page): the wallet counts, −47% site visits, 2.1x sell-through, +418% clicks, and so on. Swap in real figures, or cut the `case__nums` block from any study you can't back up.
- **The four hero stats** — `8+`, `60+`, `₹40Cr+`, `4x`. These animate on scroll; the number in `data-count` is what counts up, so change both `data-count` and the visible text.
- **All three testimonials.** They read `[Client name]` / `[Title], [Company]` deliberately, so they can't accidentally ship as real. Replace with quotes you have written permission to publish, or delete the "Kind words" sections from `index.html` and `work/index.html`.
- **The 2018–2024 timeline** in `about/index.html` — a plausible shape, not your actual history.

Set up a domain inbox (hPanel → **Emails**) so your address is `you@growthwithajay.com`. It converts better than a Gmail address on a site selling marketing.

---

## 3. Add a photo of yourself

There's no photo anywhere yet, and for a personal brand site that's the biggest single conversion gap. Add `assets/img/ajay.jpg` (about 900×1100, under 250 KB) and paste this into `about/index.html`, just above the `<div class="card">` in the Profile section:

```html
<img src="/assets/img/ajay.jpg" alt="Ajay Kumar, growth marketing consultant"
     width="900" height="1100" loading="lazy"
     style="border-radius:16px;border:1px solid var(--line);margin-bottom:24px">
```

Then update `"image"` in the Person schema at the top of that file to the photo URL.

---

## 4. The design system

Everything lives in `assets/css/style.css`. Change the tokens at the top and the whole site re-themes.

| Token | Value | Role |
|---|---|---|
| `--ink` | `#08090C` | Base ground |
| `--bone` | `#EAE6DE` | Type **and the action colour** — buttons are bone, not accent |
| `--copper` / `--copper-hi` | `#C4763F` / `#F0C08C` | Ornament only: rules, labels, glyphs, the foil gradient |
| `--mist` | `#8B8880` | Secondary text |

**Type:** Bricolage Grotesque (display) · Archivo (body) · JetBrains Mono (labels, numbers). All from Google Fonts.

The `.foil` class is the metallic gradient sweep used on the last line of each headline. The `--foil` token drives it.

**Motion** is all in `assets/js/main.js`, dependency-free: load curtain, kinetic headline reveal, custom cursor, magnetic buttons, scroll progress rail, parallax auras, film-grain canvas, 3D tilt on the industry cards, animated counters, the hero signal-wave canvas, and marquees. Everything is disabled automatically under `prefers-reduced-motion`, and touch devices skip the cursor and tilt.

To dial the motion down, the simplest lever is `assets/css/style.css` → find `.rv` and shorten the transition, or delete the `#grain` block in `main.js`.

---

## 5. Contact form

The form posts `multipart/form-data` to `/api/contact`. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `CONTACT_FROM`, and `CONTACT_TO` before testing delivery. Without SMTP configuration, the API returns a clear configuration error instead of silently falling back to PHP or a mail client.

---

## 6. Post-launch SEO checklist

- [ ] **Google Search Console** — add the property, verify by DNS, submit `https://growthwithajay.com/sitemap.xml`.
- [ ] **Bing Webmaster Tools** — one-click import from Search Console.
- [ ] **GA4** — paste the gtag snippet before `</head>` on every page, or use GTM.
- [ ] **Rich Results Test** — the FAQ, Service, Person and Breadcrumb schema should all validate.
- [ ] **PageSpeed Insights** — should score well; Google Fonts is the only external request.
- [ ] **Self-host the fonts** for a perfect score: download Bricolage Grotesque, Archivo and JetBrains Mono, drop the `.woff2` files in `assets/`, and swap the Google Fonts `<link>` for local `@font-face` rules.
- [ ] Link the site from your LinkedIn, X and Instagram bios — your first backlinks, and they matter.

### Already built in

Unique title, meta description and H1 per page · canonicals · Open Graph and Twitter cards · JSON-LD for `Person`, `ProfessionalService`, `WebSite`, `Service` ×5, `BreadcrumbList` and `FAQPage` ×10 · visible breadcrumbs · industry keywords (Web3, crypto, real estate, fashion) and capability keywords (n8n, AI agents, marketing automation) worked through titles, descriptions, headings and schema `knowsAbout` · internal linking between every service page · XML sitemap · robots.txt with AI-crawler rules · HTTPS and non-www 301s · gzip/brotli, cache and security headers · custom 404 (noindex) · skip link, visible focus states, reduced-motion support, and a `<noscript>` fallback so every section is readable with JavaScript off.

---

## 7. Editing

Page content is kept as HTML fragments under `content/pages/` and rendered by Next.js. Two things to know:

- **Nav and footer are repeated in all 10 content files.** Change a link in one, change it in all with VS Code find-in-files.
- **Section headings use `.kin` spans** for the line-by-line reveal:
  ```html
  <span class="kin"><i>First line</i></span>
  <span class="kin"><i class="foil">Last line</i></span>
  ```
  Keep the `<span class="kin"><i>…</i></span>` structure or the animation won't run. `class="foil"` is the copper gradient — use it on one line only.

**Adding a page:** copy an existing one, change the title, description, canonical, H1 and body, then add the URL to `sitemap.xml`.

**A blog** is the highest-value next addition. Create `/blog/` with an index and one folder per post, add `BlogPosting` schema to each, and link posts from the relevant service pages. Given the positioning, the obvious first three posts write themselves: what transfers between industries, what doesn't, and the diagnosis you run in week one.
