// Integration Tests — Event Router (Feature 1)
// Tests the unified event backbone that dispatches to automation, SSE, webhooks, and analytics
import { describe, it, expect, vi, beforeEach } from "vitest";
import { emit, events, getEventRouterStats, type CanonicalEventType } from "@/lib/event-router";
import { broadcaster } from "@/lib/realtime";

// Mock the downstream systems to verify dispatch
vi.mock("@/lib/event-bus", () => ({
  emitEvent: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/webhook-api", () => ({
  deliverWebhook: vi.fn().mockResolvedValue([]),
  WEBHOOK_EVENTS: [],
}));

vi.mock("@/lib/platform-analytics", () => ({
  trackEvent: vi.fn().mockResolvedValue({}),
}));

describe("Event Router — Unified Event Backbone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should emit a booking.created event and return dispatch results", async () => {
    const result = await emit({
      type: "booking.created",
      businessId: "biz-test-1",
      data: { customerName: "Marco Rossi", service: "Taglio uomo" },
      source: "test",
    });

    expect(result.correlationId).toMatch(/^evt_/);
    expect(result.automation.dispatched).toBe(true);
    expect(result.realtime.dispatched).toBe(true);
    expect(result.webhook.dispatched).toBe(true);
    expect(result.analytics.dispatched).toBe(true);
  });

  it("should generate unique correlation IDs", async () => {
    const r1 = await emit({ type: "booking.created", businessId: "biz-1", data: {} });
    const r2 = await emit({ type: "booking.created", businessId: "biz-1", data: {} });
    expect(r1.correlationId).not.toBe(r2.correlationId);
  });

  it("should stop at max depth to prevent event loops", async () => {
    const result = await emit(
      { type: "booking.created", businessId: "biz-1", data: {} },
      { depth: 3 },
    );
    expect(result.automation.dispatched).toBe(false);
    expect(result.automation.error).toContain("Max depth");
  });

  it("should skip specified systems", async () => {
    const result = await emit(
      { type: "booking.created", businessId: "biz-1", data: {} },
      { skipSystems: ["webhook", "analytics"] },
    );
    expect(result.automation.dispatched).toBe(true);
    expect(result.realtime.dispatched).toBe(true);
    expect(result.webhook.dispatched).toBe(false);
    expect(result.analytics.dispatched).toBe(false);
  });

  it("should handle events without downstream mapping gracefully", async () => {
    const result = await emit({
      type: "notification.created" as CanonicalEventType,
      businessId: "biz-1",
      data: {},
    });
    // notification.created only maps to realtime, not automation/webhook/analytics
    expect(result.realtime.dispatched).toBe(true);
    expect(result.automation.dispatched).toBe(false);
    expect(result.webhook.dispatched).toBe(false);
  });

  it("should provide convenience emitters for all event types", async () => {
    const r = await events.bookingCreated("biz-1", { test: true });
    expect(r.correlationId).toBeTruthy();
    expect(r.automation.dispatched).toBe(true);
  });

  it("should emit payment.received through all systems", async () => {
    const r = await events.paymentReceived("biz-1", { amount: 25.00 });
    expect(r.realtime.dispatched).toBe(true);
    expect(r.webhook.dispatched).toBe(true);
    expect(r.analytics.dispatched).toBe(true);
  });

  it("should emit customerCreated through automation and realtime", async () => {
    const r = await events.customerCreated("biz-1", { name: "Giulia" });
    expect(r.automation.dispatched).toBe(true);
    expect(r.realtime.dispatched).toBe(true);
  });

  it("should emit reviewReceived event", async () => {
    const r = await events.reviewReceived("biz-1", { rating: 5, author: "Marco" });
    expect(r.automation.dispatched).toBe(true);
    expect(r.realtime.dispatched).toBe(true);
  });

  it("should emit orderCreated event", async () => {
    const r = await events.orderCreated("biz-1", { orderId: "ord-1" });
    expect(r.realtime.dispatched).toBe(true);
    expect(r.webhook.dispatched).toBe(true);
  });

  it("should get event router stats", () => {
    const stats = getEventRouterStats();
    expect(stats.supportedEvents).toBeGreaterThan(0);
    expect(typeof stats.sseConnections).toBe("number");
    expect(typeof stats.connectedBusinesses).toBe("number");
  });

  it("should broadcast to SSE connections", () => {
    const mockWriter = vi.fn();
    const cleanup = broadcaster.addConnection("biz-test-sse", mockWriter);

    broadcaster.broadcast({
      type: "booking:created",
      businessId: "biz-test-sse",
      data: { test: true },
    });

    expect(mockWriter).toHaveBeenCalledTimes(1);
    expect(mockWriter).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "booking:created",
        businessId: "biz-test-sse",
      }),
    );

    cleanup();
  });
});
