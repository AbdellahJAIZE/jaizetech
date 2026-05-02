import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

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
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t('hero.kicker')}</span>
          <h1>{t('hero.headline')}</h1>
          <p className="lead">{t('hero.lead')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-narrow">
          <p className="muted-line">{t('empty')}</p>
        </div>
      </section>
    </>
  );
}
