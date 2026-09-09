import Link from 'next/link';
import { notFound } from 'next/navigation';
import InterferenceField from '@/app/components/InterferenceField';
import Reveal from '@/app/components/Reveal';
import { getDictionary, isLocale } from '@/lib/i18n';
import {
  formatDate,
  getNews,
  getPublications,
  getResearchAreas,
  pick,
  renderLocalisedBody,
  reader,
} from '@/lib/content';

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, home, areas, pubs, news] = await Promise.all([
    getDictionary(lang),
    reader.singletons.home.read(),
    getResearchAreas(),
    getPublications(),
    getNews(),
  ]);

  const intro = await renderLocalisedBody(
    home?.intro,
    home?.introZhHant,
    lang,
  );

  const featured = pubs.filter((p) => p.entry.featured).slice(0, 4);
  const latest = news.slice(0, 3);
  const highlights = home?.highlights ?? [];

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative isolate overflow-hidden bg-ink-900">
        <InterferenceField />
        {/* Keeps the headline legible over whatever the film is doing. */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/70 to-ink-900/40" />

        <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32 lg:py-40">
          <Reveal>
            <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-cream-300/70 uppercase">
              National Taiwan University
            </p>
            <h1 className="max-w-4xl font-display text-4xl leading-[1.08] text-cream-50 text-balance sm:text-6xl lg:text-7xl">
              {pick(home?.heroHeading, lang)}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream-200/85 text-pretty sm:text-xl">
              {pick(home?.heroSubheading, lang)}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href={`/${lang}/research`}
                className="rounded-full bg-cream-50 px-6 py-3 text-sm font-medium text-ink-900 transition-transform hover:-translate-y-0.5"
              >
                {dict.home.exploreResearch}
              </Link>
              <Link
                href={`/${lang}/join`}
                className="rounded-full border border-cream-300/30 px-6 py-3 text-sm font-medium text-cream-100 transition-colors hover:border-cream-300/70"
              >
                {dict.home.joinTheLab}
              </Link>
            </div>
          </Reveal>

          {highlights.length > 0 && (
            <Reveal delay={120}>
              <dl className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-cream-300/15 pt-8">
                {highlights.map((h, i) => (
                  <div key={i}>
                    <dt className="font-display text-3xl text-cream-50 sm:text-4xl">
                      {pick(h.value, lang)}
                    </dt>
                    <dd className="mt-1 text-xs tracking-wide text-cream-200/60 sm:text-sm">
                      {pick(h.label, lang)}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}
        </div>

        <div className="spectral-bar h-1 w-full" />
      </section>

      {/* --------------------------------------------------------- intro */}
      {intro && (
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16">
            <Reveal>
              <h2 className="font-display text-2xl sm:text-3xl">
                {pick(home?.introHeading, lang)}
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <div className="prose-lab max-w-2xl">{intro}</div>
              <Link
                href={`/${lang}/about`}
                className="mt-6 inline-block text-sm font-medium text-accent hover:underline"
              >
                {dict.common.readMore} →
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------ research */}
      {areas.length > 0 && (
        <section className="bg-surface-sunken py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl">
                    {dict.home.researchHeading}
                  </h2>
                  <p className="mt-2 max-w-xl text-text-muted">
                    {dict.home.researchLead}
                  </p>
                </div>
                <Link
                  href={`/${lang}/research`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  {dict.common.viewAll} →
                </Link>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {areas.map((area, i) => (
                <Reveal key={area.slug} delay={i * 70}>
                  <Link
                    href={`/${lang}/research/${area.slug}`}
                    className="film-card group block h-full rounded-xl p-6"
                  >
                    <span className="spectral-text font-mono text-xs font-semibold">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-3 font-display text-xl leading-snug">
                      {lang === 'zh-Hant' && area.entry.titleZhHant
                        ? area.entry.titleZhHant
                        : area.entry.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-text-muted">
                      {pick(area.entry.summary, lang)}
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* -------------------------------------------------- publications */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-2xl sm:text-3xl">
                {dict.home.selectedPublications}
              </h2>
              <Link
                href={`/${lang}/publications`}
                className="text-sm font-medium text-accent hover:underline"
              >
                {dict.common.viewAll} →
              </Link>
            </div>
          </Reveal>

          <ol className="mt-8 space-y-px">
            {featured.map((pub, i) => (
              <Reveal key={pub.slug} delay={i * 60}>
                <li className="group border-b border-border-subtle py-5">
                  <p className="font-display text-lg leading-snug text-text-strong">
                    {pub.entry.title}
                  </p>
                  <p className="mt-1.5 text-sm text-text-muted">
                    <span className="italic">{pub.entry.venue}</span>
                    {pub.entry.year ? ` · ${pub.entry.year}` : ''}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>
      )}

      {/* ----------------------------------------------------------- news */}
      {latest.length > 0 && (
        <section className="bg-surface-sunken py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="font-display text-2xl sm:text-3xl">
                  {dict.home.latestNews}
                </h2>
                <Link
                  href={`/${lang}/news`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  {dict.common.viewAll} →
                </Link>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {latest.map((item, i) => (
                <Reveal key={item.slug} delay={i * 70}>
                  <Link
                    href={`/${lang}/news/${item.slug}`}
                    className="film-card block h-full rounded-xl p-6"
                  >
                    <time
                      dateTime={item.entry.date ?? undefined}
                      className="text-xs tracking-wide text-text-muted"
                    >
                      {formatDate(item.entry.date, lang)}
                    </time>
                    <h3 className="mt-2 font-display text-lg leading-snug">
                      {lang === 'zh-Hant' && item.entry.titleZhHant
                        ? item.entry.titleZhHant
                        : item.entry.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">
                      {pick(item.entry.summary, lang)}
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
