"use client";

import { useVideoAllowed } from "@/components/motion/useVideoAllowed";

/**
 * Same <video> element regardless of state — never swaps to an <img>, so
 * there's no layout shift. If neither the video nor its poster exist yet
 * (real files not dropped in), falls back to a flat carbon background with
 * a small, honest note naming what's missing — never an abstract
 * placeholder standing in for real footage.
 */
export function HeroVideo({ poster, src, availableAssets }: { poster: string; src: string; availableAssets: string[] }) {
  const allowVideo = useVideoAllowed();
  const posterFile = poster.split("/").pop() ?? "";
  const srcFile = src.split("/").pop() ?? "";
  const posterExists = availableAssets.includes(posterFile);
  const videoExists = availableAssets.includes(srcFile);

  if (!posterExists && !videoExists) {
    return (
      <div className="absolute inset-0 bg-carbon">
        <span className="absolute right-4 bottom-4 rounded-md bg-warm-white/10 px-2.5 py-1 text-[0.65rem] text-warm-white/50">
          Falta {srcFile} y {posterFile}
        </span>
      </div>
    );
  }

  return (
    <video
      key={allowVideo && videoExists ? "video" : "poster"}
      poster={posterExists ? poster : undefined}
      muted
      loop
      playsInline
      autoPlay={allowVideo && videoExists}
      preload={allowVideo && videoExists ? "auto" : "none"}
      className="absolute inset-0 h-full w-full bg-carbon object-cover"
      aria-hidden
    >
      {allowVideo && videoExists && <source src={src} type="video/mp4" />}
    </video>
  );
}
