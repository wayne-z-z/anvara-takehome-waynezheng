import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { getCampaigns } from '@/lib/api';
import { CampaignList } from './components/campaign-list';
import { CreateCampaignButton } from './components/create-campaign-button';

export default async function SponsorDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Verify user has 'sponsor' role
  const roleData = await getUserRole(session.user.id);
  if (roleData.role !== 'sponsor' || !roleData.sponsorId) {
    redirect('/');
  }

  // Fetch campaigns on the server; forward cookie so backend can validate session
  const headersList = await headers();
  const cookie = headersList.get('cookie') ?? '';
  let campaigns: Awaited<ReturnType<typeof getCampaigns>> = [];
  let error: string | null = null;
  try {
    campaigns = await getCampaigns(undefined, {
      cache: 'no-store',
      headers: { Cookie: cookie },
    });
  } catch {
    error = 'Failed to load campaigns';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Campaigns</h1>
        <CreateCampaignButton />
      </div>

      <CampaignList campaigns={campaigns} error={error} />
    </div>
  );
}
