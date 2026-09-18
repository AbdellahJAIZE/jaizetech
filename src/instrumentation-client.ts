// PostHog monitoring for jaizetech.nl (EU cloud, project 277658 "Jaize Tech (jaizetech.nl)").
// Runs once in the browser before hydration (Next.js instrumentation-client).
// Consent-aware: cookieless (no cookies, no storage, no replay) until the visitor accepts the cookie banner
// (src/components/CookieConsent.tsx); after acceptance PostHog uses cookies and records session replays with all inputs masked.
// Decline (or no answer) keeps it cookieless. The choice itself is remembered in localStorage.
// The key below is PostHog's public write-only project token (safe to ship to browsers).
import posthog from 'posthog-js';

const POSTHOG_KEY = 'phc_vbJ7s5JuVhSvk3JUxTSru8LitEZP9ee3b5Pc7Ny4gQiv';

if (typeof window !== 'undefined' && !window.location.hostname.endsWith('localhost')) {
  posthog.init(POSTHOG_KEY, {
    api_host: 'https://eu.i.posthog.com',
    ui_host: 'https://eu.posthog.com',
    defaults: '2025-05-24',
    cookieless_mode: 'on_reject',
    opt_out_capturing_by_default: true,
    person_profiles: 'never',
    capture_pageview: 'history_change',
    capture_pageleave: true,
    capture_exceptions: true,
    capture_dead_clicks: true,
    capture_performance: { web_vitals: true },
    session_recording: { maskAllInputs: true, maskTextSelector: '[data-ph-mask]' },
    autocapture: true
  });
}
