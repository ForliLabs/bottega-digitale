import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';

const FEATURES = [
  {
    icon: '📅',
    title: 'Bookings & queue',
    body: 'Online appointments, walk-in queue and staff scheduling — synced to Google Calendar and confirmed over WhatsApp.',
  },
  {
    icon: '🧾',
    title: 'FatturaPA invoicing',
    body: 'Italian electronic invoicing built in: SDI-ready XML, multiple IVA rates, codice fiscale and partita IVA on every receipt.',
  },
  {
    icon: '📱',
    title: 'WhatsApp-native',
    body: 'Reach customers on the channel they actually use. Templates, automation rules and an AI assistant that drafts replies.',
  },
  {
    icon: '💳',
    title: 'Payments with Stripe Connect',
    body: 'Take deposits, sell gift cards, run checkout. Each merchant has its own Stripe account, no platform middleman.',
  },
  {
    icon: '🏷️',
    title: 'Loyalty & CRM',
    body: 'Points, digital fidelity cards, customer segments and birthday reminders — the customer book your nonna used to keep.',
  },
  {
    icon: '🤖',
    title: 'AI that earns its keep',
    body: 'Generate Instagram posts from a product photo, summarise the week\'s numbers, suggest replies — opt-in, never the only option.',
  },
];

const AUDIENCES = [
  {
    title: 'Solo founders & dev teams',
    body: 'Fork it, run it locally in 5 minutes, ship it to Vercel by lunch.',
  },
  {
    title: 'Trade associations',
    body: 'White-label portal for onboarding hundreds of member businesses at once.',
  },
  {
    title: 'Accountants & commercialisti',
    body: 'Pull invoices, IVA reports and revenue per client — no chasing email attachments.',
  },
  {
    title: 'Italian micro-businesses',
    body: 'Booking, payments and WhatsApp in Italian, with the fiscal compliance baked in.',
  },
];

const SNIPPET = `// Create a booking — TypeScript client
import {BottegaClient} from '@bottega-digitale/sdk';

const bd = new BottegaClient({apiKey: process.env.BOTTEGA_API_KEY});

const booking = await bd.bookings.create({
  businessSlug: 'barberia-da-marco',
  serviceId: 'svc_taglio_barba',
  staffId: 'staff_marco',
  startsAt: '2026-04-12T10:30:00+02:00',
  customer: {
    name: 'Luca Bianchi',
    phone: '+39 333 1234567',
    locale: 'it',
  },
  notifyVia: ['whatsapp'],
});

console.log(booking.confirmationCode); // → "BD-7H42"
`;

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} — Digital toolkit for Italian SMEs`}
      description={siteConfig.tagline}>
      <main>
        {/* HERO */}
        <section className="bd-hero">
          <div className="bd-hero__inner">
            <div>
              <span className="bd-eyebrow">🏪 Open-source SME platform</span>
              <h1>
                The <em>bancone digitale</em> for every bottega.
              </h1>
              <p className="bd-lede">
                Bottega Digitale is an all-in-one platform for Italian artisans, shops and small businesses —
                bookings, FatturaPA invoicing, WhatsApp automation, CRM and AI, in one open-source app.
              </p>
              <div className="bd-cta-row">
                <Link
                  className="button button--primary button--lg"
                  to="/docs/getting-started/quickstart">
                  Get started in 5 minutes →
                </Link>
                <Link
                  className="button button--secondary button--lg"
                  href="https://github.com/ForliLabs/bottega-digitale">
                  Star on GitHub
                </Link>
              </div>
              <div className="bd-badges">
                <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
                <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
                <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma" alt="Prisma 7" />
                <img src="https://img.shields.io/badge/tests-780-green" alt="780 tests" />
                <img src="https://img.shields.io/badge/license-source--available-orange" alt="License" />
              </div>
            </div>

            <div className="bd-terminal" aria-hidden="true">
              <div className="bd-terminal__bar">
                <span /><span /><span />
              </div>
              <pre>
{``}<span className="comment"># Clone &amp; run — works fully offline</span>{`
`}<span className="prompt">$</span>{` git clone https://github.com/ForliLabs/bottega-digitale
`}<span className="prompt">$</span>{` cd bottega-digitale && npm install
`}<span className="prompt">$</span>{` cp .env.example .env
`}<span className="prompt">$</span>{` npx prisma db push && npx tsx prisma/seed.ts
`}<span className="ok">✓</span>{` 3 demo businesses seeded in Forlì
`}<span className="prompt">$</span>{` npm run dev
`}<span className="ok">▲</span>{` ready on http://localhost:3000`}
              </pre>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="bd-section">
          <h2>Everything a bottega needs, nothing it doesn&apos;t.</h2>
          <p className="bd-section__sub">
            Six core surfaces, dozens of building blocks. Every feature degrades gracefully when the related
            integration is not configured — so you can run the whole platform with zero API keys for development.
          </p>
          <div className="bd-features">
            {FEATURES.map((f) => (
              <div className="bd-feature" key={f.title}>
                <span className="bd-feature__icon" aria-hidden="true">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SNIPPET */}
        <section className="bd-snippet">
          <div className="bd-snippet__inner">
            <div>
              <h2>One API for the entire shop.</h2>
              <p>
                Every booking, invoice, loyalty event and WhatsApp message flows through the same event bus.
                Compose automations from primitives or call the REST API directly — there is no second-class surface.
              </p>
              <p>
                <Link to="/docs/reference/api" className="button button--primary">
                  Read the API reference
                </Link>
              </p>
            </div>
            <CodeBlock language="typescript">{SNIPPET}</CodeBlock>
          </div>
        </section>

        {/* AUDIENCES */}
        <section className="bd-section">
          <h2>Built for the whole supply chain of Italian SME software.</h2>
          <p className="bd-section__sub">
            Bottega Digitale is distributed through trusted intermediaries — CNA, Confartigianato, commercialisti —
            and self-hostable by anyone who wants to run it themselves.
          </p>
          <div className="bd-audience">
            {AUDIENCES.map((a) => (
              <div className="bd-audience__card" key={a.title}>
                <strong>{a.title}</strong>
                <span>{a.body}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bd-cta-band">
          <div className="bd-cta-band__inner">
            <h2>Ready to digitise a bottega?</h2>
            <p>Read the quickstart, run the seed data, take your first booking — all in under five minutes.</p>
            <div className="bd-cta-row" style={{justifyContent: 'center'}}>
              <Link className="button button--primary button--lg" to="/docs/getting-started/quickstart">
                Quickstart
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/concepts/overview">
                Core concepts
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
