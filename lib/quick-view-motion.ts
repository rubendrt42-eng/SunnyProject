/**
 * Slide geometry for the QuickView panel: a right-edge drawer on desktop, a
 * bottom sheet on mobile.
 *
 * WHY THIS IS A FUNCTION AND NOT THREE INLINE OBJECTS
 *
 * The panel used to declare only the axis it travelled on — `{ x: "100%" }`
 * on desktop, `{ y: "100%" }` on mobile. That is broken whenever the
 * breakpoint answer *changes after the panel has already mounted*, which is
 * not a hypothetical: `useIsDesktop()` reports `false` during hydration
 * (a server snapshot cannot know the viewport), so on a wide screen the
 * sequence is
 *
 *   1. mount with the mobile initial → transform: translateY(100%)
 *   2. the real breakpoint arrives → animate becomes { x: 0 }
 *   3. `y` is no longer mentioned in the target, so nothing animates it back
 *
 * and the panel stays parked one full viewport below the fold — present in
 * the DOM, focused, announced by screen readers, and completely invisible.
 *
 * That only happens when the panel is open on first paint, which is exactly
 * the `?ver=<slug>` share link that ShareButton produces. Measured at 1440×900:
 * the dialog sat at y=900 in a 900px viewport and its close button could not
 * be clicked.
 *
 * Declaring BOTH axes every time makes the animation total: whichever axis
 * the panel entered on, `animate` brings both back to 0, so no axis can be
 * left stranded by a mid-flight change of mind.
 */

export interface PanelMotion {
  initial: { x: number | string; y: number | string };
  animate: { x: number; y: number };
  exit: { x: number | string; y: number | string };
}

/**
 * `reducedMotion` quita el desplazamiento y deja solo la opacidad, que
 * `QuickView` anima aparte. Un panel que cruza media pantalla es justo el tipo
 * de movimiento que provoca el mareo por el que se activa ese ajuste, y el
 * bloque global de globals.css no lo alcanza: solo anula transiciones y
 * animaciones de CSS, y esto es un `transform` animado desde JavaScript.
 *
 * Sigue declarando LOS DOS EJES por la razón de arriba: si el punto de ruptura
 * cambia a media animación, ningún eje puede quedarse sin destino.
 */
export function panelMotion(isDesktop: boolean, reducedMotion = false): PanelMotion {
  if (reducedMotion) {
    const still = { x: 0, y: 0 };
    return { initial: still, animate: still, exit: still };
  }

  const offscreen = isDesktop ? { x: "100%", y: 0 } : { x: 0, y: "100%" };
  return {
    initial: offscreen,
    // Always both axes. This is the line that fixes the bug.
    animate: { x: 0, y: 0 },
    exit: offscreen,
  };
}
