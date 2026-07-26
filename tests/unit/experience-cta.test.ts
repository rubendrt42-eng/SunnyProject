import { describe, expect, it } from "vitest";
import { determineCta } from "@/lib/experience-cta";
import type { ExperienceWithBusiness } from "@/lib/queries";
import type { Business, Experience } from "@/lib/database.types";

function makeBusiness(): Business {
  return {
    id: "biz-1",
    name: "Studio Norte",
    slug: "studio-norte",
    description: null,
    category: "movimiento",
    logo_url: null,
    instagram_url: null,
    maps_url: null,
    contact_name: null,
    contact_email: null,
    contact_phone: null,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function makeExperience(overrides: Partial<Experience> = {}, reserved_count = 0): ExperienceWithBusiness {
  const now = Date.now();
  const experience: Experience = {
    id: "exp-1",
    business_id: "biz-1",
    title: "Pilates Intro",
    slug: "pilates-intro",
    short_description: null,
    description: null,
    category: "movimiento",
    image_url: null,
    location_name: "San Pedro",
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
  return { ...experience, business: makeBusiness(), reserved_count };
}

const baseParams = {
  isAuthenticated: true,
  isProfileComplete: true,
  hasReservationForThisExperience: false,
  hasActivePassElsewhere: false,
};

describe("determineCta", () => {
  it("prioritizes cancelled over everything else", () => {
    const experience = makeExperience({ status: "cancelled" });
    expect(determineCta({ experience, ...baseParams, isAuthenticated: false }).type).toBe("cancelled");
  });

  it("prioritizes sold_out over authentication state", () => {
    const experience = makeExperience({ capacity: 2 }, 2);
    expect(determineCta({ experience, ...baseParams, isAuthenticated: false }).type).toBe("sold_out");
  });

  it("asks to log in when unauthenticated and the experience is otherwise claimable", () => {
    const experience = makeExperience();
    expect(determineCta({ experience, ...baseParams, isAuthenticated: false }).type).toBe("login");
  });

  it("flags already_reserved when the user already holds a reservation for this experience", () => {
    const experience = makeExperience();
    expect(determineCta({ experience, ...baseParams, hasReservationForThisExperience: true }).type).toBe(
      "already_reserved",
    );
  });

  it("flags pass_used_elsewhere when the user's weekly pass is spent on another experience", () => {
    const experience = makeExperience();
    expect(determineCta({ experience, ...baseParams, hasActivePassElsewhere: true }).type).toBe("pass_used_elsewhere");
  });

  it("asks to complete the profile before claiming", () => {
    const experience = makeExperience();
    expect(determineCta({ experience, ...baseParams, isProfileComplete: false }).type).toBe("profile_incomplete");
  });

  it("is claimable when authenticated, profile complete, and no conflicts", () => {
    const experience = makeExperience();
    expect(determineCta({ experience, ...baseParams }).type).toBe("claimable");
  });

  it("closes claiming once claim_closes_at has passed even if capacity remains", () => {
    const experience = makeExperience({ claim_closes_at: new Date(Date.now() - 1000).toISOString() });
    expect(determineCta({ experience, ...baseParams }).type).toBe("closed");
  });
});
