import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services' });
  return { title: t('title'), description: t('description') };
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
  const labels = t.raw('labels') as {
    price: string;
    duration: string;
    for: string;
    delivers: string;
    excludes: string;
    discussCta: string;
  };

  const items = t.raw('items') as Array<{
    id: string;
    name: string;
    price: string;
    duration: string;
    for: string;
    summary: string;
    delivers: string[];
    excludes: string;
  }>;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t('hero.kicker')}</span>
          <h1>{t('hero.headline')}</h1>
          <p className="lead">{t('hero.lead')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {items.map((s) => (
            <article key={s.id} id={s.id} className="service-detail">
              <header className="service-detail-head">
                <h2>{s.name}</h2>
                <aside className="svc-meta">
                  <div><span className="label">{labels.price}</span><span className="value price">{s.price}</span></div>
                  <div><span className="label">{labels.duration}</span><span className="value">{s.duration}</span></div>
                  <div><span className="label">{labels.for}</span><span className="value">{s.for}</span></div>
                </aside>
              </header>
              <p className="summary">{s.summary}</p>
              <h4>{labels.delivers}</h4>
              <ul className="delivers">
                {s.delivers.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
              <p className="excludes"><strong>{labels.excludes}:</strong> {s.excludes}</p>
              <Link className="btn btn-secondary btn-sm" href="/contact">
                {labels.discussCta}: {s.name} <span className="arrow">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section cta-section">
        <div className="container-narrow reveal">
          <h2>{t('cta.title')}</h2>
          <p className="lead">{t('cta.lead')}</p>
          <Link className="btn btn-primary btn-lg" href="/contact">
            {t('cta.primary')}<span className="arrow">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
