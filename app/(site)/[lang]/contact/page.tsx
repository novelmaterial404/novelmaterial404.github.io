import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PageHeader from '@/app/components/PageHeader';
import Reveal from '@/app/components/Reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { pick, reader } from '@/lib/content';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/contact'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const [dict, page] = await Promise.all([
    getDictionary(lang),
    reader.singletons.contact.read(),
  ]);
  return { title: pick(page?.heading, lang) || dict.contact.title };
}

export default async function ContactPage({
  params,
}: PageProps<'/[lang]/contact'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, page] = await Promise.all([
    getDictionary(lang),
    reader.singletons.contact.read(),
  ]);

  const rows = [
    { label: dict.contact.lab, value: pick(page?.labRoom, lang) },
    { label: dict.contact.office, value: pick(page?.officeRoom, lang) },
    { label: dict.contact.address, value: pick(page?.address, lang) },
    {
      label: dict.contact.email,
      value: page?.email ?? '',
      href: page?.email ? `mailto:${page.email}` : undefined,
    },
    {
      label: dict.contact.phone,
      value: page?.phone ?? '',
      href: page?.phone ? `tel:${page.phone.replace(/[^+\d]/g, '')}` : undefined,
    },
  ].filter((row) => row.value);

  return (
    <>
      <PageHeader title={pick(page?.heading, lang) || dict.contact.title} />

      <div className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <Reveal>
          <dl className="grid gap-px overflow-hidden rounded-xl border border-border-subtle">
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid gap-1 bg-surface-raised p-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6 sm:p-6"
              >
                <dt className="text-xs font-semibold tracking-[0.14em] text-text-muted uppercase sm:pt-0.5">
                  {row.label}
                </dt>
                <dd className="text-text-body">
                  {row.href ? (
                    <a href={row.href} className="text-accent hover:underline">
                      {row.value}
                    </a>
                  ) : (
                    <span className="whitespace-pre-line">{row.value}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {page?.mapUrl && (
          <Reveal delay={80}>
            <a
              href={page.mapUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 inline-block text-sm font-medium text-accent hover:underline"
            >
              {dict.contact.openMap} →
            </a>
          </Reveal>
        )}

        {pick(page?.note, lang) && (
          <Reveal delay={120}>
            <p className="mt-10 max-w-2xl leading-relaxed text-text-muted">
              {pick(page?.note, lang)}
            </p>
          </Reveal>
        )}
      </div>
    </>
  );
}
