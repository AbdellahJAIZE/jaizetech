import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });
  return { title: t('title'), description: t('description') };
}

export default async function TermsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Terms />;
}

function Terms() {
  const t = useTranslations('terms');
  const sections = t.raw('sections') as Array<{ h: string; p: string }>;

  return (
    <section className="section">
      <div className="container-narrow">
        <Breadcrumb current={t('breadcrumb')} />

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
