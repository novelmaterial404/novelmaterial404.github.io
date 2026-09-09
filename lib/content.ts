import 'server-only';
import React from 'react';
import Markdoc, { type Node as MarkdocNode } from '@markdoc/markdoc';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config';
import type { Locale } from '@/lib/i18n';

export const reader = createReader(process.cwd(), keystaticConfig);

/** The shape every short bilingual field takes in the content files. */
export type Bilingual = { readonly en: string; readonly zhHant: string };

/**
 * Resolves a bilingual field for the current locale.
 *
 * Chinese always falls back to English when empty. That is the rule that keeps
 * a half-finished translation from leaving a blank heading on the live site —
 * the professor and students can fill Chinese in gradually.
 */
export function pick(
  field: Bilingual | null | undefined,
  locale: Locale,
): string {
  if (!field) return '';
  if (locale === 'zh-Hant') return field.zhHant?.trim() || field.en || '';
  return field.en || '';
}

/** A Markdoc body as stored by Keystatic: an async function returning the AST. */
type MarkdocField = () => Promise<{ node: MarkdocNode }>;

/** Renders a Markdoc body to React elements. Returns null for empty content. */
export async function renderBody(
  field: MarkdocField | null | undefined,
): Promise<React.ReactNode | null> {
  if (typeof field !== 'function') return null;
  const { node } = await field();
  const tree = Markdoc.transform(node);

  /*
    Markdoc wraps its output in an <article>. Unwrapped here so the paragraphs
    become direct children of `.prose-lab`, which is what its `> * + *` spacing
    rule targets — otherwise the whole body is a single child and every
    paragraph runs together.
  */
  const content =
    tree && typeof tree === 'object' && 'name' in tree && tree.name === 'article'
      ? tree.children
      : tree;

  if (Array.isArray(content) && content.length === 0) return null;

  const rendered = Markdoc.renderers.react(content, React);
  if (Array.isArray(rendered) && rendered.length === 0) return null;
  return rendered;
}

/**
 * Renders the locale-appropriate body, falling back to English when the
 * Chinese version has not been written yet.
 */
export async function renderLocalisedBody(
  en: MarkdocField | null | undefined,
  zhHant: MarkdocField | null | undefined,
  locale: Locale,
): Promise<React.ReactNode | null> {
  if (locale === 'zh-Hant') {
    const zh = await renderBody(zhHant);
    if (zh) return zh;
  }
  return renderBody(en);
}

/* ------------------------------------------------------------------ people */

export const roleOrder = [
  'pi',
  'postdoc',
  'phd',
  'masters',
  'undergrad',
  'visiting',
  'staff',
  'alumni',
] as const;

export type Role = (typeof roleOrder)[number];

export const roleLabels: Record<Role, Bilingual> = {
  pi: { en: 'Principal Investigator', zhHant: '實驗室主持人' },
  postdoc: { en: 'Postdoctoral Researchers', zhHant: '博士後研究員' },
  phd: { en: 'PhD Students', zhHant: '博士班學生' },
  masters: { en: "Master's Students", zhHant: '碩士班學生' },
  undergrad: { en: 'Undergraduate Researchers', zhHant: '大學部專題生' },
  visiting: { en: 'Visiting Researchers', zhHant: '訪問學者' },
  staff: { en: 'Research Staff', zhHant: '研究人員' },
  alumni: { en: 'Alumni', zhHant: '畢業成員' },
};

export async function getPeople() {
  const entries = await reader.collections.people.all();
  return entries.sort((a, b) => {
    const roleDiff =
      roleOrder.indexOf(a.entry.role as Role) -
      roleOrder.indexOf(b.entry.role as Role);
    if (roleDiff !== 0) return roleDiff;
    const orderDiff = (a.entry.sortOrder ?? 100) - (b.entry.sortOrder ?? 100);
    if (orderDiff !== 0) return orderDiff;
    return a.entry.name.localeCompare(b.entry.name);
  });
}

export type PersonEntry = Awaited<ReturnType<typeof getPeople>>[number];

/** Groups people by role, preserving the canonical role ordering. */
export function groupByRole(people: PersonEntry[]) {
  return roleOrder
    .map((role) => ({
      role,
      members: people.filter((p) => p.entry.role === role),
    }))
    .filter((group) => group.members.length > 0);
}

/* ------------------------------------------------------------ publications */

export async function getPublications() {
  const entries = await reader.collections.publications.all();
  return entries.sort((a, b) => {
    const yearDiff = (b.entry.year ?? 0) - (a.entry.year ?? 0);
    if (yearDiff !== 0) return yearDiff;
    return a.entry.title.localeCompare(b.entry.title);
  });
}

export type PublicationEntry = Awaited<
  ReturnType<typeof getPublications>
>[number];

/* ---------------------------------------------------------------- research */

export async function getResearchAreas() {
  const entries = await reader.collections.research.all();
  return entries.sort(
    (a, b) => (a.entry.sortOrder ?? 100) - (b.entry.sortOrder ?? 100),
  );
}

/* -------------------------------------------------------------------- news */

export async function getNews() {
  const entries = await reader.collections.news.all();
  return entries.sort((a, b) =>
    (b.entry.date ?? '').localeCompare(a.entry.date ?? ''),
  );
}

/* ----------------------------------------------------------------- gallery */

export async function getGallery() {
  const entries = await reader.collections.gallery.all();
  return entries.sort(
    (a, b) => (a.entry.sortOrder ?? 100) - (b.entry.sortOrder ?? 100),
  );
}

/* --------------------------------------------------------------- singletons */

export async function getSettings() {
  return reader.singletons.siteSettings.read();
}

/** Formats a YYYY-MM-DD content date for display in the reader's locale. */
export function formatDate(date: string | null, locale: Locale): string {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'zh-Hant' ? 'zh-Hant-TW' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}
