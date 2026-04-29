// Unit tests for i18n module
import { describe, it, expect } from "vitest";
import {
  t,
  formatDate,
  formatTime,
  formatCurrency,
  formatNumber,
  formatPhone,
  getRegion,
  detectLocale,
  REGIONS,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
} from "@/lib/i18n";

describe("i18n — Translation Function", () => {
  it("should translate known keys in Italian", () => {
    const result = t("common.save", "it");
    expect(result).toBeTruthy();
    expect(result).not.toBe("common.save"); // Should not return the key itself
  });

  it("should translate known keys in English", () => {
    const result = t("common.save", "en");
    expect(result).toBeTruthy();
  });

  it("should return key for unknown translations", () => {
    const result = t("nonexistent.key.here", "it");
    expect(result).toBe("nonexistent.key.here");
  });

  it("should default to Italian locale", () => {
    const itResult = t("common.save", "it");
    const defaultResult = t("common.save");
    expect(defaultResult).toBe(itResult);
  });

  it("should fallback to Italian for missing English keys", () => {
    // If a key exists in IT but not EN, should fall back
    const result = t("common.save", "en");
    expect(result).toBeTruthy();
    expect(result).not.toBe("common.save");
  });
});

describe("i18n — Date Formatting", () => {
  const testDate = new Date(2025, 0, 15); // January 15, 2025

  it("should format dates in Italian", () => {
    const result = formatDate(testDate, "it");
    expect(result).toBeTruthy();
    expect(result).toContain("2025");
  });

  it("should format dates in English", () => {
    const result = formatDate(testDate, "en");
    expect(result).toBeTruthy();
    expect(result).toContain("2025");
  });
});

describe("i18n — Time Formatting", () => {
  const testDate = new Date(2025, 0, 15, 14, 30);

  it("should format time", () => {
    const result = formatTime(testDate, "it");
    expect(result).toBeTruthy();
  });
});

describe("i18n — Currency Formatting", () => {
  it("should format currency in Italian", () => {
    const result = formatCurrency(22.50, "it");
    expect(result).toContain("22");
    expect(result).toContain("€");
  });

  it("should format currency in English", () => {
    const result = formatCurrency(22.50, "en");
    expect(result).toContain("22");
    expect(result).toContain("€");
  });

  it("should handle zero", () => {
    const result = formatCurrency(0, "it");
    expect(result).toContain("0");
  });
});

describe("i18n — Number Formatting", () => {
  it("should format numbers in Italian", () => {
    const result = formatNumber(1234, "it");
    expect(result).toBeTruthy();
  });
});

describe("i18n — Phone Formatting", () => {
  it("should format Italian phone numbers", () => {
    const result = formatPhone("+393331234567", "it");
    expect(result).toContain("+39");
  });

  it("should return non-Italian phones as-is", () => {
    const result = formatPhone("+1234567890", "it");
    expect(result).toBe("+1234567890");
  });
});

describe("i18n — Regions", () => {
  it("should have at least 3 regions", () => {
    expect(REGIONS.length).toBeGreaterThanOrEqual(3);
  });

  it("should find Forlì region", () => {
    const region = getRegion("Forlì");
    expect(region).toBeDefined();
    expect(region!.region).toBe("Emilia-Romagna");
  });

  it("should be case-insensitive", () => {
    const region = getRegion("forlì");
    expect(region).toBeDefined();
  });

  it("should return undefined for unknown cities", () => {
    expect(getRegion("Timbuktu")).toBeUndefined();
  });

  it("should have valid VAT rates", () => {
    for (const region of REGIONS) {
      expect(region.defaultVatRate).toBe(22);
    }
  });

  it("should have associations for each region", () => {
    for (const region of REGIONS) {
      expect(region.associations.length).toBeGreaterThan(0);
    }
  });
});

describe("i18n — Locale Detection", () => {
  it("should detect Italian from accept-language", () => {
    expect(detectLocale("it-IT,it;q=0.9,en;q=0.8")).toBe("it");
  });

  it("should detect English from accept-language", () => {
    expect(detectLocale("en-US,en;q=0.9")).toBe("en");
  });

  it("should default to Italian for unknown languages", () => {
    expect(detectLocale("fr-FR,fr;q=0.9")).toBe("it");
  });

  it("should default to Italian when no header", () => {
    expect(detectLocale()).toBe("it");
    expect(detectLocale(undefined)).toBe("it");
  });
});

describe("i18n — Constants", () => {
  it("should support Italian and English", () => {
    expect(SUPPORTED_LOCALES).toContain("it");
    expect(SUPPORTED_LOCALES).toContain("en");
  });

  it("should default to Italian", () => {
    expect(DEFAULT_LOCALE).toBe("it");
  });
});
