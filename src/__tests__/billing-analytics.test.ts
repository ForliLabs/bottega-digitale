// Integration Tests — Billing Analytics (Feature 3)
import { describe, it, expect } from "vitest";
import { PRICING_TIERS, type TierKey } from "@/lib/stripe";

describe("Billing Analytics — Pricing Tiers", () => {
  it("should have all 3 pricing tiers", () => {
    expect(PRICING_TIERS.vetrina).toBeDefined();
    expect(PRICING_TIERS.bottega).toBeDefined();
    expect(PRICING_TIERS.maestro).toBeDefined();
  });

  it("should have correct pricing", () => {
    expect(PRICING_TIERS.vetrina.priceMonthly).toBe(0);
    expect(PRICING_TIERS.bottega.priceMonthly).toBe(29);
    expect(PRICING_TIERS.maestro.priceMonthly).toBe(59);
  });

  it("should have Italian tier names", () => {
    expect(PRICING_TIERS.vetrina.name).toBe("Vetrina");
    expect(PRICING_TIERS.bottega.name).toBe("Bottega");
    expect(PRICING_TIERS.maestro.name).toBe("Maestro");
  });

  it("should have valid tier keys", () => {
    const keys: TierKey[] = ["vetrina", "bottega", "maestro"];
    for (const key of keys) {
      expect(PRICING_TIERS[key]).toBeDefined();
      expect(PRICING_TIERS[key].priceMonthly).toBeGreaterThanOrEqual(0);
    }
  });
});
