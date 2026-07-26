import { describe, expect, it } from "vitest";
import { weekStartKey, nextMondayLabel, hoursUntil, isPast } from "@/lib/dates";

describe("weekStartKey", () => {
  it("returns the Monday of the current week for a mid-week date", () => {
    // Wednesday July 22, 2026 (America/Monterrey, UTC-6 in summer... no DST in MX since 2022, so UTC-6 year-round)
    const wednesday = new Date("2026-07-22T18:00:00Z");
    expect(weekStartKey(wednesday)).toBe("2026-07-20");
  });

  it("returns the same Monday for a date that is already Monday", () => {
    const monday = new Date("2026-07-20T06:00:00Z");
    expect(weekStartKey(monday)).toBe("2026-07-20");
  });

  it("rolls over to the next Monday just after Sunday midnight America/Monterrey", () => {
    // Monday 2026-07-27 00:05 America/Monterrey == 2026-07-27 06:05 UTC
    const justAfterMidnight = new Date("2026-07-27T06:05:00Z");
    expect(weekStartKey(justAfterMidnight)).toBe("2026-07-27");
  });
});

describe("nextMondayLabel", () => {
  it("labels the Monday after the current week", () => {
    const wednesday = new Date("2026-07-22T18:00:00Z");
    expect(nextMondayLabel(wednesday)).toBe("27 de julio");
  });
});

describe("hoursUntil / isPast", () => {
  it("computes positive hours for a future date and negative for a past one", () => {
    const future = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
    const past = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();

    expect(hoursUntil(future)).toBeGreaterThan(4.9);
    expect(hoursUntil(past)).toBeLessThan(0);
    expect(isPast(past)).toBe(true);
    expect(isPast(future)).toBe(false);
  });
});
