// Zod validation schemas for Orders API routes
import { z } from "zod";

// ─── Constants ──────────────────────────────────────────────────

export const ORDER_STATUSES = [
  "ricevuto",
  "in_preparazione",
  "pronto",
  "consegnato",
  "cancellato",
] as const;

export const ORDER_CHANNELS = ["online", "whatsapp"] as const;

// ─── Schemas ────────────────────────────────────────────────────

export const orderItemSchema = z.object({
  productId: z.string().min(1, "ID prodotto obbligatorio"),
  quantity: z
    .number()
    .int()
    .min(1, "Quantità minima 1")
    .default(1),
});

export const createOrderSchema = z.object({
  customerName: z
    .string()
    .min(1, "Nome cliente obbligatorio")
    .max(200, "Nome cliente troppo lungo"),
  customerPhone: z
    .string()
    .max(30, "Numero telefono troppo lungo")
    .nullable()
    .optional(),
  channel: z.enum(ORDER_CHANNELS).default("online"),
  items: z
    .array(orderItemSchema)
    .min(1, "Almeno un articolo richiesto"),
  notes: z
    .string()
    .max(1000, "Note troppo lunghe")
    .nullable()
    .optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

// ─── Types ──────────────────────────────────────────────────────

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
