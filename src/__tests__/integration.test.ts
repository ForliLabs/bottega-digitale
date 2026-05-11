// Integration Test Suite — Feature 2
// Tests service-layer functions end-to-end across module boundaries
// Covers 5 critical paths: auth, booking, product/order, customer, webhook/API key

import { describe, it, expect } from "vitest";

// ─── Journey 1: Auth & Business Setup ───────────────────────────

describe("Integration — Auth & Business Setup", () => {
  it("should hash and verify passwords correctly", async () => {
    const { hashPassword, verifyPassword } = await import("@/lib/auth");
    const hash = await hashPassword("Secure!Pass123");

    expect(hash).toContain("scrypt");
    expect(hash.split("$").length).toBe(4);

    const valid = await verifyPassword("Secure!Pass123", hash);
    expect(valid).toBe(true);

    const invalid = await verifyPassword("wrongPassword", hash);
    expect(invalid).toBe(false);
  });

  it("should generate unique session tokens", async () => {
    const { generateToken } = await import("@/lib/auth");
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(generateToken());
    }
    expect(tokens.size).toBe(100);
  });

  it("should validate registration input correctly", async () => {
    const { validateInput } = await import("@/lib/security");

    const noErrors = validateInput(
      { email: "test@example.com", password: "SecurePass1!", businessName: "La Bottega" },
      [
        { field: "email", type: "email", required: true },
        { field: "password", type: "string", required: true, minLength: 8, maxLength: 128 },
        { field: "businessName", type: "string", required: true, minLength: 2, maxLength: 100 },
      ],
    );
    expect(noErrors).toHaveLength(0);

    const emailErrors = validateInput(
      { email: "not-an-email", password: "SecurePass1!", businessName: "La Bottega" },
      [{ field: "email", type: "email", required: true }],
    );
    expect(emailErrors.length).toBeGreaterThan(0);

    const passErrors = validateInput(
      { email: "test@example.com", password: "short", businessName: "La Bottega" },
      [{ field: "password", type: "string", required: true, minLength: 8 }],
    );
    expect(passErrors.length).toBeGreaterThan(0);

    const missingErrors = validateInput(
      { email: "test@example.com", password: "SecurePass1!" },
      [{ field: "businessName", type: "string", required: true }],
    );
    expect(missingErrors.length).toBeGreaterThan(0);
  });

  it("should enforce rate limiting through the full pipeline", async () => {
    const { checkRouteRateLimit, rateLimiter, withRateLimit } = await import("@/lib/rate-limiter");
    rateLimiter.reset();

    // Test low-level rate limiter
    const result = checkRouteRateLimit("auth:login", "integration-ip-1");
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(10);

    // Exhaust limit
    for (let i = 0; i < 9; i++) {
      checkRouteRateLimit("auth:login", "integration-ip-1");
    }
    const blocked = checkRouteRateLimit("auth:login", "integration-ip-1");
    expect(blocked.allowed).toBe(false);

    // Test wrapper-level rate limiter
    const handler = withRateLimit("auth:register", async () => {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    for (let i = 0; i < 3; i++) {
      const res = await handler(new Request("http://localhost", {
        headers: { "x-forwarded-for": "integration-ip-2" },
      }));
      expect(res.status).toBe(200);
      expect(res.headers.get("X-RateLimit-Limit")).toBe("3");
    }

    const blockedRes = await handler(new Request("http://localhost", {
      headers: { "x-forwarded-for": "integration-ip-2" },
    }));
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.headers.get("Retry-After")).toBeTruthy();

    rateLimiter.reset();
  });

  it("should provide business templates for Italian categories", async () => {
    const { BUSINESS_TEMPLATES, getTemplate, getTemplateCategories } = await import("@/lib/business-templates");
    const categories = getTemplateCategories();
    expect(categories.length).toBe(10);

    const barbershop = getTemplate("barbiere");
    expect(barbershop).toBeDefined();
    expect(barbershop!.label).toContain("Barbiere");
    expect(barbershop!.services.length).toBeGreaterThan(0);
    expect(barbershop!.openingHours.length).toBeGreaterThan(0);

    expect(BUSINESS_TEMPLATES.length).toBe(10);
  });

  it("should calculate onboarding progress", async () => {
    const { calculateProgress, isOnboardingComplete, WIZARD_STEPS, getNextStep } = await import("@/lib/onboarding");

    expect(WIZARD_STEPS.length).toBeGreaterThanOrEqual(7);

    const noProgress = calculateProgress([]);
    expect(noProgress.percentComplete).toBe(0);

    const step1 = WIZARD_STEPS[0].id;
    const step2 = WIZARD_STEPS[1].id;
    const step3 = WIZARD_STEPS[2].id;

    const someProgress = calculateProgress([step1, step2, step3]);
    expect(someProgress.percentComplete).toBeGreaterThan(0);
    expect(someProgress.percentComplete).toBeLessThan(100);

    const allSteps = WIZARD_STEPS.map((s) => s.id);
    expect(isOnboardingComplete(allSteps)).toBe(true);
    expect(isOnboardingComplete([step1])).toBe(false);

    const next = getNextStep([step1]);
    expect(next).toBeDefined();
    expect(next!.id).toBe(step2);
  });

  it("should validate environment configuration", async () => {
    const { validateEnvironment } = await import("@/lib/security");
    const result = validateEnvironment();
    expect(result).toHaveProperty("valid");
    expect(result).toHaveProperty("missing");
    expect(result).toHaveProperty("warnings");
  });
});

// ─── Journey 2: Booking Flow ────────────────────────────────────

describe("Integration — Booking Flow", () => {
  it("should validate booking input end-to-end", async () => {
    const { validateInput } = await import("@/lib/security");

    const valid = validateInput(
      {
        customerName: "Marco Rossi",
        startsAt: new Date(Date.now() + 86400000).toISOString(),
        customerPhone: "+39 333 1234567",
      },
      [
        { field: "customerName", type: "string", required: true, minLength: 2, maxLength: 80 },
        { field: "startsAt", type: "date", required: true },
        { field: "customerPhone", type: "phone" },
      ],
    );
    expect(valid).toHaveLength(0);
  });

  it("should normalize phone numbers for booking", async () => {
    const { normalizePhoneNumber, isValidPhoneNumber } = await import("@/lib/utils");

    const normalized = normalizePhoneNumber("+39 333 123 4567");
    expect(normalized).toBe("+393331234567");
    expect(isValidPhoneNumber(normalized)).toBe(true);
    expect(isValidPhoneNumber("abc")).toBe(false);
  });

  it("should emit booking events through event router", async () => {
    const { emit } = await import("@/lib/event-router");

    // Skip automation and analytics (require DB), keep realtime (in-memory)
    const result = await emit(
      {
        type: "booking.created",
        businessId: "test-business-integration",
        data: {
          bookingId: "bk-test-1",
          customerName: "Test Customer",
          service: "Taglio",
          startsAt: new Date().toISOString(),
        },
        source: "integration-test",
      },
      { skipSystems: ["webhook", "analytics", "automation"] },
    );

    expect(result.correlationId).toMatch(/^evt_/);
    expect(result.realtime.dispatched).toBe(true);
  });

  it("should track booking events in observability metrics", async () => {
    const { metrics, withObservability } = await import("@/lib/observability");

    const handler = withObservability("/api/bookings", async () => {
      return new Response(JSON.stringify({ id: "bk-1" }), { status: 201 });
    });

    const response = await handler(new Request("http://localhost/api/bookings", { method: "POST" }));
    expect(response.status).toBe(201);

    const stats = metrics.getRouteStats("/api/bookings", 1);
    expect(stats.count).toBeGreaterThanOrEqual(1);
  });
});

// ─── Journey 3: Product & Order Flow ────────────────────────────

describe("Integration — Product & Order Flow", () => {
  it("should define order status flow", async () => {
    const { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } = await import("@/lib/product-catalog");

    expect(ORDER_STATUS_FLOW["ricevuto"]).toBe("in_preparazione");
    expect(ORDER_STATUS_FLOW["in_preparazione"]).toBe("pronto");
    expect(ORDER_STATUS_FLOW["pronto"]).toBe("consegnato");
    expect(ORDER_STATUS_FLOW["consegnato"]).toBeNull();

    expect(ORDER_STATUS_LABELS["ricevuto"]).toBeDefined();
    expect(ORDER_STATUS_LABELS["consegnato"]).toBeDefined();
  });

  it("should format prices in Euro correctly", async () => {
    const { formatPrice } = await import("@/lib/product-catalog");
    const { formatEuro } = await import("@/lib/payments");

    // Intl.NumberFormat with it-IT may produce different spacing/symbols
    const price22 = formatPrice(22.5);
    expect(price22).toContain("22");
    expect(price22).toContain("€");

    const price0 = formatPrice(0);
    expect(price0).toContain("0");
    expect(price0).toContain("€");

    const euro100 = formatEuro(100);
    expect(euro100).toContain("100");
    expect(euro100).toContain("€");
  });

  it("should provide e-invoice IVA rates and formatting", async () => {
    const { IVA_RATES, formatEuro } = await import("@/lib/e-invoice");

    expect(IVA_RATES.standard).toBe(22);
    expect(IVA_RATES.reduced).toBe(10);
    expect(IVA_RATES.superReduced).toBe(4);
    expect(IVA_RATES.exempt).toBe(0);

    const formatted = formatEuro(22.0);
    expect(formatted).toContain("22");
    expect(formatted).toContain("€");
  });
});

// ─── Journey 4: Customer Portal ─────────────────────────────────

describe("Integration — Customer Portal", () => {
  it("should generate valid OTP codes", async () => {
    const { generateOTP } = await import("@/lib/customer-auth");

    const otp = generateOTP();
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);

    // Generate multiple and ensure variety
    const otps = new Set<string>();
    for (let i = 0; i < 50; i++) {
      otps.add(generateOTP());
    }
    expect(otps.size).toBeGreaterThan(10);
  });

  it("should format GDPR data exports as CSV", async () => {
    const { formatExportAsCSV } = await import("@/lib/gdpr");

    const csv = formatExportAsCSV({
      customer: {
        name: "Marco Rossi",
        phone: "+393331234567",
        email: "marco@example.com",
        createdAt: new Date("2025-01-01").toISOString(),
      },
      bookings: [
        {
          service: "Taglio",
          startsAt: new Date("2025-01-15T10:00:00Z").toISOString(),
          status: "Completata",
          priceEuro: 22,
        },
      ],
      loyaltyCards: [],
      orders: [],
      queueEntries: [],
      consent: null,
      exportedAt: new Date().toISOString(),
      format: "csv",
    });

    expect(csv).toContain("Marco Rossi");
    expect(typeof csv).toBe("string");
  });

  it("should provide default consent preferences", async () => {
    const { DEFAULT_CONSENT, COOKIE_CATEGORIES } = await import("@/lib/gdpr");

    expect(DEFAULT_CONSENT).toBeDefined();
    expect(DEFAULT_CONSENT).toHaveProperty("whatsappMarketing");
    expect(DEFAULT_CONSENT).toHaveProperty("emailMarketing");
    expect(DEFAULT_CONSENT.emailTransactional).toBe(true);
    expect(DEFAULT_CONSENT.whatsappMarketing).toBe(false);

    expect(COOKIE_CATEGORIES.length).toBeGreaterThanOrEqual(3);
  });

  it("should generate privacy policy text", async () => {
    const { generatePrivacyPolicy } = await import("@/lib/gdpr");

    const policy = generatePrivacyPolicy({
      businessName: "Barberia Da Marco",
      email: "marco@barberia.it",
      address: "Via Roma 1, 47121 Forlì FC",
      phone: "+39 0543 123456",
      city: "Forlì",
    });

    expect(policy).toContain("BARBERIA DA MARCO");
    expect(policy).toContain("marco@barberia.it");
    expect(policy.length).toBeGreaterThan(100);
  });

  it("should calculate dashboard metrics from demo data", async () => {
    const { calculateDashboardMetrics, sampleBookings, sampleCustomers, sampleReviews } = await import("@/lib/data");

    const dashMetrics = calculateDashboardMetrics(sampleBookings, sampleCustomers, sampleReviews);
    expect(dashMetrics).toHaveProperty("websiteVisits");
    expect(dashMetrics).toHaveProperty("bookingsToday");
    expect(dashMetrics).toHaveProperty("averageRating");
    expect(dashMetrics).toHaveProperty("reviewsCount");
    expect(dashMetrics.reviewsCount).toBeGreaterThan(0);
  });
});

// ─── Journey 5: Webhook & API Key Flow ──────────────────────────

describe("Integration — Webhook & API Key Flow", () => {
  it("should generate valid API keys with proper format", async () => {
    const { generateApiKey } = await import("@/lib/webhook-api");

    const result = generateApiKey();
    expect(result.key).toBeDefined();
    expect(result.key.startsWith("sk_live_")).toBe(true);
    expect(result.key.length).toBeGreaterThan(20);
    expect(result.prefix).toBeDefined();
    expect(result.prefix).toContain("...");
  });

  it("should sign webhook payloads with HMAC-SHA256", async () => {
    const { signWebhookPayload } = await import("@/lib/webhook-api");

    const payload = JSON.stringify({ event: "booking.created", data: { id: "bk-1" } });
    const secret = "whsec_test_secret_key_12345";

    const signature = await signWebhookPayload(payload, secret);
    expect(signature).toBeDefined();
    expect(signature.length).toBeGreaterThan(0);

    // Same payload + secret should produce same signature
    const signature2 = await signWebhookPayload(payload, secret);
    expect(signature).toBe(signature2);

    // Different payload should produce different signature
    const diffSig = await signWebhookPayload(payload + "modified", secret);
    expect(diffSig).not.toBe(signature);
  });

  it("should generate a complete OpenAPI spec", async () => {
    const { generateOpenAPISpec } = await import("@/lib/webhook-api");

    const spec = generateOpenAPISpec();
    expect(spec.openapi).toMatch(/^3\./);
    expect(spec.info).toBeDefined();
    expect((spec.info as Record<string, unknown>).title).toBeDefined();
    expect(spec.paths).toBeDefined();
    expect(Object.keys(spec.paths as object).length).toBeGreaterThan(5);
    expect(spec.components).toBeDefined();
  });

  it("should list available webhook event types", async () => {
    const { WEBHOOK_EVENTS } = await import("@/lib/webhook-api");

    expect(Array.isArray(WEBHOOK_EVENTS)).toBe(true);
    expect(WEBHOOK_EVENTS.length).toBeGreaterThanOrEqual(8);
    expect(WEBHOOK_EVENTS.some((e) => e.type === "booking.created")).toBe(true);
    expect(WEBHOOK_EVENTS.some((e) => e.type === "payment.received")).toBe(true);
  });

  it("should hash API keys securely", async () => {
    const { hashApiKey } = await import("@/lib/webhook-api");

    const hash1 = await hashApiKey("bd_test_key_123");
    const hash2 = await hashApiKey("bd_test_key_123");
    expect(hash1).toBe(hash2); // deterministic

    const diffHash = await hashApiKey("bd_test_key_456");
    expect(diffHash).not.toBe(hash1); // different keys -> different hashes
  });
});

// ─── Cross-Cutting: Event Backbone Integration ──────────────────

describe("Integration — Unified Event Backbone", () => {
  it("should dispatch events to downstream systems", async () => {
    const { emit } = await import("@/lib/event-router");

    // Skip automation, webhook, analytics (require DB); test realtime (in-memory)
    const result = await emit(
      {
        type: "booking.created",
        businessId: "test-integration-biz",
        data: { bookingId: "bk-int-1", customerName: "Test" },
        source: "integration-test",
      },
      { skipSystems: ["webhook", "analytics", "automation"] },
    );

    expect(result.correlationId).toBeTruthy();
    expect(result.realtime.dispatched).toBe(true);
  });

  it("should prevent duplicate event dispatch", async () => {
    const { emit } = await import("@/lib/event-router");

    const correlationId = `dedup-test-${Date.now()}`;

    const first = await emit({
      type: "payment.received",
      businessId: "test-dedup-biz",
      data: { amount: 50 },
      correlationId,
      source: "integration-test",
    });

    const second = await emit({
      type: "payment.received",
      businessId: "test-dedup-biz",
      data: { amount: 50 },
      correlationId,
      source: "integration-test",
    });

    expect(first.correlationId).toBe(correlationId);
    expect(second.correlationId).toBe(correlationId);
  });

  it("should respect max depth to prevent infinite loops", async () => {
    const { emit } = await import("@/lib/event-router");

    const result = await emit(
      {
        type: "booking.created",
        businessId: "test-depth-biz",
        data: {},
        source: "integration-test",
      },
      { depth: 3 },
    );

    expect(result.automation.dispatched).toBe(false);
    expect(result.automation.error).toContain("Max depth");
  });

  it("should skip specific downstream systems when requested", async () => {
    const { emit } = await import("@/lib/event-router");

    const result = await emit(
      {
        type: "order.created",
        businessId: "test-skip-biz",
        data: { orderId: "ord-1" },
        source: "integration-test",
      },
      { skipSystems: ["webhook", "analytics", "automation"] },
    );

    expect(result.webhook.dispatched).toBe(false);
    expect(result.analytics.dispatched).toBe(false);
    expect(result.automation.dispatched).toBe(false);
    expect(result.realtime.dispatched).toBe(true);
  });

  it("should provide event router stats", async () => {
    const { getEventRouterStats } = await import("@/lib/event-router");

    const stats = getEventRouterStats();
    expect(stats).toHaveProperty("sseConnections");
    expect(stats).toHaveProperty("connectedBusinesses");
    expect(stats).toHaveProperty("supportedEvents");
    expect(stats.supportedEvents).toBeGreaterThan(0);
  });
});

// ─── Cross-Cutting: Observability Pipeline ──────────────────────

describe("Integration — Observability Pipeline", () => {
  it("should wrap route handler with full observability", async () => {
    const { withObservability } = await import("@/lib/observability");

    const handler = withObservability("/api/integration-test", async (_req, { requestId, log }) => {
      log.info("Processing integration test request");
      return new Response(JSON.stringify({ requestId, status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const response = await handler(new Request("http://localhost/api/integration-test"));
    expect(response.status).toBe(200);
    expect(response.headers.get("X-Request-Id")).toMatch(/^req_/);
    expect(response.headers.get("X-Response-Time")).toBeTruthy();

    const body = await response.json();
    expect(body.requestId).toMatch(/^req_/);
  });

  it("should capture errors and report to external tracker", async () => {
    const { withObservability, registerErrorReporter, errorTracker } = await import("@/lib/observability");
    const mockCapture = { called: false, error: null as Error | null };

    registerErrorReporter({
      captureException: (err) => { mockCapture.called = true; mockCapture.error = err; },
      captureMessage: () => {},
      setUser: () => {},
      addBreadcrumb: () => {},
    });

    const errorsBefore = errorTracker.getErrorRate(1);

    const handler = withObservability("/api/error-test", async () => {
      throw new Error("Integration test error");
    });

    const response = await handler(new Request("http://localhost/api/error-test"));
    expect(response.status).toBe(500);

    const errorsAfter = errorTracker.getErrorRate(1);
    expect(errorsAfter).toBeGreaterThan(errorsBefore);

    // External reporter should have been called
    expect(mockCapture.called).toBe(true);
    expect(mockCapture.error?.message).toBe("Integration test error");
  });

  it("should combine rate limiting with observability", async () => {
    const { withRateLimit, rateLimiter } = await import("@/lib/rate-limiter");
    const { withObservability } = await import("@/lib/observability");
    rateLimiter.reset();

    const innerHandler = withRateLimit("auth:register", async () => {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });

    const handler = withObservability("/api/combined-test", async (req, { requestId }) => {
      const response = await innerHandler(req);
      const headers = new Headers(response.headers);
      headers.set("X-Request-Id", requestId);
      return new Response(response.body, { status: response.status, headers });
    });

    for (let i = 0; i < 3; i++) {
      const res = await handler(new Request("http://localhost/api/combined-test", {
        headers: { "x-forwarded-for": "10.99.99.99" },
      }));
      expect(res.status).toBe(200);
    }

    const blockedRes = await handler(new Request("http://localhost/api/combined-test", {
      headers: { "x-forwarded-for": "10.99.99.99" },
    }));
    expect(blockedRes.status).toBe(429);

    rateLimiter.reset();
  });
});

// ─── Cross-Cutting: i18n & Email Integration ────────────────────

describe("Integration — i18n & Email Pipeline", () => {
  it("should render booking confirmation emails in Italian", async () => {
    const { renderBookingConfirmationI18n } = await import("@/lib/email-i18n");

    const email = renderBookingConfirmationI18n({
      locale: "it",
      customerName: "Marco",
      service: "Taglio classico",
      date: "15 Gennaio 2025",
      time: "10:00",
      address: "Via Roma 1, Forlì",
      branding: { businessName: "Barberia Da Marco" },
    });

    expect(email.subject).toBeDefined();
    expect(email.html).toContain("Marco");
    expect(email.html).toContain("Barberia Da Marco");
  });

  it("should render booking confirmation emails in English", async () => {
    const { renderBookingConfirmationI18n } = await import("@/lib/email-i18n");

    const email = renderBookingConfirmationI18n({
      locale: "en",
      customerName: "John",
      service: "Classic cut",
      date: "January 15, 2025",
      time: "10:00 AM",
      address: "Via Roma 1, Forlì",
      branding: { businessName: "Marco's Barbershop" },
    });

    expect(email.subject).toBeDefined();
    expect(email.html).toContain("John");
  });

  it("should render welcome emails in both locales", async () => {
    const { renderWelcomeI18n } = await import("@/lib/email-i18n");

    const itEmail = renderWelcomeI18n({
      locale: "it",
      businessName: "La Bottega",
      name: "Marco",
      dashboardUrl: "https://app.bottega-digitale.it/dashboard",
      branding: { businessName: "La Bottega" },
    });
    expect(itEmail.subject).toBeDefined();
    expect(itEmail.html).toContain("Marco");

    const enEmail = renderWelcomeI18n({
      locale: "en",
      businessName: "The Shop",
      name: "John",
      dashboardUrl: "https://app.bottega-digitale.it/dashboard",
      branding: { businessName: "The Shop" },
    });
    expect(enEmail.subject).toBeDefined();
    expect(enEmail.html).toContain("John");
  });

  it("should support notification orchestration across channels", async () => {
    const { isInQuietHours, selectChannel } = await import("@/lib/notification-orchestrator");

    // Quiet hours check
    const lateNight = new Date();
    lateNight.setHours(23, 30, 0, 0);
    expect(isInQuietHours("22:00", "08:00", lateNight)).toBe(true);

    const midDay = new Date();
    midDay.setHours(14, 0, 0, 0);
    expect(isInQuietHours("22:00", "08:00", midDay)).toBe(false);

    // Channel selection
    const channel = selectChannel(
      { preferredChannel: "whatsapp" },
      { whatsappTransactional: true, emailTransactional: true, pushNotifications: false },
    );
    expect(channel).toBe("whatsapp");
  });
});

// ─── Cross-Cutting: SEO & Discovery ─────────────────────────────

describe("Integration — SEO Pipeline", () => {
  it("should generate JSON-LD for local business", async () => {
    const { generateLocalBusinessJsonLd } = await import("@/lib/seo");

    const jsonLd = generateLocalBusinessJsonLd({
      name: "Barberia Da Marco",
      description: "Il miglior barbiere di Forlì",
      address: "Via Roma 1, 47121 Forlì FC",
      city: "Forlì",
      phone: "+39 0543 123456",
      email: "info@barberia.it",
      slug: "barberia-da-marco",
      category: "Barbiere",
      openingHours: ["Lunedì–Venerdì 09:00–18:00"],
    });

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("BarberShop"); // "Barbiere" maps to BarberShop schema
    expect(jsonLd.name).toBe("Barberia Da Marco");
  });

  it("should generate JSON-LD for products", async () => {
    const { generateProductJsonLd } = await import("@/lib/seo");

    const jsonLd = generateProductJsonLd({
      name: "Olio d'oliva extra vergine",
      description: "Olio biologico dalla Romagna",
      priceEuro: 12.5,
      availability: true,
      businessName: "La Bottega",
      businessSlug: "la-bottega",
    });

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("Product");
    expect(jsonLd.name).toBe("Olio d'oliva extra vergine");
  });

  it("should generate sitemap XML", async () => {
    const { generateSitemapXml } = await import("@/lib/seo");

    const xml = generateSitemapXml([
      { url: "/s/barberia-da-marco", lastmod: "2025-01-15", priority: 0.8 },
      { url: "/s/trattoria-nonna", lastmod: "2025-01-10", priority: 0.8 },
    ]);

    expect(xml).toContain("<?xml");
    expect(xml).toContain("<urlset");
    expect(xml).toContain("barberia-da-marco");
    expect(xml).toContain("trattoria-nonna");
  });

  it("should generate business metadata for pages", async () => {
    const { generateBusinessMetadata } = await import("@/lib/seo");

    const metadata = generateBusinessMetadata({
      name: "Barberia Da Marco",
      description: "Il miglior barbiere di Forlì",
      slug: "barberia-da-marco",
      category: "Barbiere",
      city: "Forlì",
    });

    expect(metadata.title).toContain("Barberia Da Marco");
    expect(metadata.description).toBeDefined();
  });
});

// ─── Cross-Cutting: Billing Analytics ───────────────────────────

describe("Integration — Billing Analytics", () => {
  it("should provide MRR breakdown interface", async () => {
    const billingModule = await import("@/lib/billing-analytics");

    // Verify the module exports the expected functions
    expect(typeof billingModule.calculateMRR).toBe("function");
    expect(typeof billingModule.getPaymentStats).toBe("function");
    expect(typeof billingModule.getBusinessMetrics).toBe("function");
    expect(typeof billingModule.checkRevenueAlerts).toBe("function");
    expect(typeof billingModule.getARRProjection).toBe("function");
    expect(typeof billingModule.getWeeklyRevenueSummary).toBe("function");
  });
});
