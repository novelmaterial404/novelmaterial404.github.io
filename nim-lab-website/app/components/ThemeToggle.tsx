'use client';

import { useEffect, useSyncExternalStore } from 'react';

export const THEME_KEY = 'nim-theme';
const CHANGE_EVENT = 'nim-theme-change';

type Choice = 'light' | 'dark';

/**
 * Light/dark switch.
 *
 * With no stored choice the site follows the reader's device, and keeps
 * following it live if they change it. Once they pick, that choice wins and
 * persists. The chosen theme is applied by an inline script in the layout
 * before first paint, so the page never flashes the wrong colours.
 *
 * The theme lives outside React — it is an attribute on <html>, a media query,
 * and a localStorage entry — so it is read through useSyncExternalStore rather
 * than mirrored into state with an effect.
 */
function subscribe(onChange: () => void) {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  query.addEventListener('change', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    query.removeEventListener('change', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function storedChoice(): Choice | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function getSnapshot(): Choice {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'light' || explicit === 'dark') return explicit;
  // localStorage is consulted directly as well as the attribute: in
  // development the pre-paint script is not rendered (see the layout), so the
  // attribute is not set yet on the first read.
  return (
    storedChoice() ??
    (window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light')
  );
}

/**
 * The server cannot know the reader's preference, so it commits to neither.
 * The icon appears once the client snapshot resolves — which avoids both a
 * hydration mismatch and a wrong icon flashing on load.
 */
function getServerSnapshot(): Choice | undefined {
  return undefined;
}

export default function ThemeToggle({ label }: { label: string }) {
  const choice = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  /*
    Puts the saved choice onto <html> if nothing has yet — which is the case in
    development, where the pre-paint script is not rendered. In production the
    script has already done this and the effect is a no-op.

    Only applied when a choice was actually stored: setting the attribute
    unconditionally would pin the theme and stop it following the reader's
    device.
  */
  useEffect(() => {
    const stored = storedChoice();
    if (stored && document.documentElement.dataset.theme !== stored) {
      document.documentElement.dataset.theme = stored;
      window.dispatchEvent(new Event(CHANGE_EVENT));
    }
  }, []);

  const toggle = () => {
    const next: Choice = choice === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private browsing can refuse storage; the theme still applies for this
      // page view, it just will not be remembered.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={choice === 'dark'}
      className="rounded-full border border-border-subtle p-2 text-text-muted transition-colors hover:text-text-strong"
    >
      {/* Fixed box so the header never shifts between the two icons. */}
      <span className="block h-[18px] w-[18px]">
        {choice === undefined ? null : choice === 'dark' ? (
          <MoonIcon />
        ) : (
          <SunIcon />
        )}
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="3.4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 1.5v1.8M9 14.7v1.8M16.5 9h-1.8M3.3 9H1.5M14.3 3.7l-1.3 1.3M5 13l-1.3 1.3M14.3 14.3L13 13M5 5L3.7 3.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M15.2 10.8A6.6 6.6 0 0 1 7.2 2.8a6.6 6.6 0 1 0 8 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
