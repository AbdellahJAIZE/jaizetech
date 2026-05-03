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
  const t = await getTranslations({ locale, namespace: 'blog' });
  return { title: t('title'), description: t('description') };
}

export default async function BlogPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Blog />;
}

function Blog() {
  const t = useTranslations('blog');

  return (
    <section className="section">
      <div className="container">
        <Breadcrumb current={t('breadcrumb')} />

        <header style={{ marginBottom: 32, maxWidth: 720 }}>
          <h1>{t('hero.headline')}</h1>
          <p className="lead" style={{ marginTop: 16 }}>{t('hero.lead')}</p>
        </header>

        {/* Empty state — first post hint and subscribe card */}
        <div style={{ maxWidth: 720, margin: '64px auto' }}>
          <div className="subscribe-card">
            <p>{t('subscribeTitle')}</p>
            <a href="/contact">{t('subscribeLink')}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
