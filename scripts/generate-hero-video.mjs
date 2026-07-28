/**
 * One-off local generator for the hero background video + poster.
 * Not a project dependency. No network access to Pexels/Unsplash was
 * available in this environment (confirmed, see DEMO_ASSETS.md), so this
 * builds a short generated montage (5 abstract "scenes", one per category,
 * each with a subtle Ken Burns zoom) with sharp + ffmpeg instead of real
 * footage.
 *
 * Run with: node scripts/generate-hero-video.mjs
 */
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);
const sharp = require("/home/user/SunnyProject/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp");

const PUBLIC_DIR = new URL("../public/demo-assets/", import.meta.url);
const TMP_DIR = new URL("../.tmp-hero-video/", import.meta.url);
mkdirSync(PUBLIC_DIR, { recursive: true });
mkdirSync(TMP_DIR, { recursive: true });

const W = 1920;
const H = 1080;
const CLIP_SECONDS = 3;
const FPS = 25;

// Five scenes, one per category — abstract/atmospheric, no text, no icons,
// so they read as footage rather than a card graphic once title copy sits
// on top via CSS overlay.
const SCENES = [
  {
    name: "movimiento",
    layers: [
      { cx: 1500, cy: 250, r: 520, fill: "#F8D347", opacity: 0.55 },
      { cx: 300, cy: 850, r: 420, fill: "#FF7A3D", opacity: 0.4 },
      { cx: 950, cy: 950, r: 300, fill: "#FFFDFC", opacity: 0.12 },
    ],
    bg: ["#171714", "#3a2e14"],
  },
  {
    name: "recovery",
    layers: [
      { cx: 400, cy: 300, r: 480, fill: "#FF7A3D", opacity: 0.45 },
      { cx: 1550, cy: 750, r: 560, fill: "#171714", opacity: 0.5 },
      { cx: 960, cy: 200, r: 260, fill: "#FFFDFC", opacity: 0.1 },
    ],
    bg: ["#2a1a12", "#171714"],
  },
  {
    name: "coffee",
    layers: [
      { cx: 1400, cy: 850, r: 500, fill: "#F8D347", opacity: 0.4 },
      { cx: 500, cy: 200, r: 420, fill: "#6D6D65", opacity: 0.5 },
      { cx: 1000, cy: 550, r: 300, fill: "#FF7A3D", opacity: 0.25 },
    ],
    bg: ["#3a2a1a", "#171714"],
  },
  {
    name: "outdoor",
    layers: [
      { cx: 1600, cy: 300, r: 560, fill: "#F8D347", opacity: 0.5 },
      { cx: 250, cy: 900, r: 460, fill: "#FF7A3D", opacity: 0.4 },
      { cx: 900, cy: 850, r: 320, fill: "#FFFDFC", opacity: 0.15 },
    ],
    bg: ["#12253a", "#171714"],
  },
  {
    name: "comunidad",
    layers: [
      { cx: 500, cy: 250, r: 500, fill: "#FF7A3D", opacity: 0.5 },
      { cx: 1500, cy: 800, r: 480, fill: "#F8D347", opacity: 0.45 },
      { cx: 960, cy: 540, r: 260, fill: "#FFFDFC", opacity: 0.1 },
    ],
    bg: ["#2a1414", "#171714"],
  },
];

function buildSvg({ layers, bg }) {
  const circles = layers
    .map((l) => `<circle cx="${l.cx}" cy="${l.cy}" r="${l.r}" fill="${l.fill}" opacity="${l.opacity}" />`)
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bg[0]}" />
        <stop offset="100%" stop-color="${bg[1]}" />
      </linearGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="60" /></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)" />
    <g filter="url(#blur)">${circles}</g>
  </svg>`;
}

async function main() {
  const clipPaths = [];

  for (const [i, scene] of SCENES.entries()) {
    const svg = Buffer.from(buildSvg(scene));
    const stillPath = new URL(`${scene.name}.png`, TMP_DIR).pathname;
    await sharp(svg).png().toFile(stillPath);

    const clipPath = new URL(`clip-${i}.mp4`, TMP_DIR).pathname;
    const zoomDirection = i % 2 === 0 ? "min(zoom+0.0018,1.18)" : "max(1.18-on*0.0018,1.0)";

    execFileSync("ffmpeg", [
      "-y",
      "-loop", "1",
      "-i", stillPath,
      "-vf", `scale=${W}:${H},zoompan=z='${zoomDirection}':d=${CLIP_SECONDS * FPS}:s=${W}x${H}:fps=${FPS}`,
      "-t", String(CLIP_SECONDS),
      "-pix_fmt", "yuv420p",
      "-an",
      clipPath,
    ], { stdio: "inherit" });

    clipPaths.push(clipPath);
    console.log(`  ✓ clip ${i + 1}/${SCENES.length} (${scene.name})`);
  }

  const concatListPath = new URL("concat.txt", TMP_DIR).pathname;
  writeFileSync(concatListPath, clipPaths.map((p) => `file '${p}'`).join("\n"));

  const rawConcatPath = new URL("concat.mp4", TMP_DIR).pathname;
  execFileSync("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", concatListPath, "-c", "copy", rawConcatPath], {
    stdio: "inherit",
  });

  const finalPath = new URL("hero-reel.mp4", PUBLIC_DIR).pathname;
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i", rawConcatPath,
      "-vf", "fade=t=in:st=0:d=0.6,fade=t=out:st=14.4:d=0.6",
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", "28",
      "-movflags", "+faststart",
      "-pix_fmt", "yuv420p",
      "-an",
      finalPath,
    ],
    { stdio: "inherit" },
  );
  console.log(`  ✓ hero-reel.mp4`);

  const posterPath = new URL("hero-poster.webp", PUBLIC_DIR).pathname;
  const posterPng = new URL("poster.png", TMP_DIR).pathname;
  execFileSync("ffmpeg", ["-y", "-i", finalPath, "-frames:v", "1", "-ss", "00:00:01", posterPng], { stdio: "inherit" });
  await sharp(posterPng).webp({ quality: 82 }).toFile(posterPath);
  console.log(`  ✓ hero-poster.webp`);

  rmSync(TMP_DIR, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
