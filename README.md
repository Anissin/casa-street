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
| `CMS_DATA_FILE` | Optional path for the saved menu and owner settings (default `.casa-cms-state.json`). Use persistent storage in production — container filesystems are wiped on redeploy. |
| `UPLOADS_DIR` | Optional folder for photos uploaded in the admin (default `.casa-uploads`). Also needs persistent storage. |
| `PORT` | Server port (default 3000). |

See `.env.example`.

## Admin (Owner Studio)

Press **Ctrl + Shift + C** (Mac: **Cmd + Shift + C**) anywhere on the site, or open
`/#owner` on a phone or tablet, then enter the `OWNER_CMS_TOKEN` passcode. The
shortcut only opens the passcode screen; the passcode is what protects the admin.

- **Edit Menu** — add new dishes; edit name, description, price, photo, halal tag and
  order links; move dishes between sections; reorder, hide (e.g. sold out) or delete
  them; edit section titles and descriptions.
- **Halal** — turn the 100% Halal messaging on/off and choose which dishes carry a
  halal tag (certification wording is optional and off by default).
- **Drafts** — confirm and publish the French Tacos section (hidden until confirmed).
- **Social Links / Follow Feed** — verify optional TikTok / Facebook / WhatsApp links
  and upload or approve photos for "Follow the Flavour".

### Link-injection protection (always on)

Enforced by the server, with instant feedback in the editor
(`src/lib/contentSafety.ts`):

- dish names, descriptions, section text and captions cannot contain links, web
  addresses (`www.`, `example.com`), `javascript:`/`data:` URLs or `<` `>` characters;
- dish order links must be `https://` on `ubereats.com` or `deliveroo.co.uk`
  (look-alikes such as `ubereats.com.evil.example` are rejected);
- uploaded photos must really be JPEG/PNG/WebP (checked by file signature) and are
  stored under `/uploads` with a content-hash file name;
- the address, social profiles and the official Instagram / Uber Eats / Deliveroo /
  Google Maps links are fixed in `src/lib/cms.ts` and cannot be changed via the API.

## Images

Optimised WebP files in `public/images/` are generated from the originals by:

```bash
npm run images         # python3 scripts/optimize-images.py (needs Pillow)
```
