import Reveal from './Reveal';

/** The standard opening block for every interior page. */
export default function PageHeader({
  title,
  lead,
  eyebrow,
}: {
  title: string;
  lead?: string;
  eyebrow?: string;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-14 pb-8 sm:px-8 sm:pt-20">
      <Reveal>
        {eyebrow && (
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-text-muted uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-4xl leading-[1.1] text-balance sm:text-5xl">
          {title}
        </h1>
        {lead && (
          <p className="mt-4 max-w-2xl text-lg text-text-muted text-pretty">
            {lead}
          </p>
        )}
        <div className="spectral-rule mt-8" />
      </Reveal>
    </div>
  );
}
