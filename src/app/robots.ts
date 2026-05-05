import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

// Live: allow all crawlers, point to sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/']
      }
    ],
    sitemap: 'https://jaizetech.nl/sitemap.xml',
    host: 'https://jaizetech.nl'
  };
}
