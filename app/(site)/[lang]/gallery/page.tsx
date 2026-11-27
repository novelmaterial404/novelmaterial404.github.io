import path from 'node:path';
import sharp from 'sharp';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PageHeader from '@/app/components/PageHeader';
import Reveal from '@/app/components/Reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { formatDate, getGallery } from '@/lib/content';

/*
  Photos of the lab. Each entry is a YAML file in content/gallery/ pointing at
  an image in public/images/gallery/ (see keystatic.config.ts for the fields).
  Clicking a photo opens the full-size file.

  Photos keep their own shape (no cropping — group photos lose people at the
  edges otherwise), laid out in columns. Their dimensions are read from the
  files at build time.
*/

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

async function imageSize(src: string) {
  try {
    const { width, height } = await sharp(
      path.join(process.cwd(), 'public', src),
    ).metadata();
    if (width && height) return { width, height };
  } catch {
    // Missing or remote file: fall back to a common photo shape.
  }
  return { width: 1200, height: 900 };
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/gallery'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.gallery.title, description: dict.gallery.lead };
}

export default async function GalleryPage({
  params,
}: PageProps<'/[lang]/gallery'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, photos] = await Promise.all([getDictionary(lang), getGallery()]);
  const sizes = await Promise.all(photos.map((p) => imageSize(p.entry.image)));

  return (
    <>
      <PageHeader title={dict.gallery.title} lead={dict.gallery.lead} />

      <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        {photos.length === 0 ? (
          <p className="text-text-muted">{dict.gallery.empty}</p>
        ) : (
          <ul className="gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
            {photos.map((photo, i) => {
              const caption =
                lang === 'zh-Hant' && photo.entry.captionZhHant
                  ? photo.entry.captionZhHant
                  : photo.entry.caption;
              const date = formatDate(photo.entry.date, lang);
              const src = photo.entry.image;

              return (
                <Reveal key={photo.slug} delay={(i % 3) * 60}>
                  <li>
                    <figure className="film-card overflow-hidden rounded-xl">
                      <a
                        href={src.startsWith('/') ? `${basePath}${src}` : src}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group block overflow-hidden bg-surface-sunken"
                      >
                        <Image
                          src={src}
                          alt={caption}
                          width={sizes[i].width}
                          height={sizes[i].height}
                          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                          className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                      </a>
                      {(caption || date) && (
                        <figcaption className="px-5 py-4">
                          {caption && <p className="leading-snug">{caption}</p>}
                          {date && (
                            <time
                              dateTime={photo.entry.date ?? undefined}
                              className="mt-1 block text-xs text-text-muted"
                            >
                              {date}
                            </time>
                          )}
                        </figcaption>
                      )}
                    </figure>
                  </li>
                </Reveal>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
