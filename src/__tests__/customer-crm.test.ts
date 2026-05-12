import { describe, it, expect } from "vitest";
import {
  determineLifecycleStage,
  calculateEngagementScore,
  buildCustomerProfile,
  buildCrmSummary,
  generateRecommendations,
  identifyRiskFactors,
  calculateDaysSince,
  LIFECYCLE_LABELS_IT,
  LIFECYCLE_COLORS,
  type CrmCustomer,
} from "@/lib/customer-crm";

function daysAgoStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const makeCustomer = (overrides: Partial<CrmCustomer> = {}): CrmCustomer => ({
  id: "c-1",
  name: "Luca Bernabei",
  phone: "+39 333 1234567",
  totalVisits: 5,
  totalSpend: 150,
  lastVisit: daysAgoStr(3),
  firstVisit: daysAgoStr(180),
  loyaltyPoints: 50,
  ...overrides,
});

describe("Customer CRM — Lifecycle Stage", () => {
  it("should classify new customer (few visits)", () => {
    const customer = makeCustomer({ totalVisits: 1, lastVisit: daysAgoStr(5), firstVisit: daysAgoStr(10) });
    expect(determineLifecycleStage(customer)).toBe("new");
  });

  it("should classify regular customer (3-7 visits, active)", () => {
    const customer = makeCustomer({ totalVisits: 5, lastVisit: daysAgoStr(10) });
    expect(determineLifecycleStage(customer)).toBe("regular");
  });

  it("should classify VIP customer (8+ visits, active)", () => {
    const customer = makeCustomer({ totalVisits: 12, totalSpend: 600, lastVisit: daysAgoStr(5) });
    expect(determineLifecycleStage(customer)).toBe("vip");
  });

  it("should classify VIP by high spend", () => {
    const customer = makeCustomer({ totalVisits: 4, totalSpend: 700, lastVisit: daysAgoStr(10) });
    expect(determineLifecycleStage(customer)).toBe("vip");
  });

  it("should classify at-risk customer (no visit 45-89 days, was regular)", () => {
    const customer = makeCustomer({ totalVisits: 6, lastVisit: daysAgoStr(60) });
    expect(determineLifecycleStage(customer)).toBe("at_risk");
  });

  it("should classify lapsed customer (90+ days inactive)", () => {
    const customer = makeCustomer({ totalVisits: 8, lastVisit: daysAgoStr(100) });
    expect(determineLifecycleStage(customer)).toBe("lapsed");
  });
});

describe("Customer CRM — Engagement Score", () => {
  it("should return 0-100 score", () => {
    const customer = makeCustomer();
    const score = calculateEngagementScore(customer);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("should give higher score to recent active customers", () => {
    const recent = makeCustomer({ lastVisit: daysAgoStr(1), totalVisits: 10, totalSpend: 300 });
    const inactive = makeCustomer({ lastVisit: daysAgoStr(80), totalVisits: 2, totalSpend: 30 });
    expect(calculateEngagementScore(recent)).toBeGreaterThan(calculateEngagementScore(inactive));
  });

  it("should give higher score to frequent visitors", () => {
    const frequent = makeCustomer({ totalVisits: 15, lastVisit: daysAgoStr(3) });
    const rare = makeCustomer({ totalVisits: 1, lastVisit: daysAgoStr(3) });
    expect(calculateEngagementScore(frequent)).toBeGreaterThan(calculateEngagementScore(rare));
  });
});

describe("Customer CRM — Risk Factors", () => {
  it("should identify inactivity risk", () => {
    const customer = makeCustomer({ lastVisit: daysAgoStr(40) });
    const factors = identifyRiskFactors(customer);
    expect(factors).toContain("Inattivo da più di 30 giorni");
  });

  it("should identify single-visit risk", () => {
    const customer = makeCustomer({ totalVisits: 1 });
    const factors = identifyRiskFactors(customer);
    expect(factors).toContain("Solo una visita effettuata");
  });

  it("should have no risk factors for active VIP", () => {
    const customer = makeCustomer({
      totalVisits: 15,
      totalSpend: 600,
      lastVisit: daysAgoStr(2),
      email: "luca@email.it",
    });
    const factors = identifyRiskFactors(customer);
    expect(factors).toHaveLength(0);
  });
});

describe("Customer CRM — Recommendations", () => {
  it("should give welcome recommendations for new customers", () => {
    const recs = generateRecommendations("new", makeCustomer({ totalVisits: 1 }));
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.some((r) => r.toLowerCase().includes("benvenuto"))).toBe(true);
  });

  it("should suggest reactivation for at-risk customers", () => {
    const recs = generateRecommendations("at_risk", makeCustomer());
    expect(recs.some((r) => r.toLowerCase().includes("riattivazione"))).toBe(true);
  });

  it("should suggest win-back for lapsed customers", () => {
    const recs = generateRecommendations("lapsed", makeCustomer());
    expect(recs.some((r) => r.toLowerCase().includes("ci manchi"))).toBe(true);
  });
});

describe("Customer CRM — Profile Builder", () => {
  it("should build complete profile with all fields", () => {
    const customer = makeCustomer();
    const profile = buildCustomerProfile(customer);
    expect(profile.customerId).toBe(customer.id);
    expect(profile.name).toBe(customer.name);
    expect(profile.stage).toBeTruthy();
    expect(profile.stageLabel).toBe(LIFECYCLE_LABELS_IT[profile.stage]);
    expect(profile.stageColor).toBe(LIFECYCLE_COLORS[profile.stage]);
    expect(profile.score).toBeGreaterThanOrEqual(0);
    expect(profile.recommendations.length).toBeGreaterThan(0);
  });

  it("should compute average spend per visit", () => {
    const customer = makeCustomer({ totalVisits: 5, totalSpend: 100 });
    const profile = buildCustomerProfile(customer);
    expect(profile.averageSpendPerVisit).toBe(20);
  });
});

describe("Customer CRM — Summary", () => {
  it("should build CRM summary with distribution", () => {
    const customers: CrmCustomer[] = [
      makeCustomer({ id: "c-1", totalVisits: 1, lastVisit: daysAgoStr(3), firstVisit: daysAgoStr(10) }),
      makeCustomer({ id: "c-2", totalVisits: 5, lastVisit: daysAgoStr(10) }),
      makeCustomer({ id: "c-3", totalVisits: 12, totalSpend: 600, lastVisit: daysAgoStr(5) }),
      makeCustomer({ id: "c-4", totalVisits: 6, lastVisit: daysAgoStr(60) }),
      makeCustomer({ id: "c-5", totalVisits: 8, lastVisit: daysAgoStr(100) }),
    ];
    const summary = buildCrmSummary(customers);
    expect(summary.totalCustomers).toBe(5);
    expect(summary.distribution).toHaveLength(5); // all 5 stages
    const totalPercent = summary.distribution.reduce((s, d) => s + d.percent, 0);
    expect(totalPercent).toBeCloseTo(100, 0);
    expect(summary.retentionRate).toBeGreaterThan(0);
    expect(summary.topRecommendations.length).toBeGreaterThan(0);
  });

  it("should handle empty customer list", () => {
    const summary = buildCrmSummary([]);
    expect(summary.totalCustomers).toBe(0);
    expect(summary.averageLifetimeValue).toBe(0);
    expect(summary.retentionRate).toBe(0);
  });
});

describe("Customer CRM — Utility", () => {
  it("should calculate days since correctly", () => {
    const now = new Date("2025-01-15T12:00:00Z");
    const date = "2025-01-10T12:00:00Z";
    expect(calculateDaysSince(date, now)).toBe(5);
  });

  it("should have Italian labels for all stages", () => {
    expect(Object.keys(LIFECYCLE_LABELS_IT)).toHaveLength(5);
    expect(LIFECYCLE_LABELS_IT.new).toBe("Nuovo");
    expect(LIFECYCLE_LABELS_IT.vip).toBe("VIP");
  });
});
