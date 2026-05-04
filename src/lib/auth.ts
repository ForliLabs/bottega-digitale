/**
 * @module auth
 * Authentication and session management for business owners.
 *
 * Uses cookie-based sessions with 30-day expiry. Passwords are hashed with
 * scrypt using a per-password random salt. In demo mode (no authenticated user),
 * page-level helpers can still fall back to the first seeded business.
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
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

function scrypt(
  password: string,
  salt: string,
  keyLength: number,
  options: { N: number; r: number; p: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });
}
const PASSWORD_VERSION = "scrypt";
const PASSWORD_COST = 16384;
const PASSWORD_BLOCK_SIZE = 8;
const PASSWORD_PARALLELIZATION = 1;
const PASSWORD_KEY_LENGTH = 64;

/**
 * Hash a password using scrypt with a per-password random salt.
 * @param password - The plaintext password to hash.
 * @returns Encoded scrypt hash.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, PASSWORD_KEY_LENGTH, {
    N: PASSWORD_COST,
    r: PASSWORD_BLOCK_SIZE,
    p: PASSWORD_PARALLELIZATION,
  }) as Buffer;

  return [PASSWORD_VERSION, PASSWORD_COST, salt, derivedKey.toString("hex")].join("$");
}

/**
 * Verify a password against a stored hash.
 * @param password - The plaintext password to verify.
 * @param hash - The stored password hash.
 * @returns `true` if the password matches.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [version, costRaw, salt, storedHash] = hash.split("$");
  if (version !== PASSWORD_VERSION || !salt || !storedHash) {
    return false;
  }

  const derivedKey = await scrypt(password, salt, storedHash.length / 2, {
    N: Number(costRaw) || PASSWORD_COST,
    r: PASSWORD_BLOCK_SIZE,
    p: PASSWORD_PARALLELIZATION,
  }) as Buffer;
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (derivedKey.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedBuffer);
}

/** Generate a cryptographically random 64-character hex token. */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
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

/**
 * Get the current business context for authenticated routes only.
 * Returns `null` when the requester is not authenticated.
 */
export async function requireBusinessContext(): Promise<Business | null> {
  const auth = await getAuthContext();
  return auth?.business ?? null;
}
