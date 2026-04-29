// Unit tests for accountant portal module
import { describe, it, expect } from "vitest";
import { generateInvoiceCSV } from "@/lib/accountant-portal";

describe("Accountant Portal — Invoice CSV Export", () => {
  it("should generate CSV with header", () => {
    const csv = generateInvoiceCSV([]);
    expect(csv).toContain("Numero");
    expect(csv).toContain("Anno");
    expect(csv).toContain("Cliente");
    expect(csv).toContain("Imponibile");
    expect(csv).toContain("IVA");
    expect(csv).toContain("Totale");
    expect(csv).toContain("Data");
    expect(csv).toContain("Stato");
  });

  it("should include invoice data rows", () => {
    const csv = generateInvoiceCSV([
      {
        progressiveNumber: 1,
        fiscalYear: 2025,
        customerName: "Mario Rossi",
        totalNet: 100,
        totalVat: 22,
        totalGross: 122,
        issuedAt: new Date("2025-01-15"),
        status: "inviata",
      },
    ]);
    const lines = csv.split("\n");
    expect(lines.length).toBe(2);
    expect(lines[1]).toContain("Mario Rossi");
    expect(lines[1]).toContain("100.00");
    expect(lines[1]).toContain("22.00");
    expect(lines[1]).toContain("122.00");
    expect(lines[1]).toContain("inviata");
  });

  it("should handle multiple invoices", () => {
    const csv = generateInvoiceCSV([
      { progressiveNumber: 1, fiscalYear: 2025, customerName: "Cliente A", totalNet: 50, totalVat: 11, totalGross: 61, issuedAt: new Date(), status: "bozza" },
      { progressiveNumber: 2, fiscalYear: 2025, customerName: "Cliente B", totalNet: 100, totalVat: 22, totalGross: 122, issuedAt: new Date(), status: "inviata" },
      { progressiveNumber: 3, fiscalYear: 2025, customerName: "Cliente C", totalNet: 200, totalVat: 44, totalGross: 244, issuedAt: new Date(), status: "consegnata" },
    ]);
    const lines = csv.split("\n");
    expect(lines.length).toBe(4); // header + 3 rows
  });

  it("should quote customer names with commas", () => {
    const csv = generateInvoiceCSV([
      { progressiveNumber: 1, fiscalYear: 2025, customerName: "Rossi, Mario", totalNet: 100, totalVat: 22, totalGross: 122, issuedAt: new Date(), status: "bozza" },
    ]);
    expect(csv).toContain('"Rossi, Mario"');
  });

  it("should format amounts with 2 decimals", () => {
    const csv = generateInvoiceCSV([
      { progressiveNumber: 1, fiscalYear: 2025, customerName: "Test", totalNet: 100.5, totalVat: 22.11, totalGross: 122.61, issuedAt: new Date(), status: "bozza" },
    ]);
    expect(csv).toContain("100.50");
    expect(csv).toContain("22.11");
    expect(csv).toContain("122.61");
  });
});
