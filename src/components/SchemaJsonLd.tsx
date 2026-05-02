type Props = { locale: string };

export default function SchemaJsonLd({ locale }: Props) {
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Abdellah Jaize',
    jobTitle: 'Senior Software Engineer',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'IJlst',
      addressRegion: 'Friesland',
      addressCountry: 'NL'
    },
    url: 'https://jaizetech.nl',
    sameAs: [
      'https://linkedin.com/in/abdellah-jaize',
      'https://github.com/AbdellahJAIZE'
    ],
    knowsLanguage: ['nl', 'en', 'fr', 'ar']
  };

  const service = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Jaize',
    description:
      locale === 'nl'
        ? 'Productieklare AI-systemen voor Nederlandse scale-ups: AI-agenten, RAG-assistenten, document-automatisering en volledige stack.'
        : 'Production-ready AI systems for Dutch scale-ups: AI agents, RAG assistants, document automation, and full-stack delivery.',
    url: 'https://jaizetech.nl',
    areaServed: { '@type': 'Country', name: 'Netherlands' },
    priceRange: '€€€',
    provider: { '@type': 'Person', name: 'Abdellah Jaize' }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }}
      />
    </>
  );
}
