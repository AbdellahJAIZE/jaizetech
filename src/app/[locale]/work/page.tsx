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
  const t = await getTranslations({ locale, namespace: 'work' });
  return { title: t('title'), description: t('description') };
}

export default async function WorkPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Work />;
}

function Work() {
  const t = useTranslations('work');
  const cases = t.raw('cases') as Array<{
    id: string;
    client: string;
    sector: string;
    year: string;
    role: string;
    challenge: string;
    approach: string;
    outcomes: string[];
    stack: string[];
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
          {cases.map((c, idx) => (
            <article key={c.id} id={c.id} className="case-detail">
              <header className="case-detail-head">
                <span className="case-num">case-0{idx + 1}</span>
                <h2>{c.client}</h2>
                <div className="case-meta">
                  <span>{c.sector}</span>
                  <span className="dotsep" />
                  <span>{c.year}</span>
                  <span className="dotsep" />
                  <span>{c.role}</span>
                </div>
              </header>

              <div className="case-body">
                <div>
                  <h4>Uitdaging</h4>
                  <p>{c.challenge}</p>
                </div>
                <div>
                  <h4>Aanpak</h4>
                  <p>{c.approach}</p>
                </div>
                <div>
                  <h4>Resultaat</h4>
                  <ul>
                    {c.outcomes.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Stack</h4>
                  <div className="tags">
                    {c.stack.map((s) => (
                      <span key={s} className="tag">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
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
