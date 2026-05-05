import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import WebPageSchema from '@/components/WebPageSchema';
import { pageAlternates, absoluteUrl } from '@/lib/seo';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  const title = t('title');
  const description = t('description');
  const url = absoluteUrl(locale, '/privacy');

  return {
    title,
    description,
    alternates: pageAlternates(locale, '/privacy'),
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'Jaize Tech',
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@JaizeAbdellah',
      creator: '@JaizeAbdellah',
      images: ['/og-image.png']
    }
  };
}

export default async function PrivacyPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Privacy />;
}

function Privacy() {
  const t = useTranslations('privacy');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const sections = t.raw('sections') as Array<{ h: string; p: string }>;

  return (
    <section className="section">
      <div className="container-narrow">
        <Breadcrumb current={t('breadcrumb')} />
        <BreadcrumbSchema
          items={[
            { name: tNav('home'), url: absoluteUrl(locale, '/') },
            { name: t('breadcrumb'), url: absoluteUrl(locale, '/privacy') }
          ]}
        />
        <WebPageSchema locale={locale} path="/privacy" name={t('title')} description={t('description')} />

        <header style={{ marginBottom: 32 }}>
          <h1>{t('headline')}</h1>
          <p className="muted-line" style={{ marginTop: 12 }}>{t('lastUpdated')}</p>
          <p className="lead" style={{ marginTop: 24 }}>{t('intro')}</p>
        </header>

        <div className="legal-content">
          {sections.map((s, i) => (
            <section key={i} style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>{s.h}</h3>
              <p style={{ color: 'var(--muted)' }}>{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
