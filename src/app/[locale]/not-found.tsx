import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function NotFound() {
  const t = useTranslations('notFound');
  const tNav = useTranslations('nav');

  return (
    <section className="page-hero">
      <div className="container-narrow">
        <span className="eyebrow">404</span>
        <h1>{t('title')}</h1>
        <p className="lead">{t('lead')}</p>

        <div className="hero-actions" style={{ marginTop: 24 }}>
          <Link className="btn btn-primary" href="/">
            {t('backHome')}<span className="arrow">→</span>
          </Link>
          <Link className="btn btn-secondary" href="/services">
            {tNav('services')}<span className="arrow">→</span>
          </Link>
        </div>

        <nav aria-label={t('helpLinksAria')} style={{ marginTop: 40 }}>
          <p className="muted-line" style={{ marginBottom: 12 }}>{t('tryThese')}</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <li><Link href="/work">{tNav('work')}</Link></li>
            <li><Link href="/about">{tNav('about')}</Link></li>
            <li><Link href="/blog">{tNav('blog')}</Link></li>
            <li><Link href="/contact">{tNav('contact')}</Link></li>
          </ul>
        </nav>
      </div>
    </section>
  );
}
