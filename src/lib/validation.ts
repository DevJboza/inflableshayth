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
  contactPermission: z
    .enum(["Pendiente", "Autorizado", "No autorizado"])
    .default("Pendiente"),
  notes: z.string().max(4000).optional().default(""),
});
export const campaignSchema = z.object({
  name: z.string().min(2).max(160),
  subject: z.string().min(2).max(200),
  html: z.string().min(10).max(200000),
  idempotencyKey: z.uuid(),
  templateId: z.uuid(),
  audienceMode: z.enum(["all", "province", "canton", "custom"]),
  province: z.string().max(60).optional().default(""),
  canton: z.string().max(80).optional().default(""),
  institutionIds: z.array(z.uuid()).max(5000).optional().default([]),
  scheduledAt: z.iso.datetime(),
  dailyLimit: z.coerce.number().int().min(1).max(500),
  allowedDays: z.array(z.number().int().min(1).max(7)).min(1),
  sendStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  sendEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  catalogPath: z.literal("/catalogo-navideno.pdf"),
});
