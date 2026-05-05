'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';

export default function LangSwitcher() {
  const locale = useLocale();
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (next: 'nl' | 'en') => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div className="lang-switcher" role="group" aria-label={t('languageAria')}>
      <button
        type="button"
        data-lang-btn="nl"
        aria-pressed={locale === 'nl'}
        aria-label={t('switchToDutchAria')}
        lang="nl"
        onClick={() => switchTo('nl')}
      >
        NL
      </button>
      <span className="sep" aria-hidden="true">|</span>
      <button
        type="button"
        data-lang-btn="en"
        aria-pressed={locale === 'en'}
        aria-label={t('switchToEnglishAria')}
        lang="en"
        onClick={() => switchTo('en')}
      >
        EN
      </button>
    </div>
  );
}
