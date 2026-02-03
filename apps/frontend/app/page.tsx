import Link from 'next/link';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3847';

export const metadata = {
  title: 'Anvara — Sponsorship Marketplace | Connect Sponsors & Publishers',
  description:
    'Reach your audience. List ad slots, run campaigns, and connect sponsors with publishers. Simple, transparent, and built for scale.',
  openGraph: {
    title: 'Anvara — Sponsorship Marketplace',
    description:
      'Reach your audience. List ad slots, run campaigns, and connect sponsors with publishers.',
    url: SITE_URL,
    siteName: 'Anvara',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anvara — Sponsorship Marketplace',
    description:
      'Reach your audience. List ad slots, run campaigns, and connect sponsors with publishers.',
  },
};

export default function Home() {
  return (
    <article>
      {/* Hero */}
      <section className="py-16 text-center md:py-24">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-[--color-foreground] md:text-5xl lg:text-6xl">
          Connect with the right audiences
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-[--color-muted] md:text-xl">
          The sponsorship marketplace where sponsors run campaigns and publishers monetize their
          inventory. Simple, transparent, and built for scale.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="min-h-[44px] w-full rounded-lg bg-[--color-primary] px-8 py-3 text-center font-semibold text-white hover:bg-[--color-primary-hover] sm:w-auto"
          >
            Get Started
          </Link>
          <Link
            href="/marketplace"
            className="min-h-[44px] w-full rounded-lg border-2 border-[--color-border] px-8 py-3 text-center font-semibold text-[--color-foreground] hover:border-[--color-primary] hover:bg-[--color-primary]/5 sm:w-auto"
          >
            Browse Marketplace
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[--color-border] py-16 md:py-20" aria-labelledby="features-heading">
        <h2 id="features-heading" className="mb-10 text-center text-2xl font-bold text-[--color-foreground] md:text-3xl">
          Built for both sides
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[--color-border] bg-[--color-background] p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 text-3xl" aria-hidden>📢</div>
            <h3 className="mb-2 text-lg font-semibold text-[--color-primary]">For Sponsors</h3>
            <p className="text-sm text-[--color-muted]">
              Create campaigns, set budgets, and reach your target audience through premium
              publishers. Book placements or request custom quotes.
            </p>
          </div>
          <div className="rounded-xl border border-[--color-border] bg-[--color-background] p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 text-3xl" aria-hidden>📺</div>
            <h3 className="mb-2 text-lg font-semibold text-[--color-secondary]">For Publishers</h3>
            <p className="text-sm text-[--color-muted]">
              List your ad slots, set your rates, and connect with sponsors looking for your
              audience. Display, video, newsletter, and podcast inventory.
            </p>
          </div>
          <div className="rounded-xl border border-[--color-border] bg-[--color-background] p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 text-3xl" aria-hidden>🔍</div>
            <h3 className="mb-2 text-lg font-semibold text-[--color-foreground]">Discover</h3>
            <p className="text-sm text-[--color-muted]">
              Browse the marketplace by type, price, and availability. Filter and find the right
              fit for your campaign or inventory.
            </p>
          </div>
          <div className="rounded-xl border border-[--color-border] bg-[--color-background] p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 text-3xl" aria-hidden>🤝</div>
            <h3 className="mb-2 text-lg font-semibold text-[--color-foreground]">Transparent</h3>
            <p className="text-sm text-[--color-muted]">
              Clear pricing, direct communication, and straightforward booking. No hidden fees.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-[--color-border] py-16 md:py-20" aria-labelledby="how-heading">
        <h2 id="how-heading" className="mb-10 text-center text-2xl font-bold text-[--color-foreground] md:text-3xl">
          How it works
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[--color-primary] text-xl font-bold text-white" aria-hidden>1</div>
            <h3 className="mb-2 font-semibold text-[--color-foreground]">Sign up</h3>
            <p className="text-sm text-[--color-muted]">
              Create an account as a sponsor or publisher. Get access to your dashboard in seconds.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[--color-primary] text-xl font-bold text-white" aria-hidden>2</div>
            <h3 className="mb-2 font-semibold text-[--color-foreground]">Browse or list</h3>
            <p className="text-sm text-[--color-muted]">
              Sponsors browse ad slots; publishers create listings. Set budgets, rates, and goals.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[--color-primary] text-xl font-bold text-white" aria-hidden>3</div>
            <h3 className="mb-2 font-semibold text-[--color-foreground]">Connect</h3>
            <p className="text-sm text-[--color-muted]">
              Book placements or request quotes. Campaigns go live; publishers get paid. Simple.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-[--color-border] py-16 md:py-20" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[--color-border] bg-[--color-primary]/5 p-8 text-center md:p-12">
          <h2 id="cta-heading" className="mb-3 text-2xl font-bold text-[--color-foreground] md:text-3xl">
            Ready to get started?
          </h2>
          <p className="mb-6 text-[--color-muted]">
            Join sponsors and publishers who use Anvara to reach the right audiences.
          </p>
          <Link
            href="/login"
            className="inline-block min-h-[44px] rounded-lg bg-[--color-primary] px-8 py-3 font-semibold text-white hover:bg-[--color-primary-hover]"
          >
            Sign up free
          </Link>
        </div>
      </section>
    </article>
  );
}
