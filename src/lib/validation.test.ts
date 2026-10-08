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
      }).success,
    ).toBe(true));
});
