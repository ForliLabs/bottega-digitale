// Unit tests for payments module
import { describe, it, expect } from "vitest";
import { formatEuro } from "@/lib/payments";

describe("Payments — formatEuro", () => {
  it("should format amounts correctly", () => {
    const result = formatEuro(100);
    expect(result).toContain("100");
    expect(result).toContain("€");
  });

  it("should handle zero", () => {
    const result = formatEuro(0);
    expect(result).toContain("0");
  });

  it("should handle decimals", () => {
    const result = formatEuro(29.99);
    expect(result).toContain("29");
  });

  it("should handle large numbers", () => {
    const result = formatEuro(10000);
    expect(result).toContain("€");
  });
});
