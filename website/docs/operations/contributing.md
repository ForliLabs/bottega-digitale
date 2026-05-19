---
sidebar_position: 5
title: Contributing
description: How to propose changes, ship PRs and get them reviewed.
---

# Contributing

Bottega Digitale is built in the open. Contributions are welcome — bug fixes, docs improvements, new features, and feedback from real merchants are all valuable.

## Quick contributing checklist

1. **Open an issue first** for anything bigger than a typo. Describe the problem and proposed approach.
2. **Branch from `main`** with a descriptive name: `fix/booking-timezone`, `feat/gift-cards-pdf`.
3. **Write tests** for the change. We don't merge new domain logic without tests.
4. **Run `npm run lint && npm test`** before opening the PR.
5. **Keep PRs small** — under 400 lines diff is ideal. Split refactors from behaviour changes.
6. **Update docs** in `website/docs/` if you add or change public behaviour.

## Local setup for contributors

```bash
git clone https://github.com/ForliLabs/bottega-digitale.git
cd bottega-digitale
npm install
cp .env.example .env
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

For docs work:

```bash
cd website
npm install
npm start             # docs preview on :3000
```

## Style

- **TypeScript strict** — no `any` unless explicitly justified in a comment.
- **Tailwind utilities first**, custom CSS only when utilities can't express the design.
- **No dead code**. Remove the old path when you replace it.
- **No new dependencies without a discussion**. We are deliberate about supply-chain surface.

## Commit messages

We use a relaxed Conventional Commits style:

```
feat(booking): support group-class capacity
fix(whatsapp): retry sends on 429
docs(reference): clarify webhook signature freshness window
chore(deps): bump prisma to 7.9
```

## Review expectations

- A maintainer will look at your PR within 3 working days.
- We may ask for changes; that's normal and never personal.
- We squash-merge. Your commit history on the branch can be messy; the merge commit will be tidy.

## What we don't accept

- Drive-by formatting changes to files unrelated to your PR.
- Renames-for-the-sake-of-renames.
- New abstractions without a concrete second caller.
- AI-generated PRs that the author hasn't read and tested.

## Architecture decisions

Larger architectural changes go through an **ADR** (Architecture Decision Record) in `docs/adr/`. Open a draft PR with the ADR before you start writing the code.

## Recognition

Every merged PR adds you to the contributors list in the `CHANGELOG.md`. We celebrate first-time contributors in the release notes.

## Code of conduct

By participating you agree to the [Code of Conduct](./code-of-conduct). It boils down to: be kind, be patient, assume good faith.
