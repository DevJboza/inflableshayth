import { describe, it, expect } from "vitest";
import { institutionSchema, campaignSchema } from "./validation";
describe("validación", () => {
  it("rechaza correo inválido", () =>
    expect(
      institutionSchema.safeParse({
        name: "Escuela",
        email: "mal",
        type: "Escuela",
        status: "Sin contactar",
      }).success,
    ).toBe(false));
  it("acepta campaña válida", () =>
    expect(
      campaignSchema.safeParse({
        name: "Promoción",
        subject: "Hola",
        html: "<p>Contenido válido</p>",
        idempotencyKey: "d5c81067-8187-4a87-9952-adaff85ac400",
        templateId: "d5c81067-8187-4a87-9952-adaff85ac401",
        audienceMode: "all",
        scheduledAt: "2026-10-12T14:00:00.000Z",
        dailyLimit: 20,
        allowedDays: [1, 2, 3, 4, 5],
        sendStart: "08:00",
        sendEnd: "16:00",
        catalogPath: "/catalogo-navideno.pdf",
      }).success,
    ).toBe(true));
});
