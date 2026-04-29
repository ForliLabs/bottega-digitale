// Unit tests for business templates module
import { describe, it, expect } from "vitest";
import {
  BUSINESS_TEMPLATES,
  getTemplate,
  getTemplateCategories,
} from "@/lib/business-templates";

describe("Business Templates — Template Registry", () => {
  it("should have 10 templates", () => {
    expect(BUSINESS_TEMPLATES.length).toBe(10);
  });

  it("should have unique IDs", () => {
    const ids = BUSINESS_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should include all key Italian categories", () => {
    const ids = BUSINESS_TEMPLATES.map((t) => t.id);
    expect(ids).toContain("barbiere");
    expect(ids).toContain("parrucchiera");
    expect(ids).toContain("estetista");
    expect(ids).toContain("forno");
    expect(ids).toContain("fiorista");
    expect(ids).toContain("ristorante");
    expect(ids).toContain("meccanico");
    expect(ids).toContain("dentista");
    expect(ids).toContain("palestra");
    expect(ids).toContain("alimentari");
  });
});

describe("Business Templates — Barbiere Template", () => {
  const barbiere = BUSINESS_TEMPLATES.find((t) => t.id === "barbiere")!;

  it("should have services", () => {
    expect(barbiere.services.length).toBeGreaterThan(3);
  });

  it("should have typical Italian barbiere pricing", () => {
    const taglio = barbiere.services.find((s) => s.name.toLowerCase().includes("taglio classico"));
    expect(taglio).toBeDefined();
    expect(taglio!.priceEuro).toBeGreaterThanOrEqual(10);
    expect(taglio!.priceEuro).toBeLessThanOrEqual(25);
  });

  it("should have reasonable durations", () => {
    for (const service of barbiere.services) {
      expect(service.durationMinutes).toBeGreaterThan(0);
      expect(service.durationMinutes).toBeLessThanOrEqual(60);
    }
  });

  it("should have no products (service-only)", () => {
    expect(barbiere.products.length).toBe(0);
  });

  it("should have WhatsApp FAQs", () => {
    expect(barbiere.whatsappFaqs.length).toBeGreaterThan(0);
  });

  it("should have loyalty config", () => {
    expect(barbiere.loyalty.pointsPerVisit).toBeGreaterThan(0);
    expect(barbiere.loyalty.rewardThreshold).toBeGreaterThan(0);
    expect(barbiere.loyalty.rewardName).toBeTruthy();
  });
});

describe("Business Templates — Forno Template", () => {
  const forno = BUSINESS_TEMPLATES.find((t) => t.id === "forno")!;

  it("should have products (not services)", () => {
    expect(forno.products.length).toBeGreaterThan(3);
    expect(forno.services.length).toBe(0);
  });

  it("should have product categories", () => {
    const categories = new Set(forno.products.map((p) => p.category));
    expect(categories.size).toBeGreaterThan(1);
  });

  it("should have early opening hours", () => {
    const tuesday = forno.openingHours.find((h) => h.day === "Martedì");
    expect(tuesday).toBeDefined();
    const openHour = parseInt(tuesday!.open.split(":")[0]);
    expect(openHour).toBeLessThanOrEqual(7);
  });
});

describe("Business Templates — Ristorante Template", () => {
  const ristorante = BUSINESS_TEMPLATES.find((t) => t.id === "ristorante")!;

  it("should have both services and products", () => {
    expect(ristorante.services.length).toBeGreaterThan(0);
    expect(ristorante.products.length).toBeGreaterThan(0);
  });

  it("should have table booking services at €0", () => {
    const freeServices = ristorante.services.filter((s) => s.priceEuro === 0);
    expect(freeServices.length).toBeGreaterThan(0);
  });
});

describe("Business Templates — All Templates Validation", () => {
  it("should have opening hours for all templates", () => {
    for (const template of BUSINESS_TEMPLATES) {
      expect(template.openingHours.length).toBeGreaterThanOrEqual(7);
    }
  });

  it("should have either services or products for each template", () => {
    for (const template of BUSINESS_TEMPLATES) {
      expect(template.services.length + template.products.length).toBeGreaterThan(0);
    }
  });

  it("should have icons for all templates", () => {
    for (const template of BUSINESS_TEMPLATES) {
      expect(template.icon).toBeTruthy();
    }
  });

  it("should have labels for all templates", () => {
    for (const template of BUSINESS_TEMPLATES) {
      expect(template.label).toBeTruthy();
    }
  });

  it("should have website templates for all templates", () => {
    for (const template of BUSINESS_TEMPLATES) {
      expect(template.websiteTemplate).toBeTruthy();
    }
  });

  it("should have social themes for all templates", () => {
    for (const template of BUSINESS_TEMPLATES) {
      expect(template.socialThemes.length).toBeGreaterThan(0);
    }
  });

  it("should have valid opening hour format", () => {
    for (const template of BUSINESS_TEMPLATES) {
      for (const hour of template.openingHours) {
        expect(hour.open).toMatch(/^\d{2}:\d{2}$/);
        expect(hour.close).toMatch(/^\d{2}:\d{2}$/);
        expect(typeof hour.closed).toBe("boolean");
      }
    }
  });
});

describe("Business Templates — getTemplate", () => {
  it("should find template by ID", () => {
    const template = getTemplate("barbiere");
    expect(template).toBeDefined();
    expect(template!.id).toBe("barbiere");
  });

  it("should find template by category", () => {
    const template = getTemplate("parrucchiere");
    expect(template).toBeDefined();
  });

  it("should be case-insensitive", () => {
    const template = getTemplate("Barbiere");
    expect(template).toBeDefined();
  });

  it("should return undefined for unknown templates", () => {
    expect(getTemplate("sconosciuto")).toBeUndefined();
  });
});

describe("Business Templates — getTemplateCategories", () => {
  it("should return all categories with id, label, icon", () => {
    const categories = getTemplateCategories();
    expect(categories.length).toBe(10);
    for (const cat of categories) {
      expect(cat.id).toBeTruthy();
      expect(cat.label).toBeTruthy();
      expect(cat.icon).toBeTruthy();
    }
  });
});
