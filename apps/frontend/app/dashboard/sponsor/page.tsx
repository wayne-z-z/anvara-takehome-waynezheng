import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { getCampaignsPaginated } from '@/lib/api';
import { CampaignList } from './components/campaign-list';
import { CreateCampaignButton } from './components/create-campaign-button';

const DEFAULT_PAGE_SIZE = 10;

export default async function SponsorDashboard({
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
  if (roleData.role !== 'sponsor' || !roleData.sponsorId) {
    redirect('/');
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const headersList = await headers();
  const cookie = headersList.get('cookie') ?? '';
  let campaigns: Awaited<ReturnType<typeof getCampaignsPaginated>>['items'] = [];
  let total = 0;
  let error: string | null = null;
  try {
    const result = await getCampaignsPaginated(page, DEFAULT_PAGE_SIZE, {
      cache: 'no-store',
      headers: { Cookie: cookie },
    });
    campaigns = result.items;
    total = result.total;
  } catch {
    error = 'Failed to load campaigns';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Campaigns</h1>
        <CreateCampaignButton />
      </div>

      <CampaignList
        campaigns={campaigns}
        error={error}
        pagination={
          error == null
            ? { page, limit: DEFAULT_PAGE_SIZE, total, basePath: '/dashboard/sponsor' }
            : undefined
        }
      />
    </div>
  );
}
