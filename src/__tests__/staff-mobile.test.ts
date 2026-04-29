// Unit tests for staff mobile module
import { describe, it, expect } from "vitest";
import { parseWorkingHours, ITALIAN_DAYS } from "@/lib/staff-mobile";

describe("Staff Mobile — Italian Days", () => {
  it("should have 7 days", () => {
    expect(ITALIAN_DAYS.length).toBe(7);
  });

  it("should start with Domenica (Sunday)", () => {
    expect(ITALIAN_DAYS[0]).toBe("Domenica");
  });

  it("should end with Sabato (Saturday)", () => {
    expect(ITALIAN_DAYS[6]).toBe("Sabato");
  });

  it("should include all weekdays", () => {
    expect(ITALIAN_DAYS).toContain("Lunedì");
    expect(ITALIAN_DAYS).toContain("Martedì");
    expect(ITALIAN_DAYS).toContain("Mercoledì");
    expect(ITALIAN_DAYS).toContain("Giovedì");
    expect(ITALIAN_DAYS).toContain("Venerdì");
  });
});

describe("Staff Mobile — Working Hours Parsing", () => {
  it("should return default schedule for empty JSON", () => {
    const schedule = parseWorkingHours("[]");
    expect(schedule.length).toBe(7);
  });

  it("should return default schedule for invalid JSON", () => {
    const schedule = parseWorkingHours("not json");
    expect(schedule.length).toBe(7);
  });

  it("should parse valid working hours", () => {
    const hours = JSON.stringify([
      { day: 1, startTime: "08:30", endTime: "19:30", isOff: false },
      { day: 2, startTime: "08:30", endTime: "19:30", isOff: false },
    ]);
    const schedule = parseWorkingHours(hours);
    expect(schedule.length).toBe(2);
    expect(schedule[0].startTime).toBe("08:30");
    expect(schedule[0].endTime).toBe("19:30");
    expect(schedule[0].dayLabel).toBe("Lunedì");
  });

  it("should default Sunday and Monday as off", () => {
    const schedule = parseWorkingHours("[]");
    expect(schedule[0].isOff).toBe(true); // Domenica
    expect(schedule[1].isOff).toBe(true); // Lunedì
    expect(schedule[2].isOff).toBe(false); // Martedì
  });

  it("should add Italian day labels", () => {
    const hours = JSON.stringify([{ day: 3 }]);
    const schedule = parseWorkingHours(hours);
    expect(schedule[0].dayLabel).toBe("Mercoledì");
  });

  it("should use default times when not specified", () => {
    const hours = JSON.stringify([{ day: 2, isOff: false }]);
    const schedule = parseWorkingHours(hours);
    expect(schedule[0].startTime).toBe("09:00");
    expect(schedule[0].endTime).toBe("18:00");
  });
});
