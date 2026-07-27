const DEMO_TAG = /\s*\[Demostraci[oó]n\]\s*$/i;

/** Seed/demo experiences are tagged with a "[Demostración]" suffix in their title (no schema change needed). */
export function isDemoExperience(title: string): boolean {
  return DEMO_TAG.test(title);
}

/** Strips the "[Demostración]" tag for display — the UI shows it as a proper badge instead. */
export function displayTitle(title: string): string {
  return title.replace(DEMO_TAG, "").trim();
}
