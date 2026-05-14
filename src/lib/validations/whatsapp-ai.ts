// Zod validation schemas for WhatsApp AI API routes
import { z } from "zod";

// ─── Schemas ────────────────────────────────────────────────────

const phoneRegex = /^\+?[\d\s-]{8,15}$/;

export const whatsappAiMessageSchema = z.object({
  phone: z
    .string()
    .min(1, "Numero di telefono obbligatorio")
    .regex(phoneRegex, "Numero di telefono non valido"),
  message: z
    .string()
    .min(1, "Messaggio obbligatorio")
    .max(4096, "Messaggio troppo lungo (max 4096 caratteri)"),
});

export const whatsappAiPersonalitySchema = z.enum(["amichevole", "formale"]);

const faqLineSchema = z.string().max(500, "FAQ troppo lunga (max 500 caratteri)");

export const whatsappAiConfigSchema = z.object({
  enabled: z.boolean().default(true),
  personality: whatsappAiPersonalitySchema.default("amichevole"),
  faqLines: z
    .array(faqLineSchema)
    .max(50, "Massimo 50 FAQ")
    .default([]),
});

// ─── Types ──────────────────────────────────────────────────────

export type WhatsappAiMessageInput = z.infer<typeof whatsappAiMessageSchema>;
export type WhatsappAiConfigInput = z.infer<typeof whatsappAiConfigSchema>;
