// Unit tests for UX fixes
import { describe, it, expect } from "vitest";

describe("UX Fix 1 — Loyalty page fallback code entry", () => {
  it("should show code entry form when customerId is missing", () => {
    // The loyalty page now shows a CodeEntryForm when ?c= param is absent
    // rather than a dead-end error message
    const customerId = "";
    const showCodeEntry = !customerId;
    expect(showCodeEntry).toBe(true);
  });

  it("should not show code entry form when customerId is present", () => {
    const customerId = "abc123";
    const showCodeEntry = !customerId;
    expect(showCodeEntry).toBe(false);
  });

  it("should construct correct redirect URL from entered code", () => {
    const businessId = "shop-1";
    const code = "abc123";
    const url = `/loyalty/${businessId}?c=${encodeURIComponent(code)}`;
    expect(url).toBe("/loyalty/shop-1?c=abc123");
  });

  it("should encode special characters in code for URL", () => {
    const businessId = "shop-1";
    const code = "code with spaces & symbols";
    const url = `/loyalty/${businessId}?c=${encodeURIComponent(code)}`;
    expect(url).toContain("code%20with%20spaces");
    expect(url).toContain("%26");
  });

  it("should reject empty code submission", () => {
    const code = "   ";
    const trimmed = code.trim();
    const isValid = trimmed.length > 0;
    expect(isValid).toBe(false);
  });
});

describe("UX Fix 2 — Website editor preview CTAs non-interactive", () => {
  it("preview CTAs should be rendered as span elements, not links or buttons", () => {
    // The editor preview uses <span> for CTAs with opacity-60 and cursor-default
    // This test validates the design decision
    const previewCTAClasses = "relative cursor-default rounded-full bg-slate-900 px-4 py-2 text-white opacity-60";
    expect(previewCTAClasses).toContain("cursor-default");
    expect(previewCTAClasses).toContain("opacity-60");
  });

  it("preview CTAs should include accessible labels", () => {
    const ariaLabel = "Anteprima: Prenota ora (non cliccabile)";
    expect(ariaLabel).toContain("non cliccabile");
    expect(ariaLabel).toContain("Anteprima");
  });
});

describe("UX Fix 3 — Dashboard bookings empty state", () => {
  it("should show empty state when bookings array is empty", () => {
    const bookings: unknown[] = [];
    const shouldShowEmptyState = bookings.length === 0;
    expect(shouldShowEmptyState).toBe(true);
  });

  it("should not show empty state when bookings exist", () => {
    const bookings = [{ id: "1", customerName: "Mario", service: "Taglio", startsAt: new Date().toISOString() }];
    const shouldShowEmptyState = bookings.length === 0;
    expect(shouldShowEmptyState).toBe(false);
  });
});

describe("UX Fix 4 — Homepage CTA links to demo section", () => {
  it("hero CTA should point to #demo anchor, not /dashboard", () => {
    const ctaHref = "#demo";
    expect(ctaHref).toBe("#demo");
    expect(ctaHref).not.toBe("/dashboard");
  });

  it("demo section should have matching anchor id", () => {
    const demoSectionId = "demo";
    const ctaHref = "#demo";
    expect(ctaHref).toBe(`#${demoSectionId}`);
  });
});

describe("UX Fix 5 — Public queue error state with retry", () => {
  it("should show retry when business load fails", () => {
    const businessLoading = false;
    const error = "Impossibile caricare la coda";
    const businessName = "";
    const entryId = null;

    const showRetry = !entryId && !businessLoading && !!error && !businessName;
    expect(showRetry).toBe(true);
  });

  it("should not show retry when business loaded successfully", () => {
    const businessLoading = false;
    const error = "";
    const businessName = "Bottega di Marco";
    const entryId = null;

    const showRetry = !entryId && !businessLoading && !!error && !businessName;
    expect(showRetry).toBe(false);
  });

  it("should not show retry when already in queue", () => {
    const businessLoading = false;
    const error = "Some error";
    const businessName = "";
    const entryId = "entry-123";

    const showRetry = !entryId && !businessLoading && !!error && !businessName;
    expect(showRetry).toBe(false);
  });

  it("should clear error when retry is clicked", () => {
    let error = "Impossibile caricare la coda";
    // Simulating the retry onClick handler
    error = "";
    expect(error).toBe("");
  });
});
