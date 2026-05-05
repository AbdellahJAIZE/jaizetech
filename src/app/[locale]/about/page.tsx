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
  const t = await getTranslations({ locale, namespace: 'about' });
  const title = t('title');
  const description = t('description');
  const url = absoluteUrl(locale, '/about');

  return {
    title,
    description,
    alternates: pageAlternates(locale, '/about'),
    openGraph: {
      type: 'profile',
      firstName: 'Abdellah',
      lastName: 'Jaize',
      url,
      title,
      description,
      siteName: 'Jaize Tech',
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      images: [
        { url: '/abdellah.jpg', width: 600, height: 600, alt: 'Abdellah Jaize, AI software engineer based in IJlst, Netherlands' }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@JaizeAbdellah',
      creator: '@JaizeAbdellah',
      images: ['/abdellah.jpg']
    }
  };
}

export default async function AboutPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <About />;
}

function About() {
  const t = useTranslations('about');
  const tNav = useTranslations('nav');
  const locale = useLocale();

  const bio = t.raw('bio') as string[];
  const experience = t.raw('experience.items') as Array<{ date: string; role: string; stack: string }>;
  const education = t.raw('credentials.education') as Array<{ label: string; value: string }>;
  const languages = t.raw('credentials.languages') as Array<{ label: string; value: string }>;
  const photoMeta = t.raw('photoMeta') as { name: string; status: string };
  const photoAlt = t('photoAlt');

  return (
    <section className="section">
      <div className="container">
        <Breadcrumb current={t('breadcrumb')} />
        <BreadcrumbSchema
          items={[
            { name: tNav('home'), url: absoluteUrl(locale, '/') },
            { name: t('breadcrumb'), url: absoluteUrl(locale, '/about') }
          ]}
        />
        <WebPageSchema locale={locale} path="/about" name={t('title')} description={t('description')} />

        {/* Hero: photo block + content */}
        <div className="about-hero">
          <div>
            <div className="photo-block">
              <img
                src="/abdellah.jpg"
                alt={photoAlt}
                width={600}
                height={600}
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            </div>
            <div className="photo-meta">
              <div><span>{photoMeta.name}</span><span>· {photoMeta.status}</span></div>
            </div>
          </div>
          <div>
            <p className="role">{t('hero.role')}</p>
            <h1>{t('hero.name')}</h1>
            <div className="bio">
              {bio.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </div>

        {/* 01 — Experience */}
        <section className="numbered-section">
          <div className="section-label">{t('experience.label')}</div>
          <h2>{t('experience.title')}</h2>
          <div className="work-rows">
            {experience.map((row, i) => (
              <div key={i} className="work-row">
                <div className="date">{row.date}</div>
                <div>
                  <h3>{row.role}</h3>
                  <div className="stack">{row.stack}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 02 — Education + Languages */}
        <section className="numbered-section">
          <div className="section-label">{t('credentials.label')}</div>
          <h2>{t('credentials.title')}</h2>
          <div className="dual-list">
            <div className="col">
              <h4>{t('credentials.educationLabel')}</h4>
              <dl>
                {education.map((row, i) => (
                  <span key={i} style={{ display: 'contents' }}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </span>
                ))}
              </dl>
            </div>
            <div className="col">
              <h4>{t('credentials.languagesLabel')}</h4>
              <dl>
                {languages.map((row, i) => (
                  <span key={i} style={{ display: 'contents' }}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </span>
                ))}
                <dt>{t('credentials.kvkLabel')}</dt>
                <dd>{t('credentials.kvkValue')}</dd>
              </dl>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="numbered-section" style={{ borderTop: '1px solid var(--line)', paddingBottom: 0 }}>
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
