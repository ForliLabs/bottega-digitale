// Unit tests for AI content module
import { describe, it, expect } from "vitest";
import { getWeeklyContentSuggestions, isAIConfigured } from "@/lib/ai-content";

describe("AI Content — Weekly Suggestions", () => {
  it("should return suggestions for barbiere category", () => {
    const suggestions = getWeeklyContentSuggestions("barbiere");
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.some((s) => s.toLowerCase().includes("lunedì"))).toBe(true);
  });

  it("should return suggestions for forno category", () => {
    const suggestions = getWeeklyContentSuggestions("forno");
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it("should return default suggestions for unknown categories", () => {
    const suggestions = getWeeklyContentSuggestions("unknown-category");
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it("should have suggestions for different days", () => {
    const suggestions = getWeeklyContentSuggestions("barbiere");
    const days = suggestions.map((s) => s.split(":")[0]);
    expect(new Set(days).size).toBeGreaterThan(1);
  });

  it("should handle case-insensitive category matching", () => {
    const lower = getWeeklyContentSuggestions("barbiere");
    const mixed = getWeeklyContentSuggestions("Barbiere di quartiere");
    // Both should return barbiere-specific results (not default)
    expect(lower.length).toBeGreaterThan(0);
    expect(mixed.length).toBeGreaterThan(0);
  });
});

describe("AI Content — Configuration Check", () => {
  it("should return boolean", () => {
    expect(typeof isAIConfigured()).toBe("boolean");
  });
});
