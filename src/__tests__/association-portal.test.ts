// Unit tests for association portal module
import { describe, it, expect } from "vitest";
import { validatePartitaIva, parseCSVBusinesses } from "@/lib/association-portal";

describe("Association Portal — Partita IVA Validation", () => {
  it("should reject non-numeric strings", () => {
    expect(validatePartitaIva("abcdefghijk")).toBe(false);
  });

  it("should reject wrong-length strings", () => {
    expect(validatePartitaIva("123")).toBe(false);
    expect(validatePartitaIva("1234567890123")).toBe(false);
  });

  it("should reject empty strings", () => {
    expect(validatePartitaIva("")).toBe(false);
  });

  it("should handle strings with spaces", () => {
    const result = validatePartitaIva(" 12345678901 ");
    expect(typeof result).toBe("boolean");
  });
});

describe("Association Portal — CSV Parsing", () => {
  it("should parse valid CSV", () => {
    const csv = `nome,email,telefono,categoria,partitaIva,indirizzo
Barbiere Marco,marco@test.com,+393331234567,Barbiere,12345678901,Via Roma 1`;
    const result = parseCSVBusinesses(csv);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Barbiere Marco");
    expect(result[0].ownerEmail).toBe("marco@test.com");
    expect(result[0].category).toBe("Barbiere");
  });

  it("should handle empty CSV", () => {
    expect(parseCSVBusinesses("")).toEqual([]);
    expect(parseCSVBusinesses("header1,header2")).toEqual([]);
  });

  it("should handle multiple rows", () => {
    const csv = `name,email,phone,category
Barbiere Marco,marco@test.com,+39333,Barbiere
Forno Rosa,rosa@test.com,+39444,Panetteria`;
    const result = parseCSVBusinesses(csv);
    expect(result.length).toBe(2);
  });

  it("should handle alternative header names", () => {
    const csv = `nome,email,telefono,categoria
Test,test@test.com,+39555,Negozio`;
    const result = parseCSVBusinesses(csv);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Test");
  });
});
