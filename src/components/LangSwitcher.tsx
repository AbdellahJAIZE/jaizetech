'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import type { Pathnames } from '@/i18n/routing';

export default function LangSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const switchTo = (next: 'nl' | 'en') => {
    if (next === locale) return;
    // @ts-expect-error -- pathname is dynamic
    router.replace({ pathname, params }, { locale: next });
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
