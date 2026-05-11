// Integration Tests — Rate Limiter (Feature 6)
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  rateLimiter,
  checkApiKeyRateLimit,
  checkRouteRateLimit,
  buildRateLimitHeaders,
  rateLimitExceededResponse,
  extractClientIP,
  withRateLimit,
  withApiKeyRateLimit,
  ROUTE_LIMITS,
} from "@/lib/rate-limiter";

describe("Rate Limiter — Sliding Window", () => {
  beforeEach(() => {
    rateLimiter.reset();
  });

  it("should allow requests within the limit", () => {
    const result = rateLimiter.check("test-key", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
  });

  it("should block requests after exceeding the limit", () => {
    for (let i = 0; i < 5; i++) {
      rateLimiter.check("block-key", 5, 60_000);
    }
    const result = rateLimiter.check("block-key", 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("should track remaining correctly", () => {
    const r1 = rateLimiter.check("count-key", 3, 60_000);
    expect(r1.remaining).toBe(2);
    const r2 = rateLimiter.check("count-key", 3, 60_000);
    expect(r2.remaining).toBe(1);
    const r3 = rateLimiter.check("count-key", 3, 60_000);
    expect(r3.remaining).toBe(0);
  });

  it("should isolate different keys", () => {
    rateLimiter.check("key-a", 1, 60_000);
    const result = rateLimiter.check("key-b", 1, 60_000);
    expect(result.allowed).toBe(true);
  });

  it("should provide a resetAt date", () => {
    const result = rateLimiter.check("reset-key", 5, 60_000);
    expect(result.resetAt).toBeInstanceOf(Date);
    expect(result.resetAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("should report stats", () => {
    rateLimiter.check("stats-key-1", 10, 60_000);
    rateLimiter.check("stats-key-2", 10, 60_000);
    const stats = rateLimiter.getStats();
    expect(stats.trackedKeys).toBe(2);
    expect(stats.totalEntries).toBe(2);
  });
});

describe("Rate Limiter — API Key Enforcement", () => {
  beforeEach(() => {
    rateLimiter.reset();
  });

  it("should enforce per-key rate limits", () => {
    // rateLimit is per hour (1000 default)
    const result = checkApiKeyRateLimit("key-123", 1000);
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(1000);
  });

  it("should block API key after limit exceeded", () => {
    // Very small limit for testing
    for (let i = 0; i < 3; i++) {
      checkApiKeyRateLimit("tiny-key", 3);
    }
    const result = checkApiKeyRateLimit("tiny-key", 3);
    expect(result.allowed).toBe(false);
  });
});

describe("Rate Limiter — Route Enforcement", () => {
  beforeEach(() => {
    rateLimiter.reset();
  });

  it("should have rate limits for auth routes", () => {
    expect(ROUTE_LIMITS["auth:login"]).toBeDefined();
    expect(ROUTE_LIMITS["auth:login"].maxRequests).toBe(10);
    expect(ROUTE_LIMITS["auth:register"]).toBeDefined();
    expect(ROUTE_LIMITS["auth:register"].maxRequests).toBe(3);
  });

  it("should enforce per-route, per-IP limits", () => {
    const result = checkRouteRateLimit("auth:login", "192.168.1.1");
    expect(result.allowed).toBe(true);
  });

  it("should block login after 10 attempts", () => {
    for (let i = 0; i < 10; i++) {
      checkRouteRateLimit("auth:login", "brute-force-ip");
    }
    const result = checkRouteRateLimit("auth:login", "brute-force-ip");
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("should isolate different IPs", () => {
    for (let i = 0; i < 10; i++) {
      checkRouteRateLimit("auth:login", "ip-a");
    }
    const result = checkRouteRateLimit("auth:login", "ip-b");
    expect(result.allowed).toBe(true);
  });

  it("should fall back to default for unknown routes", () => {
    const result = checkRouteRateLimit("unknown:route", "test-ip");
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(ROUTE_LIMITS["api:default"].maxRequests);
  });
});

describe("Rate Limiter — Headers & Response", () => {
  it("should build rate limit headers for allowed request", () => {
    const headers = buildRateLimitHeaders({
      allowed: true,
      remaining: 99,
      limit: 100,
      resetAt: new Date("2025-01-15T10:00:00Z"),
    });
    expect(headers["X-RateLimit-Limit"]).toBe("100");
    expect(headers["X-RateLimit-Remaining"]).toBe("99");
    expect(headers["X-RateLimit-Reset"]).toBeTruthy();
    expect(headers["Retry-After"]).toBeUndefined();
  });

  it("should include Retry-After for blocked requests", () => {
    const headers = buildRateLimitHeaders({
      allowed: false,
      remaining: 0,
      limit: 10,
      resetAt: new Date("2025-01-15T10:00:00Z"),
      retryAfterSeconds: 42,
    });
    expect(headers["Retry-After"]).toBe("42");
  });

  it("should return 429 response", async () => {
    const response = rateLimitExceededResponse({
      allowed: false,
      remaining: 0,
      limit: 10,
      resetAt: new Date(),
      retryAfterSeconds: 30,
    });
    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toBe("Too Many Requests");
    expect(body.retryAfter).toBe(30);
  });
});

describe("Rate Limiter — IP Extraction", () => {
  const originalEnv = process.env.TRUSTED_PROXY_COUNT;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.TRUSTED_PROXY_COUNT;
    } else {
      process.env.TRUSTED_PROXY_COUNT = originalEnv;
    }
  });

  it("should return 'unknown' when no trusted proxy configured and headers present", () => {
    delete process.env.TRUSTED_PROXY_COUNT;
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.50, 70.41.3.18" },
    });
    expect(extractClientIP(req)).toBe("unknown");
  });

  it("should extract correct IP with TRUSTED_PROXY_COUNT=1", () => {
    process.env.TRUSTED_PROXY_COUNT = "1";
    // With 1 trusted proxy: "client, proxy_saw_client" → pick index len-1 = client seen by proxy
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.50, 70.41.3.18" },
    });
    expect(extractClientIP(req)).toBe("70.41.3.18");
  });

  it("should extract correct IP with TRUSTED_PROXY_COUNT=2", () => {
    process.env.TRUSTED_PROXY_COUNT = "2";
    // With 2 trusted proxies: "spoofed, real_client, proxy1" → pick index len-2 = real_client
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "spoofed, 203.0.113.50, 70.41.3.18" },
    });
    expect(extractClientIP(req)).toBe("203.0.113.50");
  });

  it("should extract IP from X-Real-IP with trusted proxy", () => {
    process.env.TRUSTED_PROXY_COUNT = "1";
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "203.0.113.50" },
    });
    expect(extractClientIP(req)).toBe("203.0.113.50");
  });

  it("should return 'unknown' when no IP header present", () => {
    const req = new Request("http://localhost");
    expect(extractClientIP(req)).toBe("unknown");
  });

  it("should not trust spoofed X-Forwarded-For without TRUSTED_PROXY_COUNT", () => {
    delete process.env.TRUSTED_PROXY_COUNT;
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    });
    expect(extractClientIP(req)).toBe("unknown");
  });
});

describe("Rate Limiter — withRateLimit Wrapper", () => {
  const originalEnv = process.env.TRUSTED_PROXY_COUNT;

  beforeEach(() => {
    rateLimiter.reset();
    process.env.TRUSTED_PROXY_COUNT = "1";
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.TRUSTED_PROXY_COUNT;
    } else {
      process.env.TRUSTED_PROXY_COUNT = originalEnv;
    }
  });

  it("should pass through allowed requests with rate limit headers", async () => {
    const handler = withRateLimit("api:default", async () => {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const req = new Request("http://localhost/api/test", {
      headers: { "x-forwarded-for": "10.0.0.1" },
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("100");
    expect(Number(res.headers.get("X-RateLimit-Remaining"))).toBeLessThan(100);
  });

  it("should return 429 when rate limit is exceeded", async () => {
    const handler = withRateLimit("auth:register", async () => {
      return new Response("ok", { status: 200 });
    });

    // Exhaust the 3-request limit
    for (let i = 0; i < 3; i++) {
      await handler(new Request("http://localhost", {
        headers: { "x-forwarded-for": "10.0.0.99" },
      }));
    }

    const res = await handler(new Request("http://localhost", {
      headers: { "x-forwarded-for": "10.0.0.99" },
    }));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe("Too Many Requests");
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("should not affect different IPs", async () => {
    const handler = withRateLimit("auth:register", async () => {
      return new Response("ok", { status: 200 });
    });

    for (let i = 0; i < 3; i++) {
      await handler(new Request("http://localhost", {
        headers: { "x-forwarded-for": "10.0.0.1" },
      }));
    }

    const res = await handler(new Request("http://localhost", {
      headers: { "x-forwarded-for": "10.0.0.2" },
    }));
    expect(res.status).toBe(200);
  });
});

describe("Rate Limiter — withApiKeyRateLimit Wrapper", () => {
  beforeEach(() => {
    rateLimiter.reset();
  });

  it("should pass through allowed API key requests", async () => {
    const handler = withApiKeyRateLimit(
      async () => new Response(JSON.stringify({ data: "ok" }), { status: 200 }),
      { apiKeyId: "key-test-1", rateLimit: 100 },
    );

    const res = await handler(new Request("http://localhost"));
    expect(res.status).toBe(200);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("100");
  });

  it("should return 429 when API key rate limit exceeded", async () => {
    const handler = withApiKeyRateLimit(
      async () => new Response("ok", { status: 200 }),
      { apiKeyId: "key-limited", rateLimit: 2 },
    );

    await handler(new Request("http://localhost"));
    await handler(new Request("http://localhost"));

    const res = await handler(new Request("http://localhost"));
    expect(res.status).toBe(429);
  });
});
