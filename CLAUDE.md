# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install deps
- `npm start` (or `node app.js`) — start server (default port 3000, override with `PORT=...`)
- `npm run dev` — nodemon auto-reload
- `MONGO_URI=mongodb://... node app.js` — point at a specific Mongo instance (defaults to `mongodb://localhost:27017/blogDB`)

No test runner, linter, or build step. `npm test` is a stub that exits 1.

## Architecture

Single-file Express app (`app.js`) rendering EJS views from `views/` against static assets in `public/`. All routes, schema, and DB connection live in `app.js`.

- **Routing**: `GET /`, `/about`, `/contact`, `/compose`, `/posts/:postId`; `POST /compose` creates a Post and redirects to `/`. `postId` is the Mongo `_id`.
- **Model**: single `Post` mongoose model with `postTitle` + `postBody` strings, defined inline.
- **Views**: EJS with shared `partials/header.ejs` + `partials/footer.ejs`. Lodash exposed to templates via `app.locals._`. Static lorem strings (`homeStartingContent`, `aboutContent`, `contactContent`) injected as locals.
- **Database**: Mongo URI read from `MONGO_URI` env var. Connection failure is logged but does NOT crash the process; DB-backed routes (`/`, `/posts/:id`, `POST /compose`) will 500 when Mongo is unreachable, while static routes (`/about`, `/contact`, `/compose` GET) keep working.
- **Static**: `express.static("public", { redirect: false })` — disables the trailing-slash 301 redirect that would otherwise fire on paths like `/about`.

## Caveats

- Mongo URI was previously hardcoded with live Atlas creds in git history (`a9e9643 Add MongoDB -- C/A`). Those creds are leaked — assume compromised; rotate if the cluster still exists.
- DB-backed handlers are `async`; do not regress to callback-style `Post.find(..., cb)` (removed in Mongoose 7+).
- Port 3000 is a common conflict on this machine (Docker). Use `PORT=3030` if `EADDRINUSE` or stale 301s appear.
