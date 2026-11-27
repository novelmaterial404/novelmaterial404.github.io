import 'server-only';
import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/i18n';
import { getSettings, pick, reader } from '@/lib/content';

/*
  Search-engine and social metadata shared by every page.

  Each page calls pageMetadata() with its own path, so that:
  - its canonical URL is itself (not the language home page),
  - hreflang links pair the English and Chinese versions of the same page,
    with English as the x-default,
  - Open Graph / Twitter cards carry the right URL, title, description and
    share image (Next replaces, rather than merges, a parent's openGraph, so
    every field is set here).
*/

/** Full site address including any base path, without a trailing slash. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

/** `/en/research/`-style path for a locale and a page path like `research`. */
export function localePath(lang: Locale, path = ''): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return `/${lang}/${clean ? `${clean}/` : ''}`;
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

export const SHARE_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
} as const;

/* ------------------------------------------------------- structured data */

const NTU = {
  '@type': 'CollegeOrUniversity',
  name: 'National Taiwan University',
  alternateName: '國立臺灣大學',
  url: 'https://www.ntu.edu.tw/',
};

export const LAB_ID = `${SITE_URL}/#lab`;
export const PI_ID = `${SITE_URL}/#pi`;

/** The lab as a research organization, plus the website itself. */
export async function labStructuredData(lang: Locale) {
  const [settings, contact] = await Promise.all([
    getSettings(),
    reader.singletons.contact.read(),
  ]);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: absoluteUrl(localePath(lang)),
        name: pick(settings?.labName, lang),
        alternateName: pick(settings?.labName, lang === 'en' ? 'zh-Hant' : 'en'),
        inLanguage: lang,
        publisher: { '@id': LAB_ID },
      },
      {
        '@type': 'ResearchOrganization',
        '@id': LAB_ID,
        name: settings?.labName?.en,
        alternateName: [settings?.labName?.zhHant, 'NIM Lab'].filter(Boolean),
        description: pick(settings?.tagline, lang),
        url: absoluteUrl(localePath(lang)),
        logo: absoluteUrl('/apple-icon.png'),
        image: absoluteUrl(SHARE_IMAGE.url),
        foundingDate: '2025-08',
        founder: { '@id': PI_ID },
        parentOrganization: {
          '@type': 'EducationalOrganization',
          name: 'Graduate Institute of Photonics and Optoelectronics',
          alternateName: '國立臺灣大學光電工程學研究所',
          url: 'https://gipo.ntu.edu.tw/',
          parentOrganization: NTU,
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: `${pick(contact?.labRoom, 'en')}, No. 1, Sec. 4, Roosevelt Rd., Da'an District`,
          addressLocality: 'Taipei',
          postalCode: '10617',
          addressCountry: 'TW',
        },
        ...(contact?.phone ? { telephone: contact.phone } : {}),
        sameAs: (settings?.links ?? [])
          .map((l) => l.url)
          .filter((u): u is string => !!u && !u.endsWith('ntu.edu.tw/')),
      },
    ],
  };
}

/** A person on the People page (used for the PI). */
export function personStructuredData(
  person: {
    name: string;
    nameZhHant?: string | null;
    photo?: string | null;
    title?: { en: string; zhHant: string } | null;
    interests?: readonly { en: string; zhHant: string }[] | null;
    links?: readonly { url?: string | null }[] | null;
  },
  lang: Locale,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PI_ID,
    name: person.name,
    ...(person.nameZhHant ? { alternateName: person.nameZhHant } : {}),
    jobTitle: pick(person.title, lang),
    ...(person.photo ? { image: absoluteUrl(person.photo) } : {}),
    url: absoluteUrl(localePath(lang, 'people')),
    worksFor: { '@id': LAB_ID },
    affiliation: NTU,
    knowsAbout: (person.interests ?? []).map((i) => pick(i, lang)),
    sameAs: (person.links ?? [])
      .map((l) => l.url)
      .filter((u): u is string => !!u),
  };
}

export async function pageMetadata({
  lang,
  path = '',
  title,
  description,
  absoluteTitle,
  type = 'website',
}: {
  lang: Locale;
  /** Page path without the locale, e.g. `research/ultrafast-spectroscopy`. */
  path?: string;
  /** Page title; the layout's template appends the lab name. */
  title?: string;
  description?: string;
  /** Use this exact title instead of the template (the home page). */
  absoluteTitle?: string;
  type?: 'website' | 'article';
}): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = pick(settings?.labName, lang) || 'Novel Inorganic Materials Lab';
  const fullTitle = absoluteTitle ?? (title ? `${title} · ${siteName}` : siteName);
  const desc = description || pick(settings?.tagline, lang);
  const url = localePath(lang, path);

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description: desc,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, localePath(l, path)])),
        'x-default': localePath('en', path),
      },
    },
    openGraph: {
      type,
      url,
      title: fullTitle,
      description: desc,
      siteName,
      locale: lang === 'zh-Hant' ? 'zh_TW' : 'en_US',
      alternateLocale: lang === 'zh-Hant' ? ['en_US'] : ['zh_TW'],
      images: [{ ...SHARE_IMAGE, alt: siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [SHARE_IMAGE.url],
    },
  };
}
