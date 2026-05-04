import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizePhoneNumber(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return "";

  const normalized = trimmed.replace(/[^\d+]/g, "");
  if (normalized.startsWith("+")) return normalized;
  if (normalized.startsWith("00")) return `+${normalized.slice(2)}`;
  if (normalized.startsWith("3") && normalized.length >= 9) return `+39${normalized}`;
  return normalized;
}

export function isValidPhoneNumber(phone: string): boolean {
  return /^\+?[1-9]\d{7,14}$/.test(normalizePhoneNumber(phone));
}
