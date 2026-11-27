import type { Metadata } from 'next';
import { ViewTransition } from 'react';
import { Spectral, Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import SiteHeader, { type NavItem } from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';
import { getDictionary, isLocale, locales, type Locale } from '@/lib/i18n';
import { getSettings, pick, reader } from '@/lib/content';
import { SITE_URL } from '@/lib/seo';
import '../../globals.css';

/*
  Latin type is served by next/font. Chinese deliberately falls back to the
  reader's system face (PingFang TC on Apple, Microsoft JhengHei on Windows,
  Noto Sans CJK elsewhere) — a webfont with full CJK coverage is several
  megabytes, and the system faces are excellent and instant.
*/
const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-spectral',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});


export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const settings = await getSettings();

  const name = pick(settings?.labName, lang) || 'Novel Inorganic Materials Lab';
  const tagline = pick(settings?.tagline, lang);
  const institution = pick(settings?.institution, lang);

  // Canonical, hreflang and social cards are set per page by pageMetadata()
  // in lib/seo.ts — setting them here would give every page the home page's.
  return {
    metadataBase: new URL(`${SITE_URL}/`),
    title: { default: name, template: `%s · ${name}` },
    description: tagline || institution,
    applicationName: name,
    authors: [{ name: lang === 'zh-Hant' ? '黃奕騰' : 'Yi-Teng Huang' }],
    formatDetection: { telephone: false, email: false, address: false },
  };
}

function navItems(lang: Locale, dict: { nav: Record<string, string> }): NavItem[] {
  return [
    { href: `/${lang}/research`, label: dict.nav.research },
    { href: `/${lang}/publications`, label: dict.nav.publications },
    { href: `/${lang}/people`, label: dict.nav.people },
    { href: `/${lang}/gallery`, label: dict.nav.gallery },
    { href: `/${lang}/news`, label: dict.nav.news },
    { href: `/${lang}/join`, label: dict.nav.join },
    { href: `/${lang}/contact`, label: dict.nav.contact },
  ];
}

export default async function SiteLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, settings, contact] = await Promise.all([
    getDictionary(lang),
    getSettings(),
    reader.singletons.contact.read(),
  ]);

  const items = navItems(lang, dict);
  const labName = pick(settings?.labName, lang) || 'Novel Inorganic Materials Lab';
  const institution = pick(settings?.institution, lang);

  return (
    <html
      lang={lang}
      data-scroll-behavior="smooth"
      className={`${spectral.variable} ${inter.variable}`}
      // The inline script below sets data-theme before React hydrates.
      suppressHydrationWarning
    >
      <head>
        {/*
          If scripting is unavailable the reveal animation never runs, so make
          sure nothing stays stuck in its hidden starting state.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        {/*
          Applies a saved theme choice before the browser's first paint, so a
          reader who chose light never sees a flash of dark (or the reverse).
          It has to be a plain blocking inline script: `next/script` with
          `beforeInteractive` queues inline code on `self.__next_s` and runs it
          via the Next runtime *after* paint, which defeats the entire purpose.

          Production only. React's development build logs "Encountered a script
          tag while rendering React component" for any <script> in the tree
          (react-dom-client.development.js only — the production build is
          silent, verified), and a red overlay on every dev page load is worse
          than the one frame of wrong theme it costs. ThemeToggle repairs that
          frame on mount, so dev and production behave the same after paint.
        */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `try{var t=localStorage.getItem('nim-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}`,
            }}
          />
        )}
        <a
          href="#main"
          className="sr-only rounded-md bg-text-strong px-4 py-2 text-surface focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100]"
        >
          {dict.common.skipToContent}
        </a>

        <SiteHeader
          locale={lang}
          labName={labName}
          institution={institution}
          items={items}
          menuLabel={dict.nav.home}
          themeLabel={dict.common.toggleTheme}
        />

        {/*
          Route navigations are React Transitions, so this gives a native
          crossfade between pages with no animation library. Browsers without
          View Transitions support simply navigate normally.
        */}
        <main id="main" className="flex-1">
          <ViewTransition>{children}</ViewTransition>
        </main>

        <SiteFooter
          labName={labName}
          institution={institution}
          note={pick(settings?.footerNote, lang)}
          room={pick(contact?.labRoom, lang)}
          links={settings?.links ?? []}
          // About is kept out of the header to keep the nav short, so
          // the footer is where it gets a permanent home.
          items={[{ href: `/${lang}/about`, label: dict.nav.about }, ...items]}
        />
      </body>
    </html>
  );
}
