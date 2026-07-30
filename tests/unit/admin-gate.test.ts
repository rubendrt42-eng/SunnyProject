import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Regression test for the /admin authorization gate.
 *
 * The bug this locks down: `redirect()` in the admin layout does NOT stop the
 * panel from being sent. In this version of Next, `redirect()` called in a
 * streaming context emits a `<meta http-equiv="refresh">` and still returns
 * HTTP 200 with the fully rendered markup — `curl /admin` came back with the
 * entire dashboard shell for an anonymous request. The gate therefore has to
 * run in the proxy, before rendering, where it can return a real 307.
 *
 * These tests assert the proxy behaviour directly, because that is the layer
 * that actually protects the route.
 */

const getUser = vi.fn();
const maybeSingle = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle }),
      }),
    }),
  }),
}));

vi.mock("@/lib/env", () => ({
  env: { supabaseUrl: "https://example.supabase.co", supabaseAnonKey: "anon-key" },
  isSupabaseConfigured: () => true,
}));

const { updateSession } = await import("@/lib/supabase/middleware");
const { NextRequest } = await import("next/server");

function request(pathname: string) {
  return new NextRequest(new Request(`https://sunny.test${pathname}`));
}

describe("admin route gate (proxy)", () => {
  beforeEach(() => {
    getUser.mockReset();
    maybeSingle.mockReset();
  });

  it("redirects an anonymous request to /admin instead of rendering it", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await updateSession(request("/admin"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://sunny.test/acceso?next=%2Fadmin");
  });

  it("redirects a signed-in NON-admin away from /admin", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    maybeSingle.mockResolvedValue({ data: { role: "user" } });

    const response = await updateSession(request("/admin/reservaciones"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://sunny.test/acceso?next=%2Fadmin%2Freservaciones");
  });

  it("redirects when the profile row is missing entirely", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    maybeSingle.mockResolvedValue({ data: null });

    const response = await updateSession(request("/admin"));

    expect(response.status).toBe(307);
  });

  it("lets an admin through", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
    maybeSingle.mockResolvedValue({ data: { role: "admin" } });

    const response = await updateSession(request("/admin"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("does not touch public routes, and does not pay for the role lookup there", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await updateSession(request("/experiencias"));

    expect(response.status).toBe(200);
    expect(maybeSingle).not.toHaveBeenCalled();
  });

  it("preserves the full admin path in `next` so login returns to the right page", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await updateSession(request("/admin/experiencias/nueva"));

    expect(response.headers.get("location")).toBe("https://sunny.test/acceso?next=%2Fadmin%2Fexperiencias%2Fnueva");
  });
});
