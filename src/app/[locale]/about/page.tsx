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
  const t = await getTranslations({ locale, namespace: 'about' });
  return { title: t('title'), description: t('description') };
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

  const bio = t.raw('bio') as string[];
  const approachItems = t.raw('approach.items') as Array<{ num: string; title: string; body: string }>;
  const experience = t.raw('experience.items') as Array<{ date: string; role: string; stack: string }>;
  const education = t.raw('credentials.education') as Array<{ label: string; value: string }>;
  const languages = t.raw('credentials.languages') as Array<{ label: string; value: string }>;
  const stackGroups = t.raw('stack.groups') as Array<{ label: string; items: string[] }>;
  const photoMeta = t.raw('photoMeta') as { name: string; status: string };

  return (
    <section className="section">
      <div className="container">
        <Breadcrumb current={t('breadcrumb')} />

        {/* Hero: photo block + content */}
        <div className="about-hero">
          <div>
            <div className="photo-block" aria-hidden="true">{t('photoInitials')}</div>
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

        {/* 01 — Approach */}
        <section className="numbered-section">
          <div className="section-label">{t('approach.label')}</div>
          <h2>{t('approach.title')}</h2>
          <div className="approach-grid">
            {approachItems.map((item) => (
              <div key={item.num} className="approach-card">
                <div className="num">{item.num}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 02 — Experience */}
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

        {/* 03 — Education + Languages */}
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

        {/* 04 — Tools & tech */}
        <section className="numbered-section">
          <div className="section-label">{t('stack.label')}</div>
          <h2>{t('stack.title')}</h2>
          <div className="tools-groups">
            {stackGroups.map((g) => (
              <div key={g.label} className="tool-group">
                <div className="tool-label">{g.label}</div>
                <div className="tags">
                  {g.items.map((it) => (
                    <span key={it} className="tag">{it}</span>
                  ))}
                </div>
              </div>
            ))}
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
