import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import Breadcrumb from '@/components/Breadcrumb';

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
    duration: string;
    for: string;
    delivers: string;
    excludes: string;
    discussCta: string;
    scopeNote: string;
  };
  const items = t.raw('items') as Array<{
    id: string;
    name: string;
    duration: string;
    for: string;
    summary: string;
    delivers: string[];
    excludes: string;
  }>;

  return (
    <section className="section">
      <div className="container">
        <Breadcrumb current={t('breadcrumb')} />

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
                  <div className="num">{num} — DIENST</div>
                  <h2>{s.name}</h2>
                  <p className="summary">{s.summary}</p>

                  <span className="delivers-label">{labels.delivers}</span>
                  <ul className="delivers">
                    {s.delivers.map((d, j) => <li key={j}>{d}</li>)}
                  </ul>

                  <p className="for-line">
                    <strong>{labels.for}:</strong> {s.for}
                  </p>
                  <p className="for-line" style={{ borderLeftColor: 'transparent' }}>
                    <strong>{labels.excludes}:</strong> {s.excludes}
                  </p>
                </div>

                <aside className="meta-rail">
                  <span className="label">{labels.duration}</span>
                  <div className="value">{s.duration}</div>

                  <span className="label">{labels.scopeNote}</span>
                  <div className="value" style={{ fontSize: 13, color: 'var(--muted)' }}>—</div>

                  <Link className="btn btn-secondary btn-sm" href="/contact">
                    {labels.discussCta}<span className="arrow">→</span>
                  </Link>
                </aside>
              </article>
            );
          })}
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
