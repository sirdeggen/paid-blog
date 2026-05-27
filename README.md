# Paid Blog - Custom Express + Ghost

Your own Node.js Express application that boots and embeds Ghost.

This gives you full control to add custom middleware (payments, auth, logging, etc.) around Ghost.

## How it works

- Dockerfile uses `ghost-cli` to reliably install Ghost 5 + all native dependencies into `/app/ghost`
- `server.js` (your app) changes directory into the Ghost install and requires Ghost
- You mount `ghostServer.rootApp` into your Express app and add whatever middleware you want

## Run

```bash
docker compose up -d --build
```

Visit http://localhost:3000

## Adding Middleware

Edit `server.js`. Everything between the two comment blocks is yours:

```js
// ============================================================
// YOUR CUSTOM MIDDLEWARE GOES HERE
// ============================================================
```

Examples included: logging + custom health route.

## Database

SQLite (Knex) lives at `/app/ghost/content/data/ghost.db` inside the named volume `ghost_content`.

## Why ghost-cli instead of direct `npm install ghost`?

The published `ghost` package on npm has internal tarball references that frequently break in Docker / CI. Using the official Ghost CLI is the recommended and stable way to get a working Ghost installation inside a custom Dockerfile.

## Structure

- `server.js` → Your Express app (entrypoint)
- `Dockerfile` → Builds your app + uses ghost-cli for Ghost
- `docker-compose.yml` → Defines the server + persistent volume for the DB

This matches your request: own Node.js Express app using Ghost, own Dockerfile, docker-compose with server + database (SQLite volume).
