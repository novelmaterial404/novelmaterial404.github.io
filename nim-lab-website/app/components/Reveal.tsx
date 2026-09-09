'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Reveals content as it scrolls into view — resolving out of a blur, the way a
 * measurement rises out of the noise floor.
 *
 * The element ships from the server already marked `pending`, so there is no
 * flash of visible-then-hidden content. Two safety nets keep that from ever
 * becoming permanently invisible content: a <noscript> rule in the layout, and
 * the reduced-motion block in globals.css.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.dataset.reveal = 'shown';
      return;
    }

    // If the browser lacks IntersectionObserver, show everything immediately
    // rather than leaving the page blank.
    if (typeof IntersectionObserver === 'undefined') {
      el.dataset.reveal = 'shown';
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.dataset.reveal = 'shown';
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal="pending"
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </div>
  );
}
