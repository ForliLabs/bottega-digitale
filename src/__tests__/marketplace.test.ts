// Unit tests for marketplace module
import { describe, it, expect } from "vitest";
import {
  MARKETPLACE_CATEGORIES,
  GIFT_CARD_AMOUNTS,
  SEASONAL_CAMPAIGNS,
  getActiveCampaigns,
} from "@/lib/marketplace";

describe("Marketplace — Categories", () => {
  it("should have at least 8 categories", () => {
    expect(MARKETPLACE_CATEGORIES.length).toBeGreaterThanOrEqual(8);
  });

  it("should have unique slugs", () => {
    const slugs = MARKETPLACE_CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("should include essential Italian business categories", () => {
    const slugs = MARKETPLACE_CATEGORIES.map((c) => c.slug);
    expect(slugs).toContain("bellezza");
    expect(slugs).toContain("alimentari");
    expect(slugs).toContain("ristorazione");
  });

  it("should have name and icon for each category", () => {
    for (const cat of MARKETPLACE_CATEGORIES) {
      expect(cat.name).toBeTruthy();
      expect(cat.icon).toBeTruthy();
      expect(cat.slug).toBeTruthy();
    }
  });

  it("should have an 'altro' fallback category", () => {
    const altro = MARKETPLACE_CATEGORIES.find((c) => c.slug === "altro");
    expect(altro).toBeDefined();
  });
});

describe("Marketplace — Gift Card Amounts", () => {
  it("should have multiple denominations", () => {
    expect(GIFT_CARD_AMOUNTS.length).toBeGreaterThanOrEqual(3);
  });

  it("should be sorted ascending", () => {
    for (let i = 1; i < GIFT_CARD_AMOUNTS.length; i++) {
      expect(GIFT_CARD_AMOUNTS[i]).toBeGreaterThan(GIFT_CARD_AMOUNTS[i - 1]);
    }
  });

  it("should include common amounts", () => {
    expect(GIFT_CARD_AMOUNTS).toContain(25);
    expect(GIFT_CARD_AMOUNTS).toContain(50);
  });

  it("should have only positive values", () => {
    for (const amount of GIFT_CARD_AMOUNTS) {
      expect(amount).toBeGreaterThan(0);
    }
  });
});

describe("Marketplace — Seasonal Campaigns", () => {
  it("should have at least 3 seasonal campaigns", () => {
    expect(SEASONAL_CAMPAIGNS.length).toBeGreaterThanOrEqual(3);
  });

  it("should have unique IDs", () => {
    const ids = SEASONAL_CAMPAIGNS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should include Christmas campaign", () => {
    const natale = SEASONAL_CAMPAIGNS.find((c) => c.id === "natale");
    expect(natale).toBeDefined();
    expect(natale!.startDate).toBe("12-01");
    expect(natale!.endDate).toBe("12-31");
  });

  it("should have valid date ranges", () => {
    for (const campaign of SEASONAL_CAMPAIGNS) {
      expect(campaign.startDate).toMatch(/^\d{2}-\d{2}$/);
      expect(campaign.endDate).toMatch(/^\d{2}-\d{2}$/);
      expect(campaign.startDate <= campaign.endDate).toBe(true);
    }
  });

  it("should have positive bonus percentages", () => {
    for (const campaign of SEASONAL_CAMPAIGNS) {
      expect(campaign.bonusPercent).toBeGreaterThan(0);
    }
  });

  it("should have required fields", () => {
    for (const campaign of SEASONAL_CAMPAIGNS) {
      expect(campaign.name).toBeTruthy();
      expect(campaign.description).toBeTruthy();
      expect(campaign.emoji).toBeTruthy();
    }
  });
});

describe("Marketplace — getActiveCampaigns", () => {
  it("should return an array", () => {
    const result = getActiveCampaigns();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should only return campaigns matching current date", () => {
    const campaigns = getActiveCampaigns();
    const now = new Date();
    const monthDay = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    for (const campaign of campaigns) {
      expect(campaign.startDate <= monthDay).toBe(true);
      expect(campaign.endDate >= monthDay).toBe(true);
    }
  });
});
