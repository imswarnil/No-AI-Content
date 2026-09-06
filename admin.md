# Admin dashboard

**URL:** https://nac.imswarnil.com/dashboard

The dashboard shows every site currently embedding the badge: total sites, total
badge loads, how many were active in the last 7 days, and a per-site table
(domain, author, whether it's currently listed in `/browse`, load count, first
seen, last seen).

## Logging in

There's no username/account — just one shared secret, `ADMIN_TOKEN`. Paste it
into the "Admin token" field on the dashboard and click **Load**. The browser
remembers it in `localStorage` afterwards, so you only have to paste it once
per browser.

## Finding the current token

The token isn't visible anywhere in the Cloudflare dashboard — secrets there
are write-only once set. The current value lives locally in this repo, in two
gitignored files (never committed):

```
.env          # used by `npm run dev`
.dev.vars     # used by `wrangler dev` / the OpenNext preview
```

Both hold the same value under `ADMIN_TOKEN=`. Open either one to read it.

## Rotating the token

If you ever need to change it (e.g. it leaked, or you want a fresh one):

```bash
# 1. Generate a new one
openssl rand -hex 32

# 2. Push it to the live Worker
wrangler secret put ADMIN_TOKEN
# (paste the new value when prompted)

# 3. Update your local copies so `npm run dev` / `wrangler dev` match
#    — edit ADMIN_TOKEN= in both .env and .dev.vars
```

Anyone with the old token loses access immediately; anyone with the dashboard
open in a browser tab will need the new one to load fresh data (their
`localStorage` copy just won't authenticate anymore).

## What it's protecting

Nothing especially sensitive — the same domain/author/hit-count data is public
via `GET /api/directory` anyway. The token mainly gates the *admin* view specifically:
every site regardless of directory-listing status, exact load counts, and
first/last-seen timestamps in one table, rather than the curated public roll.
