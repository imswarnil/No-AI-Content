<div align="center">

<img src="docs/badge-animated.svg" alt="NAC — animated notary stamp" width="200" />

# ✒︎ NAC — No AI Content

### The human‑written badge for the open web.

**NAC** is a free, open‑source **notary‑style stamp** that lets authors publicly declare their work
is written by a person — with AI used only to *refine*, never to *generate*.
Paste one line of code, and join a public directory of humans who still write by hand.

🔗 **[nac.imswarnil.com](https://nac.imswarnil.com)**

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-F04E2E.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Postgres](https://img.shields.io/badge/Postgres-Neon-336791?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Deploy to Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)](https://vercel.com/new)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-F04E2E.svg)](#-contributing)

<br/>

**[Live demo](https://nac.imswarnil.com) · [Add your site](#-quick-start) · [Who qualifies](#-what-counts-as-human-written) · [The directory](https://nac.imswarnil.com/directory)**

</div>

---

## ✨ Why

> I miss the old web — blogs where a human actually thought and wrote. Using AI to sharpen a
> sentence or pressure‑test an idea is fine. Publishing a soulless, end‑to‑end AI‑generated post
> as your own is not. **This badge is a small, honest signal that a person is still behind the words.**

This isn't anti‑AI. It's **pro‑human**.

---

## 🖼️ The stamp

A modern take on a **notary seal** — with real security‑print detailing (guilloché line‑work, a
microprint ring, and an engraved rosette) so it's distinctive and hard to casually copy. It
**animates onto the page** when it loads.

<div align="center">
<table>
<tr>
<td align="center"><img src="docs/stamp-light.png" width="260" alt="Light stamp"/><br/><sub><b>Light</b></sub></td>
<td align="center"><img src="docs/stamp-dark.png" width="260" alt="Dark stamp"/><br/><sub><b>Dark</b></sub></td>
</tr>
</table>
</div>

### Three styles, one signal

| Style | `data-style` | Best for |
| --- | --- | --- |
| 🟢 **Notary stamp** | `stamp` (default) | Sidebars — the full circular seal |
| ▭ **Banner** | `banner` | Footers / about pages — a horizontal card |
| ● **Compact pill** | `compact` | Inline / bylines — a tiny rounded pill |

---

## 🚀 Quick start

### 1. Run locally

```bash
git clone https://github.com/imswarnil/No-AI-Content.git nac && cd no-ai-content
npm install
cp .env.example .env      # fill in the values below
npm run dev               # → http://localhost:3000
```

### 2. Environment variables

| Variable | Required | What it is |
| --- | :---: | --- |
| `DATABASE_URL` | ✅ | Postgres connection string. Free at [neon.tech](https://neon.tech). The `sites` table is auto‑created. |
| `ADMIN_TOKEN` | ✅ | A long random secret. Gates the `/dashboard` usage view. |
| `NEXT_PUBLIC_SITE_URL` | — | Your public URL, for SEO (canonical, sitemap, Open Graph, JSON‑LD). |
| `ANTHROPIC_API_KEY` | — | Only for the `/check` human‑ness review. Get one at [console.anthropic.com](https://console.anthropic.com). |

### 3. Deploy to Vercel (free)

1. Push to GitHub → import the repo at [vercel.com](https://vercel.com/new).
2. Add a **Postgres** database (Vercel Storage, or a Neon string).
3. Set the env vars above in **Project → Settings → Environment Variables**.
4. **Deploy.** Your stamp is served from `https://nac.imswarnil.com/widget.js`.

---

## 🔌 Embed it

Authors customize the badge on your homepage and copy a one‑line snippet:

```html
<script
  src="https://nac.imswarnil.com/widget.js"
  data-author="Jane Doe"
  data-message="Written by a human. AI is used only to refine ideas — never to generate."
  data-style="stamp"
  data-theme="light"
  data-region="India"
  data-category="Personal"
  async
></script>
```

### Widget options (`data-*`)

| Attribute | Default | Description |
| --- | --- | --- |
| `data-author` | — | Name curved onto the stamp (`BY …`). |
| `data-message` | *"Written by a human…"* | Text for the banner/compact styles. |
| `data-style` | `stamp` | `stamp` · `banner` · `compact`. |
| `data-theme` | `light` | `light` · `dark`. |
| `data-ink` | green | Any CSS color — e.g. `#1e3a8a` for classic notary navy. |
| `data-size` | `156` | Stamp width in px. |
| `data-region` / `data-category` | — | Powers the public directory filters. |
| `data-link` | `/directory` | Where the badge links when clicked. |

Every badge also renders a **"What is this?"** control that answers **inside the widget** — no
modal. Clicking it replays the seal (the guilloché rings redraw stroke‑by‑stroke, the stamp
*thumps* like a real seal, the rosette and microprint ring slowly counter‑rotate) while an
explainer card slides open underneath: a manifesto types out and an "AI‑GENERATED" chip is
struck through.

---

## ✅ What counts as human‑written

The rule of thumb: **if a reader deleted the AI's contribution, your post should still exist.**

| ✅ Allowed | 🚫 Disqualifies |
| --- | --- |
| Spelling & grammar fixes | Full articles generated from a prompt |
| Rephrasing your **own** sentences | AI writes, you lightly edit |
| Pressure‑testing your ideas | Auto‑generated SEO / listicles |
| Summarizing sources you verify | Ghost‑written by AI, published as yours |
| Translating your writing | No human idea behind it |

## 🔍 The detector — our own engine

**`/check`** is a free **AI content detector** built from scratch (`lib/detect.ts`) — no
third‑party API needed. Paste text or a URL and it returns a **transparent, signal‑based
AI‑likeness score (0–100)** with every signal, weight and flagged phrase shown:

| Signal | What it measures |
| --- | --- |
| AI cliché phrases | "in today's fast‑paced world", "let's dive in", … |
| LLM‑favored vocabulary | "delve", "tapestry", "leverage", "seamless", … |
| Formal transitions | "moreover", "furthermore", "consequently", … |
| Sentence‑length burstiness | Humans vary rhythm; LLMs write uniformly |
| Personal voice & specifics | First person, concrete numbers |
| Contractions | Humans write "don't"; formal AI expands it |
| Filler / intensifiers | "very", "crucial", "comprehensive", … |
| Em‑dashes & semicolons | The famous LLM "—" habit |
| Sentence‑opener variety | "The… The… This… This…" reads templated |

Everything is tunable data — the weights and word lists live at the top of `lib/detect.ts`.
The exact **flagged phrases** are listed so writers know what to rewrite, and an optional
**Claude second opinion** gives qualitative feedback. Handy URLs like `/detector`,
`/ai-content-detector` and `/ai-checker` all redirect to it.

> ⚠️ **Honest by design:** reliable AI‑content detection is not possible — detectors routinely
> mislabel real human writing. `/check` gives **qualitative guidance to help you improve**, never a
> verdict on you as a person.

---

## 🗺️ Pages & API

| Route | What it does |
| --- | --- |
| `/` | Landing + live badge builder + animated story modal (with text‑to‑speech). |
| `/directory` | Public roll of human‑written sites — **sidebar checkbox filters** (category/region with counts), instant search, rich cards (favicon, fetched site title & description). **Listings are live‑verified**: a site only appears while the widget is actually found on its homepage (re‑checked daily) or its badge pinged in the last 7 days — remove the widget and the listing disappears. |
| `/eligibility` | The allowed / not‑allowed checklist. |
| `/check` | The AI content detector (own engine) + optional Claude second opinion. |
| `/detector` | SEO alias → redirects to `/check` (also `/ai-content-detector`, `/ai-checker`). |
| `/dashboard` | Private operator view (token‑gated): domains, loads, activity. |
| `POST /api/track` | Records a domain‑only badge load (no cookies, no visitor data). |
| `POST /api/detect` | Runs the in‑house detection engine on text or a URL. |
| `GET /api/directory` | Public list of embedding sites (domain, author, region, category, title, description). |
| `GET /api/sites` | Admin list (token‑gated). |
| `POST /api/analyze` | Runs the Claude human‑ness review. |

---

## 🏗️ Architecture

```mermaid
flowchart LR
    A["Author's site<br/>&lt;script widget.js&gt;"] -->|renders| B["🟢 Notary stamp<br/>+ What-is-this overlay"]
    A -->|"POST /api/track<br/>(domain only)"| C["Next.js API"]
    C --> D[("Postgres<br/>sites table")]
    E["Operator /dashboard"] -->|"token"| C
    F["Readers /directory"] --> C
    G["/check"] -->|"fetch page → review"| H["Claude API<br/>claude-opus-4-8"]
```

**Privacy model:** only the embedding **domain + timestamp + count** is stored. No IPs, no
cookies, no visitor tracking — fitting the honest‑content ethos.

---

## 🧰 Tools we used

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Neon Postgres](https://img.shields.io/badge/Neon_Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![Claude](https://img.shields.io/badge/Claude_API-D97757?style=for-the-badge&logo=anthropic&logoColor=white)](https://www.anthropic.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![CSS3](https://img.shields.io/badge/Creator_Design_System-F04E2E?style=for-the-badge&logo=css3&logoColor=white)](https://creator.imswarnil.com/)
[![Google Fonts](https://img.shields.io/badge/Google_Fonts-4285F4?style=for-the-badge&logo=googlefonts&logoColor=white)](https://fonts.google.com/)
[![Claude Code](https://img.shields.io/badge/Claude_Code-1A1A1A?style=for-the-badge&logo=anthropic&logoColor=D97757)](https://claude.com/claude-code)

</div>

| Tool | Where it's used |
| --- | --- |
| **Next.js 14** (App Router) + **React 18** + **TypeScript** | The site, the builder, and every API route |
| **Neon Postgres** (`@neondatabase/serverless`) | The `sites` table behind the public directory — serverless-friendly, no connection pool to babysit |
| **Claude API** (`@anthropic-ai/sdk`) | The `/check` human-ness review — constructive feedback, never a verdict |
| **[Creator Design System](https://creator.imswarnil.com/)** ("Frame & Signal") | The entire look & feel: tokens, type, motion, dark mode — one CSS file, zero runtime |
| **Space Grotesk · Inter · IBM Plex Mono** | The system's three voices: display, body, and the slate |
| **Vanilla JS widget** | `public/widget.js` — inline SVG, Shadow-DOM overlay, Web Speech API, zero dependencies |
| **Vercel** | Hosting + deploys |

## 🎨 Design

The site is themed end‑to‑end by the **[Creator Design System](https://creator.imswarnil.com/)** —
a token‑first, dependency‑free CSS system. `app/creator.css` is the system;
`app/globals.css` is a thin NAC layer that only consumes its **semantic tokens**
(`--accent`, `--fg-muted`, `--line-default`…), which is why:

- **Dark mode is free** — it follows the OS via the token tier; no component knows which theme it's on.
- **One accent, rationed** — the page is near‑monochrome so the signal‑red carries all the meaning.
- **Motion is honest** — entrances travel 16px on the system's easings, and everything switches off under `prefers-reduced-motion`.
- **The hero uses `svh`** — it fills the first viewport without jumping when mobile URL bars collapse.

## 📁 Structure

```
app/
  page.tsx            # landing + builder + story modal
  StoryModal.tsx      # animated slides + text-to-speech
  directory/          # public roll (search + region/category filters)
  eligibility/        # the rules checklist
  check/              # AI content detector UI (+ FAQ JSON-LD for SEO)
  dashboard/          # operator analytics
  api/{track,sites,directory,detect,analyze}/route.ts
  layout.tsx          # SEO metadata + JSON-LD + fonts
  creator.css         # the Creator Design System (vendored, unmodified)
  globals.css         # NAC layer — consumes only the system's semantic tokens
  icon.svg            # favicon (the seal)
lib/detect.ts         # the in-house AI-likeness engine (tunable signals)
lib/db.ts             # Neon Postgres + schema
public/widget.js      # the embeddable stamp (self-contained)
docs/                 # README assets
```

---

## 🧠 What we learned building this

Things this project taught us that a tutorial wouldn't:

1. **AI detectors can't be trusted with verdicts.** Our own detection engine (`lib/detect.ts`)
   made this obvious: every signal that flags AI prose also flags some real human writing.
   That's why NAC is a *declaration* you make, and `/check` gives feedback instead of a score
   you could fail.
2. **A design system is a constraint engine, not a stylesheet.** Rebuilding the site on
   token-first CSS meant deleting hard-coded colors, not adding classes. Once components only
   read semantic tokens, dark mode, rebranding, and consistency stopped being work.
3. **One accent color is a feature.** When the page is near-monochrome, the single red word in
   the hero and the one filled button *are* the visual hierarchy. Adding a second hue is a
   design decision, not a tweak.
4. **`svh` beats `vh` on mobile.** `100vh` includes the collapsed URL bar, so hero sections
   jump on scroll; `100svh` is the honest "small viewport" height and never shifts.
5. **Motion needs an off switch and a resting state.** Entrances travel 16px, run once, and the
   finished state is the resting state — so if `prefers-reduced-motion` (or a broken observer)
   kills the animation, nothing is unreachable.
6. **A widget must be dependency-free.** `widget.js` embeds on sites we don't control — so it's
   one file, inline SVG, Shadow DOM for isolation, and no framework that could clash with the host page.
7. **Privacy is an architecture choice.** Storing only *domain + timestamp + count* wasn't a
   compliance afterthought — it shaped the schema, killed the need for cookies, and matches the
   project's honesty pitch.
8. **Serverless Postgres changes the driver, not just the host.** Neon's HTTP driver
   (`@neondatabase/serverless`) exists because classic TCP pools and edge/serverless functions
   don't mix.

---

## 🧭 Roadmap

- [ ] Dynamic Open Graph share image (the stamp, per author)
- [ ] Signed / tamper‑evident stamps + a public `/verify` page
- [ ] Author accounts & API keys (verified badges)
- [ ] Email/webhook alerts when a new site embeds
- [ ] `stamp.svg` / `stamp.png` image endpoint (for Substack/Medium, which block `<script>`)

## 🤝 Contributing

PRs welcome. Open an issue to discuss substantial changes first. Run `npm run build` before
submitting.

## 📄 License

[MIT](./LICENSE) © Swarnil Singh

<div align="center"><sub>Built for humans who still write by hand. 🌱</sub></div>
