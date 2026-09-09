import Link from 'next/link';
import type { NavItem } from './SiteHeader';

export default function SiteFooter({
  labName,
  institution,
  note,
  room,
  links,
  items,
}: {
  labName: string;
  institution: string;
  note: string;
  room: string;
  links: readonly { label: string; url: string | null }[];
  items: NavItem[];
}) {
  return (
    <footer className="mt-24 border-t border-border-subtle bg-surface-sunken">
      <div className="spectral-bar h-px w-full opacity-60" />
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <h2 className="font-display text-lg text-text-strong">{labName}</h2>
            <p className="mt-2 max-w-sm text-sm text-text-muted">
              {institution}
            </p>
            {room && (
              <p className="mt-3 text-sm text-text-muted">{room}</p>
            )}
          </div>

          <nav aria-label="Footer">
            <h2 className="text-xs font-semibold tracking-widest text-text-muted uppercase">
              Pages
            </h2>
            <ul className="mt-3 space-y-2">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-text-body transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {links.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold tracking-widest text-text-muted uppercase">
                Elsewhere
              </h2>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.url ?? '#'}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm text-text-body transition-colors hover:text-accent"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {note && (
          <p className="mt-10 border-t border-border-subtle pt-6 text-xs text-text-muted">
            {note}
          </p>
        )}
      </div>
    </footer>
  );
}
