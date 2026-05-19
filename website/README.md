# Bottega Digitale — documentation site

This is the Docusaurus 3 source for the [Bottega Digitale](https://github.com/ForliLabs/bottega-digitale) documentation.

## Local development

```bash
npm install
npm start
```

The site runs on http://localhost:3000 (set `PORT=3001` if the main app is also running).

## Build

```bash
npm run build
```

The static site is written to `./build`. Deploy it anywhere — Vercel, Netlify, GitHub Pages, Cloudflare Pages.

## Structure

```
docs/
├── getting-started/   Introduction, quickstart, first booking
├── concepts/          Architecture, data model, event bus, why
├── guides/            Task-shaped recipes (booking, WhatsApp, Stripe…)
├── reference/         API, configuration, webhooks, CLI
└── operations/        Deployment, testing, troubleshooting, FAQ
```

Content is plain Markdown / MDX. Diagrams are Mermaid. Search is local (no Algolia required).
