import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PageHeader from '@/app/components/PageHeader';
import PersonAvatar from '@/app/components/PersonAvatar';
import Reveal from '@/app/components/Reveal';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import {
  getPeople,
  groupByRole,
  pick,
  renderLocalisedBody,
  roleLabels,
  type PersonEntry,
  type Role,
} from '@/lib/content';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/people'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.people.title, description: dict.people.lead };
}

export default async function PeoplePage({
  params,
}: PageProps<'/[lang]/people'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, people] = await Promise.all([getDictionary(lang), getPeople()]);
  const groups = groupByRole(people);

  return (
    <>
      <PageHeader title={dict.people.title} lead={dict.people.lead} />

      <div className="mx-auto max-w-6xl space-y-16 px-5 pb-24 sm:px-8">
        {groups.map((group, gi) => (
          <section key={group.role}>
            <h2 className="text-xs font-semibold tracking-[0.18em] text-text-muted uppercase">
              {pick(roleLabels[group.role as Role], lang)}
            </h2>

            {group.role === 'pi' ? (
              <div className="mt-6 space-y-6">
                {group.members.map((person) => (
                  <PrincipalCard key={person.slug} person={person} lang={lang} />
                ))}
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.members.map((person, i) => (
                  <Reveal key={person.slug} delay={(gi + i) * 50}>
                    <MemberCard person={person} lang={lang} dict={dict} />
                  </Reveal>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}

async function PrincipalCard({
  person,
  lang,
}: {
  person: PersonEntry;
  lang: 'en' | 'zh-Hant';
}) {
  const bio = await renderLocalisedBody(
    person.entry.bio,
    person.entry.bioZhHant,
    lang,
  );
  const name =
    lang === 'zh-Hant' && person.entry.nameZhHant
      ? person.entry.nameZhHant
      : person.entry.name;

  return (
    <Reveal>
      <div className="film-card rounded-xl p-6 sm:p-8">
        <div className="flex flex-wrap items-start gap-6">
          <PersonAvatar
            name={person.entry.name}
            photo={person.entry.photo}
            size={112}
          />
          {/* min-w forces a wrap onto its own row on narrow screens rather
              than squeezing the text into a column two words wide. */}
          <div className="min-w-[16rem] flex-1">
            <h3 className="font-display text-2xl">{name}</h3>
            {person.entry.nameZhHant && lang !== 'zh-Hant' && (
              <p className="mt-0.5 text-sm text-text-muted">
                {person.entry.nameZhHant}
              </p>
            )}
            <p className="mt-2 text-text-muted">
              {pick(person.entry.title, lang)}
            </p>

            <InterestChips person={person} lang={lang} />
            <PersonLinks person={person} />
          </div>
        </div>

        {bio && <div className="prose-lab mt-7 max-w-3xl">{bio}</div>}
      </div>
    </Reveal>
  );
}

function MemberCard({
  person,
  lang,
  dict,
}: {
  person: PersonEntry;
  lang: 'en' | 'zh-Hant';
  dict: { people: { joinedIn: string } };
}) {
  const name =
    lang === 'zh-Hant' && person.entry.nameZhHant
      ? person.entry.nameZhHant
      : person.entry.name;

  return (
    <div className="film-card h-full rounded-xl p-6">
      <PersonAvatar name={person.entry.name} photo={person.entry.photo} size={72} />

      <h3 className="mt-4 font-display text-lg">{name}</h3>
      {pick(person.entry.title, lang) && (
        <p className="mt-1 text-sm text-text-muted">
          {pick(person.entry.title, lang)}
        </p>
      )}

      {pick(person.entry.alumniNote, lang) && (
        <p className="mt-2 text-sm text-text-muted italic">
          {pick(person.entry.alumniNote, lang)}
        </p>
      )}

      <InterestChips person={person} lang={lang} />

      {person.entry.joinedYear && (
        <p className="mt-3 text-xs text-text-muted">
          {dict.people.joinedIn} {person.entry.joinedYear}
        </p>
      )}

      <PersonLinks person={person} />
    </div>
  );
}

function InterestChips({
  person,
  lang,
}: {
  person: PersonEntry;
  lang: 'en' | 'zh-Hant';
}) {
  const interests = person.entry.interests ?? [];
  if (interests.length === 0) return null;

  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {interests.map((interest, i) => (
        <li
          key={i}
          className="rounded-full border border-border-subtle px-2.5 py-1 text-xs text-text-muted"
        >
          {pick(interest, lang)}
        </li>
      ))}
    </ul>
  );
}

function PersonLinks({ person }: { person: PersonEntry }) {
  const links = person.entry.links ?? [];
  const email = person.entry.email;
  if (links.length === 0 && !email) return null;

  return (
    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
      {email && (
        <li>
          <a
            href={`mailto:${email}`}
            className="text-sm text-accent hover:underline"
          >
            {email}
          </a>
        </li>
      )}
      {links.map((link, i) => (
        <li key={i}>
          <a
            href={link.url ?? '#'}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm text-accent hover:underline"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
