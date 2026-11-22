# Casa Street

Website for Casa Street — 100% halal Moroccan street food at The Food District,
145–147 Edgware Road, London W2 2HR. React 19 + Vite + Tailwind CSS 4, served by
a small Express server that also stores the owner's publishing decisions.

## Run it

```bash
bun install            # or npm install
npm run dev            # http://localhost:3000 (Vite middleware, hot reload)
npm run build          # production bundle in dist/
npm start              # production server (NODE_ENV=production) on $PORT or 3000
```

## Checks

```bash
npm run typecheck      # TypeScript
npm test               # CMS + server security tests (node:test via tsx)
```

## Configuration (environment variables)

| Variable | Purpose |
| --- | --- |
| `OWNER_CMS_TOKEN` | **Required to save changes in the Owner Studio.** At least 12 characters; keep it secret. Without it the site works and the studio is read-only. |
| `SITE_URL` | Public https origin (e.g. `https://www.example.com`). Used for the canonical link, share-image URLs, `robots.txt` and `sitemap.xml`. Falls back to `APP_URL`. |
| `GEMINI_API_KEY` | Optional. Enables the owner-only "Verify Photo with Gemini" check. |
| `GEMINI_MODEL` | Optional model override for the photo check. |
| `CMS_DATA_FILE` | Optional path for the saved owner settings (default `.casa-cms-state.json`). Use persistent storage in production — container filesystems are wiped on redeploy. |
| `PORT` | Server port (default 3000). |

See `.env.example`.

## Owner Studio

Open it from the **Owner login** link in the footer (or `/#owner`) and enter the
`OWNER_CMS_TOKEN` passcode. From there the owner can:

- turn the **100% Halal** messaging on/off and choose which dishes carry a halal tag
  (certification wording is optional and off by default);
- confirm and publish the French Tacos section (hidden until confirmed);
- verify optional TikTok / Facebook / WhatsApp links (hidden until verified);
- upload and approve photos for the "Follow the Flavour" section.

Prices, descriptions, addresses and the official Instagram / Uber Eats / Deliveroo /
Google Maps links live in `src/lib/cms.ts`; the server ignores attempts to change
them through the API.

## Images

Optimised WebP files in `public/images/` are generated from the originals by:

```bash
npm run images         # python3 scripts/optimize-images.py (needs Pillow)
```
