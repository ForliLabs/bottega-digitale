// Unit tests for data module
import { describe, it, expect } from "vitest";
import {
  businessProfile,
  sampleBookings,
  sampleCustomers,
  sampleReviews,
  calculateAverageRating,
  calculateDashboardMetrics,
  createDemoId,
} from "@/lib/data";

describe("Data — Business Profile", () => {
  it("should have essential business info", () => {
    expect(businessProfile.name).toBeTruthy();
    expect(businessProfile.category).toBeTruthy();
    expect(businessProfile.city).toBe("Forlì");
    expect(businessProfile.address).toBeTruthy();
    expect(businessProfile.phone).toBeTruthy();
    expect(businessProfile.email).toBeTruthy();
  });

  it("should have services defined", () => {
    expect(businessProfile.services.length).toBeGreaterThan(0);
    for (const service of businessProfile.services) {
      expect(service.name).toBeTruthy();
      expect(service.price).toBeTruthy();
      expect(service.duration).toBeTruthy();
    }
  });

  it("should have opening hours", () => {
    expect(businessProfile.openingHours.length).toBeGreaterThan(0);
  });
});

describe("Data — Sample Data", () => {
  it("should have sample bookings", () => {
    expect(sampleBookings.length).toBeGreaterThan(5);
  });

  it("should have valid booking statuses", () => {
    const validStatuses = ["Confermata", "In attesa", "Completata"];
    for (const booking of sampleBookings) {
      expect(validStatuses).toContain(booking.status);
    }
  });

  it("should have sample customers", () => {
    expect(sampleCustomers.length).toBeGreaterThan(5);
  });

  it("should have sample reviews", () => {
    expect(sampleReviews.length).toBeGreaterThan(3);
  });

  it("should have ratings between 1-5", () => {
    for (const review of sampleReviews) {
      expect(review.rating).toBeGreaterThanOrEqual(1);
      expect(review.rating).toBeLessThanOrEqual(5);
    }
  });
});

describe("Data — calculateAverageRating", () => {
  it("should calculate average correctly", () => {
    const reviews = [
      { id: "1", author: "A", rating: 5, date: "", comment: "", responseSuggestion: "" },
      { id: "2", author: "B", rating: 3, date: "", comment: "", responseSuggestion: "" },
    ];
    expect(calculateAverageRating(reviews)).toBe(4);
  });

  it("should handle single review", () => {
    const reviews = [
      { id: "1", author: "A", rating: 4, date: "", comment: "", responseSuggestion: "" },
    ];
    expect(calculateAverageRating(reviews)).toBe(4);
  });

  it("should handle all 5-star reviews", () => {
    const reviews = [
      { id: "1", author: "A", rating: 5, date: "", comment: "", responseSuggestion: "" },
      { id: "2", author: "B", rating: 5, date: "", comment: "", responseSuggestion: "" },
    ];
    expect(calculateAverageRating(reviews)).toBe(5);
  });
});

describe("Data — calculateDashboardMetrics", () => {
  it("should return expected metric keys", () => {
    const metrics = calculateDashboardMetrics(sampleBookings, sampleCustomers, sampleReviews);
    expect(metrics.websiteVisits).toBeDefined();
    expect(metrics.bookingsToday).toBeDefined();
    expect(metrics.newCustomersThisMonth).toBeDefined();
    expect(metrics.averageRating).toBeDefined();
    expect(metrics.reviewsCount).toBeDefined();
  });

  it("should have non-negative values", () => {
    const metrics = calculateDashboardMetrics(sampleBookings, sampleCustomers, sampleReviews);
    expect(metrics.websiteVisits).toBeGreaterThanOrEqual(0);
    expect(metrics.bookingsToday).toBeGreaterThanOrEqual(0);
    expect(metrics.newCustomersThisMonth).toBeGreaterThanOrEqual(0);
    expect(metrics.reviewsCount).toBeGreaterThan(0);
  });
});

describe("Data — createDemoId", () => {
  it("should generate ID with prefix", () => {
    const id = createDemoId("booking");
    expect(id.startsWith("booking-")).toBe(true);
  });

  it("should generate unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      ids.add(createDemoId("test"));
    }
    expect(ids.size).toBe(50);
  });

  it("should use different prefixes", () => {
    const a = createDemoId("customer");
    const b = createDemoId("booking");
    expect(a.startsWith("customer-")).toBe(true);
    expect(b.startsWith("booking-")).toBe(true);
  });
});
