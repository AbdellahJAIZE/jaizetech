import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
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
  const t = await getTranslations({ locale, namespace: 'work' });
  const title = t('title');
  const description = t('description');
  const url = absoluteUrl(locale, '/work');

  return {
    title,
    description,
    alternates: pageAlternates(locale, '/work'),
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

export default async function WorkPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Work />;
}

function Work() {
  const t = useTranslations('work');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const labels = t.raw('labels') as { approach: string; stack: string; production: string; sector: string; period: string; role: string };
  const cases = t.raw('cases') as Array<{
    id: string;
    client: string;
    sector: string;
    year: string;
    role: string;
    summary: string;
    approach: string;
    stats: Array<{ value: string; label: string }>;
    stack: string[];
    production: string;
  }>;

  return (
    <section className="section">
      <div className="container">
        <Breadcrumb current={t('breadcrumb')} />
        <BreadcrumbSchema
          items={[
            { name: tNav('home'), url: absoluteUrl(locale, '/') },
            { name: t('breadcrumb'), url: absoluteUrl(locale, '/work') }
          ]}
        />
        <WebPageSchema locale={locale} path="/work" name={t('title')} description={t('description')} />

        <header style={{ marginBottom: 48, maxWidth: 720 }}>
          <h1>{t('hero.headline')}</h1>
          <p className="lead" style={{ marginTop: 16 }}>{t('hero.lead')}</p>
        </header>

        <div className="cases-list">
          {cases.map((c) => (
            <article key={c.id} id={c.id} className="case-section">
              <div className="case-header">
                <div>
                  <h2>{c.client}</h2>
                  <p className="case-summary">{c.summary}</p>
                </div>
                <div className="case-meta-rail">
                  <div>{labels.sector}</div><span className="v">{c.sector}</span>
                  <div style={{ marginTop: 12 }}>{labels.period}</div><span className="v">{c.year}</span>
                  <div style={{ marginTop: 12 }}>{labels.role}</div><span className="v">{c.role}</span>
                </div>
              </div>

              <p style={{ color: 'var(--muted)', maxWidth: '60ch' }}>{c.approach}</p>

              <div className="stat-row">
                {c.stats.map((s, i) => (
                  <div key={i} className="stat">
                    <div className="number">{s.value}</div>
                    <div className="label">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="stack-line">
                <span className="label">{labels.stack}</span>
                <span className="tags" style={{ display: 'inline-flex' }}>
                  {c.stack.map((s) => (
                    <span key={s} className="tag">{s}</span>
                  ))}
                </span>
              </div>

              <p className="for-line" style={{
                marginTop: 24,
                borderLeft: '2px solid var(--line-strong)',
                paddingLeft: 14,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--muted)'
              }}>
                {labels.production}: {c.production}
              </p>
            </article>
          ))}
        </div>

        <section className="numbered-section" style={{ marginTop: 32 }}>
          <h2>{t('cta.title')}</h2>
          <p className="lead" style={{ marginBottom: 24, maxWidth: 600 }}>{t('cta.lead')}</p>
          <Link className="btn btn-primary" href="/contact">
            {t('cta.primary')}<span className="arrow">→</span>
          </Link>
        </section>
      </div>
    </section>
  );
}
