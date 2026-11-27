import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PageHeader from '@/app/components/PageHeader';
import Reveal from '@/app/components/Reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { pick, reader, renderLocalisedBody } from '@/lib/content';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/join'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const page = await reader.singletons.join.read();
  const dict = await getDictionary(lang);
  return pageMetadata({
    lang,
    path: 'join',
    title: pick(page?.heading, lang) || dict.join.title,
    description: dict.seo.join,
  });
}

export default async function JoinPage({ params }: PageProps<'/[lang]/join'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, page] = await Promise.all([
    getDictionary(lang),
    reader.singletons.join.read(),
  ]);

  const body = await renderLocalisedBody(page?.body, page?.bodyZhHant, lang);
  const openings = page?.openings ?? [];

  return (
    <>
      <PageHeader
        title={pick(page?.heading, lang) || dict.join.title}
        lead={pick(page?.intro, lang)}
      />

      <div className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        {openings.length > 0 && (
          <ul className="space-y-5">
            {openings.map((opening, i) => (
              <Reveal key={i} delay={i * 70}>
                <li className="film-card rounded-xl p-6 sm:p-7">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-xl">
                      {pick(opening.title, lang)}
                    </h2>
                    <span
                      className={[
                        'rounded-full px-2.5 py-1 text-xs font-medium',
                        opening.open
                          ? 'bg-spectral-teal/15 text-spectral-teal'
                          : 'border border-border-subtle text-text-muted',
                      ].join(' ')}
                    >
                      {opening.open
                        ? dict.join.recruiting
                        : dict.join.notRecruiting}
                    </span>
                  </div>
                  <p className="mt-3 leading-relaxed text-text-muted">
                    {pick(opening.detail, lang)}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
        )}

        {body && (
          <Reveal delay={120}>
            <div className="prose-lab mt-12 max-w-2xl">{body}</div>
          </Reveal>
        )}
      </div>
    </>
  );
}
