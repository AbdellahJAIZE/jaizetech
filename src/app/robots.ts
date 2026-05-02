import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

// Pre-launch: noindex everything. Flip `launched` to true once site is ready to be indexed.
export default function robots(): MetadataRoute.Robots {
  const launched = false;
  return {
    rules: launched
      ? [{ userAgent: '*', allow: '/' }]
      : [{ userAgent: '*', disallow: '/' }],
    sitemap: 'https://jaizetech.nl/sitemap.xml'
  };
}
