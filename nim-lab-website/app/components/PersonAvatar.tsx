import Image from 'next/image';

/** Initials from a name, so a member with no photo still gets a real avatar. */
function initials(name: string): string {
  const parts = name.trim().split(/[\s-]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PersonAvatar({
  name,
  photo,
  size = 96,
}: {
  name: string;
  photo?: string | null;
  size?: number;
}) {
  if (photo) {
    return (
      <Image
        src={photo}
        alt={name}
        width={size}
        height={size}
        className="aspect-square shrink-0 rounded-full border border-border-subtle object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-sunken"
    >
      <span
        className="spectral-text font-display font-medium"
        style={{ fontSize: size * 0.34 }}
      >
        {initials(name)}
      </span>
    </div>
  );
}
