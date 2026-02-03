function AdSlotCardSkeleton() {
  return (
    <div className="rounded-xl border border-[--color-border] bg-[--color-background] p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mb-3 h-4 w-full animate-pulse rounded bg-gray-200" />
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default function PublisherDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-36 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdSlotCardSkeleton />
        <AdSlotCardSkeleton />
        <AdSlotCardSkeleton />
        <AdSlotCardSkeleton />
        <AdSlotCardSkeleton />
        <AdSlotCardSkeleton />
      </div>
    </div>
  );
}
