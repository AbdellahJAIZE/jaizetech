// Conversion events for PostHog. Safe to call anywhere in the browser:
// a no-op during SSR, when PostHog is blocked, or before it has loaded.
// Consent is handled by PostHog itself (see src/instrumentation-client.ts):
// cookieless until the visitor accepts the banner, so these calls never set cookies on their own.
import posthog from 'posthog-js';

export type CtaId =
  | 'header'
  | 'hero_call'
  | 'hero_mail'
  | 'home_cta'
  | 'services_audit'
  | 'services_hardening'
  | 'services_build'
  | 'services_cta'
  | 'work_cta'
  | 'about_cta'
  | 'contact_call_15'
  | 'contact_call_30'
  | 'contact_mail'
  | 'footer';

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    if (posthog.__loaded) posthog.capture(event, props);
  } catch {
    // PostHog not available: nothing to record
  }
}

export function trackCta(cta: CtaId | string): void {
  track('cta_click', { cta });
}
