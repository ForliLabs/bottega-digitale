// Integration Tests — SEO & Discovery Engine (Feature 4)
import { describe, it, expect } from "vitest";
import {
  generateLocalBusinessJsonLd,
  generateProductJsonLd,
  generateServiceJsonLd,
  generateBreadcrumbJsonLd,
  generateWebsiteJsonLd,
  generateBusinessMetadata,
  generateSitemapXml,
  type SitemapEntry,
} from "@/lib/seo";

describe("SEO — LocalBusiness JSON-LD", () => {
  const sampleBusiness = {
    name: "Barberia Da Marco",
    slug: "barberia-da-marco",
    category: "Barbiere",
    description: "La migliore barberia di Forlì",
    address: "Via Aurelio Saffi 42, 47121 Forlì FC",
    city: "Forlì",
    phone: "+393331234567",
    email: "info@barberia.it",
    openingHours: ["Lun 09:00-13:00, 15:00-19:30", "Mar 09:00-19:30", "Dom Chiuso"],
    avgRating: 4.8,
    reviewCount: 15,
  };

  it("should generate valid JSON-LD with @context and @type", () => {
    const jsonLd = generateLocalBusinessJsonLd(sampleBusiness);
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("BarberShop");
  });

  it("should map Italian category to Schema.org type", () => {
    const restaurant = generateLocalBusinessJsonLd({ ...sampleBusiness, category: "Ristorante" });
    expect(restaurant["@type"]).toBe("Restaurant");

    const salon = generateLocalBusinessJsonLd({ ...sampleBusiness, category: "Parrucchiere" });
    expect(salon["@type"]).toBe("HairSalon");

    const florist = generateLocalBusinessJsonLd({ ...sampleBusiness, category: "Fiorista" });
    expect(florist["@type"]).toBe("Florist");
  });

  it("should fallback to LocalBusiness for unknown categories", () => {
    const unknown = generateLocalBusinessJsonLd({ ...sampleBusiness, category: "Gelataio" });
    expect(unknown["@type"]).toBe("LocalBusiness");
  });

  it("should include address with Italian location data", () => {
    const jsonLd = generateLocalBusinessJsonLd(sampleBusiness);
    const address = jsonLd.address as Record<string, string>;
    expect(address["@type"]).toBe("PostalAddress");
    expect(address.addressLocality).toBe("Forlì");
    expect(address.addressCountry).toBe("IT");
  });

  it("should include aggregateRating when reviews exist", () => {
    const jsonLd = generateLocalBusinessJsonLd(sampleBusiness);
    const rating = jsonLd.aggregateRating as Record<string, unknown>;
    expect(rating).toBeDefined();
    expect(rating["@type"]).toBe("AggregateRating");
    expect(rating.ratingValue).toBe("4.8");
    expect(rating.reviewCount).toBe(15);
  });

  it("should omit aggregateRating when no reviews", () => {
    const noReviews = { ...sampleBusiness, avgRating: undefined, reviewCount: undefined };
    const jsonLd = generateLocalBusinessJsonLd(noReviews);
    expect(jsonLd.aggregateRating).toBeUndefined();
  });

  it("should include business URL", () => {
    const jsonLd = generateLocalBusinessJsonLd(sampleBusiness);
    expect(jsonLd.url).toContain("/s/barberia-da-marco");
  });
});

describe("SEO — Product JSON-LD", () => {
  it("should generate valid Product schema", () => {
    const jsonLd = generateProductJsonLd({
      name: "Bouquet di rose rosse",
      description: "12 rose rosse a gambo lungo",
      priceEuro: 35,
      availability: true,
      businessName: "Fiorista Girasole",
      businessSlug: "fiorista-girasole",
    });

    expect(jsonLd["@type"]).toBe("Product");
    expect(jsonLd.name).toBe("Bouquet di rose rosse");
    const offers = jsonLd.offers as Record<string, unknown>;
    expect(offers.price).toBe("35.00");
    expect(offers.priceCurrency).toBe("EUR");
    expect(offers.availability).toContain("InStock");
  });

  it("should mark out-of-stock correctly", () => {
    const jsonLd = generateProductJsonLd({
      name: "Test",
      description: "Test",
      priceEuro: 10,
      availability: false,
      businessName: "Test",
      businessSlug: "test",
    });
    const offers = jsonLd.offers as Record<string, unknown>;
    expect(offers.availability).toContain("OutOfStock");
  });
});

describe("SEO — Service JSON-LD", () => {
  it("should generate valid Service schema with duration", () => {
    const jsonLd = generateServiceJsonLd({
      name: "Taglio uomo",
      priceEuro: 18,
      durationMinutes: 25,
      businessName: "Barberia Da Marco",
      businessSlug: "barberia-da-marco",
    });

    expect(jsonLd["@type"]).toBe("Service");
    expect(jsonLd.estimatedDuration).toBe("PT25M");
    const offers = jsonLd.offers as Record<string, unknown>;
    expect(offers.price).toBe("18.00");
  });
});

describe("SEO — Breadcrumb JSON-LD", () => {
  it("should generate BreadcrumbList with correct positions", () => {
    const jsonLd = generateBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Directory", url: "/directory" },
      { name: "Barberia Da Marco", url: "/s/barberia-da-marco" },
    ]);

    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    const items = jsonLd.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(3);
    expect(items[0].position).toBe(1);
    expect(items[2].position).toBe(3);
    expect(items[2].name).toBe("Barberia Da Marco");
  });
});

describe("SEO — Website JSON-LD", () => {
  it("should generate WebSite schema with search action", () => {
    const jsonLd = generateWebsiteJsonLd();
    expect(jsonLd["@type"]).toBe("WebSite");
    expect(jsonLd.name).toBe("Bottega Digitale");
    expect(jsonLd.potentialAction).toBeDefined();
  });
});

describe("SEO — Business Metadata", () => {
  it("should generate complete metadata for a business", () => {
    const meta = generateBusinessMetadata({
      name: "Barberia Da Marco",
      slug: "barberia-da-marco",
      category: "Barbiere",
      city: "Forlì",
      description: "La migliore barberia di Forlì",
    });

    expect(meta.title).toContain("Barberia Da Marco");
    expect(meta.title).toContain("Barbiere");
    expect(meta.title).toContain("Forlì");
    expect(meta.description).toBeTruthy();
    expect(meta.openGraph?.locale).toBe("it_IT");
    expect(meta.alternates?.canonical).toContain("/s/barberia-da-marco");
  });

  it("should truncate long descriptions", () => {
    const longDesc = "A".repeat(200);
    const meta = generateBusinessMetadata({
      name: "Test",
      slug: "test",
      category: "Test",
      city: "Test",
      description: longDesc,
    });
    expect(meta.description!.length).toBeLessThanOrEqual(160);
  });
});

describe("SEO — Sitemap XML Generation", () => {
  it("should generate valid XML sitemap", () => {
    const entries: SitemapEntry[] = [
      { url: "/", changefreq: "weekly", priority: 1.0 },
      { url: "/directory", changefreq: "daily", priority: 0.9 },
    ];
    const xml = generateSitemapXml(entries);
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain("<urlset");
    expect(xml).toContain("<loc>");
    expect(xml).toContain("<changefreq>weekly</changefreq>");
    expect(xml).toContain("<priority>1.0</priority>");
  });

  it("should include lastmod when provided", () => {
    const xml = generateSitemapXml([
      { url: "/s/test", lastmod: "2025-01-15" },
    ]);
    expect(xml).toContain("<lastmod>2025-01-15</lastmod>");
  });

  it("should handle empty sitemap", () => {
    const xml = generateSitemapXml([]);
    expect(xml).toContain("<urlset");
    expect(xml).not.toContain("<url>");
  });
});
