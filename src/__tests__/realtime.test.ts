// Unit tests for realtime module
import { describe, it, expect, vi } from "vitest";
import {
  broadcaster,
  formatSSEMessage,
  formatSSEHeartbeat,
  realtime,
  HEARTBEAT_INTERVAL_MS,
  RECONNECT_DELAY_MS,
  MAX_RECONNECT_ATTEMPTS,
} from "@/lib/realtime";
import type { RealtimeEvent } from "@/lib/realtime";

describe("Realtime — SSE Message Formatting", () => {
  it("should format SSE message with id, event, and data", () => {
    const event: RealtimeEvent = {
      id: "42",
      type: "booking:created",
      businessId: "biz-1",
      data: { customerName: "Mario" },
      timestamp: new Date("2025-01-15T10:00:00Z"),
    };
    const msg = formatSSEMessage(event);
    expect(msg).toContain("id: 42");
    expect(msg).toContain("event: booking:created");
    expect(msg).toContain("Mario");
    expect(msg).toContain("\n\n"); // Double newline terminator
  });

  it("should include valid JSON in data field", () => {
    const event: RealtimeEvent = {
      id: "1",
      type: "payment:received",
      businessId: "biz-1",
      data: { amount: 22.50 },
      timestamp: new Date(),
    };
    const msg = formatSSEMessage(event);
    const dataLine = msg.split("\n").find((l) => l.startsWith("data: "));
    expect(dataLine).toBeDefined();
    const parsed = JSON.parse(dataLine!.replace("data: ", ""));
    expect(parsed.type).toBe("payment:received");
    expect(parsed.data.amount).toBe(22.50);
  });
});

describe("Realtime — Heartbeat", () => {
  it("should format heartbeat as comment", () => {
    const hb = formatSSEHeartbeat();
    expect(hb.startsWith(": heartbeat")).toBe(true);
    expect(hb.endsWith("\n\n")).toBe(true);
  });

  it("should have reasonable heartbeat interval", () => {
    expect(HEARTBEAT_INTERVAL_MS).toBeGreaterThanOrEqual(10000);
    expect(HEARTBEAT_INTERVAL_MS).toBeLessThanOrEqual(60000);
  });
});

describe("Realtime — Broadcaster", () => {
  it("should start with zero connections", () => {
    expect(broadcaster.getConnectionCount("test-business-999")).toBe(0);
  });

  it("should track connections", () => {
    const cleanup = broadcaster.addConnection("test-biz-1", () => {});
    expect(broadcaster.getConnectionCount("test-biz-1")).toBe(1);
    cleanup();
    expect(broadcaster.getConnectionCount("test-biz-1")).toBe(0);
  });

  it("should broadcast to connected clients", () => {
    const received: RealtimeEvent[] = [];
    const cleanup = broadcaster.addConnection("test-biz-2", (event) => {
      received.push(event);
    });

    broadcaster.broadcast({
      type: "booking:created",
      businessId: "test-biz-2",
      data: { test: true },
    });

    expect(received.length).toBe(1);
    expect(received[0].type).toBe("booking:created");
    cleanup();
  });

  it("should not broadcast to other businesses", () => {
    const received: RealtimeEvent[] = [];
    const cleanup = broadcaster.addConnection("test-biz-3", (event) => {
      received.push(event);
    });

    broadcaster.broadcast({
      type: "booking:created",
      businessId: "other-business",
      data: {},
    });

    expect(received.length).toBe(0);
    cleanup();
  });

  it("should handle multiple connections per business", () => {
    const received1: RealtimeEvent[] = [];
    const received2: RealtimeEvent[] = [];
    const cleanup1 = broadcaster.addConnection("test-biz-4", (e) => received1.push(e));
    const cleanup2 = broadcaster.addConnection("test-biz-4", (e) => received2.push(e));

    broadcaster.broadcast({ type: "payment:received", businessId: "test-biz-4", data: {} });

    expect(received1.length).toBe(1);
    expect(received2.length).toBe(1);
    cleanup1();
    cleanup2();
  });

  it("should list connected business IDs", () => {
    const cleanup = broadcaster.addConnection("test-list-biz", () => {});
    expect(broadcaster.getConnectedBusinessIds()).toContain("test-list-biz");
    cleanup();
  });
});

describe("Realtime — Convenience Emitters", () => {
  it("should have all event emitters", () => {
    expect(typeof realtime.bookingCreated).toBe("function");
    expect(typeof realtime.bookingUpdated).toBe("function");
    expect(typeof realtime.bookingCancelled).toBe("function");
    expect(typeof realtime.paymentReceived).toBe("function");
    expect(typeof realtime.queueUpdated).toBe("function");
    expect(typeof realtime.notificationNew).toBe("function");
    expect(typeof realtime.reviewReceived).toBe("function");
    expect(typeof realtime.orderCreated).toBe("function");
    expect(typeof realtime.orderUpdated).toBe("function");
    expect(typeof realtime.customerCreated).toBe("function");
  });

  it("should emit events through broadcaster", () => {
    const received: RealtimeEvent[] = [];
    const cleanup = broadcaster.addConnection("test-emit-biz", (e) => received.push(e));

    realtime.bookingCreated("test-emit-biz", { service: "Taglio" });
    expect(received.length).toBe(1);
    expect(received[0].type).toBe("booking:created");
    expect(received[0].data.service).toBe("Taglio");
    cleanup();
  });
});

describe("Realtime — Configuration Constants", () => {
  it("should have reasonable reconnect delay", () => {
    expect(RECONNECT_DELAY_MS).toBeGreaterThanOrEqual(1000);
    expect(RECONNECT_DELAY_MS).toBeLessThanOrEqual(30000);
  });

  it("should have reasonable max reconnect attempts", () => {
    expect(MAX_RECONNECT_ATTEMPTS).toBeGreaterThanOrEqual(3);
    expect(MAX_RECONNECT_ATTEMPTS).toBeLessThanOrEqual(20);
  });
});
