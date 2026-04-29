// Unit tests for notifications module
import { describe, it, expect } from "vitest";
import {
  NOTIFICATION_ICONS,
  NOTIFICATION_COLORS,
  DEFAULT_PREFERENCES,
} from "@/lib/notifications";
import type { NotificationType } from "@/lib/notifications";

describe("Notifications — Icons", () => {
  const types: NotificationType[] = [
    "booking", "payment", "review", "loyalty", "queue", "automation", "order", "system",
  ];

  it("should have icons for all notification types", () => {
    for (const type of types) {
      expect(NOTIFICATION_ICONS[type]).toBeTruthy();
    }
  });

  it("should have emoji icons", () => {
    for (const type of types) {
      expect(NOTIFICATION_ICONS[type].length).toBeGreaterThan(0);
    }
  });
});

describe("Notifications — Colors", () => {
  const types: NotificationType[] = [
    "booking", "payment", "review", "loyalty", "queue", "automation", "order", "system",
  ];

  it("should have Tailwind color classes for all types", () => {
    for (const type of types) {
      expect(NOTIFICATION_COLORS[type]).toBeTruthy();
      expect(NOTIFICATION_COLORS[type]).toContain("bg-");
      expect(NOTIFICATION_COLORS[type]).toContain("text-");
    }
  });
});

describe("Notifications — Default Preferences", () => {
  it("should have push enabled by default", () => {
    expect(DEFAULT_PREFERENCES.pushEnabled).toBe(true);
  });

  it("should have WhatsApp digest enabled", () => {
    expect(DEFAULT_PREFERENCES.whatsappDigest).toBe(true);
  });

  it("should have email summary disabled by default", () => {
    expect(DEFAULT_PREFERENCES.emailSummary).toBe(false);
  });

  it("should not filter to urgent-only by default", () => {
    expect(DEFAULT_PREFERENCES.urgentOnly).toBe(false);
  });

  it("should have a reasonable daily push limit", () => {
    expect(DEFAULT_PREFERENCES.maxPushPerDay).toBeGreaterThan(0);
    expect(DEFAULT_PREFERENCES.maxPushPerDay).toBeLessThanOrEqual(50);
  });
});
