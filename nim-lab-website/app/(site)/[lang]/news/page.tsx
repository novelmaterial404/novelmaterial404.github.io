import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PageHeader from '@/app/components/PageHeader';
import Reveal from '@/app/components/Reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { formatDate, getNews, pick } from '@/lib/content';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/news'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.news.title, description: dict.news.lead };
}

export default async function NewsPage({ params }: PageProps<'/[lang]/news'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, news] = await Promise.all([getDictionary(lang), getNews()]);

  return (
    <>
      <PageHeader title={dict.news.title} lead={dict.news.lead} />

      <div className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        {news.length === 0 ? (
          <p className="text-text-muted">{dict.news.empty}</p>
        ) : (
          <ol className="space-y-5">
            {news.map((item, i) => {
              const title =
                lang === 'zh-Hant' && item.entry.titleZhHant
                  ? item.entry.titleZhHant
                  : item.entry.title;

              return (
                <Reveal key={item.slug} delay={i * 60}>
                  <li>
                    <Link
                      href={`/${lang}/news/${item.slug}`}
                      className="film-card grid gap-5 rounded-xl p-6 sm:grid-cols-[minmax(0,1fr)_auto]"
                    >
                      <div>
                        <time
                          dateTime={item.entry.date ?? undefined}
                          className="text-xs tracking-wide text-text-muted"
                        >
                          {formatDate(item.entry.date, lang)}
                        </time>
                        <h2 className="mt-1.5 font-display text-xl leading-snug text-balance">
                          {title}
                        </h2>
                        <p className="mt-2 leading-relaxed text-text-muted">
                          {pick(item.entry.summary, lang)}
                        </p>
                        <span className="mt-3 inline-block text-sm font-medium text-accent">
                          {dict.common.readMore} →
                        </span>
                      </div>

                      {item.entry.image && (
                        <Image
                          src={item.entry.image}
                          alt=""
                          width={180}
                          height={120}
                          className="rounded-lg object-cover sm:w-[180px]"
                        />
                      )}
                    </Link>
                  </li>
                </Reveal>
              );
            })}
          </ol>
        )}
      </div>
    </>
  );
}
