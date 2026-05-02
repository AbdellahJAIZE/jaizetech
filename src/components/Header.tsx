'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LangSwitcher from './LangSwitcher';

export default function Header() {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu when clicking a link
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header" data-scrolled={scrolled ? 'true' : 'false'}>
      <div className="container">
        <div className="nav">
          <Link className="wordmark" href="/" aria-label="jaize home" onClick={closeMenu}>
            jaize<span className="dot" aria-hidden="true" />
          </Link>

          <nav className="nav-links" aria-label="Primary">
            <Link href="/services">{t('services')}</Link>
            <Link href="/work">{t('work')}</Link>
            <Link href="/about">{t('about')}</Link>
            <Link href="/blog">{t('blog')}</Link>
            <Link href="/contact">{t('contact')}</Link>
          </nav>

          <div className="nav-right">
            <LangSwitcher />
            <Link className="btn btn-primary btn-sm desktop-only" href="/contact">
              {t('bookCall')}
              <span className="arrow">→</span>
            </Link>
            <button
              type="button"
              className="nav-toggle"
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="bar" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="mobile-menu" data-open={menuOpen ? 'true' : 'false'}>
        <nav>
          <Link href="/services" onClick={closeMenu}>{t('services')}</Link>
          <Link href="/work" onClick={closeMenu}>{t('work')}</Link>
          <Link href="/about" onClick={closeMenu}>{t('about')}</Link>
          <Link href="/blog" onClick={closeMenu}>{t('blog')}</Link>
          <Link href="/contact" onClick={closeMenu}>{t('contact')}</Link>
          <Link className="btn btn-primary menu-cta" href="/contact" onClick={closeMenu}>
            {t('bookCall')} →
          </Link>
        </nav>
      </div>
    </header>
  );
}
