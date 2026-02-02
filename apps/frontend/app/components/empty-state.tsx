import type { ReactNode } from 'react';

interface EmptyStateProps {
  /** Emoji or icon (e.g. "📢") */
  icon?: string;
  /** Short heading */
  title: string;
  /** Supporting copy */
  description: string;
  /** Optional CTA (e.g. Create button) */
  action?: ReactNode;
}

export function EmptyState({ icon = '📋', title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-[--color-border] bg-[--color-background] p-10 text-center">
      <div className="mb-4 text-5xl" aria-hidden>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[--color-foreground]">{title}</h3>
      <p className="mt-2 text-[--color-muted]">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
