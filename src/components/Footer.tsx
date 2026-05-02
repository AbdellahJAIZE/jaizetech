import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="col-brand">
            <Link className="wordmark" href="/" aria-label="jaize home">
              jaize<span className="dot" aria-hidden="true" />
            </Link>
            <p>{t('footer.tagline')}</p>
            <p className="legal-line">
              {t('footer.kvk')} · {t('footer.based')}
            </p>
          </div>

          <div>
            <h4>{t('footer.linksTitle')}</h4>
            <ul>
              <li><Link href="/services">{t('nav.services')}</Link></li>
              <li><Link href="/work">{t('nav.work')}</Link></li>
              <li><Link href="/about">{t('nav.about')}</Link></li>
              <li><Link href="/blog">{t('nav.blog')}</Link></li>
              <li><Link href="/contact">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h4>{t('footer.contactTitle')}</h4>
            <ul>
              <li><a href="mailto:abdellah@jaizetech.nl">abdellah@jaizetech.nl</a></li>
              <li><a href="mailto:info@jaizetech.nl">info@jaizetech.nl</a></li>
            </ul>
          </div>

          <div>
            <h4>Elsewhere</h4>
            <ul>
              <li><a href="https://linkedin.com/in/abdellah-jaize" target="_blank" rel="noopener">LinkedIn</a></li>
              <li><a href="https://github.com/AbdellahJAIZE" target="_blank" rel="noopener">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} Jaize · {t('footer.rights')}</span>
          <div className="legal-links">
            <a href="#">{t('footer.terms')}</a>
            <a href="#">{t('footer.privacy')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
