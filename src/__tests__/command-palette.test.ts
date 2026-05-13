// Unit tests for command palette search logic
import { describe, it, expect } from "vitest";

interface CommandItem {
  id: string;
  label: string;
  href: string;
  section?: string;
  keywords?: string[];
}

function matchesQuery(item: CommandItem, query: string): boolean {
  const q = query.toLowerCase();
  if (item.label.toLowerCase().includes(q)) return true;
  if (item.section?.toLowerCase().includes(q)) return true;
  if (item.keywords?.some((kw) => kw.toLowerCase().includes(q))) return true;
  return false;
}

const COMMAND_ITEMS: CommandItem[] = [
  { id: "/dashboard", label: "Panoramica", href: "/dashboard" },
  { id: "/dashboard/bookings", label: "Prenotazioni", href: "/dashboard/bookings", section: "Gestione", keywords: ["appuntamenti", "calendario"] },
  { id: "/dashboard/customers", label: "Clienti", href: "/dashboard/customers", section: "Gestione", keywords: ["CRM", "contatti"] },
  { id: "/dashboard/products", label: "Prodotti", href: "/dashboard/products", section: "Gestione", keywords: ["catalogo", "servizi"] },
  { id: "/dashboard/queue", label: "Coda", href: "/dashboard/queue", section: "Gestione" },
  { id: "/dashboard/staff", label: "Team", href: "/dashboard/staff", section: "Gestione" },
  { id: "/dashboard/website", label: "Sito web", href: "/dashboard/website", section: "Marketing" },
  { id: "/dashboard/reviews", label: "Recensioni", href: "/dashboard/reviews", section: "Marketing" },
  { id: "/dashboard/whatsapp", label: "WhatsApp", href: "/dashboard/whatsapp", section: "Marketing" },
  { id: "/dashboard/social", label: "Social AI", href: "/dashboard/social", section: "Marketing" },
  { id: "/dashboard/loyalty", label: "Fedeltà", href: "/dashboard/loyalty", section: "Marketing" },
  { id: "/dashboard/invoices", label: "Fatturazione", href: "/dashboard/invoices", section: "Finanza" },
  { id: "/dashboard/payments", label: "Pagamenti", href: "/dashboard/payments", section: "Finanza" },
  { id: "/dashboard/billing", label: "Abbonamento", href: "/dashboard/billing", section: "Finanza" },
  { id: "/dashboard/analytics", label: "Analisi", href: "/dashboard/analytics", section: "Finanza" },
  { id: "/dashboard/automations", label: "Automazioni", href: "/dashboard/automations", section: "Avanzato" },
  { id: "/dashboard/advisor", label: "Consigliere AI", href: "/dashboard/advisor", section: "Avanzato" },
  { id: "/dashboard/notifications", label: "Notifiche", href: "/dashboard/notifications", section: "Avanzato" },
];

describe("Command Palette — Search Logic", () => {
  it("should return all items for empty query", () => {
    const results = COMMAND_ITEMS.filter((item) => matchesQuery(item, ""));
    // empty string matches everything via includes("")
    expect(results.length).toBe(COMMAND_ITEMS.length);
  });

  it("should match by label", () => {
    const results = COMMAND_ITEMS.filter((item) => matchesQuery(item, "Prenot"));
    expect(results).toHaveLength(1);
    expect(results[0].label).toBe("Prenotazioni");
  });

  it("should match by section", () => {
    const results = COMMAND_ITEMS.filter((item) => matchesQuery(item, "Finanza"));
    expect(results).toHaveLength(4);
    for (const r of results) {
      expect(r.section).toBe("Finanza");
    }
  });

  it("should match by keywords", () => {
    const results = COMMAND_ITEMS.filter((item) => matchesQuery(item, "CRM"));
    expect(results).toHaveLength(1);
    expect(results[0].label).toBe("Clienti");
  });

  it("should be case-insensitive", () => {
    const results = COMMAND_ITEMS.filter((item) => matchesQuery(item, "whatsapp"));
    expect(results).toHaveLength(1);
    expect(results[0].label).toBe("WhatsApp");
  });

  it("should return empty for no match", () => {
    const results = COMMAND_ITEMS.filter((item) => matchesQuery(item, "zzzzzzz"));
    expect(results).toHaveLength(0);
  });

  it("should match partial label", () => {
    const results = COMMAND_ITEMS.filter((item) => matchesQuery(item, "Auto"));
    expect(results).toHaveLength(1);
    expect(results[0].label).toBe("Automazioni");
  });

  it("should match keyword 'catalogo' to Prodotti", () => {
    const results = COMMAND_ITEMS.filter((item) => matchesQuery(item, "catalogo"));
    expect(results).toHaveLength(1);
    expect(results[0].label).toBe("Prodotti");
  });

  it("all items should have unique ids", () => {
    const ids = COMMAND_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all items should have valid hrefs starting with /dashboard", () => {
    for (const item of COMMAND_ITEMS) {
      expect(item.href).toMatch(/^\/dashboard/);
    }
  });
});
