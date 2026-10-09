import { describe, expect, it } from "vitest";
import { estimateCompletion } from "./scheduling";

describe("estimateCompletion", () => {
  it("distribuye los envíos únicamente entre días permitidos", () => {
    expect(
      estimateCompletion({
        recipients: 45,
        dailyLimit: 20,
        startDate: "2026-10-09",
        allowedDays: [1, 2, 3, 4, 5],
      }),
    ).toBe("2026-10-13");
  });
  it("rechaza calendarios sin días", () => {
    expect(
      estimateCompletion({
        recipients: 10,
        dailyLimit: 10,
        startDate: "2026-10-09",
        allowedDays: [],
      }),
    ).toBeNull();
  });
});
