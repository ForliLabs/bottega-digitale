import { describe, it, expect } from "vitest";
import {
  evaluateSegment,
  filterAudience,
  buildCampaignPreview,
  personalizeMessage,
  calculateCampaignMetrics,
  validateCampaign,
  PRESET_SEGMENTS,
  type AudienceSegment,
  type CampaignConfig,
} from "@/lib/campaign-builder";
import type { CrmCustomer } from "@/lib/customer-crm";

function daysAgoStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const makeCustomer = (overrides: Partial<CrmCustomer> = {}): CrmCustomer => ({
  id: "c-1",
  name: "Luca Bernabei",
  phone: "+39 333 1234567",
  email: "luca@email.it",
  totalVisits: 5,
  totalSpend: 150,
  lastVisit: daysAgoStr(3),
  firstVisit: daysAgoStr(180),
  loyaltyPoints: 50,
  ...overrides,
});

const sampleCustomers: CrmCustomer[] = [
  makeCustomer({ id: "c-1", name: "Luca", totalVisits: 1, lastVisit: daysAgoStr(5), firstVisit: daysAgoStr(10) }),
  makeCustomer({ id: "c-2", name: "Marco", totalVisits: 5, totalSpend: 200, lastVisit: daysAgoStr(10) }),
  makeCustomer({ id: "c-3", name: "Sara", totalVisits: 12, totalSpend: 600, lastVisit: daysAgoStr(3) }),
  makeCustomer({ id: "c-4", name: "Elena", totalVisits: 6, lastVisit: daysAgoStr(60) }),
  makeCustomer({ id: "c-5", name: "Davide", totalVisits: 8, lastVisit: daysAgoStr(100) }),
  makeCustomer({ id: "c-6", name: "Andrea", totalVisits: 3, totalSpend: 400, lastVisit: daysAgoStr(7) }),
];

describe("Campaign Builder — Segment Evaluation", () => {
  it("should match equals rule", () => {
    const segment: AudienceSegment = {
      id: "test",
      name: "Test",
      combinator: "and",
      rules: [{ field: "totalVisits", operator: "equals", value: 5 }],
    };
    const match = makeCustomer({ totalVisits: 5 });
    const noMatch = makeCustomer({ totalVisits: 3 });
    expect(evaluateSegment(match, segment)).toBe(true);
    expect(evaluateSegment(noMatch, segment)).toBe(false);
  });

  it("should match greater_than rule", () => {
    const segment: AudienceSegment = {
      id: "test",
      name: "Test",
      combinator: "and",
      rules: [{ field: "totalSpend", operator: "greater_than", value: 300 }],
    };
    const match = makeCustomer({ totalSpend: 500 });
    const noMatch = makeCustomer({ totalSpend: 100 });
    expect(evaluateSegment(match, segment)).toBe(true);
    expect(evaluateSegment(noMatch, segment)).toBe(false);
  });

  it("should match less_than rule", () => {
    const segment: AudienceSegment = {
      id: "test",
      name: "Test",
      combinator: "and",
      rules: [{ field: "daysSinceLastVisit", operator: "less_than", value: 14 }],
    };
    const match = makeCustomer({ lastVisit: daysAgoStr(5) });
    const noMatch = makeCustomer({ lastVisit: daysAgoStr(20) });
    expect(evaluateSegment(match, segment)).toBe(true);
    expect(evaluateSegment(noMatch, segment)).toBe(false);
  });

  it("should match between rule", () => {
    const segment: AudienceSegment = {
      id: "test",
      name: "Test",
      combinator: "and",
      rules: [{ field: "totalVisits", operator: "between", value: 3, value2: 8 }],
    };
    const match = makeCustomer({ totalVisits: 5 });
    const noMatch = makeCustomer({ totalVisits: 10 });
    expect(evaluateSegment(match, segment)).toBe(true);
    expect(evaluateSegment(noMatch, segment)).toBe(false);
  });

  it("should match lifecycle stage via equals", () => {
    const segment: AudienceSegment = {
      id: "test",
      name: "Test",
      combinator: "and",
      rules: [{ field: "lifecycleStage", operator: "equals", value: "new" }],
    };
    const newCustomer = makeCustomer({ totalVisits: 1, lastVisit: daysAgoStr(5), firstVisit: daysAgoStr(10) });
    expect(evaluateSegment(newCustomer, segment)).toBe(true);
  });

  it("should combine rules with AND", () => {
    const segment: AudienceSegment = {
      id: "test",
      name: "Test",
      combinator: "and",
      rules: [
        { field: "totalVisits", operator: "greater_than", value: 3 },
        { field: "totalSpend", operator: "greater_than", value: 100 },
      ],
    };
    const match = makeCustomer({ totalVisits: 5, totalSpend: 200 });
    const noMatch = makeCustomer({ totalVisits: 5, totalSpend: 50 });
    expect(evaluateSegment(match, segment)).toBe(true);
    expect(evaluateSegment(noMatch, segment)).toBe(false);
  });

  it("should combine rules with OR", () => {
    const segment: AudienceSegment = {
      id: "test",
      name: "Test",
      combinator: "or",
      rules: [
        { field: "totalVisits", operator: "greater_than", value: 10 },
        { field: "totalSpend", operator: "greater_than", value: 500 },
      ],
    };
    const matchVisits = makeCustomer({ totalVisits: 12, totalSpend: 100 });
    const matchSpend = makeCustomer({ totalVisits: 2, totalSpend: 600 });
    const noMatch = makeCustomer({ totalVisits: 5, totalSpend: 100 });
    expect(evaluateSegment(matchVisits, segment)).toBe(true);
    expect(evaluateSegment(matchSpend, segment)).toBe(true);
    expect(evaluateSegment(noMatch, segment)).toBe(false);
  });

  it("should match empty rules to all", () => {
    const segment: AudienceSegment = {
      id: "test",
      name: "Test",
      combinator: "and",
      rules: [],
    };
    expect(evaluateSegment(makeCustomer(), segment)).toBe(true);
  });
});

describe("Campaign Builder — Audience Filtering", () => {
  it("should filter audience by segment", () => {
    const highSpenders: AudienceSegment = {
      id: "test",
      name: "High spenders",
      combinator: "and",
      rules: [{ field: "totalSpend", operator: "greater_than", value: 300 }],
    };
    const result = filterAudience(sampleCustomers, highSpenders);
    expect(result.length).toBeGreaterThan(0);
    for (const c of result) {
      expect(c.totalSpend).toBeGreaterThan(300);
    }
  });

  it("should return empty for no matches", () => {
    const impossible: AudienceSegment = {
      id: "test",
      name: "Impossible",
      combinator: "and",
      rules: [{ field: "totalVisits", operator: "greater_than", value: 1000 }],
    };
    expect(filterAudience(sampleCustomers, impossible)).toHaveLength(0);
  });
});

describe("Campaign Builder — Preset Segments", () => {
  it("should have preset segments", () => {
    expect(PRESET_SEGMENTS.length).toBeGreaterThan(0);
    for (const preset of PRESET_SEGMENTS) {
      expect(preset.id).toBeTruthy();
      expect(preset.name).toBeTruthy();
      expect(preset.rules.length).toBeGreaterThan(0);
    }
  });

  it("should filter using VIP preset", () => {
    const vipSegment = PRESET_SEGMENTS.find((s) => s.id === "seg-vip-customers")!;
    const result = filterAudience(sampleCustomers, vipSegment);
    // Sara (12 visits, 600 spend) should be VIP
    expect(result.some((c) => c.name === "Sara")).toBe(true);
  });
});

describe("Campaign Builder — Message Personalization", () => {
  it("should replace placeholders", () => {
    const customer = makeCustomer({ name: "Luca Bernabei", totalVisits: 5, loyaltyPoints: 50, totalSpend: 150 });
    const template = "Ciao {{nome}}, hai {{punti}} punti fedeltà!";
    const result = personalizeMessage(template, customer);
    expect(result).toBe("Ciao Luca, hai 50 punti fedeltà!");
  });

  it("should replace full name", () => {
    const customer = makeCustomer({ name: "Marco Rossi" });
    const result = personalizeMessage("Gentile {{nome_completo}},", customer);
    expect(result).toBe("Gentile Marco Rossi,");
  });

  it("should handle template with no placeholders", () => {
    const customer = makeCustomer();
    const result = personalizeMessage("Promozione speciale!", customer);
    expect(result).toBe("Promozione speciale!");
  });
});

describe("Campaign Builder — Campaign Preview", () => {
  it("should build campaign preview", () => {
    const config: CampaignConfig = {
      name: "Benvenuto Nuovi",
      channel: "whatsapp",
      segment: PRESET_SEGMENTS.find((s) => s.id === "seg-new-customers")!,
      messageTemplate: "Ciao {{nome}}, benvenuto da noi!",
    };
    const preview = buildCampaignPreview(config, sampleCustomers);
    expect(preview.name).toBe("Benvenuto Nuovi");
    expect(preview.channel).toBe("whatsapp");
    expect(preview.audienceSize).toBeGreaterThan(0);
    expect(preview.estimatedReach).toBeLessThanOrEqual(preview.audienceSize);
    expect(preview.messagePreview).toBeTruthy();
  });
});

describe("Campaign Builder — Metrics", () => {
  it("should calculate campaign metrics", () => {
    const metrics = calculateCampaignMetrics(100, 95, 40, 10);
    expect(metrics.deliveryRate).toBe(95);
    expect(metrics.openRate).toBeCloseTo(42.1, 0);
    expect(metrics.clickRate).toBe(25);
  });

  it("should handle zero recipients", () => {
    const metrics = calculateCampaignMetrics(0, 0, 0, 0);
    expect(metrics.deliveryRate).toBe(0);
    expect(metrics.openRate).toBe(0);
    expect(metrics.clickRate).toBe(0);
  });
});

describe("Campaign Builder — Validation", () => {
  it("should accept valid campaign", () => {
    const config: CampaignConfig = {
      name: "Test Campaign",
      channel: "email",
      segment: PRESET_SEGMENTS[0],
      messageTemplate: "Ciao {{nome}}!",
    };
    const result = validateCampaign(config);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject empty name", () => {
    const config: CampaignConfig = {
      name: "",
      channel: "email",
      segment: PRESET_SEGMENTS[0],
      messageTemplate: "Ciao!",
    };
    const result = validateCampaign(config);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("nome"))).toBe(true);
  });

  it("should reject empty message", () => {
    const config: CampaignConfig = {
      name: "Test",
      channel: "email",
      segment: PRESET_SEGMENTS[0],
      messageTemplate: "",
    };
    const result = validateCampaign(config);
    expect(result.valid).toBe(false);
  });

  it("should reject past schedule date", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const config: CampaignConfig = {
      name: "Test",
      channel: "email",
      segment: PRESET_SEGMENTS[0],
      messageTemplate: "Ciao!",
      scheduledAt: pastDate.toISOString(),
    };
    const result = validateCampaign(config);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("futuro"))).toBe(true);
  });

  it("should reject overly long message", () => {
    const config: CampaignConfig = {
      name: "Test",
      channel: "whatsapp",
      segment: PRESET_SEGMENTS[0],
      messageTemplate: "x".repeat(2001),
    };
    const result = validateCampaign(config);
    expect(result.valid).toBe(false);
  });
});
