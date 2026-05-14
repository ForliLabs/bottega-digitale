// Zod validation schemas for Bookings API routes
import { z } from "zod";

// ─── Constants ──────────────────────────────────────────────────

export const BOOKING_STATUSES = [
  "Confermata",
  "In attesa",
  "Completata",
  "Cancellata",
] as const;

export const BOOKING_CHANNELS = [
  "Sito web",
  "WhatsApp",
  "Instagram",
  "Telefono",
  "Online",
] as const;

// ─── Schemas ────────────────────────────────────────────────────

export const createBookingSchema = z.object({
  customerName: z
    .string()
    .min(1, "Nome cliente obbligatorio")
    .max(200, "Nome cliente troppo lungo"),
  service: z
    .string()
    .min(1, "Servizio obbligatorio")
    .max(200, "Nome servizio troppo lungo"),
  startsAt: z
    .string()
    .min(1, "Data/ora obbligatoria")
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "Data/ora non valida",
    }),
  durationMinutes: z
    .number()
    .int("La durata deve essere un numero intero")
    .min(5, "Durata minima 5 minuti")
    .max(480, "Durata massima 8 ore")
    .default(30),
  status: z.enum(BOOKING_STATUSES).default("Confermata"),
  channel: z.enum(BOOKING_CHANNELS).default("Sito web"),
  priceEuro: z
    .number()
    .min(0, "Il prezzo non può essere negativo")
    .default(0),
  notes: z
    .string()
    .max(1000, "Note troppo lunghe")
    .nullable()
    .optional(),
  customerId: z.string().nullable().optional(),
});

export const updateBookingSchema = z.object({
  customerName: z
    .string()
    .min(1, "Nome cliente obbligatorio")
    .max(200, "Nome cliente troppo lungo")
    .optional(),
  service: z
    .string()
    .min(1, "Servizio obbligatorio")
    .max(200, "Nome servizio troppo lungo")
    .optional(),
  startsAt: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "Data/ora non valida",
    })
    .optional(),
  durationMinutes: z
    .number()
    .int("La durata deve essere un numero intero")
    .min(5, "Durata minima 5 minuti")
    .max(480, "Durata massima 8 ore")
    .optional(),
  status: z.enum(BOOKING_STATUSES).optional(),
  channel: z.enum(BOOKING_CHANNELS).optional(),
  priceEuro: z
    .number()
    .min(0, "Il prezzo non può essere negativo")
    .optional(),
  notes: z
    .string()
    .max(1000, "Note troppo lunghe")
    .nullable()
    .optional(),
  customerId: z.string().nullable().optional(),
});

export const bookingIdSchema = z.object({
  id: z.string().min(1, "ID prenotazione mancante"),
});

// ─── Types ──────────────────────────────────────────────────────

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
