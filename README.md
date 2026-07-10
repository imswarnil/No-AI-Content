# 🌱 No AI Content

An open-source, embeddable **"No AI Content"** badge. Authors customize it, copy a
one-line `<script>` snippet, and paste it on their site to publicly declare their
work is human-written. The badge also reports the **domain** it runs on, so you (the
operator) can see every site using it from a private dashboard.

- **Widget** — `public/widget.js`, a tiny dependency-free script that renders the badge and pings the tracker.
- **API** — `POST /api/track` records a domain hit; `GET /api/sites` (admin-only) lists all embedding sites.
- **Pages** — `/` is the customizer + embed-code generator; `/dashboard` is your private usage view.
- **Privacy** — only the embedding site's **domain** is stored. No visitor IPs, no cookies, no personal data.

## Tech stack

Next.js (App Router) · Postgres (Neon / Vercel Postgres) · deploys free to Vercel.

---

## 1. Run locally

```bash
npm install
cp .env.example .env        # then fill in the values (see below)
npm run dev                 # http://localhost:3000
```

You need two environment variables (`.env`):

| Variable | What it is |
| --- | --- |
| `DATABASE_URL` | A Postgres connection string. Get one free at [neon.tech](https://neon.tech) (create a project → copy the connection string). |
| `ADMIN_TOKEN`  | Any long random secret you choose. Required to view `/dashboard`. |

The `sites` table is created automatically on first request — no migration step.

---

## 2. Deploy to Vercel (free)

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Add a Postgres database: either
   - **Vercel → Storage → Create Database → Postgres** (auto-sets `DATABASE_URL`), or
   - create one at [neon.tech](https://neon.tech) and paste its string.
4. In **Project → Settings → Environment Variables**, add:
   - `DATABASE_URL` (if not auto-added)
   - `ADMIN_TOKEN` — your secret
5. **Deploy.** Your instance is live at `https://your-project.vercel.app`.

That's it — the widget is served from `https://your-project.vercel.app/widget.js`.

---

## 3. How an author uses it

They visit your homepage, customize the badge, and copy a snippet like:

```html
<script
  src="https://your-project.vercel.app/widget.js"
  data-author="Jane Doe"
  data-message="This content is written by a human. No AI-generated content."
  data-theme="light"
  async
></script>
```

They paste it anywhere in their HTML. The badge appears; a domain-only ping is sent.

### Widget options (`data-*` attributes)

| Attribute | Default | Description |
| --- | --- | --- |
| `data-author` | — | Name shown after the message. |
| `data-message` | "This content is written by a human…" | The badge text. |
| `data-theme` | `light` | `light` or `dark`. |
| `data-link` | your instance URL | Where the badge links to when clicked. |

---

## 4. See who's using it

Go to `https://your-project.vercel.app/dashboard`, enter your `ADMIN_TOKEN`, and you'll
see every embedding domain, its badge-load count, and first/last seen dates.

---

## Roadmap ideas

- Author accounts + per-author API keys (verified badges)
- Signed / tamper-evident badges
- Webhook or email alerts when a new site embeds
- A public directory of participating sites

## License

MIT — see [LICENSE](./LICENSE).
