# My Learning — building NAC without "knowing how to code"

I built this whole site by describing what I wanted and iterating — vibe coding. But along the
way the project forced me to actually understand how a real web product fits together. This file
is the honest list of what I learned, written for the me from six months ago.

---

## 1. A website is just files answering requests

The biggest unlock: there's no magic. When someone opens `nac.imswarnil.com`, a server receives a
request, runs some code, and sends back HTML, CSS and JavaScript. Every file in this repo maps to
something a visitor sees or something the server does:

- `app/page.tsx` → the homepage
- `app/browse/page.tsx` → the /browse page (the URL comes from the **folder name** — that's
  Next.js "file-based routing")
- `app/api/track/route.ts` → not a page at all, but an **API endpoint**: code other code talks to
- `public/widget.js` → a plain file served as-is; this one is the actual stamp people embed

## 2. Frontend vs backend is about *where code runs*

- **Frontend** (browser): everything the visitor's device runs — the builder form, the poll
  buttons, the stamp animation. In Next.js these files start with `"use client"`.
- **Backend** (server): code that runs on a machine I control — reading the database, checking
  whether a site really still has the widget. Visitors never see this code, only its results.

One page can be both: `/browse` fetches sites from the database on the server, then hands them to
a client component that does the instant filtering in the browser. Fast *and* private.

## 3. Components are LEGO bricks

I used to paste the same nav bar into five pages. Then a change meant fixing five files (and I
missed some — the pages drifted apart). The fix: one `SiteNav.tsx` **component**, used in
`layout.tsx`, which wraps every page. Write once, appears everywhere, changes everywhere.
Same for the footer, the share grid, the poll. If you copy-paste UI twice, make it a component.

## 4. A design system means never picking colors twice

The site's whole look is driven by **design tokens** — named CSS variables like `--accent`,
`--bg-canvas`, `--fg-muted`. Components never say "green"; they say `var(--accent)`.
So when NAC needed its own identity, I didn't restyle 50 components — I wrote one small file
(`app/nac-theme.css`) that overrides ~20 token values (paper canvas, seal-green accent), and the
entire site changed clothes. Dark mode works the same way: the tokens swap, the components don't
care.

## 5. Databases are spreadsheets with rules

The `sites` table is just rows: domain, author, category, first_seen, hits. What I learned:

- **Upsert** (`INSERT … ON CONFLICT … UPDATE`): "add this row, or if it exists, update it."
  That one pattern powers the whole tracking system.
- **You don't need a table per feature.** The visitor counter and the poll share one tiny
  `metrics` table: `key → value`. `visits: 1042`, `poll_agree: 87`. Done.
- **Migrations**: `ALTER TABLE … ADD COLUMN IF NOT EXISTS` lets old databases grow new columns
  without breaking. Schemas evolve; plan for it.

## 6. APIs are just agreed-upon messages

The poll works because the browser and server agreed on a tiny contract:
`POST /api/pulse` with `{ "event": "agree" }` → server adds 1 → replies with fresh totals.
That's all an API is: a URL, a shape of message in, a shape of message out. Once I saw that,
third-party APIs (Claude for the writing feedback) stopped being scary — same idea, different URL,
plus an API key kept in `.env` so it never lands in public code.

## 7. Trust nothing that arrives from outside

Every API route here cleans its input: domains are validated with a pattern, text is length-capped,
URLs are parsed before fetching. Anyone can send anything to a public endpoint — the widget's
tracking ping could be forged by a bored teenager with `curl`. Sanitize, cap, and never build SQL
strings by hand (the `sql` template literal escapes values for me).

## 8. Honest counting without surveillance

I wanted visitor stats and poll results without cookies or accounts. The trick: count on the
server, but let the *browser* remember whether it already participated —
`sessionStorage` ("this tab session already counted a visit") and `localStorage` ("this browser
already voted"). It's not fraud-proof, and that's fine: the goal is a truthful vibe, not analytics
of people.

## 9. Animation quality is mostly restraint

The old "What is this?" animation felt dated because it did too much: bouncy overshoot, dashed
borders, spinning everything. The redesign taught me the rules good motion follows:

- Animate only `transform` and `opacity` (cheap for the browser; smooth everywhere).
- One spring per event, short (300–500ms), with a proper easing curve — not three bounces.
- Motion should *mean* something: the stamp presses in like a real stamp; the "AI-GENERATED" chip
  gets struck through like red ink. Decoration ages; metaphor doesn't.
- Always respect `prefers-reduced-motion` — some people get motion-sick.

## 9½. The browser can talk

The "What is this?" storyboard narrates itself with the **Web Speech API** — built into every
browser, no service, no API key. What I learned making it not sound robotic: pick a voice by name
from `speechSynthesis.getVoices()` (the defaults are often the worst ones), slow the rate to ~0.9,
and advance slides on the utterance's `onend` event — with a fallback timer, because browsers
sometimes never fire it. Also: voices load *asynchronously* in Chrome; ask for them early.

## 10. SVG is drawing with text

The logo, favicon, and the entire notary stamp are SVG — shapes described in code. Which means the
stamp can be *generated*: the widget builds its SVG string on the fly, curving your name around a
circle with `<textPath>`, drawing guilloché rings with a little trigonometry. No image editor, no
image files, infinitely sharp at any size, and it can animate (the rings literally redraw
themselves using the `stroke-dasharray` trick).

## 11. URLs are part of the product

Renaming `/directory` to `/browse` isn't just a code change — old links exist on other people's
sites. So the old URL **redirects** (a permanent 301 in `next.config.js`) and the sitemap gets
updated. Cool URLs don't break; when they must change, they forward.

## 12. The filter logic I'd never have guessed

The browse filters follow a convention every store site uses but nobody explains:
**OR within a group, AND across groups.** Checking "Tech" + "Travel" means *tech or travel*;
also checking region "India" means *(tech or travel) and India*. The filter options themselves are
computed from the data — every category that actually exists among the sites appears, with a
count. Ten entries with ten categories → ten filters, automatically.

## 13. What "verification" honestly means

I wanted a "prove it's not AI" button. I learned that's impossible — every AI detector
false-flags real human writing. So the design became honest instead: the stamp is a
**declaration**, the detector is a **mirror** (transparent signals you can read and improve
against, plus third-party cross-checks that will happily disagree with each other), and the
directory **re-verifies presence** — sites that remove the stamp quietly drop off the list.
Building trust tools taught me more about honesty than about code.

## 14. Vibe coding actually works when…

- **You describe outcomes, not implementations** — "the panel should unfold like a spring, no
  bounce" beats "change line 174".
- **You read what comes back.** Every time I actually read the generated code, I learned a
  pattern I reused in my next prompt. The times I didn't, bugs hid for days.
- **You keep one source of truth** — tokens for style, components for UI, one DB helper file.
  AI (like humans) makes fewer mistakes in a tidy house.
- **You ship, then refine.** The first stamp was ugly. Version four has microprint and guilloché
  rings. Iteration is the whole game — for prompts and for products.
