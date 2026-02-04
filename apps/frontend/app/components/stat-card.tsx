interface StatCardProps {
  label: string;
  value: string | number;
  /** Optional accent color class (e.g. text-[--color-primary]) */
  valueClassName?: string;
}

export function StatCard({
  label,
  value,
  valueClassName = 'text-[--color-foreground]',
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-[--color-border] bg-[--color-background] px-4 py-3 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wide text-[--color-muted]">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${valueClassName}`}>{value}</p>
    </div>
  );
}
