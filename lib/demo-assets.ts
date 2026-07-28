/**
 * Pure, isomorphic resolution of an experience/section photo against the
 * set of files that actually exist under /public/demo-assets. Safe to
 * import from client components — the filesystem listing itself lives in
 * lib/assets.server.ts and is computed once per request server-side, then
 * passed down as a plain string array.
 */
export function demoAssetFilename(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/^\/demo-assets\/([^/?#]+)$/);
  return match ? match[1] : null;
}

export type ResolvedImage = { src: string; missingLabel: null } | { src: null; missingLabel: string };

/**
 * URLs outside /demo-assets (a future real CDN link, say) are trusted as-is
 * and never flagged "missing" — the missing-asset detection only applies to
 * the local demo asset convention this app currently uses.
 */
export function resolveExperienceImage(url: string | null | undefined, availableAssets: string[]): ResolvedImage {
  if (!url) return { src: null, missingLabel: "Sin fotografía" };

  const filename = demoAssetFilename(url);
  if (!filename) return { src: url, missingLabel: null };

  if (availableAssets.includes(filename)) return { src: url, missingLabel: null };
  return { src: null, missingLabel: filename };
}
