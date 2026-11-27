'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

export type NavItem = { href: string; label: string };

export default function SiteHeader({
  locale,
  labName,
  institution,
  items,
  menuLabel,
  themeLabel,
}: {
  locale: string;
  labName: string;
  institution: string;
  items: NavItem[];
  menuLabel: string;
  themeLabel: string;
}) {
  const pathname = usePathname() || '';
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation, otherwise it stays open over the new
  // page — the header persists across route changes, so it never unmounts.
  // Adjusted during render rather than in an effect: React re-runs the render
  // immediately without the extra commit and cascading repaint an effect costs.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link href={`/${locale}`} className="group min-w-0">
          <span className="block truncate font-display text-[15px] leading-tight font-medium text-text-strong sm:text-base">
            {labName}
          </span>
          <span className="mt-0.5 hidden truncate text-[11px] text-text-muted sm:block">
            {institution}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={[
                      'relative block rounded-md px-2.5 py-2 text-sm whitespace-nowrap transition-colors xl:px-3',
                      isActive(item.href)
                        ? 'text-text-strong'
                        : 'text-text-muted hover:text-text-strong',
                    ].join(' ')}
                  >
                    {item.label}
                    {isActive(item.href) && (
                      <span className="spectral-bar absolute inset-x-2.5 -bottom-px h-0.5 rounded-full xl:inset-x-3" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <LanguageSwitcher current={locale} />
          <ThemeToggle label={themeLabel} />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="rounded-md border border-border-subtle p-2 text-text-body lg:hidden"
          >
            <span className="sr-only">{menuLabel}</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              {open ? (
                <path
                  d="M4 4l10 10M14 4L4 14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M2.5 5h13M2.5 9h13M2.5 13h13"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-t border-border-subtle bg-surface lg:hidden"
        >
          <ul className="mx-auto max-w-6xl px-5 py-2 sm:px-8">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={[
                    'block border-b border-border-subtle/60 py-3 text-sm last:border-0',
                    isActive(item.href)
                      ? 'text-text-strong'
                      : 'text-text-muted',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
