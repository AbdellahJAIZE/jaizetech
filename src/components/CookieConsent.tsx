'use client';

// Cookie banner for PostHog (see src/instrumentation-client.ts). Shown only while the visitor has not answered.
// Accept -> posthog.opt_in_capturing(): cookies + session replay (inputs masked). Decline -> stays cookieless.
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function CookieConsent() {
  const t = useTranslations('cookies');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let tries = 0;
    const check = () => {
      try {
        if (posthog.__loaded) {
          setOpen(posthog.get_explicit_consent_status() === 'pending');
          return;
        }
      } catch {
        return;
      }
      if (tries++ < 40) setTimeout(check, 250);
    };
    check();
  }, []);

  if (!open) return null;

  const choose = (accept: boolean) => {
    try {
      if (accept) posthog.opt_in_capturing();
      else posthog.opt_out_capturing();
    } catch {
      // PostHog not loaded (blocked by an extension): nothing to consent to
    }
    setOpen(false);
  };

  return (
    <div role="dialog" aria-live="polite" aria-label={t('aria')} className="cookie-consent">
      <p>
        {t('text')} <Link href="/privacy">{t('privacy')}</Link>
      </p>
      <div className="cookie-consent__actions">
        <button type="button" className="cookie-consent__btn cookie-consent__btn--ghost" onClick={() => choose(false)}>
          {t('decline')}
        </button>
        <button type="button" className="cookie-consent__btn" onClick={() => choose(true)}>
          {t('accept')}
        </button>
      </div>
    </div>
  );
}
