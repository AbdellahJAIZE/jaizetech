import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getAllPosts } from '@/lib/blog';

export const dynamic = 'force-static';

const SITE = 'https://jaizetech.nl';

type RouteConfig = {
  path: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
};

const STATIC_ROUTES: RouteConfig[] = [
  { path: '', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/work', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.8 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 }
];

function urlFor(locale: string, path: string) {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  return `${SITE}${prefix}${path}`;
}

function buildLanguages(path: string) {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = urlFor(l, path);
  }
  languages['x-default'] = urlFor(routing.defaultLocale, path);
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const lastModified = new Date();

  for (const route of STATIC_ROUTES) {
    for (const locale of routing.locales) {
      entries.push({
        url: urlFor(locale, route.path),
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: { languages: buildLanguages(route.path) }
      });
    }
  }

  // Blog posts: only include slugs that exist in BOTH locales (clean hreflang)
  // OR include the locale-specific slug only when it exists.
  const slugsByLocale: Record<string, Set<string>> = {};
  for (const locale of routing.locales) {
    slugsByLocale[locale] = new Set(getAllPosts(locale).map((p) => p.slug));
  }

  for (const locale of routing.locales) {
    for (const post of getAllPosts(locale)) {
      const path = `/blog/${post.slug}`;
      const langs: Record<string, string> = {};
      for (const l of routing.locales) {
        if (slugsByLocale[l]?.has(post.slug)) {
          langs[l] = urlFor(l, path);
        }
      }
      langs['x-default'] = langs[routing.defaultLocale] || urlFor(locale, path);

      entries.push({
        url: urlFor(locale, path),
        lastModified: new Date(post.frontmatter.updated || post.frontmatter.published),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: { languages: langs }
      });
    }
  }

  return entries;
}
