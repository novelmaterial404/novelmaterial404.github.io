'use client';

/**
 * next/image loader for the static export.
 *
 * Returns the original file (no resizing — there is no image server on GitHub
 * Pages) with the site's base path in front of local paths like
 * `/images/people/jane.jpg`. `width` is appended as a query string only so
 * next/image does not warn that the loader ignores it; static hosts ignore it.
 */
export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
}): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const url = src.startsWith('/') ? `${basePath}${src}` : src;
  return `${url}${url.includes('?') ? '&' : '?'}w=${width}`;
}
