'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';

export default function LangSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (next: 'nl' | 'en') => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      <button
        type="button"
        data-lang-btn="nl"
        aria-pressed={locale === 'nl'}
        onClick={() => switchTo('nl')}
      >
        NL
      </button>
      <span className="sep">|</span>
      <button
        type="button"
        data-lang-btn="en"
        aria-pressed={locale === 'en'}
        onClick={() => switchTo('en')}
      >
        EN
      </button>
    </div>
  );
}
