/**
 * @module security
 * Security hardening utilities: rate limiting, CSRF protection, input validation,
 * output sanitization, security headers, and environment validation.
 *
 * Rate limiting is database-backed (Prisma `RateLimit` model) with configurable
 * per-category windows. CSRF tokens use constant-time comparison to prevent
 * timing attacks.
 *
 * @example
 * ```ts
 * // Check rate limit before processing login
 * const { allowed, remaining } = await checkRateLimit("login", userEmail);
 * if (!allowed) return Response.json({ error: "Troppi tentativi" }, { status: 429 });
 *
 * // Validate input
 * const errors = validateInput(body, [
 *   { field: "email", type: "email", required: true },
 *   { field: "name", type: "string", required: true, minLength: 2 },
 * ]);
 * ```
 */

// Security Hardening Utilities
// Rate limiting, CSRF protection, input validation, and security headers

import { prisma } from "@/lib/prisma";

// ─── Rate Limiting ──────────────────────────────────────────────

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // milliseconds
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min
  register: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  otp: { maxAttempts: 5, windowMs: 10 * 60 * 1000 }, // 5 per 10 min
  api: { maxAttempts: 100, windowMs: 60 * 1000 }, // 100 per minute
  booking: { maxAttempts: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
};

export async function checkRateLimit(
  category: string,
  identifier: string
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const config = RATE_LIMITS[category] || RATE_LIMITS.api;
  const key = `${category}:${identifier}`;
  const now = new Date();

  // Clean up expired entries
  await prisma.rateLimit.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  const existing = await prisma.rateLimit.findFirst({
    where: { key },
  });

  if (!existing) {
    const expiresAt = new Date(now.getTime() + config.windowMs);
    await prisma.rateLimit.create({
      data: { key, attempts: 1, windowStart: now, expiresAt },
    });
    return { allowed: true, remaining: config.maxAttempts - 1, resetAt: expiresAt };
  }

  if (existing.attempts >= config.maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: existing.expiresAt };
  }

  await prisma.rateLimit.update({
    where: { id: existing.id },
    data: { attempts: { increment: 1 } },
  });

  return {
    allowed: true,
    remaining: config.maxAttempts - existing.attempts - 1,
    resetAt: existing.expiresAt,
  };
}

// ─── CSRF Token Generation & Validation ─────────────────────────

export function generateCSRFToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function validateCSRFToken(token: string | null, expected: string | null): boolean {
  if (!token || !expected) return false;
  if (token.length !== expected.length) return false;
  // Constant-time comparison
  let mismatch = 0;
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

// ─── Input Validation (lightweight Zod-like) ────────────────────

export interface ValidationRule {
  field: string;
  type: "string" | "number" | "email" | "phone" | "date";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateInput(
  data: Record<string, unknown>,
  rules: ValidationRule[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const rule of rules) {
    const value = data[rule.field];

    if (rule.required && (value === undefined || value === null || value === "")) {
      errors.push({ field: rule.field, message: `${rule.field} è obbligatorio` });
      continue;
    }

    if (value === undefined || value === null || value === "") continue;

    if (rule.type === "string" && typeof value !== "string") {
      errors.push({ field: rule.field, message: `${rule.field} deve essere testo` });
      continue;
    }

    if (rule.type === "number") {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push({ field: rule.field, message: `${rule.field} deve essere un numero` });
        continue;
      }
      if (rule.min !== undefined && num < rule.min) {
        errors.push({ field: rule.field, message: `${rule.field} deve essere almeno ${rule.min}` });
      }
      if (rule.max !== undefined && num > rule.max) {
        errors.push({ field: rule.field, message: `${rule.field} deve essere al massimo ${rule.max}` });
      }
    }

    if (rule.type === "email" && typeof value === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push({ field: rule.field, message: `${rule.field} non è un'email valida` });
      }
    }

    if (rule.type === "phone" && typeof value === "string") {
      const phoneRegex = /^\+?[\d\s-]{8,15}$/;
      if (!phoneRegex.test(value)) {
        errors.push({ field: rule.field, message: `${rule.field} non è un numero di telefono valido` });
      }
    }

    if (typeof value === "string") {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push({ field: rule.field, message: `${rule.field} deve avere almeno ${rule.minLength} caratteri` });
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push({ field: rule.field, message: `${rule.field} deve avere al massimo ${rule.maxLength} caratteri` });
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push({ field: rule.field, message: `${rule.field} non ha un formato valido` });
      }
    }
  }

  return errors;
}

// ─── Security Headers ───────────────────────────────────────────

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.openai.com https://api.stripe.com https://graph.facebook.com https://mybusiness.googleapis.com;",
};

// ─── Environment Validation ─────────────────────────────────────

interface EnvVar {
  key: string;
  required: boolean;
  description: string;
}

const ENV_SCHEMA: EnvVar[] = [
  { key: "STRIPE_SECRET_KEY", required: false, description: "Stripe API key for billing" },
  { key: "STRIPE_WEBHOOK_SECRET", required: false, description: "Stripe webhook signing secret" },
  { key: "WHATSAPP_TOKEN", required: false, description: "Meta WhatsApp Business API token" },
  { key: "OPENAI_API_KEY", required: false, description: "OpenAI API key for AI features" },
  { key: "GOOGLE_CLIENT_ID", required: false, description: "Google OAuth client ID" },
  { key: "GOOGLE_CLIENT_SECRET", required: false, description: "Google OAuth client secret" },
  { key: "CRON_SECRET", required: false, description: "Secret for cron job endpoints" },
  { key: "VAPID_PUBLIC_KEY", required: false, description: "VAPID public key for push notifications" },
  { key: "VAPID_PRIVATE_KEY", required: false, description: "VAPID private key for push notifications" },
  { key: "RESEND_API_KEY", required: false, description: "Resend API key for transactional email" },
  { key: "MEDIA_STORAGE_ENDPOINT", required: false, description: "S3-compatible media storage endpoint" },
  { key: "MEDIA_STORAGE_KEY", required: false, description: "Media storage access key" },
  { key: "MEDIA_STORAGE_SECRET", required: false, description: "Media storage secret key" },
  { key: "MEDIA_STORAGE_BUCKET", required: false, description: "Media storage bucket name" },
  { key: "WEBHOOK_SIGNING_SECRET", required: false, description: "Webhook HMAC signing secret" },
];

export function validateEnvironment(): { valid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of ENV_SCHEMA) {
    if (!process.env[envVar.key]) {
      if (envVar.required) {
        missing.push(`${envVar.key} — ${envVar.description}`);
      } else {
        warnings.push(`${envVar.key} non configurato — ${envVar.description}`);
      }
    }
  }

  return { valid: missing.length === 0, missing, warnings };
}

// ─── Sanitization ───────────────────────────────────────────────

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function sanitizeForSQL(input: string): string {
  return input.replace(/['";\\]/g, "");
}
