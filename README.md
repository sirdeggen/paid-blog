# Blog Slog Vlog

![GitHub](https://img.shields.io/github/license/efecollins/blog-template-ejs)

A modern personal blog with pay-per-post Bitcoin SV micropayments.

This project is a derivative work based on the [Blog Template using EJS](https://github.com/efecollins/blog-template-ejs) originally created by **Efosa Collins EVBOWE** in 2022 and released under the ISC License. The original copyright notice and permission text are preserved in the [LICENSE](LICENSE) file.

## Our Changes

We evolved the classic template into **Blog Slog Vlog** — a lightweight, self-hosted platform for personal "brain dumps" that readers unlock with tiny one-time payments instead of subscriptions or ads:

- **Complete UI overhaul** — Modern design using Tailwind CSS (via CDN), full dark/light mode with system preference detection, custom serif typography, sticky navigation, hero section, and beautiful card-based listings with auto-generated excerpts.
- **Rich text composer** — Replaced the basic form with [Quill.js](https://quilljs.com) for headings, bold/italic, lists, blockquotes, code blocks, links, and direct image pasting or embedding.
- **Pay-per-post monetization** — Posts are protected by the BRC-121 HTTP 402 Payment Required protocol on Bitcoin SV using `@bsv/402-pay` + `@bsv/simple`. Readers pay a small one-time fee (default 10 sats) to unlock any individual piece permanently. No accounts or recurring billing required.
- **Payments are optional** — When `SERVER_PRIVATE_KEY` is not set, the 402 middleware is skipped and every post is freely readable (ideal for local development and demos).
- **Docker support** — Added `Dockerfile` and `docker-compose.yml` so you can launch a full MongoDB + app stack with a single command.
- **Environment-driven configuration** — MongoDB URI, BSV receiving key, price per post, and network settings are loaded from `.env` via `dotenv`. No more hardcoded credentials in source.
- **Modernized internals** — Express 5, Mongoose 9, proper `async/await` handlers, graceful fallback when the database is unreachable, clean HTML-stripped excerpts, and `express.static` configured without unwanted trailing-slash redirects.
- Removed the original static About/Contact pages and placeholder lorem content.

The result is a simple, elegant paid publishing tool for short-form personal writing.

## Features

- Write with a distraction-free rich editor (paste images directly from clipboard)
- One-time micropayments (fractions of a cent in BSV) — no subscriptions, no ads
- Self-hosted with a minimal, well-understood stack
- Automatic light/dark theme
- Works seamlessly with the [BSV 402 browser extension](https://github.com/bsv-blockchain/402-extension) for frictionless reading

## Tech Stack

Node.js, Express, EJS, Tailwind CSS, Quill, Mongoose/MongoDB, `@bsv/402-pay`, `@bsv/simple`, `dotenv`.

## Installation

### Docker (recommended for local development)

```bash
git clone <your-repo-url>
cd paid-blog
# Create .env with your settings (see Environment Variables below)
docker compose up
```

Visit http://localhost:3000. MongoDB runs automatically alongside the app.

### Manual setup

```bash
git clone <your-repo-url>
cd paid-blog
npm install
```

Create a `.env` file with at least the following (example values shown):

```env
MONGO_URI=mongodb://localhost:27017/blogDB
# SERVER_PRIVATE_KEY=...          # Required to enable 402 payments (omit to disable)
POST_PRICE_SATS=10
BSV_NETWORK=main
PORT=3000
```

Start MongoDB locally (or point `MONGO_URI` at a remote instance), then:

```bash
npm run dev     # auto-reloads on changes
# or
npm start
```

You should see:

```
Server started on port 3000
```

## Environment Variables

| Variable            | Purpose                          | Default / Notes                                      |
|---------------------|----------------------------------|------------------------------------------------------|
| `MONGO_URI`         | MongoDB connection               | `mongodb://localhost:27017/blogDB`                   |
| `SERVER_PRIVATE_KEY`| BSV private key for receiving payments (WIF or hex) | Omit to disable all payment gating |
| `POST_PRICE_SATS`   | Price per post unlock            | `10`                                                 |
| `BSV_NETWORK`       | `main` or `test`                 | `main`                                               |
| `BSV_STORAGE_URL`   | ARC/storage service for tx checks| `https://store-us-1.bsvb.tech`                       |
| `PORT`              | HTTP listen port                 | `3000`                                               |

**Security**: The `SERVER_PRIVATE_KEY` is a hot wallet key that receives the micropayments. Use a dedicated low-balance key and never commit it to git.

## How Payments Work

- The homepage and compose page are always public.
- When payments are enabled, visiting any `/posts/:postId` returns a standard HTTP **402 Payment Required** response with BRC-121 headers.
- A compatible client (the official BSV 402 browser extension or code using `create402Fetch` from `@bsv/402-pay/client`) automatically constructs and broadcasts a tiny BSV transaction, then retries the request with the payment proof (`x-bsv-beef` etc.).
- Once paid for that post, the full rich-text content is served. Payments are stateless and replay-protected.

## Writing & Publishing

1. Click **Write** or visit `/compose`.
2. Add a memorable title and compose your piece in the rich editor.
3. Publish — the post appears immediately on the homepage as a preview card (title + excerpt).
4. Readers discover it, click through, and pay the small satoshi amount to read the full story.

## License

ISC License (same as the original work).

- Original template: Copyright (c) 2022 Efosa Collins EVBOWE
- This derivative: see [LICENSE](LICENSE) for the full text

The original author's copyright notice and the full ISC permission/disclaimer text are included in the LICENSE file as required by the license.
