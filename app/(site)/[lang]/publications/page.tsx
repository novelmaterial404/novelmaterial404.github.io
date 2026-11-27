import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PageHeader from '@/app/components/PageHeader';
import PublicationList, {
  type PublicationItem,
} from '@/app/components/PublicationList';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import { getPublications } from '@/lib/content';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/publications'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata({
    lang,
    path: 'publications',
    title: dict.publications.title,
    description: dict.seo.publications,
  });
}

export default async function PublicationsPage({
  params,
}: PageProps<'/[lang]/publications'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, pubs] = await Promise.all([
    getDictionary(lang),
    getPublications(),
  ]);

  // Flattened to plain objects so they cross the server/client boundary.
  const items: PublicationItem[] = pubs.map(({ slug, entry }) => ({
    slug,
    title: entry.title,
    authors: entry.authors ?? '',
    venue: entry.venue ?? '',
    year: entry.year ?? null,
    month: entry.month ?? '',
    volume: entry.volume ?? '',
    pages: entry.pages ?? '',
    doi: entry.doi ?? '',
    url: entry.url ?? null,
    featured: Boolean(entry.featured),
  }));

  return (
    <>
      <PageHeader
        title={dict.publications.title}
        lead={dict.publications.lead}
      />

      <div className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <PublicationList
          items={items}
          labels={{
            all: dict.publications.all,
            filterLabel: dict.publications.filterLabel,
            empty: dict.publications.empty,
            viewPaper: dict.publications.viewPaper,
            count: dict.publications.count,
            countOne: dict.publications.countOne,
          }}
        />
      </div>
    </>
  );
}
