import { describe, expect, it } from "vitest";
import { reservationErrorMessage, categoryLabel } from "@/lib/constants";

describe("reservationErrorMessage", () => {
  it("maps known error codes to Spanish, actionable copy", () => {
    expect(reservationErrorMessage("EXPERIENCE_SOLD_OUT")).toMatch(/agotó/);
    expect(reservationErrorMessage("WEEKLY_PASS_ALREADY_USED")).toMatch(/pase/);
    expect(reservationErrorMessage("CANCELLATION_WINDOW_CLOSED")).toMatch(/cancelación/);
  });

  it("falls back to a generic message for unknown codes", () => {
    expect(reservationErrorMessage("SOMETHING_WEIRD")).toBe("Ocurrió un error inesperado. Intenta de nuevo.");
  });
});

describe("categoryLabel", () => {
  it("labels known categories in Spanish", () => {
    expect(categoryLabel("food_coffee")).toBe("Food & Coffee");
    expect(categoryLabel("movimiento")).toBe("Movimiento");
  });

  it("falls back gracefully for unknown/null categories", () => {
    expect(categoryLabel(null)).toBe("Experiencia");
    expect(categoryLabel("unknown")).toBe("Experiencia");
  });
});
