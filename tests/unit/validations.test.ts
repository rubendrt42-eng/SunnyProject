import { describe, expect, it } from "vitest";
import { profileSchema, partnerLeadSchema, experienceSchema, claimReservationSchema } from "@/lib/validations";

describe("profileSchema", () => {
  it("requires the adult confirmation checkbox", () => {
    const result = profileSchema.safeParse({
      full_name: "Ana Torres",
      city: "Monterrey",
      interests: [],
      adult_confirmed: false,
      terms_accepted: true,
    });
    expect(result.success).toBe(false);
  });

  it("requires terms acceptance", () => {
    const result = profileSchema.safeParse({
      full_name: "Ana Torres",
      city: "Monterrey",
      interests: [],
      adult_confirmed: true,
      terms_accepted: false,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a minimal valid profile", () => {
    const result = profileSchema.safeParse({
      full_name: "Ana Torres",
      city: "Monterrey",
      interests: [],
      adult_confirmed: true,
      terms_accepted: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("partnerLeadSchema", () => {
  it("rejects an invalid email", () => {
    const result = partnerLeadSchema.safeParse({
      business_name: "Studio Norte",
      contact_name: "Ana",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a minimal valid lead", () => {
    const result = partnerLeadSchema.safeParse({
      business_name: "Studio Norte",
      contact_name: "Ana",
      email: "ana@studionorte.demo",
    });
    expect(result.success).toBe(true);
  });
});

describe("experienceSchema", () => {
  const base = {
    business_id: "11111111-1111-4111-8111-111111111111",
    title: "Pilates Intro",
    slug: "pilates-intro",
    category: "movimiento" as const,
    starts_at: "2026-08-01T09:00:00.000Z",
    ends_at: "2026-08-01T10:00:00.000Z",
    claim_opens_at: "2026-07-25T00:00:00.000Z",
    claim_closes_at: "2026-08-01T09:00:00.000Z",
    capacity: 10,
  };

  it("rejects ends_at before starts_at", () => {
    const result = experienceSchema.safeParse({ ...base, ends_at: "2026-08-01T08:00:00.000Z" });
    expect(result.success).toBe(false);
  });

  it("rejects claim_closes_at after starts_at", () => {
    const result = experienceSchema.safeParse({ ...base, claim_closes_at: "2026-08-01T10:00:00.000Z" });
    expect(result.success).toBe(false);
  });

  it("accepts a well-formed experience", () => {
    const result = experienceSchema.safeParse(base);
    expect(result.success).toBe(true);
  });
});

describe("claimReservationSchema", () => {
  it("requires the acknowledgement checkbox to be true", () => {
    const result = claimReservationSchema.safeParse({
      experienceId: "11111111-1111-4111-8111-111111111111",
      acknowledgement: false,
    });
    expect(result.success).toBe(false);
  });
});
