// Unit tests for e-invoice module
import { describe, it, expect } from "vitest";
import { IVA_RATES, formatEuro } from "@/lib/e-invoice";

describe("E-Invoice — IVA Rates", () => {
  it("should have correct standard IVA rate of 22%", () => {
    expect(IVA_RATES.standard).toBe(22);
  });

  it("should have correct reduced IVA rate of 10%", () => {
    expect(IVA_RATES.reduced).toBe(10);
  });

  it("should have correct super-reduced IVA rate of 4%", () => {
    expect(IVA_RATES.superReduced).toBe(4);
  });

  it("should have exempt rate of 0%", () => {
    expect(IVA_RATES.exempt).toBe(0);
  });
});

describe("E-Invoice — formatEuro", () => {
  it("should format amounts in Italian EUR format", () => {
    const result = formatEuro(100);
    expect(result).toContain("100");
    expect(result).toContain("€");
  });

  it("should handle zero amount", () => {
    const result = formatEuro(0);
    expect(result).toContain("0");
  });

  it("should handle decimal amounts", () => {
    const result = formatEuro(29.99);
    expect(result).toContain("29");
  });
});
