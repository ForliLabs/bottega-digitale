// Integration Tests — Observability (Feature 5)
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  logger,
  generateRequestId,
  metrics,
  errorTracker,
  getSystemHealth,
  withObservability,
} from "@/lib/observability";

describe("Observability — Logger", () => {
  it("should create child logger with context", () => {
    const child = logger.withContext({
      requestId: "req-123",
      route: "/api/bookings",
      method: "GET",
    });
    // Child logger should exist and not throw
    expect(() => child.info("Test message")).not.toThrow();
  });

  it("should log at different levels without throwing", () => {
    expect(() => logger.debug("debug message")).not.toThrow();
    expect(() => logger.info("info message")).not.toThrow();
    expect(() => logger.warn("warning message")).not.toThrow();
    expect(() => logger.error("error message")).not.toThrow();
    expect(() => logger.fatal("fatal message")).not.toThrow();
  });

  it("should log errors with Error objects", () => {
    expect(() => logger.error("Failed", new Error("test error"))).not.toThrow();
  });

  it("should log with metadata", () => {
    expect(() => logger.info("With meta", { userId: "u1", action: "login" })).not.toThrow();
  });
});

describe("Observability — Request IDs", () => {
  it("should generate unique request IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateRequestId());
    }
    expect(ids.size).toBe(100);
  });

  it("should start with req_ prefix", () => {
    const id = generateRequestId();
    expect(id.startsWith("req_")).toBe(true);
  });
});

describe("Observability — Metrics Collector", () => {
  it("should record route metrics", () => {
    metrics.record({
      route: "/api/test",
      method: "GET",
      statusCode: 200,
      durationMs: 42,
      timestamp: new Date(),
    });

    const stats = metrics.getRouteStats("/api/test", 60);
    expect(stats.count).toBeGreaterThanOrEqual(1);
    expect(stats.avgMs).toBeGreaterThan(0);
  });

  it("should calculate percentiles", () => {
    // Record multiple requests with known durations
    for (const ms of [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) {
      metrics.record({
        route: "/api/percentile-test",
        method: "GET",
        statusCode: 200,
        durationMs: ms,
        timestamp: new Date(),
      });
    }

    const stats = metrics.getRouteStats("/api/percentile-test", 60);
    expect(stats.p50).toBeGreaterThanOrEqual(50);
    expect(stats.p95).toBeGreaterThanOrEqual(90);
  });

  it("should calculate error rate", () => {
    for (let i = 0; i < 8; i++) {
      metrics.record({ route: "/api/errors", method: "GET", statusCode: 200, durationMs: 10, timestamp: new Date() });
    }
    for (let i = 0; i < 2; i++) {
      metrics.record({ route: "/api/errors", method: "GET", statusCode: 500, durationMs: 10, timestamp: new Date() });
    }

    const stats = metrics.getRouteStats("/api/errors", 60);
    expect(stats.errorRate).toBeCloseTo(0.2, 1);
  });

  it("should return all route stats", () => {
    metrics.record({ route: "/api/a", method: "GET", statusCode: 200, durationMs: 10, timestamp: new Date() });
    metrics.record({ route: "/api/b", method: "POST", statusCode: 201, durationMs: 20, timestamp: new Date() });

    const all = metrics.getAllRouteStats(60);
    expect(Object.keys(all).length).toBeGreaterThanOrEqual(2);
  });
});

describe("Observability — Error Tracker", () => {
  it("should track errors", () => {
    errorTracker.track({
      message: "Test error",
      route: "/api/test",
      timestamp: new Date(),
    });

    const recent = errorTracker.getRecentErrors(60, 10);
    expect(recent.length).toBeGreaterThanOrEqual(1);
    expect(recent[0].message).toBe("Test error");
  });

  it("should return error rate", () => {
    const rate = errorTracker.getErrorRate(60);
    expect(typeof rate).toBe("number");
  });
});

describe("Observability — System Health", () => {
  it("should return system health object", () => {
    const health = getSystemHealth();
    expect(health.status).toMatch(/healthy|degraded/);
    expect(health.uptime).toBeDefined();
    expect(health.uptime.seconds).toBeGreaterThanOrEqual(0);
    expect(health.memory.rss).toBeGreaterThan(0);
    expect(health.errors).toBeDefined();
    expect(health.routes).toBeDefined();
  });
});

describe("Observability — Route Wrapper", () => {
  it("should wrap a route handler with observability", async () => {
    const handler = withObservability("/api/test", async (_req, { requestId }) => {
      return new Response(JSON.stringify({ ok: true, requestId }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const response = await handler(new Request("http://localhost/api/test"));
    expect(response.status).toBe(200);
    expect(response.headers.get("X-Request-Id")).toMatch(/^req_/);
    expect(response.headers.get("X-Response-Time")).toBeTruthy();
  });

  it("should handle errors in wrapped routes", async () => {
    const handler = withObservability("/api/error", async () => {
      throw new Error("Boom!");
    });

    const response = await handler(new Request("http://localhost/api/error"));
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBeTruthy();
    expect(body.requestId).toMatch(/^req_/);
  });
});
