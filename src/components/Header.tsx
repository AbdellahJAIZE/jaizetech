'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LangSwitcher from './LangSwitcher';

export default function Header() {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on Escape, and trap focus inside the menu while open
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    // Move focus to first link in menu
    const firstLink = menuRef.current?.querySelector<HTMLElement>('a, button');
    firstLink?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header" data-scrolled={scrolled ? 'true' : 'false'}>
      <div className="container">
        <div className="nav">
          <Link className="wordmark" href="/" aria-label={t('homeAria')} onClick={closeMenu}>
            Jaize Tech<span className="dot" aria-hidden="true" />
          </Link>

          <nav className="nav-links" aria-label={t('primaryNavAria')}>
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
              <span className="arrow" aria-hidden="true">→</span>
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="nav-toggle"
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="bar" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div
        id="mobile-nav"
        ref={menuRef}
        className="mobile-menu"
        data-open={menuOpen ? 'true' : 'false'}
      >
        <nav aria-label={t('primaryNavAria')}>
          <Link href="/services" onClick={closeMenu}>{t('services')}</Link>
          <Link href="/work" onClick={closeMenu}>{t('work')}</Link>
          <Link href="/about" onClick={closeMenu}>{t('about')}</Link>
          <Link href="/blog" onClick={closeMenu}>{t('blog')}</Link>
          <Link href="/contact" onClick={closeMenu}>{t('contact')}</Link>
          <Link className="btn btn-primary menu-cta" href="/contact" onClick={closeMenu}>
            {t('bookCall')} <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
