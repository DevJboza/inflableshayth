import { z } from "zod";
export const institutionSchema = z.object({
  name: z.string().trim().min(2).max(180),
  email: z.email().toLowerCase(),
  phone: z.string().max(30).optional().default(""),
  province: z.string().max(60).optional().default(""),
  canton: z.string().max(80).optional().default(""),
  contactName: z.string().max(120).optional().default(""),
  type: z.enum(["Escuela", "Colegio", "Jardín infantil", "Otra"]),
  status: z.enum([
    "Sin contactar",
    "Contactado",
    "Respondió",
    "Interesado",
    "Cotización solicitada",
    "Cliente",
    "No interesado",
    "No contactar",
  ]),
  notes: z.string().max(4000).optional().default(""),
});
export const campaignSchema = z.object({
  name: z.string().min(2).max(160),
  subject: z.string().min(2).max(200),
  html: z.string().min(10).max(200000),
  scheduledAt: z.string().optional(),
  idempotencyKey: z.uuid(),
});
