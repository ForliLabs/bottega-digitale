import { describe, it, expect } from "vitest";
import {
  calculateMovingAverage,
  calculateLinearTrend,
  calculateSeasonality,
  buildRevenueForecast,
  bookingsToRevenueRecords,
  type RevenueRecord,
  type ForecastBooking,
} from "@/lib/revenue-forecast";

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function generateSampleRecords(days: number): RevenueRecord[] {
  const records: RevenueRecord[] = [];
  for (let i = days; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    // Simulate realistic pattern: closed Sundays/Mondays, busier Saturdays
    const base = dow === 0 || dow === 1 ? 0 : dow === 6 ? 180 : 120;
    const noise = Math.round((Math.random() - 0.5) * 40);
    records.push({
      date: d.toISOString().slice(0, 10),
      revenue: Math.max(0, base + noise),
      bookingCount: Math.max(0, Math.round((base + noise) / 25)),
    });
  }
  return records;
}

describe("Revenue Forecast — Moving Average", () => {
  it("should calculate moving average", () => {
    const values = [10, 20, 30, 40, 50];
    const ma = calculateMovingAverage(values, 3);
    expect(ma).toHaveLength(5);
    expect(ma[0]).toBe(10); // only one value
    expect(ma[2]).toBeCloseTo(20, 0); // (10+20+30)/3
    expect(ma[4]).toBeCloseTo(40, 0); // (30+40+50)/3
  });

  it("should handle empty values", () => {
    expect(calculateMovingAverage([], 3)).toHaveLength(0);
  });

  it("should handle single value", () => {
    const ma = calculateMovingAverage([42], 3);
    expect(ma).toHaveLength(1);
    expect(ma[0]).toBe(42);
  });

  it("should handle window larger than data", () => {
    const ma = calculateMovingAverage([10, 20], 5);
    expect(ma).toHaveLength(2);
  });
});

describe("Revenue Forecast — Linear Trend", () => {
  it("should detect upward trend", () => {
    const values = [10, 20, 30, 40, 50];
    const trend = calculateLinearTrend(values);
    expect(trend.slope).toBeCloseTo(10, 1);
    expect(trend.r2).toBeCloseTo(1, 1);
  });

  it("should detect flat trend", () => {
    const values = [50, 50, 50, 50];
    const trend = calculateLinearTrend(values);
    expect(trend.slope).toBeCloseTo(0, 1);
  });

  it("should detect downward trend", () => {
    const values = [50, 40, 30, 20, 10];
    const trend = calculateLinearTrend(values);
    expect(trend.slope).toBeLessThan(0);
  });

  it("should handle single value", () => {
    const trend = calculateLinearTrend([42]);
    expect(trend.slope).toBe(0);
    expect(trend.intercept).toBe(42);
  });

  it("should have R² between 0 and 1", () => {
    const values = [10, 25, 15, 35, 20, 40, 30];
    const trend = calculateLinearTrend(values);
    expect(trend.r2).toBeGreaterThanOrEqual(0);
    expect(trend.r2).toBeLessThanOrEqual(1);
  });
});

describe("Revenue Forecast — Seasonality", () => {
  it("should calculate day-of-week factors", () => {
    const records = generateSampleRecords(28);
    const seasonality = calculateSeasonality(records);
    expect(seasonality).toHaveLength(7);
    for (const factor of seasonality) {
      expect(factor.dayOfWeek).toBeGreaterThanOrEqual(0);
      expect(factor.dayOfWeek).toBeLessThan(7);
      expect(factor.dayName).toBeTruthy();
    }
  });

  it("should have Italian day names", () => {
    const records = generateSampleRecords(7);
    const seasonality = calculateSeasonality(records);
    const dayNames = seasonality.map((s) => s.dayName);
    expect(dayNames).toContain("Lunedì");
    expect(dayNames).toContain("Sabato");
    expect(dayNames).toContain("Domenica");
  });
});

describe("Revenue Forecast — Full Forecast", () => {
  it("should generate forecast points for requested days", () => {
    const records = generateSampleRecords(60);
    const forecast = buildRevenueForecast(records, 14);
    expect(forecast.forecast).toHaveLength(14);
    expect(forecast.historical).toHaveLength(60);
  });

  it("should have confidence intervals", () => {
    const records = generateSampleRecords(30);
    const forecast = buildRevenueForecast(records, 7);
    for (const point of forecast.forecast) {
      expect(point.lowerBound).toBeLessThanOrEqual(point.predictedRevenue);
      expect(point.upperBound).toBeGreaterThanOrEqual(point.predictedRevenue);
      expect(point.confidence).toBeGreaterThan(0);
      expect(point.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("should produce non-negative predictions", () => {
    const records = generateSampleRecords(30);
    const forecast = buildRevenueForecast(records, 14);
    for (const point of forecast.forecast) {
      expect(point.predictedRevenue).toBeGreaterThanOrEqual(0);
      expect(point.lowerBound).toBeGreaterThanOrEqual(0);
    }
  });

  it("should include summary with trend direction", () => {
    const records = generateSampleRecords(30);
    const forecast = buildRevenueForecast(records, 14);
    expect(["growing", "stable", "declining"]).toContain(forecast.summary.trend);
    expect(forecast.summary.projectedRevenue).toBeGreaterThanOrEqual(0);
    expect(forecast.summary.forecastDays).toBe(14);
    expect(forecast.summary.seasonality).toHaveLength(7);
  });

  it("should handle empty records", () => {
    const forecast = buildRevenueForecast([], 7);
    expect(forecast.forecast).toHaveLength(0);
    expect(forecast.summary.projectedRevenue).toBe(0);
    expect(forecast.summary.trend).toBe("stable");
    expect(forecast.summary.confidence).toBe(0);
  });
});

describe("Revenue Forecast — Booking Conversion", () => {
  it("should convert bookings to daily revenue records", () => {
    const bookings: ForecastBooking[] = [
      { startsAt: dateStr(1) + "T09:00:00Z", priceEuro: 22, status: "Completata" },
      { startsAt: dateStr(1) + "T10:00:00Z", priceEuro: 34, status: "Confermata" },
      { startsAt: dateStr(2) + "T11:00:00Z", priceEuro: 15, status: "Completata" },
      { startsAt: dateStr(3) + "T09:00:00Z", priceEuro: 22, status: "Cancellata" },
    ];
    const records = bookingsToRevenueRecords(bookings);
    // Cancelled booking excluded
    expect(records).toHaveLength(2); // 2 unique days with valid bookings
    // Day 1 should have two bookings summed
    const day1 = records.find((r) => r.date === dateStr(1));
    expect(day1).toBeDefined();
    expect(day1!.revenue).toBe(56); // 22 + 34
    expect(day1!.bookingCount).toBe(2);
  });

  it("should handle empty bookings", () => {
    const records = bookingsToRevenueRecords([]);
    expect(records).toHaveLength(0);
  });
});
