# Paid Blog

A Ghost-powered blog ready for paid content, newsletters, and membership subscriptions.

This project runs the **official Ghost** platform using Docker Compose with SQLite for simple, zero-dependency local development.

## Why Ghost?

Ghost is the leading open-source publishing platform with first-class support for:

- Beautiful native themes (including the excellent Casper theme)
- Built-in **Members** feature with Stripe integration for paid subscriptions
- Newsletters & email
- Full admin UI, rich editor, and content API
- Knex.js + SQLite (dev) or MySQL (production)

This is the real thing — not a custom clone.

## Quick Start

```bash
docker compose up -d
```

Then open [http://localhost:3000](http://localhost:3000)

On first visit you will be taken through Ghost's setup wizard:
1. Create your owner/admin account
2. Name your site
3. (Optional) Connect to Stripe later for paid memberships

## Stack

| Component     | Technology                          |
|---------------|-------------------------------------|
| Platform      | Ghost 5 (official Docker image)     |
| Database      | SQLite (via Knex.js)                |
| Web Server    | Node.js (inside Ghost container)    |
| Port          | 3000 (mapped to Ghost's 2368)       |

## Project Structure

```
.
├── docker-compose.yml
├── .env.example
├── README.md
├── content/               # ← Ghost data lives here (SQLite, images, themes, logs)
│   └── .gitkeep
└── .gitignore
```

The `content/` directory is where Ghost stores everything persistent:
- `content/data/ghost.db` — your SQLite database
- `content/images/` — uploaded images
- `content/themes/` — custom themes
- `content/logs/`

## Environment Variables

Copy `.env.example` to `.env` if you want to customize settings:

```bash
cp .env.example .env
```

Key variables:

- `url` — Public URL of the site (very important for admin, RSS, emails)
- `NODE_ENV` — `development` or `production`

## Working With Content

After the initial setup wizard:

1. Go to **http://localhost:3000/ghost**
2. Log in with the account you created
3. Create your first posts using Ghost's excellent editor (Markdown + rich cards supported)

You can create a placeholder post during onboarding or right after.

## Adding Paid Memberships (The Whole Point)

Ghost has native support for paid subscriptions:

1. In the admin, go to **Settings → Membership**
2. Connect your Stripe account (test mode works great locally)
3. Create paid tiers (e.g., "Monthly Supporter", "Annual")
4. Mark posts as "Members-only" or "Paid members only"

This project is intentionally set up under the name `paid-blog` because Ghost + Stripe is one of the best stacks available for running a paid publication.

## Useful Commands

```bash
# Start
docker compose up -d

# View logs
docker compose logs -f ghost

# Stop
docker compose down

# Stop and remove the SQLite database + all content (nuclear option)
docker compose down -v
rm -rf content
```

## Production Notes

When you're ready for production:

- Switch to MySQL/MariaDB (Ghost strongly recommends it at scale)
- Set `NODE_ENV=production`
- Use a real domain + HTTPS (Ghost works great behind Caddy, Nginx, or Traefik)
- Set up proper email (Mailgun, SES, etc.)
- Consider Ghost's official hosting (ghost.org) if you don't want to manage infra

## License

MIT (Ghost itself is MIT licensed)
