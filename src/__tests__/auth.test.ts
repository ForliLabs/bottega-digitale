// Unit tests for auth module
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, generateToken } from "@/lib/auth";

describe("Auth — Password Hashing", () => {
  it("should hash a password", async () => {
    const hash = await hashPassword("testPassword123");
    expect(hash).toBeTruthy();
    expect(hash.length).toBe(64); // SHA-256 hex
  });

  it("should produce different hashes for different passwords", async () => {
    const hash1 = await hashPassword("password1");
    const hash2 = await hashPassword("password2");
    expect(hash1).not.toBe(hash2);
  });

  it("should produce the same hash for the same password", async () => {
    const hash1 = await hashPassword("samePassword");
    const hash2 = await hashPassword("samePassword");
    expect(hash1).toBe(hash2);
  });

  it("should verify correct password", async () => {
    const hash = await hashPassword("myPassword");
    const valid = await verifyPassword("myPassword", hash);
    expect(valid).toBe(true);
  });

  it("should reject incorrect password", async () => {
    const hash = await hashPassword("correctPassword");
    const valid = await verifyPassword("wrongPassword", hash);
    expect(valid).toBe(false);
  });
});

describe("Auth — Token Generation", () => {
  it("should generate a non-empty token", () => {
    const token = generateToken();
    expect(token).toBeTruthy();
    expect(token.length).toBe(64); // 32 bytes * 2 hex chars
  });

  it("should generate unique tokens", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(generateToken());
    }
    expect(tokens.size).toBe(100);
  });

  it("should only contain hex characters", () => {
    const token = generateToken();
    expect(/^[a-f0-9]+$/.test(token)).toBe(true);
  });
});
