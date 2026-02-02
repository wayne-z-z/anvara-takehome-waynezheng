function CampaignCardSkeleton() {
  return (
    <div className="rounded-lg border border-[--color-border] p-4">
      <div className="mb-2 flex items-start justify-between">
        <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mb-3 h-4 w-full animate-pulse rounded bg-gray-200" />
      <div className="mb-2 h-2 w-full animate-pulse rounded-full bg-gray-200" />
      <div className="mb-3 h-1.5 w-full animate-pulse rounded-full bg-gray-200" />
      <div className="h-3 w-40 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

export default function SponsorDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-36 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CampaignCardSkeleton />
        <CampaignCardSkeleton />
        <CampaignCardSkeleton />
        <CampaignCardSkeleton />
        <CampaignCardSkeleton />
        <CampaignCardSkeleton />
      </div>
    </div>
  );
}
