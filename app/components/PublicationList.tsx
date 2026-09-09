'use client';

import { useMemo, useState, type ReactNode } from 'react';

export type PublicationItem = {
  slug: string;
  title: string;
  authors: string;
  venue: string;
  year: number | null;
  month: string;
  volume: string;
  pages: string;
  doi: string;
  url: string | null;
  featured: boolean;
};

/**
 * Renders the `**Name**` emphasis used in author strings to mark lab members.
 * Deliberately handles only bold — author lists never need more than that, and
 * a full Markdown parser here would be a needless dependency and a bigger
 * surface for content to break the layout.
 */
function renderAuthors(authors: string): ReactNode {
  return authors.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-text-strong">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

export default function PublicationList({
  items,
  labels,
}: {
  items: PublicationItem[];
  labels: {
    all: string;
    filterLabel: string;
    empty: string;
    viewPaper: string;
    count: string;
    countOne: string;
  };
}) {
  const [year, setYear] = useState<number | 'all'>('all');

  const years = useMemo(
    () =>
      [...new Set(items.map((i) => i.year).filter((y): y is number => !!y))].sort(
        (a, b) => b - a,
      ),
    [items],
  );

  const shown = year === 'all' ? items : items.filter((i) => i.year === year);

  const countLabel =
    shown.length === 1
      ? labels.countOne
      : labels.count.replace('{n}', String(shown.length));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="sr-only" id="year-filter-label">
          {labels.filterLabel}
        </span>
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-labelledby="year-filter-label"
        >
          <FilterChip
            active={year === 'all'}
            onClick={() => setYear('all')}
            label={labels.all}
          />
          {years.map((y) => (
            <FilterChip
              key={y}
              active={year === y}
              onClick={() => setYear(y)}
              label={String(y)}
            />
          ))}
        </div>
      </div>

      <p className="mt-5 text-sm text-text-muted" aria-live="polite">
        {countLabel}
      </p>

      {shown.length === 0 ? (
        <p className="mt-8 text-text-muted">{labels.empty}</p>
      ) : (
        <ol className="mt-4">
          {shown.map((pub) => {
            const href =
              pub.url || (pub.doi ? `https://doi.org/${pub.doi}` : null);

            return (
              <li
                key={pub.slug}
                className="border-b border-border-subtle py-6 last:border-0"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-xs text-text-muted">
                    {pub.year}
                  </span>
                  {pub.featured && (
                    <span className="spectral-text font-mono text-[10px] font-semibold tracking-widest uppercase">
                      Selected
                    </span>
                  )}
                </div>

                <h3 className="mt-1.5 font-display text-lg leading-snug text-text-strong text-pretty">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="transition-colors hover:text-accent"
                    >
                      {pub.title}
                    </a>
                  ) : (
                    pub.title
                  )}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {renderAuthors(pub.authors)}
                </p>

                <p className="mt-1.5 text-sm text-text-muted">
                  <span className="italic">{pub.venue}</span>
                  {pub.volume && <>, {pub.volume}</>}
                  {pub.pages && <>, {pub.pages}</>}
                  {pub.month && <>, {pub.month}</>}
                  {pub.year && <> {pub.year}</>}
                </p>

                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
                  >
                    {labels.viewPaper} →
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-transparent bg-text-strong text-surface'
          : 'border-border-subtle text-text-muted hover:text-text-strong',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
