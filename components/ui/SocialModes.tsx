import { Badge } from "@/components/ui/Badge";
import { SOCIAL_MODES, type SocialMode } from "@/lib/social-modes";

/**
 * Renders an experience's declared social modality. Renders nothing at all
 * when the experience declares none — a badge that doesn't match the
 * experience is worse than no badge (brief §15), so these are never
 * inferred from the category or capacity.
 *
 * `onPhoto` switches to the translucent tone for use over an image, where
 * the pine/sunny fills would fight the photograph.
 */
export function SocialModes({
  modes,
  max = 3,
  onPhoto = false,
  className,
}: {
  modes: SocialMode[];
  max?: number;
  onPhoto?: boolean;
  className?: string;
}) {
  if (modes.length === 0) return null;

  return (
    <ul className={className ? `flex flex-wrap gap-1.5 ${className}` : "flex flex-wrap gap-1.5"}>
      {modes.slice(0, max).map((mode) => (
        <li key={mode}>
          <Badge tone={onPhoto ? "onPhoto" : SOCIAL_MODES[mode].tone}>{SOCIAL_MODES[mode].label}</Badge>
        </li>
      ))}
    </ul>
  );
}
