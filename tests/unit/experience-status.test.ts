import { describe, expect, it } from "vitest";
import { computeExperienceState, spotsLeft } from "@/lib/experience-status";
import type { Experience } from "@/lib/database.types";

function makeExperience(overrides: Partial<Experience> = {}): Experience {
  const now = Date.now();
  return {
    id: "exp-1",
    business_id: "biz-1",
    title: "Demo",
    slug: "demo",
    short_description: null,
    description: null,
    category: "movimiento",
    image_url: null,
    location_name: "Monterrey",
    address: null,
    maps_url: null,
    starts_at: new Date(now + 1000 * 60 * 60 * 24).toISOString(),
    ends_at: new Date(now + 1000 * 60 * 60 * 25).toISOString(),
    claim_opens_at: new Date(now - 1000 * 60 * 60).toISOString(),
    claim_closes_at: new Date(now + 1000 * 60 * 60 * 23).toISOString(),
    capacity: 10,
    status: "published",
    featured: false,
    what_is_included: [],
    requirements: [],
    restrictions: [],
    instructions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("computeExperienceState", () => {
  it("returns cancelled when the experience was cancelled, regardless of capacity", () => {
    const exp = makeExperience({ status: "cancelled" });
    expect(computeExperienceState(exp, 0)).toBe("cancelled");
  });

  it("returns completed once ends_at is in the past", () => {
    const exp = makeExperience({ ends_at: new Date(Date.now() - 1000).toISOString() });
    expect(computeExperienceState(exp, 2)).toBe("completed");
  });

  it("returns upcoming before claim_opens_at", () => {
    const exp = makeExperience({ claim_opens_at: new Date(Date.now() + 1000 * 60 * 60).toISOString() });
    expect(computeExperienceState(exp, 0)).toBe("upcoming");
  });

  it("returns sold_out when reserved count reaches capacity", () => {
    const exp = makeExperience({ capacity: 5 });
    expect(computeExperienceState(exp, 5)).toBe("sold_out");
  });

  it("returns low when spots left are at or below the threshold", () => {
    const exp = makeExperience({ capacity: 10 });
    expect(computeExperienceState(exp, 8)).toBe("low"); // 2 left
  });

  it("returns available when plenty of spots remain", () => {
    const exp = makeExperience({ capacity: 10 });
    expect(computeExperienceState(exp, 1)).toBe("available");
  });
});

describe("spotsLeft", () => {
  it("never goes negative", () => {
    const exp = makeExperience({ capacity: 5 });
    expect(spotsLeft(exp, 8)).toBe(0);
  });

  it("computes capacity minus reserved", () => {
    const exp = makeExperience({ capacity: 10 });
    expect(spotsLeft(exp, 3)).toBe(7);
  });
});
