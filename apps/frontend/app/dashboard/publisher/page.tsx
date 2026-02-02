import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { getAdSlots } from '@/lib/api';
import { AdSlotList } from './components/ad-slot-list';
import { CreateAdSlotButton } from './components/create-ad-slot-button';

export default async function PublisherDashboard() {
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

  const headersList = await headers();
  const cookie = headersList.get('cookie') ?? '';
  let adSlots: Awaited<ReturnType<typeof getAdSlots>> = [];
  let error: string | null = null;
  try {
    adSlots = await getAdSlots(undefined, {
      cache: 'no-store',
      headers: { Cookie: cookie },
    });
  } catch {
    error = 'Failed to load ad slots';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Ad Slots</h1>
        <CreateAdSlotButton />
      </div>

      <AdSlotList adSlots={adSlots} error={error} />
    </div>
  );
}
