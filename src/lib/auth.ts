import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import type { Business, User } from "@/generated/prisma/client";

// Simple password hashing using Web Crypto API (no external deps)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "bottega-salt-2025");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

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

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("session_token")?.value;
}

export interface AuthContext {
  user: User;
  business: Business;
}

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

// For demo mode: returns a default demo business context when no auth is configured
export async function getBusinessContext(): Promise<Business | null> {
  const auth = await getAuthContext();
  if (auth) return auth.business;

  // Fallback to first business (demo mode)
  return prisma.business.findFirst();
}
