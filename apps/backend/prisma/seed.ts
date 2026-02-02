// Seed script for populating the database with sample data
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from 'better-auth/crypto';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the PostgreSQL driver adapter for Prisma 7
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function createBetterAuthTables(client: pg.PoolClient) {
  console.log('Creating Better Auth tables...');

  // Create user table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "user" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
      image TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Create session table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      "expiresAt" TIMESTAMP NOT NULL,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Create account table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "account" (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "accountId" TEXT NOT NULL,
      "providerId" TEXT NOT NULL,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "accessTokenExpiresAt" TIMESTAMP,
      "refreshTokenExpiresAt" TIMESTAMP,
      password TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  // Create verification table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "verification" (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  console.log('  ✓ Better Auth tables created');
}

async function seedBetterAuthUsers() {
  console.log('Seeding Better Auth users...');

  const pool = new pg.Pool({ connectionString });
  const client = await pool.connect();

  try {
    // Create tables first (if they don't exist)
    await createBetterAuthTables(client);

    // Clean existing auth data
    await client.query('DELETE FROM "session"');
    await client.query('DELETE FROM "account"');
    await client.query('DELETE FROM "verification"');
    await client.query('DELETE FROM "user"');

    const now = new Date().toISOString();
    const hashedPassword = await hashPassword('password');

    // Create sponsor user with a fixed ID so we can link it
    const sponsorUserId = crypto.randomUUID();
    await client.query(
      `INSERT INTO "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [sponsorUserId, 'Demo Sponsor', 'sponsor@example.com', true, null, now, now]
    );

    await client.query(
      `INSERT INTO "account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [crypto.randomUUID(), sponsorUserId, sponsorUserId, 'credential', hashedPassword, now, now]
    );
    console.log('  ✓ Created sponsor user: sponsor@example.com / password');

    // Create publisher user with a fixed ID so we can link it
    const publisherUserId = crypto.randomUUID();
    await client.query(
      `INSERT INTO "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [publisherUserId, 'Demo Publisher', 'publisher@example.com', true, null, now, now]
    );

    await client.query(
      `INSERT INTO "account" (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        crypto.randomUUID(),
        publisherUserId,
        publisherUserId,
        'credential',
        hashedPassword,
        now,
        now,
      ]
    );
    console.log('  ✓ Created publisher user: publisher@example.com / password');

    return { sponsorUserId, publisherUserId };
  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  console.log('Seeding database...\n');

  // Seed Better Auth users first and get their IDs
  const { sponsorUserId, publisherUserId } = await seedBetterAuthUsers();

  // Clean existing Prisma data (not Better Auth tables)
  console.log('\nSeeding Prisma models...');
  await prisma.placement.deleteMany();
  await prisma.creative.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.adSlot.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.publisher.deleteMany();

  // Create sponsor linked to the demo sponsor user
  const acme = await prisma.sponsor.create({
    data: {
      userId: sponsorUserId, // Link to Better Auth user
      name: 'Acme Corp',
      email: 'sponsor@example.com', // Match the auth email
      website: 'https://acme.com',
      industry: 'Technology',
      subscriptionTier: 'PROFESSIONAL',
      isVerified: true,
    },
  });

  const techStartup = await prisma.sponsor.create({
    data: {
      name: 'TechStartup Inc',
      email: 'ads@techstartup.io',
      industry: 'SaaS',
      subscriptionTier: 'STARTER',
    },
  });

  // Create publisher linked to the demo publisher user
  const devBlog = await prisma.publisher.create({
    data: {
      userId: publisherUserId, // Link to Better Auth user
      name: 'Dev Blog Daily',
      email: 'publisher@example.com', // Match the auth email
      website: 'https://devblog.com',
      category: 'Technology',
      monthlyViews: 100000,
      subscriberCount: 15000,
      isVerified: true,
    },
  });

  const podcastShow = await prisma.publisher.create({
    data: {
      name: 'Code Talk Podcast',
      email: 'ads@codetalk.fm',
      website: 'https://codetalk.fm',
      category: 'Podcast',
      monthlyViews: 50000,
      subscriberCount: 8000,
    },
  });

  // Create additional publishers for variety
  const newsletterPub = await prisma.publisher.create({
    data: {
      name: 'Tech Weekly Newsletter',
      email: 'ads@techweekly.io',
      website: 'https://techweekly.io',
      category: 'Newsletter',
      monthlyViews: 75000,
      subscriberCount: 25000,
      isVerified: true,
    },
  });

  const videoChannel = await prisma.publisher.create({
    data: {
      name: 'CodeTube',
      email: 'sponsors@codetube.dev',
      website: 'https://codetube.dev',
      category: 'Video',
      monthlyViews: 500000,
      subscriberCount: 120000,
      isVerified: true,
    },
  });

  const startupBlog = await prisma.publisher.create({
    data: {
      name: 'Startup Insider',
      email: 'ads@startupinsider.co',
      website: 'https://startupinsider.co',
      category: 'Business',
      monthlyViews: 200000,
      subscriberCount: 45000,
    },
  });

  // Create 20 ad slots with variety
  const adSlots = [
    // Dev Blog Daily slots
    {
      name: 'Header Banner',
      description:
        'Premium top-of-page banner placement with maximum visibility. Appears on all pages.',
      type: 'DISPLAY',
      position: 'header',
      width: 728,
      height: 90,
      basePrice: 500,
      publisherId: devBlog.id,
      isAvailable: true,
    },
    {
      name: 'Sidebar Ad',
      description: 'Right sidebar placement, sticky on scroll. Great for sustained visibility.',
      type: 'DISPLAY',
      position: 'sidebar',
      width: 300,
      height: 250,
      basePrice: 300,
      publisherId: devBlog.id,
      isAvailable: true,
    },
    {
      name: 'In-Article Native Ad',
      description: 'Native ad placement within article content. Blends with editorial style.',
      type: 'DISPLAY',
      position: 'in-content',
      width: 600,
      height: 400,
      basePrice: 450,
      publisherId: devBlog.id,
      isAvailable: false, // Already booked
    },
    {
      name: 'Footer Banner',
      description: 'End-of-page banner. Lower visibility but budget-friendly option.',
      type: 'DISPLAY',
      position: 'footer',
      width: 728,
      height: 90,
      basePrice: 150,
      publisherId: devBlog.id,
      isAvailable: true,
    },
    // Code Talk Podcast slots
    {
      name: 'Pre-roll Spot (60s)',
      description: '60-second pre-roll sponsorship. Host-read with personal endorsement.',
      type: 'PODCAST',
      position: 'pre-roll',
      basePrice: 1000,
      publisherId: podcastShow.id,
      isAvailable: true,
    },
    {
      name: 'Mid-roll Spot (90s)',
      description: '90-second mid-roll placement. Highest engagement rates.',
      type: 'PODCAST',
      position: 'mid-roll',
      basePrice: 1500,
      publisherId: podcastShow.id,
      isAvailable: true,
    },
    {
      name: 'Post-roll Mention (30s)',
      description: 'Brief 30-second mention at episode end. Budget-friendly podcast option.',
      type: 'PODCAST',
      position: 'post-roll',
      basePrice: 400,
      publisherId: podcastShow.id,
      isAvailable: true,
    },
    // Tech Weekly Newsletter slots
    {
      name: 'Featured Sponsor Slot',
      description:
        'Top placement in newsletter. Includes logo, headline, and 100-word description.',
      type: 'NEWSLETTER',
      position: 'featured',
      basePrice: 800,
      publisherId: newsletterPub.id,
      isAvailable: false, // Already booked
    },
    {
      name: 'Classified Ad',
      description: 'Text-only classified listing. Great for job postings and announcements.',
      type: 'NEWSLETTER',
      position: 'classified',
      basePrice: 200,
      publisherId: newsletterPub.id,
      isAvailable: true,
    },
    {
      name: 'Dedicated Email Send',
      description: 'Full dedicated email to our 25K subscriber list. Your message only.',
      type: 'NEWSLETTER',
      position: 'dedicated',
      basePrice: 2500,
      publisherId: newsletterPub.id,
      isAvailable: true,
    },
    {
      name: 'Newsletter Footer',
      description: 'Persistent footer placement in every issue. Logo and short tagline.',
      type: 'NEWSLETTER',
      position: 'footer',
      basePrice: 350,
      publisherId: newsletterPub.id,
      isAvailable: true,
    },
    // CodeTube Video slots
    {
      name: 'Pre-roll Video Ad (15s)',
      description: '15-second skippable pre-roll video ad. Reaches 500K monthly viewers.',
      type: 'VIDEO',
      position: 'pre-roll',
      basePrice: 2000,
      publisherId: videoChannel.id,
      isAvailable: true,
    },
    {
      name: 'Pre-roll Video Ad (30s)',
      description: '30-second non-skippable pre-roll. Premium placement with guaranteed views.',
      type: 'VIDEO',
      position: 'pre-roll',
      basePrice: 3500,
      publisherId: videoChannel.id,
      isAvailable: false, // Already booked
    },
    {
      name: 'Sponsored Integration',
      description: 'In-video sponsored segment (2-3 min). Host demonstrates your product.',
      type: 'VIDEO',
      position: 'integration',
      basePrice: 5000,
      publisherId: videoChannel.id,
      isAvailable: true,
    },
    {
      name: 'End Card Placement',
      description: 'Clickable end card with your branding. Appears in last 20 seconds.',
      type: 'VIDEO',
      position: 'end-card',
      basePrice: 750,
      publisherId: videoChannel.id,
      isAvailable: true,
    },
    {
      name: 'Video Description Link',
      description: 'Prominent link in video description with tracking. All videos for 1 month.',
      type: 'VIDEO',
      position: 'description',
      basePrice: 400,
      publisherId: videoChannel.id,
      isAvailable: true,
    },
    // Startup Insider slots
    {
      name: 'Homepage Takeover',
      description: 'Full homepage takeover for 24 hours. Maximum brand exposure.',
      type: 'DISPLAY',
      position: 'takeover',
      width: 1200,
      height: 600,
      basePrice: 3000,
      publisherId: startupBlog.id,
      isAvailable: true,
    },
    {
      name: 'Sponsored Article',
      description:
        'Native sponsored content piece. Written by our editorial team about your product.',
      type: 'DISPLAY',
      position: 'sponsored-content',
      basePrice: 1500,
      publisherId: startupBlog.id,
      isAvailable: true,
    },
    {
      name: 'Leaderboard Ad',
      description: 'Standard leaderboard placement above the fold. Rotates with other sponsors.',
      type: 'DISPLAY',
      position: 'leaderboard',
      width: 970,
      height: 250,
      basePrice: 600,
      publisherId: startupBlog.id,
      isAvailable: true,
    },
    {
      name: 'Mobile Interstitial',
      description: 'Full-screen mobile interstitial. Shows once per user session.',
      type: 'DISPLAY',
      position: 'interstitial',
      width: 320,
      height: 480,
      basePrice: 400,
      publisherId: startupBlog.id,
      isAvailable: false, // Already booked
    },
  ];

  for (const slot of adSlots) {
    await prisma.adSlot.create({ data: slot });
  }

  // Extra ad slots for demo publisher (devBlog) — for pagination testing
  const adSlotTemplates = [
    { name: 'Homepage Hero', type: 'DISPLAY' as const, basePrice: 600 },
    { name: 'Article Mid-Content', type: 'DISPLAY' as const, basePrice: 280 },
    { name: 'Newsletter Top', type: 'NEWSLETTER' as const, basePrice: 420 },
    { name: 'Sidebar Sticky', type: 'DISPLAY' as const, basePrice: 320 },
    { name: 'Below Fold Banner', type: 'DISPLAY' as const, basePrice: 180 },
    { name: 'Video Pre-roll', type: 'VIDEO' as const, basePrice: 900 },
    { name: 'Sponsored Post', type: 'NATIVE' as const, basePrice: 550 },
    { name: 'Category Page Leaderboard', type: 'DISPLAY' as const, basePrice: 400 },
    { name: 'Search Results Top', type: 'DISPLAY' as const, basePrice: 350 },
    { name: 'Related Articles Widget', type: 'DISPLAY' as const, basePrice: 220 },
    { name: 'Exit Intent Popup', type: 'DISPLAY' as const, basePrice: 380 },
    { name: 'Weekly Digest Featured', type: 'NEWSLETTER' as const, basePrice: 500 },
    { name: 'Podcast Mid-roll', type: 'PODCAST' as const, basePrice: 700 },
    { name: 'In-feed Native', type: 'NATIVE' as const, basePrice: 290 },
    { name: 'Footer CTA Block', type: 'DISPLAY' as const, basePrice: 160 },
  ];
  for (let i = 0; i < adSlotTemplates.length; i++) {
    const t = adSlotTemplates[i];
    await prisma.adSlot.create({
      data: {
        name: t.name,
        description: `Additional slot for pagination testing (${i + 1}).`,
        type: t.type,
        basePrice: t.basePrice,
        publisherId: devBlog.id,
        isAvailable: i % 3 !== 0,
      },
    });
  }

  // Create campaigns for demo sponsor (acme) + techStartup
  await prisma.campaign.create({
    data: {
      name: 'Q1 Product Launch',
      description: 'Launch campaign for our new product',
      budget: 10000,
      spent: 2500,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-31'),
      status: 'ACTIVE',
      targetCategories: ['Technology'],
      targetRegions: ['US'],
      sponsorId: acme.id,
    },
  });

  await prisma.campaign.create({
    data: {
      name: 'Brand Awareness',
      description: 'General brand awareness campaign',
      budget: 5000,
      spent: 0,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-04-30'),
      status: 'DRAFT',
      targetCategories: ['Technology', 'Business'],
      targetRegions: ['US', 'EU'],
      sponsorId: techStartup.id,
    },
  });

  // Extra campaigns for demo sponsor (acme) — for pagination testing
  const campaignNames = [
    'H2 Retargeting',
    'Summer Sale Push',
    'Webinar Promotion',
    'Holiday Campaign',
    'Influencer Partnership',
    'Email List Build',
    'App Install Push',
    'Conference Sponsorship',
    'Podcast Series',
    'LinkedIn Lead Gen',
    'YouTube Pre-roll',
    'Newsletter Takeover',
    'Black Friday Blitz',
    'New Year Launch',
    'Customer Success Stories',
  ];
  const now = new Date();
  for (let i = 0; i < campaignNames.length; i++) {
    const start = new Date(now);
    start.setMonth(start.getMonth() + i);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 2);
    await prisma.campaign.create({
      data: {
        name: campaignNames[i],
        description: `Campaign for pagination testing (${i + 1}).`,
        budget: 3000 + i * 200,
        spent: 0,
        startDate: start,
        endDate: end,
        status: i % 3 === 0 ? 'ACTIVE' : i % 3 === 1 ? 'PAUSED' : 'DRAFT',
        targetCategories: ['Technology'],
        targetRegions: ['US'],
        sponsorId: acme.id,
      },
    });
  }

  console.log('\nPrisma seed completed!');
  console.log(
    '  Created: 2 sponsors, 5 publishers, 35 ad slots (19 for demo publisher), 17 campaigns (16 for demo sponsor)'
  );

  console.log('\n✅ All seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
