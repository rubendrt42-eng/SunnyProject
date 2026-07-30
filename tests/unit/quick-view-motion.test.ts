import { describe, expect, it } from "vitest";
import { panelMotion } from "@/lib/quick-view-motion";

/**
 * The invariant these tests protect: whichever axis the QuickView panel
 * slides in on, `animate` must return BOTH axes to zero.
 *
 * Without that, a breakpoint answer arriving after mount — which is what
 * happens on every `?ver=<slug>` share link, because useIsDesktop() reports
 * false during hydration — leaves the unmentioned axis stranded at 100% and
 * the panel parked a full viewport off-screen. Measured, not imagined: at
 * 1440×900 the dialog sat at y=900 with an unclickable close button.
 */

describe("panelMotion", () => {
  it("enters from the right edge on desktop", () => {
    expect(panelMotion(true).initial).toEqual({ x: "100%", y: 0 });
  });

  it("enters from the bottom edge on mobile", () => {
    expect(panelMotion(false).initial).toEqual({ x: 0, y: "100%" });
  });

  it("leaves the way it came in", () => {
    for (const isDesktop of [true, false]) {
      const m = panelMotion(isDesktop);
      expect(m.exit).toEqual(m.initial);
    }
  });

  it("always brings BOTH axes back to zero — the actual fix", () => {
    for (const isDesktop of [true, false]) {
      expect(panelMotion(isDesktop).animate).toEqual({ x: 0, y: 0 });
    }
  });

  it("never declares an offset it does not also animate away", () => {
    // Any axis named in `initial` must be named in `animate`, or it stays
    // stuck when the other axis takes over mid-flight.
    for (const isDesktop of [true, false]) {
      const m = panelMotion(isDesktop);
      for (const axis of Object.keys(m.initial) as Array<keyof typeof m.initial>) {
        expect(m.animate).toHaveProperty(axis);
      }
    }
  });

  it("survives the hydration flip: the mobile offset is cleared by the desktop target", () => {
    // Reproduces the real sequence — mount as mobile, then learn it is
    // desktop. The desktop `animate` must still address the y offset that
    // the mobile `initial` introduced.
    const mountedAs = panelMotion(false);
    const afterFlip = panelMotion(true);
    expect(mountedAs.initial.y).toBe("100%");
    expect(afterFlip.animate.y).toBe(0);
  });
});
