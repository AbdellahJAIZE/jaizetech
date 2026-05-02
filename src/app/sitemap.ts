import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-static';

const SITE = 'https://jaizetech.nl';

const ROUTES = ['', '/services', '/work', '/about', '/blog', '/contact'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of ROUTES) {
    for (const locale of routing.locales) {
      const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
      const url = `${SITE}${prefix}${route || ''}`;

      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: route === '' ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => {
              const p = l === routing.defaultLocale ? '' : `/${l}`;
              return [l, `${SITE}${p}${route || ''}`];
            })
          )
        }
      });
    }
  }

  return entries;
}
