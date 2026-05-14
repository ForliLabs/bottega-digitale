// Zod validation schemas for Customers API routes
import { z } from "zod";

// ─── Schemas ────────────────────────────────────────────────────

export const createCustomerSchema = z.object({
  name: z
    .string()
    .min(1, "Nome cliente obbligatorio")
    .max(200, "Nome troppo lungo"),
  phone: z
    .string()
    .min(1, "Numero di telefono obbligatorio")
    .max(30, "Numero di telefono troppo lungo"),
  email: z
    .string()
    .email("Indirizzo email non valido")
    .nullable()
    .optional(),
  birthday: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "Data di nascita non valida",
    })
    .nullable()
    .optional(),
  totalVisits: z
    .number()
    .int()
    .min(0, "Visite non possono essere negative")
    .default(1),
  loyaltyPoints: z
    .number()
    .int()
    .min(0, "Punti fedeltà non possono essere negativi")
    .default(0),
  notifyWhatsApp: z.boolean().default(true),
  notifyPush: z.boolean().default(true),
});

export const updateCustomerSchema = z.object({
  name: z
    .string()
    .min(1, "Nome cliente obbligatorio")
    .max(200, "Nome troppo lungo")
    .optional(),
  phone: z
    .string()
    .min(1, "Numero di telefono obbligatorio")
    .max(30, "Numero di telefono troppo lungo")
    .optional(),
  email: z
    .string()
    .email("Indirizzo email non valido")
    .nullable()
    .optional(),
  birthday: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "Data di nascita non valida",
    })
    .nullable()
    .optional(),
  totalVisits: z
    .number()
    .int()
    .min(0, "Visite non possono essere negative")
    .optional(),
  loyaltyPoints: z
    .number()
    .int()
    .min(0, "Punti fedeltà non possono essere negativi")
    .optional(),
  notifyWhatsApp: z.boolean().optional(),
  notifyPush: z.boolean().optional(),
});

export const customerIdSchema = z.object({
  id: z.string().min(1, "ID cliente mancante"),
});

// ─── Types ──────────────────────────────────────────────────────

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
