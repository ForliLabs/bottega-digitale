// Unit tests for GDPR compliance module
import { describe, it, expect } from "vitest";
import {
  formatExportAsCSV,
  generatePrivacyPolicy,
  DEFAULT_CONSENT,
  DEFAULT_COOKIE_CONSENT,
  COOKIE_CATEGORIES,
} from "@/lib/gdpr";
import type { CustomerDataExport } from "@/lib/gdpr";

const mockExport: CustomerDataExport = {
  customer: {
    name: "Mario Rossi",
    phone: "+39 333 1234567",
    email: "mario@test.it",
    birthday: null,
    totalVisits: 5,
    loyaltyPoints: 50,
    createdAt: "2025-01-01",
  },
  bookings: [
    { id: "b1", customerName: "Mario Rossi", service: "Taglio", startsAt: "2025-01-15", status: "Completata" },
    { id: "b2", customerName: "Mario Rossi", service: "Barba", startsAt: "2025-01-20", status: "Confermata" },
  ],
  loyaltyCards: [
    { id: "lc1", points: 50, totalEarned: 50, createdAt: "2025-01-01" },
  ],
  orders: [],
  queueEntries: [],
  consent: { whatsappMarketing: true, emailMarketing: false },
  exportedAt: new Date().toISOString(),
  format: "json",
};

describe("GDPR — CSV Export Formatting", () => {
  it("should include customer data section", () => {
    const csv = formatExportAsCSV(mockExport);
    expect(csv).toContain("DATI PERSONALI");
    expect(csv).toContain("Mario Rossi");
    expect(csv).toContain("+39 333 1234567");
  });

  it("should include bookings section", () => {
    const csv = formatExportAsCSV(mockExport);
    expect(csv).toContain("PRENOTAZIONI");
    expect(csv).toContain("Taglio");
  });

  it("should include loyalty section", () => {
    const csv = formatExportAsCSV(mockExport);
    expect(csv).toContain("CARTE FEDELTÀ");
  });

  it("should handle empty bookings", () => {
    const emptyExport = { ...mockExport, bookings: [] };
    const csv = formatExportAsCSV(emptyExport);
    expect(csv).toContain("PRENOTAZIONI");
  });
});

describe("GDPR — Privacy Policy Generation", () => {
  const policy = generatePrivacyPolicy({
    businessName: "Barbiere da Marco",
    address: "Via delle Torri 18",
    email: "marco@test.it",
    phone: "+39 0543 191919",
    city: "Forlì",
  });

  it("should include business name", () => {
    expect(policy).toContain("Barbiere da Marco");
    expect(policy).toContain("BARBIERE DA MARCO");
  });

  it("should include address and contact info", () => {
    expect(policy).toContain("Via delle Torri 18");
    expect(policy).toContain("marco@test.it");
    expect(policy).toContain("+39 0543 191919");
  });

  it("should reference GDPR articles", () => {
    expect(policy).toContain("Regolamento UE 2016/679");
    expect(policy).toContain("Art. 15");
    expect(policy).toContain("Art. 17");
    expect(policy).toContain("Art. 20");
  });

  it("should mention data subject rights", () => {
    expect(policy).toContain("diritto all'oblio");
    expect(policy).toContain("Portabilità");
    expect(policy).toContain("Cancellare");
  });

  it("should mention Garante Privacy", () => {
    expect(policy).toContain("garanteprivacy.it");
  });

  it("should mention data retention", () => {
    expect(policy).toContain("24 mesi");
    expect(policy).toContain("10 anni");
  });

  it("should mention cookie policy", () => {
    expect(policy).toContain("cookie");
  });

  it("should include current date", () => {
    const today = new Date().toLocaleDateString("it-IT");
    expect(policy).toContain(today);
  });
});

describe("GDPR — Default Consent", () => {
  it("should default marketing channels to off", () => {
    expect(DEFAULT_CONSENT.whatsappMarketing).toBe(false);
    expect(DEFAULT_CONSENT.emailMarketing).toBe(false);
  });

  it("should default transactional channels to on", () => {
    expect(DEFAULT_CONSENT.whatsappTransactional).toBe(true);
    expect(DEFAULT_CONSENT.emailTransactional).toBe(true);
  });

  it("should default push notifications to on", () => {
    expect(DEFAULT_CONSENT.pushNotifications).toBe(true);
  });

  it("should default analytics to on", () => {
    expect(DEFAULT_CONSENT.analyticsTracking).toBe(true);
  });

  it("should default third-party sharing to off", () => {
    expect(DEFAULT_CONSENT.thirdPartySharing).toBe(false);
  });
});

describe("GDPR — Cookie Consent", () => {
  it("should have necessary cookies always on", () => {
    expect(DEFAULT_COOKIE_CONSENT.necessary).toBe(true);
  });

  it("should have analytics cookies off by default", () => {
    expect(DEFAULT_COOKIE_CONSENT.analytics).toBe(false);
  });

  it("should have marketing cookies off by default", () => {
    expect(DEFAULT_COOKIE_CONSENT.marketing).toBe(false);
  });

  it("should have at least 3 cookie categories", () => {
    expect(COOKIE_CATEGORIES.length).toBeGreaterThanOrEqual(3);
  });

  it("should have necessary cookies as required", () => {
    const necessary = COOKIE_CATEGORIES.find((c) => c.id === "necessary");
    expect(necessary).toBeDefined();
    expect(necessary!.required).toBe(true);
  });

  it("should have analytics and marketing as optional", () => {
    const analytics = COOKIE_CATEGORIES.find((c) => c.id === "analytics");
    const marketing = COOKIE_CATEGORIES.find((c) => c.id === "marketing");
    expect(analytics!.required).toBe(false);
    expect(marketing!.required).toBe(false);
  });

  it("should have descriptions for all categories", () => {
    for (const cat of COOKIE_CATEGORIES) {
      expect(cat.name).toBeTruthy();
      expect(cat.description).toBeTruthy();
    }
  });
});
