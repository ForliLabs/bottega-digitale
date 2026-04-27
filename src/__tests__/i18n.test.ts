// Unit tests for i18n module
import { describe, it, expect } from "vitest";
import {
  t,
  formatCurrency,
  formatNumber,
  detectLocale,
  getRegion,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
} from "@/lib/i18n";

describe("i18n — Translation", () => {
  it("should return Italian translations by default", () => {
    expect(t("common.save")).toBe("Salva");
    expect(t("common.cancel")).toBe("Annulla");
  });

  it("should return English translations when locale is en", () => {
    expect(t("common.save", "en")).toBe("Save");
    expect(t("common.cancel", "en")).toBe("Cancel");
  });

  it("should fall back to Italian for missing English keys", () => {
    // Both locales should have all keys, but fallback works
    const result = t("common.appName", "en");
    expect(result).toBe("Bottega Digitale");
  });

  it("should return the key when translation not found", () => {
    expect(t("nonexistent.key")).toBe("nonexistent.key");
  });

  it("should handle deeply nested keys", () => {
    expect(t("dashboard.bookings")).toBe("Prenotazioni");
    expect(t("dashboard.bookings", "en")).toBe("Bookings");
  });
});

describe("i18n — Currency Formatting", () => {
  it("should format EUR in Italian format", () => {
    const result = formatCurrency(100, "it");
    expect(result).toContain("100");
    expect(result).toContain("€");
  });

  it("should format EUR in English format", () => {
    const result = formatCurrency(100, "en");
    expect(result).toContain("100");
    expect(result).toContain("€");
  });
});

describe("i18n — Number Formatting", () => {
  it("should format numbers in Italian style", () => {
    const result = formatNumber(1000, "it");
    expect(result).toContain("1");
    expect(result).toContain("000");
  });
});

describe("i18n — Locale Detection", () => {
  it("should detect Italian locale", () => {
    expect(detectLocale("it-IT,it;q=0.9,en;q=0.8")).toBe("it");
  });

  it("should detect English locale", () => {
    expect(detectLocale("en-US,en;q=0.9")).toBe("en");
  });

  it("should default to Italian for unknown locales", () => {
    expect(detectLocale("ja-JP")).toBe("it");
    expect(detectLocale(undefined)).toBe("it");
  });
});

describe("i18n — Regions", () => {
  it("should find Forlì region", () => {
    const region = getRegion("Forlì");
    expect(region).toBeTruthy();
    expect(region?.region).toBe("Emilia-Romagna");
    expect(region?.defaultVatRate).toBe(22);
  });

  it("should be case-insensitive", () => {
    expect(getRegion("forlì")).toBeTruthy();
    expect(getRegion("BOLOGNA")).toBeTruthy();
  });

  it("should return undefined for unknown cities", () => {
    expect(getRegion("Milano")).toBeUndefined();
  });

  it("should have correct defaults", () => {
    expect(DEFAULT_LOCALE).toBe("it");
    expect(SUPPORTED_LOCALES).toContain("it");
    expect(SUPPORTED_LOCALES).toContain("en");
  });
});
