/**
 * @module auth
 * Authentication and session management for business owners.
 *
 * Uses cookie-based sessions with 30-day expiry. Passwords are hashed with
 * SHA-256 via the Web Crypto API (no external dependencies). In demo mode
 * (no authenticated user), falls back to the first seeded business.
 *
 * @example
 * ```ts
 * const auth = await getAuthContext();
 * if (auth) {
 *   console.log(auth.user.email, auth.business.name);
 * }
 * ```
 */
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import type { Business, User } from "@/generated/prisma/client";

/**
 * Hash a password using SHA-256 with a fixed salt.
 * @param password - The plaintext password to hash.
 * @returns Hex-encoded SHA-256 hash.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "bottega-salt-2025");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Verify a password against a stored hash.
 * @param password - The plaintext password to verify.
 * @param hash - The stored SHA-256 hex hash.
 * @returns `true` if the password matches.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

/** Generate a cryptographically random 64-character hex token. */
export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Create a new session for a user with 30-day expiry.
 * @param userId - The user ID to create a session for.
 * @returns The session token.
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

/** Set the `session_token` HTTP-only cookie. Secure in production, SameSite=Lax. */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
}

/** Delete the session cookie (logout). */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
}

/** Read the session token from the request cookies. */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("session_token")?.value;
}

/** Authenticated user context including their primary business. */
export interface AuthContext {
  user: User;
  business: Business;
}

/**
 * Resolve the current user and business from the session cookie.
 * Returns `null` if the session is missing, expired, or the user has no business membership.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.userId },
    include: { business: true },
  });

  if (!membership) return null;

  return {
    user: session.user,
    business: membership.business,
  };
}

/**
 * Get the current business context, falling back to the first seeded business in demo mode.
 * Useful for routes that should work without authentication during development.
 */
export async function getBusinessContext(): Promise<Business | null> {
  const auth = await getAuthContext();
  if (auth) return auth.business;

  // Fallback to first business (demo mode)
  return prisma.business.findFirst();
}
