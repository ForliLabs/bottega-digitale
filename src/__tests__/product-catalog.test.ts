// Unit tests for product catalog module
import { describe, it, expect } from "vitest";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  formatPrice,
} from "@/lib/product-catalog";
import type { OrderStatus } from "@/lib/product-catalog";

describe("Product Catalog — Order Status Flow", () => {
  it("should have a complete status flow", () => {
    expect(ORDER_STATUS_FLOW.ricevuto).toBe("in_preparazione");
    expect(ORDER_STATUS_FLOW.in_preparazione).toBe("pronto");
    expect(ORDER_STATUS_FLOW.pronto).toBe("consegnato");
    expect(ORDER_STATUS_FLOW.consegnato).toBeNull();
    expect(ORDER_STATUS_FLOW.cancellato).toBeNull();
  });

  it("should have terminal statuses", () => {
    const terminalStatuses: OrderStatus[] = ["consegnato", "cancellato"];
    for (const status of terminalStatuses) {
      expect(ORDER_STATUS_FLOW[status]).toBeNull();
    }
  });
});

describe("Product Catalog — Order Status Labels", () => {
  it("should have Italian labels for all statuses", () => {
    const statuses = ["ricevuto", "in_preparazione", "pronto", "consegnato", "cancellato"];
    for (const status of statuses) {
      expect(ORDER_STATUS_LABELS[status]).toBeTruthy();
    }
  });

  it("should use proper Italian capitalization", () => {
    expect(ORDER_STATUS_LABELS.ricevuto).toBe("Ricevuto");
    expect(ORDER_STATUS_LABELS.consegnato).toBe("Consegnato");
  });
});

describe("Product Catalog — Order Status Styles", () => {
  it("should have Tailwind classes for all statuses", () => {
    const statuses = ["ricevuto", "in_preparazione", "pronto", "consegnato", "cancellato"];
    for (const status of statuses) {
      expect(ORDER_STATUS_STYLES[status]).toBeTruthy();
      expect(ORDER_STATUS_STYLES[status]).toContain("bg-");
      expect(ORDER_STATUS_STYLES[status]).toContain("text-");
    }
  });

  it("should use red for cancelled status", () => {
    expect(ORDER_STATUS_STYLES.cancellato).toContain("red");
  });

  it("should use green for pronto status", () => {
    expect(ORDER_STATUS_STYLES.pronto).toContain("green");
  });
});

describe("Product Catalog — formatPrice", () => {
  it("should format price in EUR", () => {
    const result = formatPrice(22);
    expect(result).toContain("€");
    expect(result).toContain("22");
  });

  it("should handle zero", () => {
    const result = formatPrice(0);
    expect(result).toContain("0");
  });

  it("should handle decimals", () => {
    const result = formatPrice(29.99);
    expect(result).toContain("29");
  });

  it("should handle large amounts", () => {
    const result = formatPrice(1000);
    expect(result).toContain("€");
  });
});
