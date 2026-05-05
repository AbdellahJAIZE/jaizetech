type Props = { locale: string };

const SITE = 'https://jaizetech.nl';

export default function SchemaJsonLd({ locale }: Props) {
  const isNL = locale === 'nl';

  const personId = `${SITE}/#abdellah`;
  const orgId = `${SITE}/#jaize`;
  const websiteId = `${SITE}/#website`;

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId,
    name: 'Abdellah Jaize',
    givenName: 'Abdellah',
    familyName: 'Jaize',
    jobTitle: 'AI Software Engineer',
    description: isNL
      ? 'AI software engineer in IJlst, Friesland. Bouwt productieklare AI-agenten, RAG-systemen en document-automatisering voor Nederlandse scale-ups en MKB.'
      : 'AI software engineer in IJlst, Friesland. Builds production-ready AI agents, RAG systems, and document automation for Dutch scale-ups and SMBs.',
    url: `${SITE}/about`,
    image: {
      '@type': 'ImageObject',
      url: `${SITE}/abdellah.jpg`,
      width: 600,
      height: 600,
      caption: 'Abdellah Jaize, AI software engineer in IJlst, Netherlands'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'IJlst',
      addressRegion: 'Friesland',
      addressCountry: 'NL'
    },
    nationality: { '@type': 'Country', name: 'Morocco' },
    alumniOf: [
      {
        '@type': 'CollegeOrUniversity',
        name: 'ENSAM Casablanca',
        sameAs: 'https://ensam-casa.ma/'
      },
      {
        '@type': 'CollegeOrUniversity',
        name: 'FST Settat',
        sameAs: 'https://fst-usms.ac.ma/'
      }
    ],
    knowsAbout: [
      'Artificial Intelligence',
      'Production AI Systems',
      'Retrieval Augmented Generation',
      'RAG',
      'AI Agents',
      'LangGraph',
      'LangChain',
      'Large Language Models',
      'OpenAI API',
      'Anthropic Claude',
      'Document Automation',
      'OCR',
      'Computer Vision',
      'NestJS',
      'Next.js',
      'TypeScript',
      'Python',
      'PostgreSQL',
      'AWS',
      'GCP',
      'Cloudflare',
      'NVIDIA Triton',
      'Fractional CTO',
      'Technical Leadership'
    ],
    knowsLanguage: [
      { '@type': 'Language', name: 'English', alternateName: 'en' },
      { '@type': 'Language', name: 'French', alternateName: 'fr' },
      { '@type': 'Language', name: 'Arabic', alternateName: 'ar' }
    ],
    sameAs: [
      'https://www.linkedin.com/in/abdellah-jaize',
      'https://github.com/AbdellahJAIZE',
      'https://twitter.com/JaizeAbdellah'
    ]
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': orgId,
    name: 'Jaize Tech',
    legalName: 'Jaize Tech',
    alternateName: 'Jaize',
    description: isNL
      ? 'Productieklare AI-systemen voor Nederlandse scale-ups en MKB. AI-agenten, RAG-assistenten, document-automatisering en volledige stack. Vaste prijs, vaste scope.'
      : 'Production-ready AI systems for Dutch scale-ups and SMBs. AI agents, RAG assistants, document automation, and full-stack delivery. Fixed price, fixed scope.',
    url: SITE,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE}/icon.svg`,
      width: 64,
      height: 64
    },
    image: {
      '@type': 'ImageObject',
      url: `${SITE}/og-image.png`,
      width: 1200,
      height: 630
    },
    founder: { '@id': personId },
    foundingDate: '2026-05-04',
    taxID: '42051769',
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'KvK',
      value: '42051769'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'IJlst',
      addressRegion: 'Friesland',
      addressCountry: 'NL'
    },
    areaServed: [
      { '@type': 'Country', name: 'Netherlands' },
      { '@type': 'Country', name: 'Belgium' }
    ],
    priceRange: '€800-€880',
    knowsLanguage: ['nl', 'en', 'fr'],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'abdellah@jaizetech.nl',
        availableLanguage: ['English', 'Dutch', 'French'],
        areaServed: 'NL'
      },
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: 'info@jaizetech.nl',
        availableLanguage: ['English', 'Dutch'],
        areaServed: 'NL'
      }
    ],
    sameAs: [
      'https://www.linkedin.com/in/abdellah-jaize',
      'https://github.com/AbdellahJAIZE',
      'https://twitter.com/JaizeAbdellah'
    ],
    makesOffer: [
      { '@type': 'Offer', name: 'AI Integration Audit' },
      { '@type': 'Offer', name: 'RAG Knowledge Assistant' },
      { '@type': 'Offer', name: 'AI Workflow Agent' },
      { '@type': 'Offer', name: 'AI SaaS MVP' },
      { '@type': 'Offer', name: 'Document Intelligence and OCR Automation' },
      { '@type': 'Offer', name: 'Fractional CTO' }
    ]
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId,
    url: SITE,
    name: 'Jaize Tech',
    inLanguage: ['nl-NL', 'en-US'],
    publisher: { '@id': orgId },
    about: { '@id': personId }
  };

  const blocks = [person, organization, website];

  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
