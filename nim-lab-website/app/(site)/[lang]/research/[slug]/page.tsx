import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Reveal from '@/app/components/Reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import {
  getResearchAreas,
  pick,
  reader,
  renderLocalisedBody,
} from '@/lib/content';

export async function generateStaticParams() {
  const areas = await getResearchAreas();
  return locales.flatMap((lang) =>
    areas.map((area) => ({ lang, slug: area.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/research/[slug]'>): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const area = await reader.collections.research.read(slug);
  if (!area) return {};
  const title =
    lang === 'zh-Hant' && area.titleZhHant ? area.titleZhHant : area.title;
  return { title, description: pick(area.summary, lang) };
}

export default async function ResearchAreaPage({
  params,
}: PageProps<'/[lang]/research/[slug]'>) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, area] = await Promise.all([
    getDictionary(lang),
    reader.collections.research.read(slug),
  ]);
  if (!area) notFound();

  const body = await renderLocalisedBody(area.body, area.bodyZhHant, lang);
  const title =
    lang === 'zh-Hant' && area.titleZhHant ? area.titleZhHant : area.title;

  return (
    <article className="mx-auto max-w-3xl px-5 pt-14 pb-24 sm:px-8 sm:pt-20">
      <Reveal>
        <Link
          href={`/${lang}/research`}
          className="text-sm text-text-muted transition-colors hover:text-accent"
        >
          ← {dict.research.backToResearch}
        </Link>

        <h1 className="mt-6 font-display text-4xl leading-[1.12] text-balance sm:text-5xl">
          {title}
        </h1>

        <p className="mt-5 text-lg leading-relaxed text-text-muted text-pretty">
          {pick(area.summary, lang)}
        </p>

        <div className="spectral-rule mt-10" />
      </Reveal>

      {area.figure && (
        <Reveal delay={80}>
          <figure className="mt-10">
            <Image
              src={area.figure}
              alt={pick(area.figureCaption, lang)}
              width={1200}
              height={700}
              className="w-full rounded-xl border border-border-subtle object-cover"
            />
            {pick(area.figureCaption, lang) && (
              <figcaption className="mt-3 text-sm text-text-muted">
                {pick(area.figureCaption, lang)}
              </figcaption>
            )}
          </figure>
        </Reveal>
      )}

      {body && (
        <Reveal delay={120}>
          <div className="prose-lab mt-10">{body}</div>
        </Reveal>
      )}
    </article>
  );
}
