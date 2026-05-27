# Paid Blog — Custom Ghost (Node.js + Middleware)

This project runs **Ghost as a library** inside your own Node.js application.  
You get the full power of Ghost (admin UI, frontend, Members, API, themes) while having complete control to inject custom middleware, routes, payment logic, etc.

## Architecture

- **Custom Node.js server** (`index.js`) that boots Ghost programmatically using the `ghost` package.
- **Knex + SQLite** for the database (simple, file-based, no separate DB container needed for development).
- **Dockerfile** builds *your* server (not the official Ghost image).
- **docker-compose.yml** defines the app service + a persistent volume for the SQLite database and all Ghost content.

This gives you a clean place to add things like:
- Custom authentication / payment middleware
- Additional API routes
- Request logging, feature flags, A/B testing
- Integration with your own services

## Quick Start

```bash
docker compose up -d --build
```

Then open [http://localhost:3000](http://localhost:3000).

On first run you will see Ghost's standard setup wizard to create the admin account.

## Where to Add Your Middleware

Open [index.js](/index.js) and look for this section:

```js
// ============================================================
// CUSTOM MIDDLEWARE & ROUTES — ADD YOUR CODE BELOW THIS LINE
// ============================================================
```

Examples already included:
- Request logging
- Custom `/health` endpoint
- Placeholder comments for future payment/subscription middleware

## Project Structure

```
.
├── Dockerfile                 # Builds your custom Ghost Node.js app
├── docker-compose.yml         # App service + persistent volume for SQLite
├── index.js                   # Your server — Ghost + custom middleware lives here
├── package.json
├── .env.example
├── content/                   # Created at runtime (SQLite DB, images, themes)
│   └── data/ghost.db
└── README.md
```

## Database (SQLite + Knex)

Ghost uses Knex.js under the hood. In this setup we explicitly configure it to use SQLite:

```js
database__client=sqlite3
database__connection__filename=/app/content/data/ghost.db
```

The database file lives inside the `ghost_content` Docker volume. It will survive container restarts and `docker compose down`.

If you ever want to switch to MySQL/MariaDB (recommended for production), you can:
1. Add a `db` service in docker-compose.yml
2. Change the `database__*` environment variables
3. Run Ghost's migrations

## Adding Custom Middleware

Because you own the Express app that mounts `ghostServer.rootApp`, you can insert middleware anywhere:

- Before Ghost (your routes take precedence)
- After Ghost (catch-all, custom error handling)
- Around specific paths (`/members`, `/api`, etc.)

Example future payment check:

```js
app.use('/api/paid-content', async (req, res, next) => {
  const hasValidSubscription = await checkSubscription(req);
  if (!hasValidSubscription) return res.status(403).send('Payment required');
  next();
});
```

## Useful Commands

```bash
# Start / rebuild
docker compose up -d --build

# Follow logs
docker compose logs -f app

# Stop everything
docker compose down

# Nuclear reset (deletes the SQLite database and all content)
docker compose down -v
rm -rf content
```

## Production Considerations

- Switch from SQLite to MySQL/MariaDB
- Set `NODE_ENV=production`
- Configure proper `url` and email transport
- Consider running Ghost behind a reverse proxy (Caddy, Traefik, Nginx) for TLS
- Use a multi-stage Dockerfile for smaller images

## Why This Approach?

Using the official `ghost` Docker image is great for simple blogs.  
Running Ghost inside your own Node.js process (this setup) is the correct path when you need to extend it with custom business logic, payments, or integrations — exactly what a "paid blog" usually requires.

## License

MIT
