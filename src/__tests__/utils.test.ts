// Unit tests for utils module
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("Utils — cn (classNames merger)", () => {
  it("should merge class names", () => {
    const result = cn("text-red-500", "bg-white");
    expect(result).toContain("text-red-500");
    expect(result).toContain("bg-white");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base", isActive && "active");
    expect(result).toContain("active");
  });

  it("should handle false conditionals", () => {
    const isActive = false;
    const result = cn("base", isActive && "active");
    expect(result).toContain("base");
    expect(result).not.toContain("active");
  });

  it("should handle undefined values", () => {
    const result = cn("base", undefined, "end");
    expect(result).toContain("base");
    expect(result).toContain("end");
  });

  it("should merge tailwind conflicts", () => {
    const result = cn("text-red-500", "text-blue-500");
    // tailwind-merge should keep the last one
    expect(result).toContain("text-blue-500");
  });

  it("should handle empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });
});
