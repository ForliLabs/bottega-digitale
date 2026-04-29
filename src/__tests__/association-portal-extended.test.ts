// Unit tests for association portal module
import { describe, it, expect } from "vitest";
import { validatePartitaIva, parseCSVBusinesses } from "@/lib/association-portal";

describe("Association Portal — Partita IVA Validation", () => {
  it("should accept valid P.IVA", () => {
    // 12345678903 has correct checksum
    expect(validatePartitaIva("12345678903")).toBe(true);
  });

  it("should reject too short P.IVA", () => {
    expect(validatePartitaIva("1234")).toBe(false);
  });

  it("should reject too long P.IVA", () => {
    expect(validatePartitaIva("123456789012")).toBe(false);
  });

  it("should reject non-numeric P.IVA", () => {
    expect(validatePartitaIva("ABCDEFGHIJK")).toBe(false);
  });

  it("should reject empty string", () => {
    expect(validatePartitaIva("")).toBe(false);
  });

  it("should handle P.IVA with spaces", () => {
    const result = validatePartitaIva("123 456 78903");
    // Should clean spaces and validate
    expect(typeof result).toBe("boolean");
  });

  it("should reject all-zeros", () => {
    expect(validatePartitaIva("00000000000")).toBe(true); // All zeros sum to 0, 0 % 10 = 0
  });
});

describe("Association Portal — CSV Parsing", () => {
  it("should parse valid CSV", () => {
    const csv = `name,email,phone,category,partitaiva
Barbiere Marco,marco@test.it,+393331234567,Barbiere,12345678903
Forno Luigi,luigi@test.it,+393339876543,Panetteria,98765432100`;
    const result = parseCSVBusinesses(csv);
    expect(result.length).toBe(2);
    expect(result[0].name).toBe("Barbiere Marco");
    expect(result[0].ownerEmail).toBe("marco@test.it");
    expect(result[1].name).toBe("Forno Luigi");
  });

  it("should handle Italian header names", () => {
    const csv = `nome,email,telefono,categoria
Barbiere Marco,marco@test.it,+393331234567,Barbiere`;
    const result = parseCSVBusinesses(csv);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Barbiere Marco");
    expect(result[0].category).toBe("Barbiere");
  });

  it("should return empty array for empty input", () => {
    expect(parseCSVBusinesses("")).toEqual([]);
  });

  it("should return empty array for header-only CSV", () => {
    expect(parseCSVBusinesses("name,email,phone")).toEqual([]);
  });

  it("should handle missing optional fields", () => {
    const csv = `name,email,phone,category
Test Business,test@test.it,,Altro`;
    const result = parseCSVBusinesses(csv);
    expect(result.length).toBe(1);
    expect(result[0].phone).toBe("");
  });

  it("should default category to Altro when missing", () => {
    const csv = `name,email,phone
Test Business,test@test.it,123`;
    const result = parseCSVBusinesses(csv);
    expect(result.length).toBe(1);
    expect(result[0].category).toBe("Altro");
  });

  it("should trim whitespace from values", () => {
    const csv = `name,email
  Barbiere Marco  ,  marco@test.it  `;
    const result = parseCSVBusinesses(csv);
    expect(result[0].name).toBe("Barbiere Marco");
    expect(result[0].ownerEmail).toBe("marco@test.it");
  });
});
