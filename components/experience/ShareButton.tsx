"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { clsx } from "clsx";

type Feedback = "idle" | "copied" | "failed";

/**
 * Sharing an experience (brief §27). Exactly three routes, no social SDKs:
 *
 * 1. The native share sheet, when the browser has one — this is the whole
 *    point on mobile, where it reaches WhatsApp, Messages, everything.
 * 2. A direct WhatsApp link, because it is how plans actually get shared
 *    here and it works on desktop where there is no share sheet.
 * 3. Copy link, as the always-available fallback.
 *
 * The confirmation is announced through `aria-live`, not just a colour and
 * an icon swap, and it reverts after two seconds. A copy failure says so
 * instead of silently pretending it worked — a lie here means someone
 * pastes nothing into a chat.
 */
export function ShareButton({
  url,
  title,
  variant = "button",
  className,
}: {
  /** Path or absolute URL. A path is resolved against the current origin at click time. */
  url: string;
  title: string;
  variant?: "button" | "compact";
  className?: string;
}) {
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  function flash(next: Feedback) {
    setFeedback(next);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setFeedback("idle"), 2000);
  }

  function absoluteUrl() {
    return url.startsWith("http") ? url : new URL(url, window.location.origin).toString();
  }

  async function handleShare() {
    const href = absoluteUrl();

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: `${title} — Sunny Project`, url: href });
        return;
      } catch {
        // A dismissed share sheet lands here too, which is not an error —
        // fall through to copying so the action still does something useful.
      }
    }

    await copy(href);
  }

  async function copy(href?: string) {
    const target = href ?? absoluteUrl();
    try {
      await navigator.clipboard.writeText(target);
      flash("copied");
    } catch {
      flash("failed");
    }
  }

  /**
   * WhatsApp is a button rather than an `<a href>` on purpose. The wa.me
   * text has to contain the *absolute* URL, and `window.location.origin`
   * does not exist during server render — resolving it in an effect would
   * either mean setState-in-effect or shipping a first paint whose link
   * pastes a bare path with no domain into someone's chat. Computing it at
   * click time is exact, and there is nothing to hydrate.
   */
  function openWhatsApp() {
    const text = `${title} — ${absoluteUrl()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  if (variant === "compact") {
    return (
      <div className={clsx("flex items-center gap-1", className)}>
        <button
          type="button"
          onClick={handleShare}
          aria-label={`Compartir ${title}`}
          className="flex size-9 items-center justify-center rounded-md text-carbon/60 transition-colors hover:bg-carbon/5 hover:text-carbon"
        >
          {feedback === "copied" ? <Check aria-hidden size={16} strokeWidth={1.75} /> : <Share2 aria-hidden size={16} strokeWidth={1.5} />}
        </button>
        <span aria-live="polite" className="sr-only">
          {feedback === "copied" ? "Enlace copiado." : feedback === "failed" ? "No pudimos copiar el enlace." : ""}
        </span>
      </div>
    );
  }

  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-carbon/20 px-4 text-small font-medium text-carbon transition-colors hover:border-carbon/50"
        >
          <Share2 aria-hidden size={16} strokeWidth={1.5} />
          Compartir
        </button>

        <button
          type="button"
          onClick={openWhatsApp}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-carbon/20 px-4 text-small font-medium text-carbon transition-colors hover:border-carbon/50"
        >
          WhatsApp
        </button>

        <button
          type="button"
          onClick={() => copy()}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-carbon/20 px-4 text-small font-medium text-carbon transition-colors hover:border-carbon/50"
        >
          {feedback === "copied" ? <Check aria-hidden size={16} strokeWidth={1.75} /> : <Link2 aria-hidden size={16} strokeWidth={1.5} />}
          {feedback === "copied" ? "Enlace copiado" : "Copiar enlace"}
        </button>
      </div>

      <p aria-live="polite" className="min-h-5 text-small text-gray">
        {feedback === "copied" ? "Enlace copiado." : feedback === "failed" ? "No pudimos copiar el enlace. Cópialo desde la barra de direcciones." : ""}
      </p>
    </div>
  );
}
