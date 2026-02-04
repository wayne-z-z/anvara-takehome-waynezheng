'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/auth-client';

type UserRole = 'sponsor' | 'publisher' | null;

const linkBase =
  'block min-h-[44px] min-w-[44px] py-3 text-[--color-muted] hover:text-[--color-foreground] md:py-0 md:min-h-0 md:min-w-0';

function activeClass(pathname: string, href: string) {
  const isActive =
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
  return isActive ? 'font-semibold text-[--color-foreground]' : '';
}

export function Nav() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [role, setRole] = useState<UserRole>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/auth/role/${user.id}`
      )
        .then((res) => res.json())
        .then((data) => setRole(data.role))
        .catch(() => setRole(null));
    } else {
      queueMicrotask(() => setRole(null));
    }
  }, [user?.id]);

  // Close mobile menu on route change
  useEffect(() => {
    queueMicrotask(() => setMenuOpen(false));
  }, [pathname]);

  return (
    <header className="border-b border-[--color-border]">
      <nav className="mx-auto max-w-6xl px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="min-h-[44px] min-w-[44px] flex items-center text-xl font-bold text-[--color-primary] md:min-h-0 md:min-w-0"
          >
            Anvara
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/marketplace"
              className={`${linkBase} ${activeClass(pathname ?? '', '/marketplace')}`}
            >
              Marketplace
            </Link>
            {user && role === 'sponsor' && (
              <Link
                href="/dashboard/sponsor"
                className={`${linkBase} ${activeClass(pathname ?? '', '/dashboard/sponsor')}`}
              >
                My Campaigns
              </Link>
            )}
            {user && role === 'publisher' && (
              <Link
                href="/dashboard/publisher"
                className={`${linkBase} ${activeClass(pathname ?? '', '/dashboard/publisher')}`}
              >
                My Ad Slots
              </Link>
            )}
            {isPending ? (
              <span className="text-[--color-muted]">...</span>
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-[--color-muted]">
                  {user.name} {role && `(${role})`}
                </span>
                <button
                  onClick={async () => {
                    await authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          window.location.href = '/';
                        },
                      },
                    });
                  }}
                  className="min-h-[44px] rounded bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-500 md:min-h-[36px]"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`${linkBase} flex items-center rounded bg-[--color-primary] px-4 text-white hover:bg-[--color-primary-hover] ${activeClass(pathname ?? '', '/login')}`}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-[--color-muted] hover:bg-gray-100 hover:text-[--color-foreground] md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? (
              <span className="text-2xl" aria-hidden>
                ✕
              </span>
            ) : (
              <span className="text-2xl" aria-hidden>
                ☰
              </span>
            )}
          </button>
        </div>

        {/* Mobile menu panel */}
        {menuOpen && (
          <div
            className="mt-2 border-t border-[--color-border] pt-2 md:hidden"
            role="dialog"
            aria-label="Mobile menu"
          >
            <div className="flex flex-col gap-1">
              <Link
                href="/marketplace"
                className={`${linkBase} rounded px-2 ${activeClass(pathname ?? '', '/marketplace')}`}
              >
                Marketplace
              </Link>
              {user && role === 'sponsor' && (
                <Link
                  href="/dashboard/sponsor"
                  className={`${linkBase} rounded px-2 ${activeClass(pathname ?? '', '/dashboard/sponsor')}`}
                >
                  My Campaigns
                </Link>
              )}
              {user && role === 'publisher' && (
                <Link
                  href="/dashboard/publisher"
                  className={`${linkBase} rounded px-2 ${activeClass(pathname ?? '', '/dashboard/publisher')}`}
                >
                  My Ad Slots
                </Link>
              )}
              {isPending ? (
                <span className="py-3 text-[--color-muted]">...</span>
              ) : user ? (
                <div className="flex flex-col gap-1 border-t border-[--color-border] pt-2">
                  <span className="px-2 py-2 text-sm text-[--color-muted]">
                    {user.name} {role && `(${role})`}
                  </span>
                  <button
                    onClick={async () => {
                      await authClient.signOut({
                        fetchOptions: {
                          onSuccess: () => {
                            window.location.href = '/';
                          },
                        },
                      });
                    }}
                    className="min-h-[44px] text-left rounded px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`${linkBase} rounded px-4 font-medium text-[--color-primary] ${activeClass(pathname ?? '', '/login')}`}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
