# Changelog

All notable changes to Bottega Digitale will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `withTenantGuard` helper that injects `businessId` into queries with tenant isolation
- SHA-256 hashing for session tokens — raw tokens are no longer stored in the database
- Prisma migrate deploy step in CI pipeline (runs on `main` push only)
- Playwright E2E test setup with login smoke test (`npm run test:e2e`)
- MIT LICENSE file

### Changed
- `getBusinessContext` no longer falls back to first business in production mode
- `.gitignore` now explicitly allows `.env.example` and excludes `prisma/dev.db`

### Security
- Session tokens are stored as SHA-256 hashes instead of plaintext
- Production environments no longer expose demo business fallback

## [0.1.0] — 2025-01-01

### Added
- Initial multi-tenant SaaS platform for Forlì small businesses
- Authentication with scrypt password hashing and cookie-based sessions
- Prisma ORM with SQLite/Turso dual-backend support
- Dashboard with analytics, bookings, products, invoices, and more
- WhatsApp Business API integration
- AI advisor and content generation modules
- GDPR compliance module
- Rate limiting and CSRF protection
- Google Business Profile integration
- E-invoicing (Fattura Elettronica) support
- Customer CRM and loyalty program
- Staff management portal
- Marketplace and cross-promotion features
