// Zod validation schemas for Media API routes
import { z } from "zod";

// ─── Constants ──────────────────────────────────────────────────

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MEDIA_FOLDERS = [
  "general",
  "products",
  "social",
  "logo",
  "hero",
] as const;

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_ALT_LENGTH = 200;

// ─── Schemas ────────────────────────────────────────────────────

export const mediaFolderSchema = z.enum(MEDIA_FOLDERS);

export const mediaUploadSchema = z.object({
  folder: mediaFolderSchema.default("general"),
  alt: z
    .string()
    .max(MAX_ALT_LENGTH, `Alt text deve essere al massimo ${MAX_ALT_LENGTH} caratteri`)
    .optional(),
});

export const mediaFileSchema = z.object({
  name: z.string().min(1, "Nome file obbligatorio"),
  size: z
    .number()
    .min(1, "File vuoto")
    .max(MAX_FILE_SIZE_BYTES, "File troppo grande (max 5MB)"),
  type: z
    .string()
    .refine(
      (val): val is (typeof ALLOWED_MIME_TYPES)[number] =>
        (ALLOWED_MIME_TYPES as readonly string[]).includes(val),
      { message: "Tipo file non supportato. Usa JPEG, PNG, WebP o GIF." },
    ),
});

export const mediaDeleteSchema = z.object({
  id: z.string().min(1, "ID file mancante"),
});

export const mediaLibraryQuerySchema = z.object({
  folder: mediaFolderSchema.optional(),
});

// ─── Types ──────────────────────────────────────────────────────

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;
export type MediaFileInput = z.infer<typeof mediaFileSchema>;
export type MediaDeleteInput = z.infer<typeof mediaDeleteSchema>;
export type MediaLibraryQuery = z.infer<typeof mediaLibraryQuerySchema>;
