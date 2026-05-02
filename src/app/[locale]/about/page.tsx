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
  const approach = t.raw('approach.items') as string[];
  const education = t.raw('credentials.education') as string[];
  const certs = t.raw('credentials.certs') as string[];
  const languages = t.raw('credentials.languages') as string[];
  const stackGroups = t.raw('stack.groups') as Array<{ label: string; items: string[] }>;

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
          <div className="bio">
            {bio.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="approach">
            <h3>{t('approach.title')}</h3>
            <ul>
              {approach.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>

          <div className="credentials">
            <h3>{t('credentials.title')}</h3>
            <div className="creds-grid">
              <div>
                <h4>Education</h4>
                <ul>{education.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
              <div>
                <h4>Certifications</h4>
                <ul>{certs.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </div>
              <div>
                <h4>Languages</h4>
                <ul>{languages.map((l, i) => <li key={i}>{l}</li>)}</ul>
              </div>
            </div>
          </div>

          <div className="stack">
            <h3>{t('stack.title')}</h3>
            <div className="stack-groups">
              {stackGroups.map((g) => (
                <div key={g.label}>
                  <h4>{g.label}</h4>
                  <div className="tags">
                    {g.items.map((it) => (
                      <span key={it} className="tag">{it}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
