// Unit tests for security module
import { describe, it, expect } from "vitest";
import { sanitizeHtml, generateCSRFToken, validateCSRFToken, validateInput } from "@/lib/security";

describe("Security — HTML Sanitization", () => {
  it("should escape HTML tags", () => {
    const result = sanitizeHtml('<script>alert("xss")</script>Hello');
    expect(result).not.toContain("<script>");
    expect(result).toContain("Hello");
    expect(result).toContain("&lt;script&gt;");
  });

  it("should handle empty strings", () => {
    expect(sanitizeHtml("")).toBe("");
  });

  it("should preserve normal text", () => {
    expect(sanitizeHtml("Barbiere Marco")).toBe("Barbiere Marco");
  });

  it("should handle Italian characters", () => {
    expect(sanitizeHtml("Caffè Forlì")).toBe("Caffè Forlì");
  });

  it("should escape quotes", () => {
    const result = sanitizeHtml('He said "hello"');
    expect(result).toContain("&quot;");
  });
});

describe("Security — CSRF Token", () => {
  it("should generate a non-empty token", () => {
    const token = generateCSRFToken();
    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(0);
  });

  it("should generate unique tokens", () => {
    const token1 = generateCSRFToken();
    const token2 = generateCSRFToken();
    expect(token1).not.toBe(token2);
  });

  it("should validate matching tokens", () => {
    const token = generateCSRFToken();
    expect(validateCSRFToken(token, token)).toBe(true);
  });

  it("should reject mismatched tokens", () => {
    const token1 = generateCSRFToken();
    const token2 = generateCSRFToken();
    expect(validateCSRFToken(token1, token2)).toBe(false);
  });

  it("should reject null tokens", () => {
    expect(validateCSRFToken(null, "token")).toBe(false);
    expect(validateCSRFToken("token", null)).toBe(false);
  });
});

describe("Security — Input Validation", () => {
  it("should validate required fields", () => {
    const errors = validateInput({}, [
      { field: "name", type: "string", required: true },
    ]);
    expect(errors.length).toBe(1);
    expect(errors[0].field).toBe("name");
  });

  it("should pass valid email", () => {
    const errors = validateInput({ email: "test@example.com" }, [
      { field: "email", type: "email" },
    ]);
    expect(errors.length).toBe(0);
  });

  it("should reject invalid email", () => {
    const errors = validateInput({ email: "not-an-email" }, [
      { field: "email", type: "email" },
    ]);
    expect(errors.length).toBe(1);
  });

  it("should validate number ranges", () => {
    const errors = validateInput({ price: 5 }, [
      { field: "price", type: "number", min: 10 },
    ]);
    expect(errors.length).toBe(1);
  });

  it("should validate string length", () => {
    const errors = validateInput({ name: "ab" }, [
      { field: "name", type: "string", minLength: 3 },
    ]);
    expect(errors.length).toBe(1);
  });
});
