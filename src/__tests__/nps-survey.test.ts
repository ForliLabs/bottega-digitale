import { describe, it, expect } from "vitest";
import {
  classifyNpsScore,
  calculateNpsScore,
  calculateNpsTrend,
  generateNpsInsights,
  validateSurveyResponse,
  buildNpsDashboard,
  NPS_CATEGORY_LABELS_IT,
  NPS_CATEGORY_COLORS,
  type SurveyResponse,
} from "@/lib/nps-survey";

function daysAgoStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const makeSurveyResponses = (): SurveyResponse[] => [
  { id: "r1", score: 10, comment: "Servizio perfetto!", customerName: "Luca", channel: "web", createdAt: daysAgoStr(2) },
  { id: "r2", score: 9, comment: "Molto soddisfatto", customerName: "Marco", channel: "web", createdAt: daysAgoStr(5) },
  { id: "r3", score: 8, channel: "whatsapp", createdAt: daysAgoStr(7) },
  { id: "r4", score: 7, comment: "Buono ma potrebbe migliorare", customerName: "Elena", channel: "web", createdAt: daysAgoStr(10) },
  { id: "r5", score: 6, comment: "Tempi di attesa lunghi", customerName: "Davide", channel: "email", createdAt: daysAgoStr(15) },
  { id: "r6", score: 3, comment: "Esperienza deludente", customerName: "Andrea", channel: "web", createdAt: daysAgoStr(20) },
  { id: "r7", score: 9, channel: "web", createdAt: daysAgoStr(25) },
  { id: "r8", score: 10, comment: "Il migliore!", customerName: "Sara", channel: "whatsapp", createdAt: daysAgoStr(30) },
  { id: "r9", score: 5, channel: "web", createdAt: daysAgoStr(40) },
  { id: "r10", score: 9, comment: "Consigliatissimo", customerName: "Filippo", channel: "email", createdAt: daysAgoStr(50) },
];

describe("NPS Survey — Score Classification", () => {
  it("should classify 9-10 as promoter", () => {
    expect(classifyNpsScore(9)).toBe("promoter");
    expect(classifyNpsScore(10)).toBe("promoter");
  });

  it("should classify 7-8 as passive", () => {
    expect(classifyNpsScore(7)).toBe("passive");
    expect(classifyNpsScore(8)).toBe("passive");
  });

  it("should classify 0-6 as detractor", () => {
    expect(classifyNpsScore(0)).toBe("detractor");
    expect(classifyNpsScore(4)).toBe("detractor");
    expect(classifyNpsScore(6)).toBe("detractor");
  });

  it("should throw for invalid scores", () => {
    expect(() => classifyNpsScore(-1)).toThrow();
    expect(() => classifyNpsScore(11)).toThrow();
  });
});

describe("NPS Survey — NPS Score Calculation", () => {
  it("should calculate NPS from responses", () => {
    const responses = makeSurveyResponses();
    const nps = calculateNpsScore(responses);
    expect(nps.totalResponses).toBe(10);
    expect(nps.promoterCount + nps.passiveCount + nps.detractorCount).toBe(10);
    // NPS = promoter% - detractor%
    expect(nps.value).toBe(Math.round(nps.promoterPercent - nps.detractorPercent));
  });

  it("should handle all promoters", () => {
    const responses: SurveyResponse[] = [
      { id: "1", score: 10, channel: "web", createdAt: daysAgoStr(1) },
      { id: "2", score: 9, channel: "web", createdAt: daysAgoStr(2) },
    ];
    const nps = calculateNpsScore(responses);
    expect(nps.value).toBe(100);
    expect(nps.promoterPercent).toBe(100);
  });

  it("should handle all detractors", () => {
    const responses: SurveyResponse[] = [
      { id: "1", score: 3, channel: "web", createdAt: daysAgoStr(1) },
      { id: "2", score: 2, channel: "web", createdAt: daysAgoStr(2) },
    ];
    const nps = calculateNpsScore(responses);
    expect(nps.value).toBe(-100);
    expect(nps.detractorPercent).toBe(100);
  });

  it("should handle empty responses", () => {
    const nps = calculateNpsScore([]);
    expect(nps.value).toBe(0);
    expect(nps.totalResponses).toBe(0);
  });
});

describe("NPS Survey — Trend", () => {
  it("should generate monthly trend points", () => {
    const responses = makeSurveyResponses();
    const trend = calculateNpsTrend(responses, 3);
    expect(trend).toHaveLength(3);
    for (const point of trend) {
      expect(point.period).toMatch(/^\d{4}-\d{2}$/);
      expect(point.nps).toBeGreaterThanOrEqual(-100);
      expect(point.nps).toBeLessThanOrEqual(100);
    }
  });

  it("should handle months with no responses", () => {
    const trend = calculateNpsTrend([], 6);
    expect(trend).toHaveLength(6);
    for (const point of trend) {
      expect(point.nps).toBe(0);
      expect(point.responseCount).toBe(0);
    }
  });
});

describe("NPS Survey — Insights", () => {
  it("should generate insights for high NPS", () => {
    const nps = calculateNpsScore([
      { id: "1", score: 10, channel: "web", createdAt: daysAgoStr(1) },
      { id: "2", score: 10, channel: "web", createdAt: daysAgoStr(2) },
      { id: "3", score: 9, channel: "web", createdAt: daysAgoStr(3) },
      { id: "4", score: 10, channel: "web", createdAt: daysAgoStr(4) },
      { id: "5", score: 9, channel: "web", createdAt: daysAgoStr(5) },
      { id: "6", score: 10, channel: "web", createdAt: daysAgoStr(6) },
      { id: "7", score: 9, channel: "web", createdAt: daysAgoStr(7) },
      { id: "8", score: 10, channel: "web", createdAt: daysAgoStr(8) },
      { id: "9", score: 10, channel: "web", createdAt: daysAgoStr(9) },
      { id: "10", score: 9, channel: "web", createdAt: daysAgoStr(10) },
    ]);
    const insights = generateNpsInsights(nps, []);
    expect(insights.some((i) => i.type === "positive")).toBe(true);
  });

  it("should warn about low response count", () => {
    const nps = calculateNpsScore([
      { id: "1", score: 8, channel: "web", createdAt: daysAgoStr(1) },
    ]);
    const insights = generateNpsInsights(nps, []);
    expect(insights.some((i) => i.message.includes("Poche risposte"))).toBe(true);
  });
});

describe("NPS Survey — Validation", () => {
  it("should accept valid response", () => {
    const result = validateSurveyResponse(8, "Ottimo servizio!");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject out-of-range score", () => {
    const result = validateSurveyResponse(11);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should reject overly long comment", () => {
    const longComment = "a".repeat(1001);
    const result = validateSurveyResponse(8, longComment);
    expect(result.valid).toBe(false);
  });
});

describe("NPS Survey — Dashboard", () => {
  it("should build complete NPS dashboard", () => {
    const responses = makeSurveyResponses();
    const dashboard = buildNpsDashboard(responses);

    expect(dashboard.currentNps).toBeDefined();
    expect(dashboard.trend.length).toBeGreaterThan(0);
    expect(dashboard.categoryDistribution).toHaveLength(3);
    expect(dashboard.insights.length).toBeGreaterThan(0);
    expect(dashboard.averageScore).toBeGreaterThan(0);
    expect(dashboard.averageScore).toBeLessThanOrEqual(10);
  });

  it("should include recent comments", () => {
    const responses = makeSurveyResponses();
    const dashboard = buildNpsDashboard(responses);
    expect(dashboard.recentComments.length).toBeGreaterThan(0);
    for (const comment of dashboard.recentComments) {
      expect(comment.comment).toBeTruthy();
      expect(comment.score).toBeGreaterThanOrEqual(0);
    }
  });

  it("should have Italian labels", () => {
    expect(NPS_CATEGORY_LABELS_IT.promoter).toBe("Promotore");
    expect(NPS_CATEGORY_LABELS_IT.passive).toBe("Passivo");
    expect(NPS_CATEGORY_LABELS_IT.detractor).toBe("Detrattore");
  });

  it("should have colors for all categories", () => {
    expect(NPS_CATEGORY_COLORS.promoter).toBeTruthy();
    expect(NPS_CATEGORY_COLORS.passive).toBeTruthy();
    expect(NPS_CATEGORY_COLORS.detractor).toBeTruthy();
  });
});
