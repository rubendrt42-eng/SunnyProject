/**
 * End-to-end integration tests against a REAL Supabase project with the
 * migrations in supabase/migrations applied. These exercise the
 * claim_reservation()/cancel_reservation() RPCs and RLS policies directly —
 * the source of truth for the weekly-pass and no-overbooking rules
 * (see PRODUCT_SPEC.md §4-§5, §27).
 *
 * They are automatically skipped unless TEST_SUPABASE_URL and
 * TEST_SUPABASE_SERVICE_ROLE_KEY point at a disposable test project (never
 * point this at production data — it creates and deletes real rows/users).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.TEST_SUPABASE_URL;
const serviceRoleKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
const configured = Boolean(url && serviceRoleKey);

describe.skipIf(!configured)("reservation rules (live Supabase)", () => {
  let admin: SupabaseClient;
  let businessId: string;
  let userAId: string;
  let userBId: string;
  let clientA: SupabaseClient;
  let clientB: SupabaseClient;

  async function createSignedInClient(email: string): Promise<{ id: string; client: SupabaseClient }> {
    const { data: created, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (error || !created.user) throw error;

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (linkError || !linkData) throw linkError;

    const client = createClient(url!, process.env.TEST_SUPABASE_ANON_KEY || serviceRoleKey!);
    const { error: verifyError } = await client.auth.verifyOtp({
      email,
      token_hash: linkData.properties.hashed_token,
      type: "magiclink",
    });
    if (verifyError) throw verifyError;

    await admin.from("profiles").update({ full_name: "Test User", adult_confirmed_at: new Date().toISOString(), terms_accepted_at: new Date().toISOString() }).eq("id", created.user.id);

    return { id: created.user.id, client };
  }

  async function createExperience(overrides: Record<string, unknown> = {}) {
    const now = Date.now();
    const { data, error } = await admin
      .from("experiences")
      .insert({
        business_id: businessId,
        title: "Integration Test Experience",
        slug: `itest-${crypto.randomUUID()}`,
        category: "movimiento",
        starts_at: new Date(now + 1000 * 60 * 60 * 24).toISOString(),
        ends_at: new Date(now + 1000 * 60 * 60 * 25).toISOString(),
        claim_opens_at: new Date(now - 1000 * 60 * 60).toISOString(),
        claim_closes_at: new Date(now + 1000 * 60 * 60 * 23).toISOString(),
        capacity: 1,
        status: "published",
        ...overrides,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  beforeAll(async () => {
    admin = createClient(url!, serviceRoleKey!, { auth: { persistSession: false } });

    const { data: business, error } = await admin
      .from("businesses")
      .insert({ name: "Integration Test Biz", slug: `itest-biz-${crypto.randomUUID()}`, active: true })
      .select()
      .single();
    if (error) throw error;
    businessId = business.id;

    const a = await createSignedInClient(`itest-a-${crypto.randomUUID()}@example.com`);
    const b = await createSignedInClient(`itest-b-${crypto.randomUUID()}@example.com`);
    userAId = a.id;
    clientA = a.client;
    userBId = b.id;
    clientB = b.client;
  }, 30000);

  afterAll(async () => {
    await admin.from("reservations").delete().eq("business_id", businessId).select().then(() => undefined, () => undefined);
    await admin.from("experiences").delete().eq("business_id", businessId);
    await admin.from("businesses").delete().eq("id", businessId);
    if (userAId) await admin.auth.admin.deleteUser(userAId);
    if (userBId) await admin.auth.admin.deleteUser(userBId);
  });

  it("lets a user claim a pass when capacity and eligibility allow it", async () => {
    const exp = await createExperience({ capacity: 5 });
    const { data, error } = await clientA.rpc("claim_reservation", { p_experience_id: exp.id, p_source: "test" });
    expect(error).toBeNull();
    expect(data.status).toBe("confirmed");
    expect(data.folio).toMatch(/^SUN-\d{4}-[A-F0-9]{6}$/);
  });

  it("rejects a second reservation for the same experience by the same user", async () => {
    const exp = await createExperience({ capacity: 5 });
    await clientA.rpc("claim_reservation", { p_experience_id: exp.id });
    const { error } = await clientA.rpc("claim_reservation", { p_experience_id: exp.id });
    expect(error?.message).toBe("ALREADY_RESERVED_EXPERIENCE");
  });

  it("rejects a second active weekly pass for a different experience", async () => {
    const expA = await createExperience({ capacity: 5 });
    const expB = await createExperience({ capacity: 5 });
    await clientA.rpc("claim_reservation", { p_experience_id: expA.id });
    const { error } = await clientA.rpc("claim_reservation", { p_experience_id: expB.id });
    expect(error?.message).toBe("WEEKLY_PASS_ALREADY_USED");
  });

  it("rejects claiming a sold-out experience", async () => {
    const exp = await createExperience({ capacity: 1 });
    await clientA.rpc("claim_reservation", { p_experience_id: exp.id });
    const { error } = await clientB.rpc("claim_reservation", { p_experience_id: exp.id });
    expect(error?.message).toBe("EXPERIENCE_SOLD_OUT");
  });

  it("never overbooks the last spot under concurrent claims", async () => {
    const exp = await createExperience({ capacity: 1 });
    const [resA, resB] = await Promise.all([
      clientA.rpc("claim_reservation", { p_experience_id: exp.id }),
      clientB.rpc("claim_reservation", { p_experience_id: exp.id }),
    ]);
    const succeeded = [resA, resB].filter((r) => !r.error);
    const failed = [resA, resB].filter((r) => r.error);
    expect(succeeded).toHaveLength(1);
    expect(failed).toHaveLength(1);
    expect(failed[0].error?.message).toBe("EXPERIENCE_SOLD_OUT");
  });

  it("frees the weekly pass and capacity when cancelled on time", async () => {
    const exp = await createExperience({ capacity: 5 });
    const { data: reservation } = await clientA.rpc("claim_reservation", { p_experience_id: exp.id });
    const { data: cancelled, error } = await clientA.rpc("cancel_reservation", { p_reservation_id: reservation.id });
    expect(error).toBeNull();
    expect(cancelled.status).toBe("cancelled");

    // Pass recovered: same user can claim another experience the same week.
    const expOther = await createExperience({ capacity: 5 });
    const { error: secondError } = await clientA.rpc("claim_reservation", { p_experience_id: expOther.id });
    expect(secondError).toBeNull();
  });

  it("rejects a cancellation inside the 12-hour window", async () => {
    const exp = await createExperience({
      starts_at: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      claim_closes_at: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    });
    const { data: reservation } = await clientA.rpc("claim_reservation", { p_experience_id: exp.id });
    const { error } = await clientA.rpc("cancel_reservation", { p_reservation_id: reservation.id });
    expect(error?.message).toBe("CANCELLATION_WINDOW_CLOSED");
  });

  it("prevents a user from reading another user's reservations", async () => {
    const exp = await createExperience({ capacity: 5 });
    const { data: reservation } = await clientA.rpc("claim_reservation", { p_experience_id: exp.id });
    const { data, error } = await clientB.from("reservations").select("*").eq("id", reservation.id).maybeSingle();
    expect(error).toBeNull();
    expect(data).toBeNull(); // RLS silently excludes rows the caller can't see
  });

  it("prevents a user from writing their own role via the profiles table", async () => {
    const { error } = await clientA.from("profiles").update({ role: "admin" }).eq("id", userAId);
    expect(error).not.toBeNull();
  });
});
