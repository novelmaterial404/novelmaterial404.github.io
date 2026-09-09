import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PageHeader from '@/app/components/PageHeader';
import Reveal from '@/app/components/Reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { getResearchAreas, pick } from '@/lib/content';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/research'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.research.title, description: dict.research.lead };
}

export default async function ResearchPage({
  params,
}: PageProps<'/[lang]/research'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, areas] = await Promise.all([
    getDictionary(lang),
    getResearchAreas(),
  ]);

  return (
    <>
      <PageHeader title={dict.research.title} lead={dict.research.lead} />

      <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <div className="space-y-5">
          {areas.map((area, i) => {
            const title =
              lang === 'zh-Hant' && area.entry.titleZhHant
                ? area.entry.titleZhHant
                : area.entry.title;

            return (
              <Reveal key={area.slug} delay={i * 60}>
                <Link
                  href={`/${lang}/research/${area.slug}`}
                  className="film-card group grid gap-6 rounded-xl p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:p-8"
                >
                  <span className="spectral-text font-mono text-sm font-semibold sm:pt-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                    <div>
                      <h2 className="font-display text-2xl leading-snug text-balance">
                        {title}
                      </h2>
                      <p className="mt-3 max-w-2xl leading-relaxed text-text-muted">
                        {pick(area.entry.summary, lang)}
                      </p>
                      <span className="mt-4 inline-block text-sm font-medium text-accent">
                        {dict.common.readMore} →
                      </span>
                    </div>

                    {area.entry.figure && (
                      <Image
                        src={area.entry.figure}
                        alt=""
                        width={220}
                        height={150}
                        className="rounded-lg object-cover md:w-[220px]"
                      />
                    )}
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </>
  );
}
