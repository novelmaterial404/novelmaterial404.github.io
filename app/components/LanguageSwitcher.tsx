'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LOCALES = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'zh-Hant', label: '中', full: '中文' },
] as const;

/**
 * Swaps the locale segment while keeping the reader on the same page — going
 * bilingual is useless if it always dumps you back on the home page.
 */
export default function LanguageSwitcher({ current }: { current: string }) {
  const pathname = usePathname() || `/${current}`;

  const pathFor = (locale: string) => {
    const segments = pathname.split('/');
    // segments[0] is '' because the path is absolute; [1] is the locale.
    segments[1] = locale;
    return segments.join('/') || `/${locale}`;
  };

  return (
    <div
      className="flex items-center rounded-full border border-border-subtle p-0.5"
      role="group"
      aria-label="Language"
    >
      {LOCALES.map(({ code, label, full }) => {
        const active = code === current;
        return (
          <Link
            key={code}
            href={pathFor(code)}
            hrefLang={code}
            aria-label={full}
            aria-current={active ? 'true' : undefined}
            className={[
              'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
              active
                ? 'bg-text-strong text-surface'
                : 'text-text-muted hover:text-text-strong',
            ].join(' ')}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
