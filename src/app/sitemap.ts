import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const SITE = 'https://jaizetech.nl';

const ROUTES = ['/', '/services', '/work', '/about', '/blog', '/contact'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of ROUTES) {
    for (const locale of routing.locales) {
      const path = resolveLocalizedPath(route, locale);
      const url = `${SITE}${locale === 'nl' ? '' : '/' + locale}${path}`;
      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: route === '/' ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [
              l,
              `${SITE}${l === 'nl' ? '' : '/' + l}${resolveLocalizedPath(route, l)}`
            ])
          )
        }
      });
    }
  }

  return entries;
}

function resolveLocalizedPath(route: string, locale: string): string {
  const map = (routing.pathnames as Record<string, string | Record<string, string>>)[route];
  if (typeof map === 'string') return map === '/' ? '' : map;
  if (typeof map === 'object') {
    const localized = map[locale] ?? route;
    return localized === '/' ? '' : localized;
  }
  return route;
}
