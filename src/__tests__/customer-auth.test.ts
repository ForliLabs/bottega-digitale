// Unit tests for customer auth module
import { describe, it, expect } from "vitest";
import { generateOTP, generateCustomerToken } from "@/lib/customer-auth";

describe("Customer Auth — OTP Generation", () => {
  it("should generate a 6-digit code", () => {
    const otp = generateOTP();
    expect(otp.length).toBe(6);
  });

  it("should generate only digits", () => {
    const otp = generateOTP();
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  it("should generate different OTPs", () => {
    const otps = new Set<string>();
    for (let i = 0; i < 50; i++) {
      otps.add(generateOTP());
    }
    expect(otps.size).toBeGreaterThan(40);
  });

  it("should generate OTPs >= 100000", () => {
    for (let i = 0; i < 20; i++) {
      const otp = parseInt(generateOTP(), 10);
      expect(otp).toBeGreaterThanOrEqual(100000);
      expect(otp).toBeLessThan(1000000);
    }
  });
});

describe("Customer Auth — Token Generation", () => {
  it("should generate a 64-character hex token", () => {
    const token = generateCustomerToken();
    expect(token.length).toBe(64);
    expect(/^[a-f0-9]+$/.test(token)).toBe(true);
  });

  it("should generate unique tokens", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 50; i++) {
      tokens.add(generateCustomerToken());
    }
    expect(tokens.size).toBe(50);
  });
});
