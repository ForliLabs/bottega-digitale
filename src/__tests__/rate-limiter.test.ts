// Integration Tests — Rate Limiter (Feature 6)
import { describe, it, expect, beforeEach } from "vitest";
import {
  rateLimiter,
  checkApiKeyRateLimit,
  checkRouteRateLimit,
  buildRateLimitHeaders,
  rateLimitExceededResponse,
  extractClientIP,
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
  it("should extract IP from X-Forwarded-For", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.50, 70.41.3.18" },
    });
    expect(extractClientIP(req)).toBe("203.0.113.50");
  });

  it("should extract IP from X-Real-IP", () => {
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "203.0.113.50" },
    });
    expect(extractClientIP(req)).toBe("203.0.113.50");
  });

  it("should return 'unknown' when no IP header present", () => {
    const req = new Request("http://localhost");
    expect(extractClientIP(req)).toBe("unknown");
  });
});
