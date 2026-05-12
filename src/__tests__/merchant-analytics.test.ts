import { describe, it, expect } from "vitest";
import {
  calculateRevenueTrend,
  calculateServiceRankings,
  calculatePeakHours,
  calculateChannelBreakdown,
  buildMerchantDashboard,
  type AnalyticsBooking,
} from "@/lib/merchant-analytics";

function daysAgo(days: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const sampleBookings: AnalyticsBooking[] = [
  { service: "Taglio classico", startsAt: daysAgo(1, 9), priceEuro: 22, status: "Completata", channel: "Sito web" },
  { service: "Taglio classico", startsAt: daysAgo(2, 10), priceEuro: 22, status: "Confermata", channel: "Sito web" },
  { service: "Barba modellata", startsAt: daysAgo(3, 11), priceEuro: 15, status: "Completata", channel: "WhatsApp" },
  { service: "Taglio + barba", startsAt: daysAgo(4, 14), priceEuro: 34, status: "Confermata", channel: "Instagram" },
  { service: "Taglio classico", startsAt: daysAgo(5, 9), priceEuro: 22, status: "Completata", channel: "Telefono" },
  { service: "Ritocco veloce", startsAt: daysAgo(6, 16), priceEuro: 12, status: "Cancellata", channel: "Sito web" },
  { service: "Taglio + barba", startsAt: daysAgo(7, 10), priceEuro: 34, status: "Completata", channel: "WhatsApp" },
  { service: "Barba modellata", startsAt: daysAgo(10, 15), priceEuro: 15, status: "Confermata", channel: "Sito web" },
];

describe("Merchant Analytics — Revenue Trend", () => {
  it("should calculate revenue from completed/confirmed bookings", () => {
    const trend = calculateRevenueTrend(sampleBookings, 30);
    // Cancelled booking (€12) should be excluded
    expect(trend.totalRevenue).toBe(22 + 22 + 15 + 34 + 22 + 34 + 15);
    expect(trend.periodDays).toBe(30);
  });

  it("should have daily data points for the period", () => {
    const trend = calculateRevenueTrend(sampleBookings, 30);
    expect(trend.daily).toHaveLength(30);
    for (const point of trend.daily) {
      expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(point.revenue).toBeGreaterThanOrEqual(0);
      expect(point.bookingCount).toBeGreaterThanOrEqual(0);
    }
  });

  it("should calculate average daily revenue", () => {
    const trend = calculateRevenueTrend(sampleBookings, 30);
    expect(trend.averageDailyRevenue).toBeCloseTo(trend.totalRevenue / 30, 1);
  });

  it("should handle empty bookings", () => {
    const trend = calculateRevenueTrend([], 30);
    expect(trend.totalRevenue).toBe(0);
    expect(trend.growthPercent).toBe(0);
  });
});

describe("Merchant Analytics — Service Rankings", () => {
  it("should rank services by revenue", () => {
    const rankings = calculateServiceRankings(sampleBookings);
    expect(rankings.length).toBeGreaterThan(0);
    // Rankings should be sorted by total revenue descending
    for (let i = 1; i < rankings.length; i++) {
      expect(rankings[i - 1].totalRevenue).toBeGreaterThanOrEqual(rankings[i].totalRevenue);
    }
  });

  it("should exclude cancelled bookings", () => {
    const rankings = calculateServiceRankings(sampleBookings);
    const ritocco = rankings.find((r) => r.serviceName === "Ritocco veloce");
    expect(ritocco).toBeUndefined();
  });

  it("should calculate correct share percentages", () => {
    const rankings = calculateServiceRankings(sampleBookings);
    const totalShare = rankings.reduce((s, r) => s + r.sharePercent, 0);
    expect(totalShare).toBeCloseTo(100, 0);
  });

  it("should compute average price per service", () => {
    const rankings = calculateServiceRankings(sampleBookings);
    const taglio = rankings.find((r) => r.serviceName === "Taglio classico");
    expect(taglio).toBeDefined();
    expect(taglio!.averagePrice).toBe(22);
  });
});

describe("Merchant Analytics — Peak Hours Heatmap", () => {
  it("should create 7×24 grid of time slots", () => {
    const heatmap = calculatePeakHours(sampleBookings);
    expect(heatmap.slots).toHaveLength(7 * 24);
  });

  it("should have valid intensity values (0-1)", () => {
    const heatmap = calculatePeakHours(sampleBookings);
    for (const slot of heatmap.slots) {
      expect(slot.intensity).toBeGreaterThanOrEqual(0);
      expect(slot.intensity).toBeLessThanOrEqual(1);
    }
  });

  it("should track total bookings", () => {
    const heatmap = calculatePeakHours(sampleBookings);
    expect(heatmap.totalBookings).toBe(sampleBookings.length);
  });

  it("should identify a peak hour", () => {
    const heatmap = calculatePeakHours(sampleBookings);
    expect(heatmap.peakHour).toBeGreaterThanOrEqual(0);
    expect(heatmap.peakHour).toBeLessThan(24);
    expect(heatmap.peakDay).toBeGreaterThanOrEqual(0);
    expect(heatmap.peakDay).toBeLessThan(7);
  });
});

describe("Merchant Analytics — Channel Breakdown", () => {
  it("should group bookings by channel", () => {
    const breakdown = calculateChannelBreakdown(sampleBookings);
    expect(breakdown.length).toBeGreaterThan(0);
    const totalCount = breakdown.reduce((s, c) => s + c.bookingCount, 0);
    expect(totalCount).toBe(sampleBookings.length);
  });

  it("should calculate share percentages summing to 100", () => {
    const breakdown = calculateChannelBreakdown(sampleBookings);
    const totalPercent = breakdown.reduce((s, c) => s + c.sharePercent, 0);
    expect(totalPercent).toBeCloseTo(100, 0);
  });
});

describe("Merchant Analytics — Full Dashboard", () => {
  it("should build complete dashboard", () => {
    const dashboard = buildMerchantDashboard(sampleBookings);
    expect(dashboard.revenueTrend).toBeDefined();
    expect(dashboard.serviceRankings.length).toBeGreaterThan(0);
    expect(dashboard.peakHours.slots).toHaveLength(168);
    expect(dashboard.channelBreakdown.length).toBeGreaterThan(0);
    expect(dashboard.summary.totalRevenue).toBeGreaterThan(0);
    expect(dashboard.summary.topService).toBeTruthy();
    expect(dashboard.summary.busiestDay).toBeTruthy();
  });

  it("should compute average ticket", () => {
    const dashboard = buildMerchantDashboard(sampleBookings);
    expect(dashboard.summary.averageTicket).toBeGreaterThan(0);
    expect(dashboard.summary.averageTicket).toBe(
      Math.round((dashboard.summary.totalRevenue / dashboard.summary.totalBookings) * 100) / 100
    );
  });

  it("should handle empty bookings gracefully", () => {
    const dashboard = buildMerchantDashboard([]);
    expect(dashboard.summary.totalRevenue).toBe(0);
    expect(dashboard.summary.totalBookings).toBe(0);
    expect(dashboard.summary.averageTicket).toBe(0);
    expect(dashboard.summary.topService).toBe("N/A");
  });
});
