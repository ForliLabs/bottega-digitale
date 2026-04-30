// Integration Tests — Notification Orchestrator (Feature 9)
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isInQuietHours,
  selectChannel,
} from "@/lib/notification-orchestrator";

// We test the pure functions directly since the full orchestrator requires DB

describe("Notification Orchestrator — Quiet Hours", () => {
  it("should detect quiet hours spanning midnight (22:00-08:00)", () => {
    const at23 = new Date("2025-01-15T23:00:00");
    expect(isInQuietHours("22:00", "08:00", at23)).toBe(true);
  });

  it("should detect quiet hours before midnight", () => {
    const at22 = new Date("2025-01-15T22:30:00");
    expect(isInQuietHours("22:00", "08:00", at22)).toBe(true);
  });

  it("should detect quiet hours after midnight", () => {
    const at3am = new Date("2025-01-15T03:00:00");
    expect(isInQuietHours("22:00", "08:00", at3am)).toBe(true);
  });

  it("should be outside quiet hours during the day", () => {
    const at10am = new Date("2025-01-15T10:00:00");
    expect(isInQuietHours("22:00", "08:00", at10am)).toBe(false);
  });

  it("should be outside quiet hours in the afternoon", () => {
    const at15 = new Date("2025-01-15T15:00:00");
    expect(isInQuietHours("22:00", "08:00", at15)).toBe(false);
  });

  it("should handle non-midnight-spanning hours", () => {
    const at14 = new Date("2025-01-15T14:00:00");
    expect(isInQuietHours("13:00", "15:00", at14)).toBe(true);

    const at16 = new Date("2025-01-15T16:00:00");
    expect(isInQuietHours("13:00", "15:00", at16)).toBe(false);
  });

  it("should handle edge case at exact start time", () => {
    const atStart = new Date("2025-01-15T22:00:00");
    expect(isInQuietHours("22:00", "08:00", atStart)).toBe(true);
  });

  it("should handle edge case at exact end time", () => {
    const atEnd = new Date("2025-01-15T08:00:00");
    expect(isInQuietHours("22:00", "08:00", atEnd)).toBe(false);
  });
});

describe("Notification Orchestrator — Channel Selection", () => {
  it("should default to email when no preference set", () => {
    const channel = selectChannel(null, null);
    expect(channel).toBe("email");
  });

  it("should use preferred channel when consent exists", () => {
    const channel = selectChannel(
      { preferredChannel: "whatsapp" },
      { whatsappTransactional: true, emailTransactional: true, pushNotifications: true },
    );
    expect(channel).toBe("whatsapp");
  });

  it("should fallback to email when preferred channel lacks consent", () => {
    const channel = selectChannel(
      { preferredChannel: "whatsapp" },
      { whatsappTransactional: false, emailTransactional: true, pushNotifications: true },
    );
    expect(channel).toBe("email");
  });

  it("should fallback to push when email consent is also missing", () => {
    const channel = selectChannel(
      { preferredChannel: "whatsapp" },
      { whatsappTransactional: false, emailTransactional: false, pushNotifications: true },
    );
    expect(channel).toBe("push");
  });

  it("should use whatsapp as last resort", () => {
    const channel = selectChannel(
      { preferredChannel: "push" },
      { whatsappTransactional: true, emailTransactional: false, pushNotifications: false },
    );
    expect(channel).toBe("whatsapp");
  });

  it("should respect push preference", () => {
    const channel = selectChannel(
      { preferredChannel: "push" },
      { whatsappTransactional: true, emailTransactional: true, pushNotifications: true },
    );
    expect(channel).toBe("push");
  });

  it("should use preferred channel from preference object", () => {
    const channel = selectChannel(
      { preferredChannel: "email" },
      { whatsappTransactional: true, emailTransactional: true, pushNotifications: true },
    );
    expect(channel).toBe("email");
  });
});
