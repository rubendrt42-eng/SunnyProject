/**
 * One-off local generator for /public/demo-assets/*.webp placeholders.
 * Not a project dependency — requires `sharp` directly from pnpm's store
 * since this environment has no network access to Pexels/Unsplash to
 * download real stock photography (see DEMO_ASSETS.md).
 *
 * Run with: node scripts/generate-demo-assets.mjs
 */
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const sharp = require("/home/user/SunnyProject/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp");

const OUT_DIR = new URL("../public/demo-assets/", import.meta.url);
mkdirSync(OUT_DIR, { recursive: true });

const WIDTH = 1600;
const HEIGHT = 1000;

const ASSETS = [
  {
    file: "pilates.webp",
    label: "Pilates Reformer Intro",
    bg: ["#F8D347", "#FF7A3D"],
    icon: "M400,650 L1200,650 M400,650 C400,600 450,580 500,580 L1100,580 C1150,580 1200,600 1200,650 M600,580 L600,420 M1000,580 L1000,420",
  },
  {
    file: "recovery.webp",
    label: "Recovery Contrast Session",
    bg: ["#171714", "#FF7A3D"],
    icon: "M800,300 C900,300 980,380 980,480 C980,620 800,750 800,750 C800,750 620,620 620,480 C620,380 700,300 800,300 Z",
  },
  {
    file: "coffee.webp",
    label: "Coffee Tasting",
    bg: ["#6D6D65", "#F8D347"],
    icon: "M560,420 L1000,420 L980,680 C980,730 940,760 890,760 L670,760 C620,760 580,730 580,680 Z M1000,460 L1060,460 C1100,460 1130,490 1130,530 C1130,570 1100,600 1060,600 L1000,600",
  },
  {
    file: "paddle.webp",
    label: "Sunrise Paddle",
    bg: ["#FF7A3D", "#F8D347"],
    icon: "M300,700 C500,650 700,650 900,700 C1100,750 1300,750 1500,700 M780,250 L820,650 M700,320 L900,320",
  },
  {
    file: "run-club.webp",
    label: "Run & Coffee Social",
    bg: ["#171714", "#F8D347"],
    icon: "M550,750 L700,550 L820,650 L1000,380 M1000,380 L1080,380 M1000,380 L1000,460",
  },
  {
    file: "yoga.webp",
    label: "Sunset Yoga",
    bg: ["#FF7A3D", "#171714"],
    icon: "M800,350 C845,350 880,385 880,430 C880,475 845,510 800,510 C755,510 720,475 720,430 C720,385 755,350 800,350 Z M650,750 C650,650 710,590 800,590 C890,590 950,650 950,750",
  },
];

function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildSvg({ label, bg, icon }) {
  const gradientId = "g";
  const safeLabel = escapeXml(label);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 1600 1000">
    <defs>
      <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bg[0]}" />
        <stop offset="100%" stop-color="${bg[1]}" />
      </linearGradient>
    </defs>
    <rect width="1600" height="1000" fill="url(#${gradientId})" />
    <circle cx="1350" cy="150" r="260" fill="#FFFDFC" opacity="0.08" />
    <circle cx="120" cy="900" r="220" fill="#171714" opacity="0.08" />
    <path d="${icon}" stroke="#FFFDFC" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85" />
    <text x="80" y="920" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="46" fill="#FFFDFC" opacity="0.92">${safeLabel}</text>
    <text x="80" y="960" font-family="Arial, sans-serif" font-size="24" letter-spacing="4" fill="#FFFDFC" opacity="0.7">SUNNY PROJECT · DEMOSTRACIÓN</text>
  </svg>`;
}

async function main() {
  for (const asset of ASSETS) {
    const svg = Buffer.from(buildSvg(asset));
    const outPath = new URL(asset.file, OUT_DIR);
    const buffer = await sharp(svg).webp({ quality: 82 }).toBuffer();
    writeFileSync(outPath, buffer);
    console.log(`  ✓ ${asset.file} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
