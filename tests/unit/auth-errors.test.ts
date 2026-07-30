import { describe, expect, it } from "vitest";
import { describeAuthError } from "@/lib/auth-errors";

/**
 * These assertions encode the lesson from a real incident: the sign-in form
 * showed "verifica tu correo e intenta de nuevo" while the actual failure was
 * a send-rate limit. That advice is not merely unhelpful — retrying extends
 * the lockout — and it pointed the investigation at the wrong thing for
 * hours. So the mapping is tested, not eyeballed.
 */

describe("describeAuthError — rate limit", () => {
  it("recognises the over_email_send_rate_limit code", () => {
    const r = describeAuthError({ code: "over_email_send_rate_limit", message: "email rate limit exceeded", status: 429 });
    expect(r.kind).toBe("rate_limit");
    expect(r.discourageRetry).toBe(true);
    expect(r.code).toBe("over_email_send_rate_limit");
  });

  it("recognises a bare HTTP 429 even without the code", () => {
    expect(describeAuthError({ status: 429, message: "too many requests" }).kind).toBe("rate_limit");
  });

  it("extracts the wait from the short variant and puts it in the message", () => {
    const r = describeAuthError({
      code: "over_email_send_rate_limit",
      status: 429,
      message: "For security purposes, you can only request this after 43 seconds.",
    });
    expect(r.kind).toBe("rate_limit");
    expect(r.detail).toContain("43 segundos");
  });

  it("never tells the person to just try again, since that extends the wait", () => {
    const r = describeAuthError({ code: "over_email_send_rate_limit", status: 429, message: "email rate limit exceeded" });
    expect(r.detail.toLowerCase()).not.toMatch(/intenta de nuevo/);
    expect(r.discourageRetry).toBe(true);
  });
});

describe("describeAuthError — unauthorised redirect", () => {
  it("recognises a rejected redirect_to", () => {
    const r = describeAuthError({ message: "Invalid redirect_to URL", status: 400, code: "validation_failed" });
    expect(r.kind).toBe("redirect_not_allowed");
    expect(r.discourageRetry).toBe(true);
  });

  it("does not blame the address the person typed", () => {
    const r = describeAuthError({ message: "redirect_to is not allowed", status: 400 });
    expect(r.detail.toLowerCase()).not.toContain("verifica tu correo");
    expect(r.title.toLowerCase()).not.toContain("correo");
  });
});

describe("describeAuthError — the person's own mistake", () => {
  it("recognises a malformed address and DOES invite a retry", () => {
    const r = describeAuthError({ message: "Unable to validate email address: invalid format", status: 400 });
    expect(r.kind).toBe("invalid_email");
    expect(r.discourageRetry).toBe(false);
  });
});

describe("describeAuthError — transport", () => {
  it("recognises supabase-js retryable fetch failures", () => {
    expect(describeAuthError({ name: "AuthRetryableFetchError", message: "Failed to fetch" }).kind).toBe("network");
  });

  it("recognises a thrown TypeError from fetch", () => {
    expect(describeAuthError(new TypeError("Failed to fetch")).kind).toBe("network");
  });
});

describe("describeAuthError — unknown", () => {
  it("falls back without crashing and surfaces something reportable", () => {
    const r = describeAuthError({ message: "boom", status: 500 });
    expect(r.kind).toBe("unknown");
    expect(r.code).toBe("http_500");
  });

  it("survives null, undefined and junk instead of throwing in the form", () => {
    for (const input of [null, undefined, 0, "", [], {}]) {
      const r = describeAuthError(input);
      expect(r.kind).toBe("unknown");
      expect(r.title.length).toBeGreaterThan(0);
      expect(r.detail.length).toBeGreaterThan(0);
    }
  });

  it("always returns a non-empty title and detail for every branch", () => {
    const samples = [
      { code: "over_email_send_rate_limit", status: 429, message: "email rate limit exceeded" },
      { message: "Invalid redirect_to URL" },
      { message: "invalid email format" },
      { name: "AuthRetryableFetchError" },
      { message: "???" },
    ];
    for (const s of samples) {
      const r = describeAuthError(s);
      expect(r.title.trim()).not.toBe("");
      expect(r.detail.trim()).not.toBe("");
    }
  });
});
