import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { getAdSlotsPaginated } from '@/lib/api';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Ad Slots</h1>
        <CreateAdSlotButton />
      </div>

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
