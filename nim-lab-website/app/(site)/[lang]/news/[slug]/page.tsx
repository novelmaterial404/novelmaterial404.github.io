import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Reveal from '@/app/components/Reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import {
  formatDate,
  getNews,
  pick,
  reader,
  renderLocalisedBody,
} from '@/lib/content';

export async function generateStaticParams() {
  const news = await getNews();
  return locales.flatMap((lang) =>
    news.map((item) => ({ lang, slug: item.slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/news/[slug]'>): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const item = await reader.collections.news.read(slug);
  if (!item) return {};
  const title =
    lang === 'zh-Hant' && item.titleZhHant ? item.titleZhHant : item.title;
  return { title, description: pick(item.summary, lang) };
}

export default async function NewsItemPage({
  params,
}: PageProps<'/[lang]/news/[slug]'>) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, item] = await Promise.all([
    getDictionary(lang),
    reader.collections.news.read(slug),
  ]);
  if (!item) notFound();

  const body = await renderLocalisedBody(item.body, item.bodyZhHant, lang);
  const title =
    lang === 'zh-Hant' && item.titleZhHant ? item.titleZhHant : item.title;

  return (
    <article className="mx-auto max-w-3xl px-5 pt-14 pb-24 sm:px-8 sm:pt-20">
      <Reveal>
        <Link
          href={`/${lang}/news`}
          className="text-sm text-text-muted transition-colors hover:text-accent"
        >
          ← {dict.news.title}
        </Link>

        <time
          dateTime={item.date ?? undefined}
          className="mt-6 block text-sm tracking-wide text-text-muted"
        >
          {formatDate(item.date, lang)}
        </time>

        <h1 className="mt-2 font-display text-4xl leading-[1.12] text-balance sm:text-[2.75rem]">
          {title}
        </h1>

        {pick(item.summary, lang) && (
          <p className="mt-5 text-lg leading-relaxed text-text-muted text-pretty">
            {pick(item.summary, lang)}
          </p>
        )}

        <div className="spectral-rule mt-10" />
      </Reveal>

      {item.image && (
        <Reveal delay={80}>
          <Image
            src={item.image}
            alt=""
            width={1200}
            height={700}
            className="mt-10 w-full rounded-xl border border-border-subtle object-cover"
          />
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
