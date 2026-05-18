// Unit tests for Iteration 2 UX/accessibility improvements
import { describe, it, expect } from "vitest";

// ─── ConfirmDialog contract ────────────────────────────────────

describe("ConfirmDialog component module", () => {
  it("exports ConfirmDialog function", async () => {
    const mod = await import("@/components/ui/confirm-dialog");
    expect(typeof mod.ConfirmDialog).toBe("function");
  });
});

// ─── Toast provider alert semantics ────────────────────────────

describe("ToastProvider module", () => {
  it("exports ToastProvider and useToast", async () => {
    const mod = await import("@/components/ui/toast-provider");
    expect(typeof mod.ToastProvider).toBe("function");
    expect(typeof mod.useToast).toBe("function");
  });
});

// ─── Feedback module alert semantics ───────────────────────────

describe("Feedback module", () => {
  it("exports InlineMessage component", async () => {
    const mod = await import("@/components/ui/feedback");
    expect(typeof mod.InlineMessage).toBe("function");
  });
});

// ─── BookingsManager contract ──────────────────────────────────

describe("BookingsManager module", () => {
  it("exports BookingsManager function", async () => {
    const mod = await import("@/app/dashboard/bookings/bookings-manager");
    expect(typeof mod.BookingsManager).toBe("function");
  });
});

// ─── CustomersManager contract ─────────────────────────────────

describe("CustomersManager module", () => {
  it("exports CustomersManager function", async () => {
    const mod = await import("@/app/dashboard/customers/customers-manager");
    expect(typeof mod.CustomersManager).toBe("function");
  });
});

// ─── window.confirm removal verification ───────────────────────

describe("window.confirm removal", () => {
  it("bookings-manager source does not reference window.confirm", async () => {
    // Read source to verify window.confirm was removed
    const fs = await import("fs");
    const path = await import("path");
    const src = fs.readFileSync(
      path.resolve(__dirname, "../app/dashboard/bookings/bookings-manager.tsx"),
      "utf-8",
    );
    expect(src).not.toContain("window.confirm");
  });

  it("customers-manager source does not reference window.confirm", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const src = fs.readFileSync(
      path.resolve(__dirname, "../app/dashboard/customers/customers-manager.tsx"),
      "utf-8",
    );
    expect(src).not.toContain("window.confirm");
  });
});

// ─── Form label association verification ───────────────────────

describe("Form label association", () => {
  it("bookings form uses htmlFor + id pairs", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const src = fs.readFileSync(
      path.resolve(__dirname, "../app/dashboard/bookings/bookings-manager.tsx"),
      "utf-8",
    );
    // Every label should use htmlFor.
    const labelMatches = src.match(/htmlFor="booking-\w+"/g) ?? [];
    const idMatches = src.match(/id="booking-\w+"/g) ?? [];
    expect(labelMatches.length).toBeGreaterThanOrEqual(8);
    // The service field has two conditional implementations (select + free-text input)
    // that share the same id so the label's htmlFor always resolves to the visible
    // control regardless of which mode is active. Allow id count == label count OR
    // id count == label count + 1 for that one shared id.
    expect(idMatches.length).toBeGreaterThanOrEqual(labelMatches.length);
    expect(idMatches.length).toBeLessThanOrEqual(labelMatches.length + 1);
  });

  it("customers form uses htmlFor + id pairs", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const src = fs.readFileSync(
      path.resolve(__dirname, "../app/dashboard/customers/customers-manager.tsx"),
      "utf-8",
    );
    const labelMatches = src.match(/htmlFor="customer-\w+"/g) ?? [];
    const idMatches = src.match(/id="customer-\w+"/g) ?? [];
    expect(labelMatches.length).toBeGreaterThanOrEqual(5);
    expect(idMatches.length).toBe(labelMatches.length);
  });
});

// ─── Error summary accessibility ───────────────────────────────

describe("Error summary accessibility", () => {
  it("bookings error summary uses role=alert", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const src = fs.readFileSync(
      path.resolve(__dirname, "../app/dashboard/bookings/bookings-manager.tsx"),
      "utf-8",
    );
    expect(src).toContain('role="alert"');
    expect(src).toContain('aria-label="Errori nel modulo"');
    expect(src).toContain("tabIndex={-1}");
  });

  it("customers error summary uses role=alert", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const src = fs.readFileSync(
      path.resolve(__dirname, "../app/dashboard/customers/customers-manager.tsx"),
      "utf-8",
    );
    expect(src).toContain('role="alert"');
    expect(src).toContain('aria-label="Errori nel modulo"');
    expect(src).toContain("tabIndex={-1}");
  });
});

// ─── Mobile touch target verification ──────────────────────────

describe("Mobile touch targets", () => {
  it("bookings mobile buttons have min-h-[44px]", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const src = fs.readFileSync(
      path.resolve(__dirname, "../app/dashboard/bookings/bookings-manager.tsx"),
      "utf-8",
    );
    // In the mobile card layout (md:hidden block), buttons should have min-h-[44px]
    const mobileSection = src.split("md:hidden")[1]?.split("hidden overflow-x-auto md:block")[0] ?? "";
    const minHMatches = mobileSection.match(/min-h-\[44px\]/g) ?? [];
    // select + edit button + delete button = 3 elements with min-h
    expect(minHMatches.length).toBeGreaterThanOrEqual(3);
  });

  it("customers mobile buttons have min-h-[44px]", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const src = fs.readFileSync(
      path.resolve(__dirname, "../app/dashboard/customers/customers-manager.tsx"),
      "utf-8",
    );
    const mobileSection = src.split("md:hidden")[1]?.split("hidden overflow-x-auto md:block")[0] ?? "";
    const minHMatches = mobileSection.match(/min-h-\[44px\]/g) ?? [];
    // edit button + delete button = 2 elements with min-h
    expect(minHMatches.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── ConfirmDialog ARIA attributes ─────────────────────────────

describe("ConfirmDialog ARIA", () => {
  it("source uses role=alertdialog with proper aria attributes", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const src = fs.readFileSync(
      path.resolve(__dirname, "../components/ui/confirm-dialog.tsx"),
      "utf-8",
    );
    expect(src).toContain('role="alertdialog"');
    expect(src).toContain("aria-modal");
    expect(src).toContain("aria-labelledby");
    expect(src).toContain("aria-describedby");
  });
});
