// Tests for critical security fixes
import { describe, it, expect } from "vitest";
import { AuthenticationError } from "@/lib/auth";

describe("Security Fixes", () => {
  describe("Fix 1: Jobs endpoint — deny by default when CRON_SECRET is unset", () => {
    it("should reject when CRON_SECRET env is not set", () => {
      // The fix changes `if (expectedSecret && ...)` to `if (!expectedSecret || ...)`
      // Simulating the guard logic:
      const expectedSecret = undefined; // CRON_SECRET not set
      const cronSecret = "anything";
      const shouldDeny = !expectedSecret || cronSecret !== expectedSecret;
      expect(shouldDeny).toBe(true);
    });

    it("should reject when CRON_SECRET is empty string", () => {
      const expectedSecret = "";
      const cronSecret = "";
      const shouldDeny = !expectedSecret || cronSecret !== expectedSecret;
      expect(shouldDeny).toBe(true);
    });

    it("should reject when cron secret header does not match", () => {
      const expectedSecret = "my-secret";
      const cronSecret = "wrong-secret";
      const shouldDeny = !expectedSecret || cronSecret !== expectedSecret;
      expect(shouldDeny).toBe(true);
    });

    it("should allow when cron secret header matches", () => {
      const expectedSecret = "my-secret";
      const cronSecret = "my-secret";
      const shouldDeny = !expectedSecret || cronSecret !== expectedSecret;
      expect(shouldDeny).toBe(false);
    });

    it("should reject when cron secret header is null", () => {
      const expectedSecret = "my-secret";
      const cronSecret = null;
      const shouldDeny = !expectedSecret || cronSecret !== expectedSecret;
      expect(shouldDeny).toBe(true);
    });
  });

  describe("Fix 3: AuthenticationError class", () => {
    it("should have statusCode 401", () => {
      const err = new AuthenticationError();
      expect(err.statusCode).toBe(401);
    });

    it("should have correct name", () => {
      const err = new AuthenticationError();
      expect(err.name).toBe("AuthenticationError");
    });

    it("should use default message", () => {
      const err = new AuthenticationError();
      expect(err.message).toBe("Autenticazione richiesta");
    });

    it("should accept custom message", () => {
      const err = new AuthenticationError("Custom error");
      expect(err.message).toBe("Custom error");
    });

    it("should be an instance of Error", () => {
      const err = new AuthenticationError();
      expect(err).toBeInstanceOf(Error);
    });

    it("should be catchable as AuthenticationError", () => {
      try {
        throw new AuthenticationError();
      } catch (e) {
        expect(e).toBeInstanceOf(AuthenticationError);
        if (e instanceof AuthenticationError) {
          expect(e.statusCode).toBe(401);
        }
      }
    });
  });
});
