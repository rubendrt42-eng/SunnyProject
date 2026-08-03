import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import type { ReactNode } from "react";

/**
 * The one empty state used everywhere — catalogue with no results, admin
 * table with no rows, a week with nothing published.
 *
 * It always says what is missing in concrete terms and, where an action
 * exists, offers it. "No hay nada" with no way forward is a dead end, so
 * `action` is strongly encouraged even though it's optional (some contexts,
 * like an admin table filtered to zero rows, genuinely have no action
 * beyond clearing filters, which the caller supplies).
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-carbon/15 px-6 py-12 text-center",
        className,
      )}
    >
      <Icon aria-hidden size={20} strokeWidth={1.5} className="text-carbon/30" />
      <p className="text-heading">{title}</p>
      {description && <p className="max-w-sm text-small text-gray">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
