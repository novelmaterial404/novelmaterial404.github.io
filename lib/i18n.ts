import 'server-only';

export const locales = ['en', 'zh-Hant'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** Human-readable names, each written in its own language. */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  'zh-Hant': '中文',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((m) => m.default),
  'zh-Hant': () => import('@/dictionaries/zh-Hant.json').then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)['en']>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]() as Promise<Dictionary>;
}
