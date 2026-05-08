import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import ServiceCard from '@/components/ServiceCard';
import CaseCard from '@/components/CaseCard';
import FAQSchema from '@/components/FAQSchema';
import WebPageSchema from '@/components/WebPageSchema';
import { pageAlternates, absoluteUrl } from '@/lib/seo';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const url = absoluteUrl(locale, '/');
  const title = t('title');
  const description = t('description');

  return {
    title: { absolute: title },
    description,
    alternates: pageAlternates(locale, '/'),
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'Jaize Tech',
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      alternateLocale: locale === 'nl' ? ['en_US'] : ['nl_NL'],
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

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Home />;
}

function Home() {
  const t = useTranslations('home');
  const locale = useLocale();
  const faqItems = t.raw('faq.items') as Array<{ q: string; a: string }>;
  const statsItems = t.raw('stats.items') as Array<{ value: string; label: string }>;

  return (
    <>
      <WebPageSchema locale={locale} path="/" name={t('title')} description={t('description')} />
      <section className="hero container">
        <div className="hero-grid">
          <div className="hero-content">
            <h1 className="reveal">{t('hero.headline')}</h1>
            <p className="lead reveal">{t('hero.lead')}</p>

            <div className="hero-actions reveal">
              <Link className="btn btn-primary" href="/contact">
                {t('hero.ctaPrimary')}
                <span className="arrow">→</span>
              </Link>
              <Link className="btn btn-secondary" href="/services">
                {t('hero.ctaSecondary')}
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>

          <aside className="hero-stats reveal" aria-label={t('stats.label')}>
            <div className="hero-stats-eyebrow">{t('stats.eyebrow')}</div>
            <ul className="hero-stats-list">
              {statsItems.map((s, i) => (
                <li key={i}>
                  <span className="hero-stat-value">{s.value}</span>
                  <span className="hero-stat-label">{s.label}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="readme reveal" aria-label={t('readme.label')}>
          <div className="readme-head">
            <span className="traffic" aria-hidden="true">
              <span /><span /><span />
            </span>
            <span className="mono">~/jaize/profile.txt</span>
          </div>
          <dl className="readme-body">
            <dt>{t('readme.name')}</dt><dd>{t('readme.nameValue')}</dd>
            <dt>{t('readme.role')}</dt><dd>{t('readme.roleValue')}</dd>
            <dt>{t('readme.based')}</dt><dd>{t('readme.basedValue')}</dd>
            <dt>{t('readme.lang')}</dt><dd>{t('readme.langValue')}</dd>
            <dt>{t('readme.kvk')}</dt><dd>{t('readme.kvkValue')}</dd>
          </dl>
        </div>
      </section>

      <hr className="hr-rule" />

      <section className="section container">
        <div className="section-head reveal">
          <span className="eyebrow">{t('services.kicker')}</span>
          <h2>{t('services.title')}</h2>
        </div>
        <div className="services-grid reveal">
          {[0, 1, 2].map((i) => (
            <ServiceCard key={i} index={i} />
          ))}
        </div>
        <div className="show-all-services reveal">
          <Link className="btn btn-secondary" href="/services">
            {t('services.viewAll')}<span className="arrow">→</span>
          </Link>
        </div>
      </section>

      <hr className="hr-rule" />

      <section className="section container">
        <div className="section-head reveal">
          <span className="eyebrow">{t('work.kicker')}</span>
          <h2>{t('work.title')}</h2>
        </div>
        <div className="cases-row reveal">
          {[0, 1].map((i) => (
            <CaseCard key={i} index={i} />
          ))}
        </div>
        <div className="show-all-services reveal">
          <Link className="btn btn-secondary" href="/work">
            {t('work.viewAll')}<span className="arrow">→</span>
          </Link>
        </div>
      </section>

      <hr className="hr-rule" />

      <section className="section" aria-labelledby="faq-title">
        <div className="container-narrow">
          <div className="section-head reveal" style={{ marginBottom: 24 }}>
            <span className="eyebrow">{t('faq.kicker')}</span>
            <h2 id="faq-title">{t('faq.title')}</h2>
          </div>

          <div className="faq reveal">
            {faqItems.map((item, idx) => (
              <details key={idx}>
                <summary>
                  <span>{item.q}</span>
                  <span className="icon" aria-hidden="true" />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
        <FAQSchema items={faqItems} />
      </section>

      <section className="section cta-section">
        <div className="container-narrow reveal">
          <h2>{t('cta.title')}</h2>
          <p className="lead">{t('cta.lead')}</p>
          <Link className="btn btn-primary btn-lg" href="/contact">
            {t('cta.primary')}
            <span className="arrow">→</span>
          </Link>
          <p className="muted-line">{t('cta.secondary')}</p>
        </div>
      </section>
    </>
  );
}
