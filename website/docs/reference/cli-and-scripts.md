---
sidebar_position: 4
title: CLI & scripts
description: Every npm script and what it does.
---

# CLI & scripts

Bottega Digitale doesn't ship a custom CLI — everything is an `npm` script or a `tsx` invocation. This page documents each one.

## Daily workflow

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js dev server with Turbopack on port 3000 |
| `npm run build` | Run `prisma generate` and a Next.js production build |
| `npm run start` | Start the production server (after `build`) |
| `npm run lint` | ESLint over `src/**` |

## Database

| Script | What it does |
| --- | --- |
| `npx prisma generate` | Generate the Prisma client into `src/generated/` |
| `npx prisma db push` | Apply the schema to the local SQLite (no migrations) |
| `npx prisma migrate dev` | Create and apply a migration (only on the Turso branch) |
| `npx prisma studio` | Open the Prisma Studio GUI on port 5555 |
| `npx tsx prisma/seed.ts` | Seed the three demo businesses |
| `npx tsx prisma/seed.ts --clean` | Wipe and re-seed |

## Testing

| Script | What it does |
| --- | --- |
| `npm test` | Run all Vitest suites once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Coverage report — 60% threshold on `src/lib/` |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run test:e2e:ui` | Playwright in UI mode |

## Maintenance scripts

These live under `scripts/` and are run with `tsx`:

```bash
npx tsx scripts/check-env.ts          # validate .env for current target
npx tsx scripts/rotate-secrets.ts     # rotate SESSION_SECRET safely
npx tsx scripts/backup-db.ts          # gzip dump of dev.db
npx tsx scripts/issue-test-invoice.ts # generate a sample FatturaPA XML
```

## Production cron

The cron entry point is an HTTP endpoint, not a script:

```bash
curl -X POST https://<your-domain>/api/jobs \
  -H "Authorization: Bearer $CRON_SECRET"
```

Vercel cron (configured in `vercel.json`) hits this every 15 minutes. Self-hosted deployments should configure their own scheduler — see [Deployment](../operations/deployment).

## Docker

```bash
docker compose up -d                  # full stack with bind-mounted dev DB
docker compose logs -f bottega        # tail logs
docker build -t bottega-digitale .    # standalone image
```

## Generating types

After changing the Prisma schema:

```bash
npx prisma generate                   # regenerates the client
npm run lint                          # picks up new types
```

Most type drift in the codebase comes from forgetting `prisma generate` — `npm run build` does it automatically, but `npm run dev` does not.
