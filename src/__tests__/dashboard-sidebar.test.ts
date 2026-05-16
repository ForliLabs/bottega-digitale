// Unit tests for dashboard sidebar grouping
import { describe, it, expect } from "vitest";

interface SidebarItem {
  label: string;
  href: string;
}

interface SidebarSection {
  key: string;
  label?: string;
  items: SidebarItem[];
}

// Mirror the sections from layout.tsx for testing
const sections: SidebarSection[] = [
  {
    key: "home",
    items: [{ label: "Panoramica", href: "/dashboard" }],
  },
  {
    key: "gestione",
    label: "Gestione",
    items: [
      { label: "Prenotazioni", href: "/dashboard/bookings" },
      { label: "Clienti", href: "/dashboard/customers" },
      { label: "Prodotti", href: "/dashboard/products" },
      { label: "Coda", href: "/dashboard/queue" },
      { label: "Team", href: "/dashboard/staff" },
      { label: "Attività programmate", href: "/dashboard/jobs" },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    items: [
      { label: "Sito web", href: "/dashboard/website" },
      { label: "Recensioni", href: "/dashboard/reviews" },
      { label: "WhatsApp", href: "/dashboard/whatsapp" },
      { label: "Social AI", href: "/dashboard/social" },
      { label: "Fedeltà", href: "/dashboard/loyalty" },
      { label: "Rete", href: "/dashboard/network" },
    ],
  },
  {
    key: "finanza",
    label: "Finanza",
    items: [
      { label: "Fatturazione", href: "/dashboard/invoices" },
      { label: "Pagamenti", href: "/dashboard/payments" },
      { label: "Abbonamento", href: "/dashboard/billing" },
      { label: "Analisi", href: "/dashboard/analytics" },
    ],
  },
  {
    key: "avanzato",
    label: "Avanzato",
    items: [
      { label: "Automazioni", href: "/dashboard/automations" },
      { label: "Consigliere AI", href: "/dashboard/advisor" },
      { label: "Moonshot Lab", href: "/dashboard/moonshot" },
      { label: "Notifiche", href: "/dashboard/notifications" },
    ],
  },
];

describe("Dashboard sidebar sections", () => {
  it("should have exactly 5 sections", () => {
    expect(sections).toHaveLength(5);
  });

  it("should have expected section keys", () => {
    const keys = sections.map((s) => s.key);
    expect(keys).toEqual(["home", "gestione", "marketing", "finanza", "avanzato"]);
  });

  it("home section should have no label (ungrouped)", () => {
    const home = sections.find((s) => s.key === "home");
    expect(home?.label).toBeUndefined();
  });

  it("all other sections should have labels", () => {
    const labeled = sections.filter((s) => s.key !== "home");
    for (const section of labeled) {
      expect(section.label).toBeTruthy();
    }
  });

  it("should contain all 21 dashboard routes", () => {
    const allItems = sections.flatMap((s) => s.items);
    expect(allItems).toHaveLength(21);
  });

  it("should have no duplicate hrefs across sections", () => {
    const allHrefs = sections.flatMap((s) => s.items.map((i) => i.href));
    const unique = new Set(allHrefs);
    expect(unique.size).toBe(allHrefs.length);
  });

  it("every item href should start with /dashboard", () => {
    const allItems = sections.flatMap((s) => s.items);
    for (const item of allItems) {
      expect(item.href).toMatch(/^\/dashboard/);
    }
  });

  it("gestione section should contain operational routes", () => {
    const gestione = sections.find((s) => s.key === "gestione");
    const labels = gestione?.items.map((i) => i.label) ?? [];
    expect(labels).toContain("Prenotazioni");
    expect(labels).toContain("Clienti");
    expect(labels).toContain("Prodotti");
  });

  it("finanza section should contain financial routes", () => {
    const finanza = sections.find((s) => s.key === "finanza");
    const labels = finanza?.items.map((i) => i.label) ?? [];
    expect(labels).toContain("Fatturazione");
    expect(labels).toContain("Pagamenti");
    expect(labels).toContain("Abbonamento");
  });
});

describe("Sidebar active route detection", () => {
  function isActive(pathname: string, href: string): boolean {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
  }

  it("should detect exact match", () => {
    expect(isActive("/dashboard/bookings", "/dashboard/bookings")).toBe(true);
  });

  it("should detect nested route as active", () => {
    expect(isActive("/dashboard/bookings/new", "/dashboard/bookings")).toBe(true);
  });

  it("should not mark /dashboard as active for sub-routes", () => {
    expect(isActive("/dashboard/bookings", "/dashboard")).toBe(false);
  });

  it("should not cross-match similar prefixes", () => {
    expect(isActive("/dashboard/billing", "/dashboard/bill")).toBe(false);
  });

  it("should detect section as active when any child is active", () => {
    const pathname = "/dashboard/invoices/123";
    const finanza = sections.find((s) => s.key === "finanza")!;
    const sectionActive = finanza.items.some((item) => isActive(pathname, item.href));
    expect(sectionActive).toBe(true);
  });

  it("should not detect section as active when no child matches", () => {
    const pathname = "/dashboard/bookings";
    const finanza = sections.find((s) => s.key === "finanza")!;
    const sectionActive = finanza.items.some((item) => isActive(pathname, item.href));
    expect(sectionActive).toBe(false);
  });
});
