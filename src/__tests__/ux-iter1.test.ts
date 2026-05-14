// Unit tests for Iteration 1 — exercises real code from security, e-invoice, and api-response modules
import { describe, it, expect } from "vitest";
import { sanitizeHtml, validateInput, generateCSRFToken, validateCSRFToken } from "@/lib/security";
import { IVA_RATES, formatEuro } from "@/lib/e-invoice";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";

// ─── sanitizeHtml ──────────────────────────────────────────────

describe("sanitizeHtml", () => {
  it("escapes script tags in user input", () => {
    const result = sanitizeHtml('<img src=x onerror="alert(1)">');
    expect(result).not.toContain("<img");
    expect(result).toContain("&lt;img");
  });

  it("round-trips safe Italian text unchanged", () => {
    expect(sanitizeHtml("Caffè & Bottega d'Arte")).toBe(
      "Caffè &amp; Bottega d&#x27;Arte"
    );
  });
});

// ─── validateInput ─────────────────────────────────────────────

describe("validateInput", () => {
  it("rejects missing required fields", () => {
    const errors = validateInput({}, [
      { field: "email", type: "email", required: true },
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe("email");
  });

  it("accepts valid phone numbers", () => {
    const errors = validateInput({ phone: "+39 0543 123456" }, [
      { field: "phone", type: "phone" },
    ]);
    expect(errors).toHaveLength(0);
  });

  it("rejects numbers outside range", () => {
    const errors = validateInput({ price: -5 }, [
      { field: "price", type: "number", min: 0 },
    ]);
    expect(errors).toHaveLength(1);
  });
});

// ─── CSRF tokens ───────────────────────────────────────────────

describe("CSRF token validation", () => {
  it("rejects tokens that differ by one character", () => {
    const token = generateCSRFToken();
    const tampered = token.slice(0, -1) + (token.endsWith("0") ? "1" : "0");
    expect(validateCSRFToken(token, tampered)).toBe(false);
  });
});

// ─── IVA rates ─────────────────────────────────────────────────

describe("IVA rates", () => {
  it("standard rate is 22%", () => {
    expect(IVA_RATES.standard).toBe(22);
  });

  it("formatEuro formats Italian-style currency", () => {
    const result = formatEuro(1234.5);
    // Locale formatting may vary; verify key parts are present
    expect(result).toContain("€");
    expect(result).toMatch(/1\.?234/);
  });
});

// ─── ensureSameOrigin ──────────────────────────────────────────

describe("ensureSameOrigin", () => {
  function fakeRequest(url: string, headers: Record<string, string> = {}): Request {
    return new Request(url, { headers });
  }

  it("allows requests with no origin or referer headers", () => {
    const result = ensureSameOrigin(fakeRequest("https://example.com/api/test"));
    expect(result).toBeNull();
  });

  it("allows same-origin requests", () => {
    const result = ensureSameOrigin(
      fakeRequest("https://example.com/api/test", { origin: "https://example.com" })
    );
    expect(result).toBeNull();
  });

  it("rejects cross-origin requests", async () => {
    const result = ensureSameOrigin(
      fakeRequest("https://example.com/api/test", { origin: "https://evil.com" })
    );
    expect(result).not.toBeNull();
    const body = await result!.json();
    expect(body.statusCode).toBe(403);
  });

  it("does not throw on malformed referer", () => {
    const result = ensureSameOrigin(
      fakeRequest("https://example.com/api/test", { referer: "not-a-url" })
    );
    // Should return a 403 error, not throw
    expect(result).not.toBeNull();
  });
});

// ─── apiError / apiJson ────────────────────────────────────────

describe("apiError", () => {
  it("returns correct status code and body", async () => {
    const response = apiError("Non trovato", 404, "not_found");
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("not_found");
    expect(body.message).toBe("Non trovato");
  });
});

describe("apiJson", () => {
  it("returns JSON body", async () => {
    const response = apiJson({ ok: true });
    const body = await response.json();
    expect(body.ok).toBe(true);
  });
});