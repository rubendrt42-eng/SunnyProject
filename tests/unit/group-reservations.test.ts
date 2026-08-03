import { describe, expect, it } from "vitest";
import { claimReservationSchema, companionSchema } from "@/lib/validations";
import { maxPartySizeOf, partySizeOf, allowsCompanions } from "@/lib/experience-flags";
import { summarizeReservations } from "@/lib/admin-queries";
import type { Experience, Reservation } from "@/lib/database.types";

/**
 * Group / companion coverage for the cases the brief lists as mandatory.
 *
 * IMPORTANT about what these tests do and do not prove.
 *
 * They cover the layers that live in TypeScript: the request schema, the
 * clamping readers, and the occupancy arithmetic the panel and the public
 * site both display. They do NOT prove the database prevents overbooking —
 * that guarantee lives in claim_reservation()'s row lock plus its
 * `sum(party_size) + p_party_size > capacity` check, and it can only be
 * demonstrated against a real Postgres. The concurrency and last-spot cases
 * below therefore assert the *arithmetic* that decision depends on, and
 * SUNNY_COMPANIONS_MIGRATION_PLAN.md carries the SQL test plan that must be
 * run in an isolated environment before this ships.
 */

function experience(overrides: Partial<Experience> = {}): Experience {
  return {
    id: "exp-1",
    business_id: "biz-1",
    title: "Pádel Mix-In",
    slug: "padel-mixin",
    short_description: null,
    description: null,
    category: "movimiento",
    image_url: null,
    location_name: null,
    address: null,
    maps_url: null,
    starts_at: new Date(Date.now() + 86_400_000).toISOString(),
    ends_at: new Date(Date.now() + 90_000_000).toISOString(),
    claim_opens_at: new Date(Date.now() - 3600_000).toISOString(),
    claim_closes_at: new Date(Date.now() + 80_000_000).toISOString(),
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

function reservation(overrides: Partial<Reservation> = {}): Reservation {
  return {
    id: crypto.randomUUID(),
    experience_id: "exp-1",
    user_id: crypto.randomUUID(),
    folio: "SUN-2026-AAAAAA",
    week_start: "2026-07-27",
    status: "confirmed",
    source: null,
    reserved_at: new Date().toISOString(),
    cancelled_at: null,
    checked_in_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

const validClaim = { experienceId: crypto.randomUUID(), acknowledgement: true as const };

describe("claim request schema — party size", () => {
  it("accepts party_size = 1 with no companions", () => {
    const parsed = claimReservationSchema.safeParse({ ...validClaim, partySize: 1, companions: [] });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.partySize).toBe(1);
  });

  it("defaults to party_size = 1 when omitted, preserving the pre-group behaviour", () => {
    const parsed = claimReservationSchema.safeParse(validClaim);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.partySize).toBe(1);
      expect(parsed.data.companions).toEqual([]);
    }
  });

  it("accepts party_size = 2 with exactly one companion", () => {
    const parsed = claimReservationSchema.safeParse({
      ...validClaim,
      partySize: 2,
      companions: [{ full_name: "Ana López" }],
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts party_size = 3 with exactly two companions", () => {
    const parsed = claimReservationSchema.safeParse({
      ...validClaim,
      partySize: 3,
      companions: [{ full_name: "Ana López" }, { full_name: "Luis Ramos" }],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects party_size = 4 — above the MVP ceiling of three", () => {
    const parsed = claimReservationSchema.safeParse({
      ...validClaim,
      partySize: 4,
      companions: [{ full_name: "A B" }, { full_name: "C D" }, { full_name: "E F" }],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects party_size = 0", () => {
    expect(claimReservationSchema.safeParse({ ...validClaim, partySize: 0 }).success).toBe(false);
  });

  it("rejects a mismatch between party_size and the number of companions", () => {
    // 3 places but only one companion named: the missing person would still
    // occupy a spot, so this must not pass.
    const parsed = claimReservationSchema.safeParse({
      ...validClaim,
      partySize: 3,
      companions: [{ full_name: "Ana López" }],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects companions sent without increasing party_size", () => {
    const parsed = claimReservationSchema.safeParse({
      ...validClaim,
      partySize: 1,
      companions: [{ full_name: "Ana López" }],
    });
    expect(parsed.success).toBe(false);
  });

  it("still rejects the claim when the acknowledgement is missing", () => {
    const parsed = claimReservationSchema.safeParse({
      experienceId: crypto.randomUUID(),
      partySize: 2,
      companions: [{ full_name: "Ana López" }],
      acknowledgement: false,
    });
    expect(parsed.success).toBe(false);
  });
});

describe("companion schema — name required, email optional", () => {
  it("requires a full name", () => {
    expect(companionSchema.safeParse({ full_name: "" }).success).toBe(false);
    expect(companionSchema.safeParse({ full_name: "  " }).success).toBe(false);
  });

  it("rejects a one-character name", () => {
    expect(companionSchema.safeParse({ full_name: "A" }).success).toBe(false);
  });

  it("accepts a name with no email at all", () => {
    expect(companionSchema.safeParse({ full_name: "Ana López" }).success).toBe(true);
  });

  it("accepts a name with an empty-string email — a blank optional field must not fail", () => {
    const parsed = companionSchema.safeParse({ full_name: "Ana López", email: "" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.email).toBeUndefined();
  });

  it("accepts a valid email and rejects a malformed one", () => {
    expect(companionSchema.safeParse({ full_name: "Ana López", email: "ana@example.com" }).success).toBe(true);
    expect(companionSchema.safeParse({ full_name: "Ana López", email: "no-arroba" }).success).toBe(false);
  });

  it("trims the stored name", () => {
    const parsed = companionSchema.safeParse({ full_name: "  Ana López  " });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.full_name).toBe("Ana López");
  });
});

describe("max_party_size reader", () => {
  it("defaults to 1 before the migration adds the column", () => {
    expect(maxPartySizeOf(experience())).toBe(1);
    expect(allowsCompanions(experience())).toBe(false);
  });

  it("reads a configured value", () => {
    expect(maxPartySizeOf(experience({ max_party_size: 3 }))).toBe(3);
    expect(allowsCompanions(experience({ max_party_size: 2 }))).toBe(true);
  });

  it("clamps a value above the MVP ceiling — a bad row cannot widen the allowance", () => {
    expect(maxPartySizeOf(experience({ max_party_size: 99 }))).toBe(3);
  });

  it("clamps zero, negatives and nulls up to 1", () => {
    expect(maxPartySizeOf(experience({ max_party_size: 0 }))).toBe(1);
    expect(maxPartySizeOf(experience({ max_party_size: -5 }))).toBe(1);
    expect(maxPartySizeOf(experience({ max_party_size: null }))).toBe(1);
  });
});

describe("party_size reader — existing reservations stay correct", () => {
  it("counts a pre-migration reservation with no party_size as exactly 1 person", () => {
    expect(partySizeOf(reservation())).toBe(1);
  });

  it("reads a group reservation", () => {
    expect(partySizeOf(reservation({ party_size: 3 }))).toBe(3);
  });

  it("clamps a corrupt value rather than trusting it", () => {
    expect(partySizeOf(reservation({ party_size: 50 }))).toBe(3);
    expect(partySizeOf(reservation({ party_size: 0 }))).toBe(1);
  });
});

describe("occupancy counts people, not rows", () => {
  it("sums party sizes across reservations", () => {
    const summary = summarizeReservations([
      reservation({ party_size: 3 }),
      reservation({ party_size: 2 }),
      reservation({ party_size: 1 }),
    ]);
    // Counting rows would have said 3. The real occupancy is 6 people.
    expect(summary.get("exp-1")?.reservedPeople).toBe(6);
    expect(summary.get("exp-1")?.reservationCount).toBe(3);
    expect(summary.get("exp-1")?.groupCount).toBe(2);
  });

  it("treats reservations with no party_size as 1, so mixed old/new data is right", () => {
    const summary = summarizeReservations([reservation(), reservation({ party_size: 2 })]);
    expect(summary.get("exp-1")?.reservedPeople).toBe(3);
  });

  it("frees every spot of a cancelled group — cancellation is all-or-nothing", () => {
    const summary = summarizeReservations([
      reservation({ party_size: 3, status: "cancelled" }),
      reservation({ party_size: 2 }),
    ]);
    expect(summary.get("exp-1")?.reservedPeople).toBe(2);
    expect(summary.get("exp-1")?.cancelled).toBe(1);
  });

  it("still counts attended and no_show as occupying their spots", () => {
    const summary = summarizeReservations([
      reservation({ party_size: 2, status: "attended" }),
      reservation({ party_size: 2, status: "no_show" }),
    ]);
    expect(summary.get("exp-1")?.reservedPeople).toBe(4);
    expect(summary.get("exp-1")?.attended).toBe(1);
    expect(summary.get("exp-1")?.noShow).toBe(1);
  });
});

describe("capacity arithmetic the database check depends on", () => {
  const capacity = 10;
  const remaining = (reservations: Reservation[]) =>
    capacity - (summarizeReservations(reservations).get("exp-1")?.reservedPeople ?? 0);

  it("exact capacity: a group of 3 fits when exactly 7 people are in", () => {
    // Sizes must each be within the MVP ceiling — partySizeOf clamps
    // anything larger, which is why 3 + 3 + 1 is used rather than 4 + 3.
    const existing = [reservation({ party_size: 3 }), reservation({ party_size: 3 }), reservation({ party_size: 1 })];
    expect(remaining(existing)).toBe(3);
    expect(remaining(existing) >= 3).toBe(true);
  });

  it("last spot: a group of 2 does NOT fit when only 1 place is left", () => {
    const existing = [reservation({ party_size: 3 }), reservation({ party_size: 3 }), reservation({ party_size: 3 })];
    expect(remaining(existing)).toBe(1);
    expect(remaining(existing) >= 2).toBe(false);
  });

  it("overbooking attempt: the row count would have allowed it, the people count does not", () => {
    // Three reservations of three people each against capacity 10.
    const existing = [reservation({ party_size: 3 }), reservation({ party_size: 3 }), reservation({ party_size: 3 })];
    const rowCount = existing.length; // 3 — what the old function counted
    const peopleCount = summarizeReservations(existing).get("exp-1")!.reservedPeople; // 9

    expect(rowCount).toBe(3);
    expect(peopleCount).toBe(9);
    // Under row counting a further group of 3 looked fine (3 + 1 <= 10).
    expect(rowCount + 1 <= capacity).toBe(true);
    // Counting people, it correctly does not fit (9 + 3 > 10).
    expect(peopleCount + 3 > capacity).toBe(true);
  });

  it("a full experience leaves zero spots even though only four rows exist", () => {
    const existing = [
      reservation({ party_size: 3 }),
      reservation({ party_size: 3 }),
      reservation({ party_size: 3 }),
      reservation({ party_size: 1 }),
    ];
    expect(remaining(existing)).toBe(0);
  });
});
