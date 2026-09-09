import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PageHeader from '@/app/components/PageHeader';
import Reveal from '@/app/components/Reveal';
import { isLocale, locales } from '@/lib/i18n';
import { pick, reader, renderLocalisedBody } from '@/lib/content';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/about'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const page = await reader.singletons.about.read();
  return { title: pick(page?.heading, lang) || 'About' };
}

export default async function AboutPage({
  params,
}: PageProps<'/[lang]/about'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const page = await reader.singletons.about.read();
  const body = await renderLocalisedBody(page?.body, page?.bodyZhHant, lang);

  return (
    <>
      <PageHeader title={pick(page?.heading, lang) || 'About'} />
      <div className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
        {body && (
          <Reveal>
            <div className="prose-lab">{body}</div>
          </Reveal>
        )}
      </div>
    </>
  );
}
