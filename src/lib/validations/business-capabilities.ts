import { z } from "zod";

export const updateBusinessCapabilitiesSchema = z.object({
  websitePublished: z.boolean().optional(),
  queueEnabled: z.boolean().optional(),
  avgServiceMinutes: z.number().int().min(5).max(180).optional(),
  loyaltyEnabled: z.boolean().optional(),
  onlineBookingEnabled: z.boolean().optional(),
  crossPromoEnabled: z.boolean().optional(),
  whatsappAiEnabled: z.boolean().optional(),
  catalogEnabled: z.boolean().optional(),
  depositsEnabled: z.boolean().optional(),
  depositPercentage: z.number().int().min(5).max(100).optional(),
});

export type UpdateBusinessCapabilitiesInput = z.infer<typeof updateBusinessCapabilitiesSchema>;
