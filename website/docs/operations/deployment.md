---
sidebar_position: 1
title: Deployment
description: Ship Bottega Digitale to Vercel, Docker or a VPS.
---

# Deployment

Bottega Digitale is a single Next.js app. You can deploy it three ways. We recommend **Vercel** for getting started, **Docker on a VPS** for cost-sensitive deployments, and **self-managed Kubernetes** only if you already operate Kubernetes.

## Option A — Vercel (recommended)

The repo ships with `vercel.json` pre-configured: build command, region (`cdg1` — Paris, for EU data residency), security headers and the cron schedule.

1. Push the repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Add the production environment variables — see [Configuration](../reference/configuration). Bare minimum:
   - `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (production database)
   - `SESSION_SECRET`, `CRON_SECRET`, `WEBHOOK_SIGNING_SECRET`
   - `NEXT_PUBLIC_URL` = your production origin
4. Deploy.

Vercel will:

- run `prisma generate && next build`,
- deploy to `cdg1`,
- schedule `/api/jobs` every 15 minutes,
- apply security headers to `/api/*`.

### Production database

Use **[Turso](https://turso.tech)** (LibSQL — distributed SQLite):

```bash
turso db create bottega-prod --location fra
turso db tokens create bottega-prod
```

Then add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to Vercel. On first boot the app runs `prisma db push` against the new database — or, for stricter teams, run migrations from a CI job.

## Option B — Docker on a VPS

The repo includes a multi-stage `Dockerfile` (node:20-alpine) producing a small standalone image.

```bash
docker build -t bottega-digitale .
docker run -d \
  --name bottega \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  -v /srv/bottega/data:/app/prisma \
  bottega-digitale
```

For a full stack with Caddy as the TLS terminator:

```bash
docker compose -f docker-compose.yml up -d
```

`docker-compose.yml` ships with:

- `bottega` — the app
- `caddy` — automatic HTTPS via Let's Encrypt
- `restic-backup` — daily encrypted snapshots of the SQLite file (when `RESTIC_REPOSITORY` is set)

### Recommended VPS sizing

| Scale | Suggested instance |
| --- | --- |
| < 50 merchants, < 5k bookings/month | Hetzner CX22 (2 vCPU, 4 GB), ~€5/mo |
| 50–500 merchants | Hetzner CCX13 or CX42 (4 vCPU, 8 GB), ~€15/mo |
| > 500 merchants | Move to Vercel or run two instances behind a load balancer |

### Cron on a VPS

There is no native scheduler — wire a host cron to hit `/api/jobs`:

```cron
*/15 * * * * curl -fsSL -X POST -H "Authorization: Bearer $CRON_SECRET" https://your-domain/api/jobs
```

## Option C — Kubernetes (advanced)

We don't ship Helm charts. The image is plain — wire your own `Deployment` + `Service` + `Ingress` + `CronJob` (or external scheduler). Sticky sessions are **not** required: sessions are JWT-style and stateless.

## Custom domains

Every merchant can use their own domain:

1. The merchant adds the domain in **Settings → Dominio**.
2. Bottega Digitale provisions the apex/www records to verify.
3. On Vercel: the domain is added programmatically via the Vercel API (requires `VERCEL_API_TOKEN`).
4. On VPS: Caddy auto-provisions a certificate on first request.

## Observability

Out of the box:

- `lib/observability.ts` writes structured JSON logs to stdout.
- `/api/health` is the liveness endpoint.
- Errors are surfaced on the dashboard's **System** page.

For production-grade monitoring, set:

```bash
SENTRY_DSN="https://..."           # optional, errors
AXIOM_TOKEN="..."                  # optional, log shipping
AXIOM_DATASET="bottega"
```

## Backups

For SQLite (dev) or `litestream`-replicated SQLite (VPS): nightly snapshots via `restic-backup`.
For Turso: enable [Turso Point-in-Time Restore](https://docs.turso.tech).

For the `MediaStorage` bucket: enable versioning at the storage provider level.

## Rolling deploys

`npm run build` is the same code path in every deploy target. Zero-downtime is automatic on Vercel; on VPS, use `docker compose up -d --no-deps --build bottega` — Docker Compose performs a recreate with the new image.

## Checklist before going live

- [ ] All secrets rotated from the `.env.example` values.
- [ ] Production `DATABASE_URL` points at Turso, not the bundled SQLite.
- [ ] Stripe webhook configured and the test `stripe trigger` succeeds.
- [ ] WhatsApp webhook URL set in Meta Business Manager.
- [ ] At least one template approved by Meta.
- [ ] Privacy policy and DPA reviewed by counsel.
- [ ] `/api/health` returns 200 from outside your network.
- [ ] Backups validated by performing a restore drill.
