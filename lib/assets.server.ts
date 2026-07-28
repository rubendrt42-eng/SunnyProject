import "server-only";
import { readdirSync } from "node:fs";
import path from "node:path";

const DEMO_ASSETS_DIR = path.join(process.cwd(), "public", "demo-assets");

/**
 * One directory listing per request, computed server-side (Server
 * Components only — this file is `server-only`). Never throws: an absent
 * or empty /public/demo-assets simply means every photo/video in the app
 * renders its "missing asset" state, which is the intended behavior before
 * real files are dropped in.
 */
export function listAvailableDemoAssets(): string[] {
  try {
    return readdirSync(DEMO_ASSETS_DIR);
  } catch {
    return [];
  }
}
