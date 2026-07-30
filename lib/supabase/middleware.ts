import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";
import { env, isSupabaseConfigured } from "@/lib/env";

/** Routes that must never render for anyone who isn't an admin. */
const ADMIN_PREFIX = "/admin";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Refreshes the session cookie when it's close to expiring. Do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /**
   * The /admin gate runs HERE, before rendering, and this is deliberate.
   *
   * `redirect()` inside the admin layout is not sufficient on its own. This
   * version of Next documents that when `redirect()` is called in a
   * streaming context it "will insert a meta tag to emit the redirect on the
   * client side" (see node_modules/next/dist/docs/01-app/03-api-reference/
   * 04-functions/redirect.md). That is exactly what happens in the admin
   * layout: the response comes back as **HTTP 200 with the full panel
   * markup** plus a `<meta http-equiv="refresh">`. A browser navigates away
   * after a beat, but the HTML has already been sent — `curl http://.../admin`
   * returned the whole dashboard shell. Verified against the running dev
   * server before this fix.
   *
   * No private data leaked, because RLS restricts every admin table to
   * `is_admin()` and an anonymous request gets empty results — but shipping
   * the panel's structure to anyone who asks is not acceptable, and it would
   * become a real leak the moment an RLS policy was loosened.
   *
   * The same doc gives the remedy: "If you'd like to redirect before the
   * render process, use next.config.js or Proxy". So the check happens in
   * the proxy, which returns a genuine 307 and never renders the route. The
   * layout guard stays as defense in depth.
   *
   * The role lookup only runs for /admin requests, so normal traffic pays
   * nothing for it.
   */
  if (request.nextUrl.pathname.startsWith(ADMIN_PREFIX)) {
    if (!user) return redirectToLogin(request);

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "admin") return redirectToLogin(request);
  }

  return response;
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/acceso";
  url.search = "";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}
