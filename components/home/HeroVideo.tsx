"use client";

import { useVideoAllowed } from "@/components/motion/useVideoAllowed";

/**
 * Always renders the same <video> element (poster attribute set) so there
 * is never a layout shift or an img/video swap — the poster is the frame
 * one way or another. The <source> is only attached when video is allowed
 * (motion + connection permitting); otherwise the element just displays
 * its poster indefinitely, which reads as a still hero image.
 */
export function HeroVideo({ poster, src }: { poster: string; src: string }) {
  const allowVideo = useVideoAllowed();

  return (
    <video
      key={allowVideo ? "video" : "poster"}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay={allowVideo}
      preload={allowVideo ? "auto" : "none"}
      className="absolute inset-0 h-full w-full object-cover"
      aria-hidden
    >
      {allowVideo && <source src={src} type="video/mp4" />}
    </video>
  );
}
