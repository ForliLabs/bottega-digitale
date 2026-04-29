// Unit tests for email module
import { describe, it, expect } from "vitest";
import {
  renderBookingConfirmation,
  renderPaymentReceipt,
  renderPasswordReset,
  renderWelcome,
  renderWeeklySummary,
  renderOrderConfirmation,
  renderReviewRequest,
} from "@/lib/email";

const mockBranding = {
  businessName: "Barbiere da Marco",
  primaryColor: "#1E40AF",
  city: "Forlì",
};

describe("Email — Booking Confirmation Template", () => {
  it("should render booking details", () => {
    const { subject, html } = renderBookingConfirmation({
      customerName: "Mario Rossi",
      service: "Taglio classico",
      date: "15/01/2025",
      time: "10:00",
      address: "Via delle Torri 18, Forlì",
      branding: mockBranding,
    });
    expect(subject).toContain("Prenotazione confermata");
    expect(subject).toContain("Taglio classico");
    expect(html).toContain("Mario Rossi");
    expect(html).toContain("Taglio classico");
    expect(html).toContain("10:00");
    expect(html).toContain("Via delle Torri 18");
  });

  it("should include staff name when provided", () => {
    const { html } = renderBookingConfirmation({
      customerName: "Mario",
      service: "Barba",
      date: "15/01",
      time: "10:00",
      staffName: "Marco",
      address: "Via delle Torri 18",
      branding: mockBranding,
    });
    expect(html).toContain("Marco");
  });

  it("should include cancel link when provided", () => {
    const { html } = renderBookingConfirmation({
      customerName: "Mario",
      service: "Barba",
      date: "15/01",
      time: "10:00",
      address: "Via delle Torri 18",
      cancelUrl: "https://example.com/cancel",
      branding: mockBranding,
    });
    expect(html).toContain("cancel");
  });
});

describe("Email — Payment Receipt Template", () => {
  it("should render payment amount", () => {
    const { subject, html } = renderPaymentReceipt({
      customerName: "Mario Rossi",
      amount: "€22,00",
      description: "Taglio classico",
      date: "15/01/2025",
      transactionId: "tx-123",
      branding: mockBranding,
    });
    expect(subject).toContain("€22,00");
    expect(html).toContain("€22,00");
    expect(html).toContain("tx-123");
  });
});

describe("Email — Password Reset Template", () => {
  it("should render OTP code", () => {
    const { subject, html } = renderPasswordReset({
      name: "Mario",
      otpCode: "123456",
      expiresMinutes: 15,
      branding: mockBranding,
    });
    expect(subject).toContain("password");
    expect(html).toContain("123456");
    expect(html).toContain("15 minuti");
  });
});

describe("Email — Welcome Template", () => {
  it("should render welcome with business name", () => {
    const { subject, html } = renderWelcome({
      name: "Mario",
      businessName: "Barbiere da Marco",
      dashboardUrl: "https://example.com/dashboard",
      branding: mockBranding,
    });
    expect(subject).toContain("Benvenuto");
    expect(html).toContain("Dashboard");
    expect(html).toContain("Barbiere da Marco");
  });
});

describe("Email — Weekly Summary Template", () => {
  it("should render weekly stats", () => {
    const { subject, html } = renderWeeklySummary({
      businessName: "Barbiere da Marco",
      period: "6-12 Gennaio 2025",
      bookings: 15,
      revenue: "€340,00",
      newCustomers: 3,
      pendingReviews: 2,
      branding: mockBranding,
    });
    expect(subject).toContain("Riepilogo");
    expect(html).toContain("15");
    expect(html).toContain("€340,00");
    expect(html).toContain("3");
  });
});

describe("Email — Order Confirmation Template", () => {
  it("should render order with items", () => {
    const { subject, html } = renderOrderConfirmation({
      customerName: "Mario Rossi",
      orderId: "ORD-001",
      items: [
        { name: "Pane toscano", quantity: 2, price: "€6,00" },
        { name: "Focaccia", quantity: 1, price: "€4,00" },
      ],
      total: "€10,00",
      branding: mockBranding,
    });
    expect(subject).toContain("ORD-001");
    expect(html).toContain("Pane toscano");
    expect(html).toContain("€10,00");
  });
});

describe("Email — Review Request Template", () => {
  it("should render review request with link", () => {
    const { html } = renderReviewRequest({
      customerName: "Mario",
      service: "Taglio classico",
      reviewUrl: "https://example.com/review",
      branding: mockBranding,
    });
    expect(html).toContain("esperienza");
    expect(html).toContain("Taglio classico");
    expect(html).toContain("review");
  });
});

describe("Email — Layout", () => {
  it("should include business name in all templates", () => {
    const { html } = renderWelcome({
      name: "Test",
      businessName: "Test Business",
      dashboardUrl: "/",
      branding: { businessName: "Test Business" },
    });
    expect(html).toContain("Test Business");
    expect(html).toContain("Bottega Digitale");
  });

  it("should include unsubscribe link", () => {
    const { html } = renderWelcome({
      name: "Test",
      businessName: "Test",
      dashboardUrl: "/",
      branding: { businessName: "Test" },
    });
    expect(html).toContain("unsubscribe");
  });

  it("should be valid HTML", () => {
    const { html } = renderWelcome({
      name: "Test",
      businessName: "Test",
      dashboardUrl: "/",
      branding: { businessName: "Test" },
    });
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
    expect(html).toContain('lang="it"');
  });
});
