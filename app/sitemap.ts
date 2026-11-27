import type { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n';
import { getNews, getResearchAreas } from '@/lib/content';
import { absoluteUrl, localePath } from '@/lib/seo';

/*
  /sitemap.xml — every page in both languages, each listing its other-language
  twin so search engines treat them as one page in two languages. Built at
  build time; new news posts and research areas are picked up automatically.
*/

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [areas, news] = await Promise.all([getResearchAreas(), getNews()]);

  const pages: { path: string; priority: number; lastModified?: string }[] = [
    { path: '', priority: 1 },
    { path: 'research', priority: 0.9 },
    { path: 'publications', priority: 0.9 },
    { path: 'people', priority: 0.8 },
    { path: 'join', priority: 0.8 },
    { path: 'news', priority: 0.7 },
    { path: 'gallery', priority: 0.5 },
    { path: 'about', priority: 0.6 },
    { path: 'contact', priority: 0.6 },
    ...areas.map((a) => ({ path: `research/${a.slug}`, priority: 0.7 })),
    ...news.map((n) => ({
      path: `news/${n.slug}`,
      priority: 0.5,
      lastModified: n.entry.date ?? undefined,
    })),
  ];

  return pages.flatMap(({ path, priority, lastModified }) => {
    const languages = {
      ...Object.fromEntries(
        locales.map((l) => [l, absoluteUrl(localePath(l, path))]),
      ),
      'x-default': absoluteUrl(localePath('en', path)),
    };
    return locales.map((lang) => ({
      url: absoluteUrl(localePath(lang, path)),
      ...(lastModified ? { lastModified } : {}),
      priority,
      alternates: { languages },
    }));
  });
}
