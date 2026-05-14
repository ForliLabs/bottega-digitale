// Zod validation schemas for Products API routes
import { z } from "zod";

// ─── Schemas ────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Nome prodotto obbligatorio")
    .max(200, "Nome prodotto troppo lungo"),
  description: z
    .string()
    .max(2000, "Descrizione troppo lunga")
    .default(""),
  priceEuro: z
    .number()
    .min(0, "Il prezzo non può essere negativo"),
  categoryId: z.string().nullable().optional(),
  imageUrl: z.string().url("URL immagine non valido").nullable().optional(),
  stock: z
    .number()
    .int()
    .min(-1, "Valore scorte non valido")
    .default(-1),
  isAvailable: z.boolean().default(true),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, "Nome prodotto obbligatorio")
    .max(200, "Nome prodotto troppo lungo")
    .optional(),
  description: z
    .string()
    .max(2000, "Descrizione troppo lunga")
    .optional(),
  priceEuro: z
    .number()
    .min(0, "Il prezzo non può essere negativo")
    .optional(),
  categoryId: z.string().nullable().optional(),
  imageUrl: z.string().url("URL immagine non valido").nullable().optional(),
  stock: z
    .number()
    .int()
    .min(-1, "Valore scorte non valido")
    .optional(),
  isAvailable: z.boolean().optional(),
});

// ─── Types ──────────────────────────────────────────────────────

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
