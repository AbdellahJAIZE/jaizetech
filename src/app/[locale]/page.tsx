import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import ServiceCard from '@/components/ServiceCard';
import CaseCard from '@/components/CaseCard';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return {
    title: t('title'),
    description: t('description')
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
  const faqItems = t.raw('faq.items') as Array<{ q: string; a: string }>;

  return (
    <>
      <section className="hero container">
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

        <div className="readme reveal" aria-label="profile">
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
          {[0, 1, 2, 3, 4, 5].map((i) => (
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
          {[0, 1, 2].map((i) => (
            <CaseCard key={i} index={i} />
          ))}
        </div>
      </section>

      <hr className="hr-rule" />

      <section className="section">
        <div className="container-narrow">
          <div className="section-head reveal" style={{ marginBottom: 24 }}>
            <span className="eyebrow">{t('faq.kicker')}</span>
            <h2>{t('faq.title')}</h2>
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
