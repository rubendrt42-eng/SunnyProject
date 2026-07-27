"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/Badge";
import { categoryLabel } from "@/lib/constants";
import { formatDateShort } from "@/lib/dates";
import type { ExperienceWithBusiness } from "@/lib/queries";
import { spotsLeft } from "@/lib/experience-status";

export function HeroFeaturedCard({ experience }: { experience: ExperienceWithBusiness }) {
  const prefersReducedMotion = useReducedMotion();
  const left = spotsLeft(experience, experience.reserved_count);

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 28, scale: prefersReducedMotion ? 1 : 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="w-full max-w-sm shrink-0 overflow-hidden rounded-2xl bg-warm-white/95 shadow-xl backdrop-blur"
    >
      <Link href={`/experiencias/${experience.slug}`} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image src={experience.image_url || "/images/placeholder-1.svg"} alt="" fill sizes="360px" className="object-cover" />
        </div>
        <div className="flex flex-col gap-1.5 p-5 text-carbon">
          <Badge tone="sunny" className="w-fit">
            {categoryLabel(experience.category)}
          </Badge>
          <p className="font-serif text-xl leading-snug">{experience.title}</p>
          <p className="text-sm text-gray">{experience.business.name}</p>
          <div className="mt-1 flex items-center justify-between text-sm text-gray">
            <span>{formatDateShort(experience.starts_at)}</span>
            <span>{left} lugares</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
