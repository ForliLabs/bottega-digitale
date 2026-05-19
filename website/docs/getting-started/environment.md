---
sidebar_position: 4
title: Environment & prerequisites
description: Versions, tooling and OS-specific notes for a smooth local setup.
---

# Environment & prerequisites

Bottega Digitale is a single Next.js 16 application with no external services required for development. This page covers the tooling you need and a few platform-specific notes.

## Supported tooling

| Tool | Tested versions | Why |
| --- | --- | --- |
| **Node.js** | 20 LTS, 22 | Required by Next.js 16 and Prisma 7 |
| **npm** | 9+ | The lockfile is `package-lock.json` |
| **TypeScript** | 5.x (bundled) | Strict mode is on |
| **SQLite** | bundled | Local dev database (`prisma/dev.db`) |
| **Docker** | 24+ (optional) | For container-based deployments |

We use **npm**, not pnpm or yarn — the lockfile is the source of truth.

## Recommended editor setup

- **VS Code** with the extensions: `Prisma`, `ESLint`, `Tailwind CSS IntelliSense`.
- Enable "format on save" and use the workspace `tsconfig.json` for path aliases.

## Operating systems

### macOS

Works out of the box on Apple Silicon. If `npm install` complains about `libsql`, run:

```bash
xcode-select --install
```

### Linux

Tested on Ubuntu 22.04 and Debian 12. No extra dependencies.

### Windows

Use **WSL2** (Ubuntu). Native Windows works but Prisma's LibSQL adapter and the seed scripts have rough edges on PowerShell paths.

## Environment variables

Copy the example file once and forget about it:

```bash
cp .env.example .env
```

Every variable is optional for development. The only one you might care about immediately is:

```bash
DATABASE_URL="file:prisma/dev.db"   # default — local SQLite
NEXT_PUBLIC_URL="http://localhost:3000"
```

For the full list and what each integration unlocks, see the [configuration reference](../reference/configuration).

## Resetting the database

When you want a clean slate (after schema changes or messy demo data):

```bash
rm prisma/dev.db
npx prisma db push
npx tsx prisma/seed.ts
```

The seed is idempotent — running it twice won't double the data, it will skip records that already exist by slug.

## Telemetry & analytics

Bottega Digitale does **not** phone home. There is no analytics SDK in `npm run dev`. Next.js telemetry is disabled by `vercel.json` in production and can be turned off locally with:

```bash
npx next telemetry disable
```
