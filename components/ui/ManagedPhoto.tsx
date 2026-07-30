import Image from "next/image";
import { ImageOff } from "lucide-react";
import { clsx } from "clsx";
import { resolveExperienceImage } from "@/lib/demo-assets";

/**
 * The single place a photo gets rendered anywhere in the app. Must sit
 * inside a `relative`-positioned container — it always fills it (`fill`),
 * matching how every card/hero in this codebase already lays out photos.
 *
 * Given a real, present file it renders next/image. Given a missing one
 * (deleted fake asset, or a real experience whose photo hasn't been
 * uploaded yet) it renders a flat, honest empty state naming the exact
 * missing filename — never a generated illustration standing in for it.
 */
export function ManagedPhoto({
  url,
  availableAssets,
  alt,
  sizes,
  priority,
  className,
}: {
  url: string | null | undefined;
  availableAssets: string[];
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const resolved = resolveExperienceImage(url, availableAssets);

  if (resolved.src) {
    return <Image src={resolved.src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
  }

  return (
    <div className={clsx("absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-carbon/[0.04]", className)}>
      <ImageOff aria-hidden size={20} strokeWidth={1.5} className="text-carbon/25" />
      <span className="px-3 text-center text-label leading-tight text-carbon/35">
        {resolved.missingLabel === "Sin fotografía" ? resolved.missingLabel : `Falta ${resolved.missingLabel}`}
      </span>
    </div>
  );
}
