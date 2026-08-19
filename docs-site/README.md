# Shipkit docs — Holocron build

A standalone [Holocron](https://holocron.so/) build of the Shipkit documentation,
kept as the alternative to the default in-app fumadocs renderer.

It reads the **same** MDX from `../docs` (via `pagesDir` in `vite.config.ts`), so
there is no second copy of the content to keep in sync. `docs.jsonc` is generated
from that tree by `scripts/generate-holocron-nav.mjs` and is gitignored.

## Run it

```bash
cd docs-site
npm install
npm run dev     # http://localhost:5173
```

To serve it at `/docs` on the main app, point Shipkit at it:

```bash
DOCS_PROVIDER=holocron DOCS_HOLOCRON_URL=http://localhost:5173 bun dev
```

`next.config.ts` then rewrites `/docs` and `/docs/*` to this server and the
in-app fumadocs route stands down. See `src/config/docs-provider.ts`.

## Deploying

Holocron has **no static-export mode** — `vite build` emits an RSC server
(`dist/rsc/index.js`), so it needs a Node or Cloudflare Workers runtime:

```bash
npm run build
npm start        # node dist/rsc/index.js
```

Set `DOCS_HOLOCRON_URL` to that deployment's origin.

## Status

`npm run dev` works — every route serves 200 and the content renders.

`npm run build` currently **fails on content errors**, and they are real:

- **15 broken internal links** across 6 pages (e.g. `/contributing`,
  `/integrations/infrastructure/aws-s3`, `/reference/snippets` — pages that do
  not exist). Fumadocs does not link-check, so these have been broken silently.
- **1 unsupported component**: `<FileTree>` in `docs/development/web-workers.mdx`.
  It is a Shipkit component; Holocron ships its own component set and has no
  equivalent.

To preview the built site before those are fixed:

```bash
HOLOCRON_SKIP_BUILD_ERRORS=true npm run build
```

Fixing the 15 links is worthwhile regardless of which provider ships — they are
broken under fumadocs too, just unreported.

## Caveats

- **Shipkit's app-wired MDX components do not exist here.** Holocron renders MDX
  with its own component set, so `<SiteName />` (used in `docs/index.mdx`) and
  any future `<SecretGenerator />` / `<AskAiButtons />` usage will not resolve.
  Keep app-specific components out of docs intended for this provider.
- Holocron is single-maintainer and pre-1.0; `@holocron.so/vite` is pinned to a
  caret range on 0.30.x.
