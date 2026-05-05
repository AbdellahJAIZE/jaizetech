import { routing } from '@/i18n/routing';

export const SITE_URL = 'https://jaizetech.nl';

/**
 * Build a path that respects the localePrefix='as-needed' rule:
 * default locale (nl) has no prefix, others have /<locale>.
 */
export function localePath(locale: string, path: string): string {
  const clean = path === '/' ? '' : path;
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  return `${prefix}${clean}` || '/';
}

/**
 * Returns the canonical and hreflang alternates for a given route path.
 * Use inside `generateMetadata` to populate `alternates`.
 */
export function pageAlternates(locale: string, path: string) {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = localePath(l, path);
  }
  languages['x-default'] = localePath(routing.defaultLocale, path);

  return {
    canonical: localePath(locale, path),
    languages
  };
}

/**
 * Absolute URL for a given locale + path (used for openGraph.url and JSON-LD).
 */
export function absoluteUrl(locale: string, path: string): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}
