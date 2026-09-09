import Link from 'next/link';

/*
  Catches missing pages inside a locale tree (a mistyped news slug, a removed
  research area) so they keep the site's header and footer.

  `not-found.tsx` cannot read route params, so this shows both languages rather
  than guessing which one the reader wanted.
*/
export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-28 text-center sm:px-8 sm:py-36">
      <p className="spectral-text font-mono text-sm font-semibold">404</p>

      <h1 className="mt-4 font-display text-4xl text-balance sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-3 font-display text-2xl text-text-muted">找不到頁面</p>

      <div className="spectral-rule mx-auto mt-10 max-w-sm" />

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/en"
          className="rounded-full border border-border-subtle px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
        >
          English home
        </Link>
        <Link
          href="/zh-Hant"
          className="rounded-full border border-border-subtle px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
        >
          中文首頁
        </Link>
      </div>
    </div>
  );
}
