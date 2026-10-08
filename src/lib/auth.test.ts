import { describe, it, expect } from "vitest";
import { safeEqual } from "./auth";
describe("safeEqual", () => {
  it("compara secretos", () => {
    expect(safeEqual("correcto", "correcto")).toBe(true);
    expect(safeEqual("correcto", "incorrecto")).toBe(false);
  });
});
