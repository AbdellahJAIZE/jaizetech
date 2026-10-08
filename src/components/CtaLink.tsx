'use client';

// A link that records a PostHog 'cta_click' (and 'call_booked' for calendar links) before navigating.
// Internal paths go through next-intl's Link so the locale prefix is kept; external/mailto use a plain <a>.
import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';
import { track, trackCta } from '@/lib/track';

type Props = {
  cta: string;
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
};

const CAL_HOST = 'cal.eu';

export default function CtaLink({ cta, href, className, children, ariaLabel }: Props) {
  const external = /^(https?:|mailto:)/.test(href);
  const onClick = () => {
    trackCta(cta);
    if (href.includes(CAL_HOST)) track('call_booked', { cta, href });
  };

  if (external) {
    const isHttp = href.startsWith('http');
    return (
      <a
        className={className}
        href={href}
        onClick={onClick}
        aria-label={ariaLabel}
        {...(isHttp ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link className={className} href={href} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
