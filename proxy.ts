import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, locales } from './lib/i18n';

/**
 * Picks the best locale from an Accept-Language header.
 *
 * Hand-rolled rather than pulling in `negotiator` + `intl-localematcher`: with
 * only two locales the matching rules are trivial, and this keeps the proxy
 * dependency-free (it runs on every request that reaches it).
 */
function negotiateLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith('q='))
        ?.slice(2);
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
    })
    .filter((entry) => entry.tag && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    // Any Traditional-Chinese-leaning tag maps to zh-Hant: zh-tw, zh-hant,
    // zh-hant-tw, zh-hk, zh-mo. Simplified (zh-cn, zh-hans) falls through to
    // English rather than being served the wrong script.
    if (/^zh(-hant\b|-tw\b|-hk\b|-mo\b)/.test(tag)) return 'zh-Hant';
    if (tag === 'en' || tag.startsWith('en-')) return 'en';
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Already localised — nothing to do.
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = negotiateLocale(request.headers.get('accept-language'));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except the CMS, API routes, Next internals, and public files.
  // Without a matcher the proxy would also run on /_next/static and /_next/image.
  matcher: [
    '/((?!keystatic|api|_next/static|_next/image|favicon.ico|images|.*\\.[\\w]+$).*)',
  ],
};
