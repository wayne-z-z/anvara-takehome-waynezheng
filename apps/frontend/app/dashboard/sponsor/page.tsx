import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { getCampaignsPaginated } from '@/lib/api';
import { StatCard } from '@/app/components/stat-card';
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

  const pageBudget = campaigns.reduce((sum, c) => sum + Number(c.budget), 0);
  const pageSpent = campaigns.reduce((sum, c) => sum + Number(c.spent), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[--color-foreground]">
          My Campaigns
        </h1>
        <CreateCampaignButton />
      </div>

      {!error && (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total campaigns" value={total} />
          <StatCard
            label="Budget (this page)"
            value={`$${pageBudget.toLocaleString()}`}
            valueClassName="text-[--color-primary]"
          />
          <StatCard
            label="Spent (this page)"
            value={`$${pageSpent.toLocaleString()}`}
            valueClassName="text-[--color-muted]"
          />
        </div>
      )}

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
