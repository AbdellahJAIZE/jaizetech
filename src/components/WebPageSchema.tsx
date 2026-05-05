import { absoluteUrl } from '@/lib/seo';

type Props = {
  locale: string;
  path: string;
  name: string;
  description?: string;
};

const SITE = 'https://jaizetech.nl';

export default function WebPageSchema({ locale, path, name, description }: Props) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: absoluteUrl(locale, path),
    name,
    inLanguage: locale === 'nl' ? 'nl-NL' : 'en-US',
    isPartOf: { '@id': `${SITE}/#website` },
    about: { '@id': `${SITE}/#jaize` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: `${SITE}/og-image.png`,
      width: 1200,
      height: 630
    },
    ...(description ? { description } : {})
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
