import "server-only";
import { readdirSync } from "node:fs";
import path from "node:path";

const DEMO_ASSETS_DIR = path.join(process.cwd(), "public", "demo-assets");
const SUNNY_MEDIA_DIR = path.join(process.cwd(), "public", "media", "sunny");

/**
 * One directory listing per request, computed server-side (Server
 * Components only — this file is `server-only`). Never throws: an absent
 * or empty directory simply means every photo in the app renders its
 * "missing asset" state, which is the intended behavior before real files
 * are dropped in.
 *
 * Two roots are listed:
 * - /public/demo-assets — flat, legacy convention, keyed by bare filename.
 * - /public/media/sunny — the committed Sunny media library, nested by
 *   section, keyed by its full public path so `hero/x.webp` and
 *   `categories/x.webp` can never be confused with each other.
 */
export function listAvailableDemoAssets(): string[] {
  const flat = safeList(DEMO_ASSETS_DIR);
  return [...flat, ...listSunnyMedia()];
}

function safeList(dir: string): string[] {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

function listSunnyMedia(): string[] {
  try {
    return readdirSync(SUNNY_MEDIA_DIR, { withFileTypes: true, recursive: true })
      .filter((entry) => entry.isFile())
      .map((entry) => {
        // `parentPath` is absolute; turn it back into the public URL path.
        const rel = path.relative(SUNNY_MEDIA_DIR, path.join(entry.parentPath, entry.name));
        return `/media/sunny/${rel.split(path.sep).join("/")}`;
      });
  } catch {
    return [];
  }
}
