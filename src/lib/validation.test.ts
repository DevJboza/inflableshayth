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
      }).success,
    ).toBe(true));
});
