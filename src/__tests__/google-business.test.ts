// Unit tests for Google Business module
import { describe, it, expect } from "vitest";
import { starRatingToNumber, isGoogleConfigured } from "@/lib/google-business";

describe("Google Business — Star Rating Conversion", () => {
  it("should convert ONE to 1", () => {
    expect(starRatingToNumber("ONE")).toBe(1);
  });

  it("should convert TWO to 2", () => {
    expect(starRatingToNumber("TWO")).toBe(2);
  });

  it("should convert THREE to 3", () => {
    expect(starRatingToNumber("THREE")).toBe(3);
  });

  it("should convert FOUR to 4", () => {
    expect(starRatingToNumber("FOUR")).toBe(4);
  });

  it("should convert FIVE to 5", () => {
    expect(starRatingToNumber("FIVE")).toBe(5);
  });

  it("should return 0 for unknown ratings", () => {
    expect(starRatingToNumber("UNKNOWN")).toBe(0);
    expect(starRatingToNumber("")).toBe(0);
    expect(starRatingToNumber("SIX")).toBe(0);
  });
});

describe("Google Business — Configuration Check", () => {
  it("should return boolean", () => {
    expect(typeof isGoogleConfigured()).toBe("boolean");
  });
});
