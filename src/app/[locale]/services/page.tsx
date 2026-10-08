import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import CtaLink from '@/components/CtaLink';
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
  const t = await getTranslations({ locale, namespace: 'services' });
  const title = t('title');
  const description = t('description');
  const url = absoluteUrl(locale, '/services');

  return {
    title,
    description,
    alternates: pageAlternates(locale, '/services'),
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

export default async function ServicesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Services />;
}

function Services() {
  const t = useTranslations('services');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const labels = t.raw('labels') as {
    discussCta: string;
    serviceLabel: string;
    outcome: string;
    deliverables: string;
    duration: string;
    price: string;
  };
  const items = t.raw('items') as Array<{
    id: string;
    name: string;
    duration: string;
    price?: string;
    priceNote?: string;
    outcome: string;
    summary: string;
    deliverables: string[];
  }>;

  return (
    <section className="section">
      <div className="container">
        <Breadcrumb current={t('breadcrumb')} />
        <BreadcrumbSchema
          items={[
            { name: tNav('home'), url: absoluteUrl(locale, '/') },
            { name: t('breadcrumb'), url: absoluteUrl(locale, '/services') }
          ]}
        />
        <WebPageSchema locale={locale} path="/services" name={t('title')} description={t('description')} />

        <header style={{ marginBottom: 48, maxWidth: 720 }}>
          <h1>{t('hero.headline')}</h1>
          <p className="lead" style={{ marginTop: 16 }}>{t('hero.lead')}</p>
        </header>

        <div className="services-list">
          {items.map((s, i) => {
            const num = String(i + 1).padStart(2, '0');
            return (
              <article key={s.id} id={s.id} className="service-section">
                <div>
                  <div className="num">{num} · {labels.serviceLabel}</div>
                  <h2>{s.name}</h2>
                  <p className="summary service-outcome"><strong>{labels.outcome}:</strong> {s.outcome}</p>
                  <p className="summary">{s.summary}</p>
                  <h3 className="service-deliverables-title">{labels.deliverables}</h3>
                  <ul className="service-deliverables">
                    {s.deliverables.map((d) => <li key={d}>{d}</li>)}
                  </ul>
                </div>

                <aside className="meta-rail">
                  <p className="service-duration"><span className="label">{labels.duration}</span><br />{s.duration}</p>
                  {s.price && (
                    <p className="service-duration service-price">
                      <span className="label">{labels.price}</span><br />
                      <strong>{s.price}</strong>
                      {s.priceNote && <><br /><span className="price-note">{s.priceNote}</span></>}
                    </p>
                  )}
                  <CtaLink cta={`services_${s.id}`} className="btn btn-secondary btn-sm" href="https://www.cal.eu/jaize/15min?overlayCalendar=true">
                    {labels.discussCta}<span className="arrow">→</span>
                  </CtaLink>
                </aside>
              </article>
            );
          })}
        </div>

        <section className="numbered-section" style={{ marginTop: 32 }}>
          <h2>{t('cta.title')}</h2>
          <p className="lead" style={{ marginBottom: 24, maxWidth: 600 }}>{t('cta.lead')}</p>
          <CtaLink cta="services_cta" className="btn btn-primary" href="/contact">
            {t('cta.primary')}<span className="arrow">→</span>
          </CtaLink>
        </section>
      </div>
    </section>
  );
}
