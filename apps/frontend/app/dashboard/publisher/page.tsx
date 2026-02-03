import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { getAdSlotsPaginated } from '@/lib/api';
import { StatCard } from '@/app/components/stat-card';
import { AdSlotList } from './components/ad-slot-list';
import { CreateAdSlotButton } from './components/create-ad-slot-button';

const DEFAULT_PAGE_SIZE = 10;

export default async function PublisherDashboard({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  const roleData = await getUserRole(session.user.id);
  if (roleData.role !== 'publisher') {
    redirect('/');
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const headersList = await headers();
  const cookie = headersList.get('cookie') ?? '';
  let adSlots: Awaited<ReturnType<typeof getAdSlotsPaginated>>['items'] = [];
  let total = 0;
  let error: string | null = null;
  try {
    const result = await getAdSlotsPaginated(page, DEFAULT_PAGE_SIZE, {
      cache: 'no-store',
      headers: { Cookie: cookie },
    });
    adSlots = result.items;
    total = result.total;
  } catch {
    error = 'Failed to load ad slots';
  }

  const availableCount = adSlots.filter((s) => s.isAvailable).length;
  const pageValue = adSlots.reduce((sum, s) => sum + Number(s.basePrice), 0);

  return (
    <div className="animate-page-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[--color-foreground]">
          My Ad Slots
        </h1>
        <CreateAdSlotButton />
      </div>

      {!error && (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total ad slots" value={total} />
          <StatCard
            label="Available (this page)"
            value={`${availableCount} of ${adSlots.length}`}
            valueClassName="text-[--color-success]"
          />
          <StatCard
            label="Listed value (this page)"
            value={`$${pageValue.toLocaleString()}/mo`}
            valueClassName="text-[--color-primary]"
          />
        </div>
      )}

      <AdSlotList
        adSlots={adSlots}
        error={error}
        pagination={
          error == null
            ? { page, limit: DEFAULT_PAGE_SIZE, total, basePath: '/dashboard/publisher' }
            : undefined
        }
      />
    </div>
  );
}
