import "server-only";
import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { Resend } from "resend";
import { env, isEmailConfigured } from "@/lib/env";

/**
 * Fire-and-forget email delivery. Never throws: a failed send must never
 * roll back or block a reservation (see PRODUCT_SPEC.md §8). Failures are
 * logged and swallowed; the reservation stays the source of truth in the DB.
 * In development (no RESEND_API_KEY) the rendered email is printed to the
 * console instead of sent.
 */
export async function sendEmail(params: { to: string; subject: string; react: ReactElement }): Promise<void> {
  const { to, subject, react } = params;

  try {
    if (!isEmailConfigured()) {
      const html = await render(react);
      console.log(`\n[email:dev] to=${to} subject="${subject}"\n${html}\n`);
      return;
    }

    const resend = new Resend(env.resendApiKey);
    const { error } = await resend.emails.send({ from: env.resendFromEmail, to, subject, react });

    if (error) {
      console.error("[email] Resend error", error);
    }
  } catch (err) {
    console.error("[email] failed to send", err);
  }
}
