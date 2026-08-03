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

/** Paths into the committed Sunny media library are keyed by their full public path. */
function sunnyMediaPath(url: string): string | null {
  return /^\/media\/sunny\/[^?#]+$/.test(url) ? url : null;
}

/**
 * Resolves a photo path against the files that actually exist on disk.
 *
 * Two local conventions are checked — `/demo-assets/<file>` and
 * `/media/sunny/<section>/<file>` — so a renamed or deleted committed asset
 * shows the honest missing state naming the file, rather than a silent
 * broken image. Anything else (a Supabase Storage URL from Emmy's upload, a
 * future CDN link) is trusted as-is: we have no way to check it from here,
 * and flagging it "missing" would be a lie.
 */
export function resolveExperienceImage(url: string | null | undefined, availableAssets: string[]): ResolvedImage {
  if (!url) return { src: null, missingLabel: "Sin fotografía" };

  const mediaPath = sunnyMediaPath(url);
  if (mediaPath) {
    if (availableAssets.includes(mediaPath)) return { src: url, missingLabel: null };
    return { src: null, missingLabel: mediaPath.split("/").pop() ?? mediaPath };
  }

  const filename = demoAssetFilename(url);
  if (!filename) return { src: url, missingLabel: null };

  if (availableAssets.includes(filename)) return { src: url, missingLabel: null };
  return { src: null, missingLabel: filename };
}
