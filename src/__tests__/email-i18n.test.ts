// Integration Tests — Email i18n (Feature 8)
import { describe, it, expect } from "vitest";
import {
  renderBookingConfirmationI18n,
  renderWelcomeI18n,
  renderReviewRequestI18n,
  renderPasswordResetI18n,
} from "@/lib/email-i18n";

const branding = {
  businessName: "Barberia Da Marco",
  primaryColor: "#1E40AF",
  city: "Forlì",
};

describe("Email i18n — Booking Confirmation", () => {
  const baseData = {
    customerName: "Marco Rossi",
    service: "Taglio uomo",
    date: "15/01/2025",
    time: "10:00",
    address: "Via Saffi 42, Forlì",
    branding,
  };

  it("should render in Italian by default", () => {
    const { subject, html } = renderBookingConfirmationI18n(baseData);
    expect(subject).toContain("confermata");
    expect(html).toContain("Prenotazione confermata");
    expect(html).toContain("Marco Rossi");
    expect(html).toContain("Taglio uomo");
    expect(html).toContain("Servizio");
    expect(html).toContain("lang=\"it\"");
  });

  it("should render in English when locale is 'en'", () => {
    const { subject, html } = renderBookingConfirmationI18n({
      ...baseData,
      locale: "en",
    });
    expect(subject).toContain("confirmed");
    expect(html).toContain("Booking confirmed");
    expect(html).toContain("lang=\"en\"");
    expect(html).toContain("Service");
    expect(html).toContain("Date");
    expect(html).toContain("Time");
  });

  it("should include cancel URL when provided", () => {
    const { html } = renderBookingConfirmationI18n({
      ...baseData,
      cancelUrl: "https://example.com/cancel",
    });
    expect(html).toContain("cancel");
    expect(html).toContain("https://example.com/cancel");
  });

  it("should include staff name when provided", () => {
    const { html } = renderBookingConfirmationI18n({
      ...baseData,
      staffName: "Luca",
    });
    expect(html).toContain("Luca");
    expect(html).toContain("Operatore");
  });
});

describe("Email i18n — Welcome", () => {
  it("should render Italian welcome email", () => {
    const { subject, html } = renderWelcomeI18n({
      name: "Rosa",
      businessName: "Trattoria Nonna Rosa",
      dashboardUrl: "https://app.bottegadigitale.it/dashboard",
      branding,
    });
    expect(subject).toContain("Benvenuto");
    expect(html).toContain("Benvenuto su Bottega Digitale");
    expect(html).toContain("primi passi");
    expect(html).toContain("Dashboard");
  });

  it("should render English welcome email", () => {
    const { subject, html } = renderWelcomeI18n({
      name: "Rosa",
      businessName: "Trattoria Nonna Rosa",
      dashboardUrl: "https://app.bottegadigitale.it/dashboard",
      branding,
      locale: "en",
    });
    expect(subject).toContain("Welcome");
    expect(html).toContain("Welcome to Bottega Digitale");
    expect(html).toContain("first steps");
  });
});

describe("Email i18n — Review Request", () => {
  it("should render in Italian", () => {
    const { html } = renderReviewRequestI18n({
      customerName: "Marco",
      service: "Taglio",
      reviewUrl: "https://review.url",
      branding,
    });
    expect(html).toContain("esperienza");
    expect(html).toContain("recensione");
  });

  it("should render in English", () => {
    const { html } = renderReviewRequestI18n({
      customerName: "Marco",
      service: "Haircut",
      reviewUrl: "https://review.url",
      branding,
      locale: "en",
    });
    expect(html).toContain("experience");
    expect(html).toContain("review");
  });
});

describe("Email i18n — Password Reset", () => {
  it("should render with OTP code in Italian", () => {
    const { html } = renderPasswordResetI18n({
      name: "Marco",
      otpCode: "123456",
      expiresMinutes: 10,
      branding,
    });
    expect(html).toContain("123456");
    expect(html).toContain("10 minuti");
    expect(html).toContain("password");
  });

  it("should render with OTP code in English", () => {
    const { html } = renderPasswordResetI18n({
      name: "Marco",
      otpCode: "654321",
      expiresMinutes: 15,
      branding,
      locale: "en",
    });
    expect(html).toContain("654321");
    expect(html).toContain("15 minutes");
    expect(html).toContain("reset");
  });
});

describe("Email i18n — Layout", () => {
  it("should include business branding in all emails", () => {
    const { html } = renderBookingConfirmationI18n({
      customerName: "Test",
      service: "Test",
      date: "01/01/2025",
      time: "10:00",
      address: "Test",
      branding: {
        businessName: "My Business",
        primaryColor: "#FF0000",
        city: "Roma",
      },
    });
    expect(html).toContain("My Business");
    expect(html).toContain("Roma");
    expect(html).toContain("#FF0000");
  });

  it("should include unsubscribe link", () => {
    const { html } = renderWelcomeI18n({
      name: "Test",
      businessName: "Test",
      dashboardUrl: "https://test.com",
      branding,
    });
    expect(html).toContain("unsubscribe");
  });

  it("should include Bottega Digitale branding", () => {
    const { html } = renderWelcomeI18n({
      name: "Test",
      businessName: "Test",
      dashboardUrl: "https://test.com",
      branding,
    });
    expect(html).toContain("Bottega Digitale");
  });
});
