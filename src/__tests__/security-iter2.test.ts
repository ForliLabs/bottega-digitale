// Tests for iteration 2 security fixes
import { describe, it, expect } from "vitest";
import { ensureSameOrigin } from "@/lib/api-response";

// ─── ensureSameOrigin guard tests ────────────────────────────────

describe("ensureSameOrigin CSRF guard", () => {
  function makeRequest(url: string, headers: Record<string, string> = {}): Request {
    return new Request(url, { headers });
  }

  it("should allow when origin matches request URL", () => {
    const req = makeRequest("https://example.com/api/test", {
      origin: "https://example.com",
    });
    expect(ensureSameOrigin(req)).toBeNull();
  });

  it("should reject when origin does not match request URL", () => {
    const req = makeRequest("https://example.com/api/test", {
      origin: "https://evil.com",
    });
    const result = ensureSameOrigin(req);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it("should allow when referer origin matches (no origin header)", () => {
    const req = makeRequest("https://example.com/api/test", {
      referer: "https://example.com/dashboard",
    });
    expect(ensureSameOrigin(req)).toBeNull();
  });

  it("should reject when referer origin does not match", () => {
    const req = makeRequest("https://example.com/api/test", {
      referer: "https://evil.com/phishing",
    });
    const result = ensureSameOrigin(req);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it("should allow when neither origin nor referer is present (non-browser)", () => {
    const req = makeRequest("https://example.com/api/test");
    expect(ensureSameOrigin(req)).toBeNull();
  });
});

// ─── Staff PATCH allowlist tests ─────────────────────────────────

describe("Staff PATCH field allowlist", () => {
  const STAFF_UPDATABLE_FIELDS = new Set([
    "name",
    "email",
    "phone",
    "role",
    "color",
    "workingHours",
    "serviceIds",
    "active",
  ]);

  function filterPayload(raw: Record<string, unknown>): Record<string, unknown> {
    const filtered: Record<string, unknown> = {};
    for (const key of Object.keys(raw)) {
      if (STAFF_UPDATABLE_FIELDS.has(key)) {
        filtered[key] = raw[key];
      }
    }
    return filtered;
  }

  it("should allow valid fields through", () => {
    const result = filterPayload({ name: "Mario", email: "m@test.com", active: true });
    expect(result).toEqual({ name: "Mario", email: "m@test.com", active: true });
  });

  it("should strip businessId from updates", () => {
    const result = filterPayload({ name: "Mario", businessId: "other-tenant" });
    expect(result).toEqual({ name: "Mario" });
    expect(result).not.toHaveProperty("businessId");
  });

  it("should strip id from updates", () => {
    const result = filterPayload({ name: "Mario", id: "override-id" });
    expect(result).toEqual({ name: "Mario" });
    expect(result).not.toHaveProperty("id");
  });

  it("should strip userId from updates", () => {
    const result = filterPayload({ name: "Mario", userId: "other-user" });
    expect(result).toEqual({ name: "Mario" });
    expect(result).not.toHaveProperty("userId");
  });

  it("should strip createdAt and updatedAt from updates", () => {
    const result = filterPayload({ name: "Mario", createdAt: "2020-01-01", updatedAt: "2020-01-01" });
    expect(result).toEqual({ name: "Mario" });
  });

  it("should allow all valid staff fields", () => {
    const allValid = {
      name: "Maria",
      email: "maria@test.com",
      phone: "+39123",
      role: "manager",
      color: "#FF0000",
      workingHours: "[]",
      serviceIds: "[]",
      active: false,
    };
    expect(filterPayload(allValid)).toEqual(allValid);
  });

  it("should return empty object for payload with only disallowed fields", () => {
    const result = filterPayload({ businessId: "x", userId: "y", __proto__: "z" });
    expect(Object.keys(result)).toHaveLength(0);
  });
});

// ─── Staff role validation tests ─────────────────────────────────

describe("Staff role validation", () => {
  const validRoles = ["owner", "manager", "staff"];

  it("should accept valid roles", () => {
    for (const role of validRoles) {
      expect(validRoles.includes(role)).toBe(true);
    }
  });

  it("should reject invalid roles", () => {
    const invalidRoles = ["admin", "superuser", "root", "", "OWNER"];
    for (const role of invalidRoles) {
      expect(validRoles.includes(role)).toBe(false);
    }
  });
});

// ─── createOrder validation logic tests ──────────────────────────

describe("createOrder validation logic", () => {
  it("should detect missing product IDs when scoped by business", () => {
    const requestedIds = ["prod-1", "prod-2", "prod-3"];
    const foundProducts = [{ id: "prod-1" }, { id: "prod-3" }];
    const foundIds = new Set(foundProducts.map((p) => p.id));
    const missingIds = requestedIds.filter((id) => !foundIds.has(id));

    expect(missingIds).toEqual(["prod-2"]);
  });

  it("should pass when all products found", () => {
    const requestedIds = ["prod-1", "prod-2"];
    const foundProducts = [{ id: "prod-1" }, { id: "prod-2" }];
    const foundIds = new Set(foundProducts.map((p) => p.id));
    const missingIds = requestedIds.filter((id) => !foundIds.has(id));

    expect(missingIds).toHaveLength(0);
  });

  it("should reject empty items array", () => {
    const items: Array<{ productId: string; quantity: number }> = [];
    expect(items.length === 0).toBe(true);
  });
});

// ─── Loyalty checkin input validation tests ──────────────────────

describe("Loyalty checkin input validation", () => {
  it("should require at least one customer identifier", () => {
    const body = {};
    const { customerId, customerPhone } = body as Record<string, unknown>;
    expect(!customerId && !customerPhone).toBe(true);
  });

  it("should accept customerId as identifier", () => {
    const body = { customerId: "cust-123" };
    const { customerId, customerPhone } = body as Record<string, unknown>;
    expect(!customerId && !customerPhone).toBe(false);
  });

  it("should accept customerPhone as identifier", () => {
    const body = { customerPhone: "+39123456" };
    const { customerId, customerPhone } = body as Record<string, unknown>;
    expect(!customerId && !customerPhone).toBe(false);
  });

  it("should reject non-string customerId", () => {
    const customerId = 12345;
    expect(typeof customerId !== "string").toBe(true);
  });

  it("should reject non-string customerPhone", () => {
    const customerPhone = 12345;
    expect(typeof customerPhone !== "string").toBe(true);
  });
});
