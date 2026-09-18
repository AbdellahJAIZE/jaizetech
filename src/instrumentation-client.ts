// PostHog monitoring for jaizetech.nl (EU cloud, project 277658 "Jaize Tech (jaizetech.nl)").
// Runs once in the browser before hydration (Next.js instrumentation-client).
// Cookieless mode: no cookies, no localStorage, no session replay — so no cookie banner is needed.
// The key below is PostHog's public write-only project token (safe to ship to browsers).
import posthog from 'posthog-js';

const POSTHOG_KEY = 'phc_vbJ7s5JuVhSvk3JUxTSru8LitEZP9ee3b5Pc7Ny4gQiv';

if (typeof window !== 'undefined' && !window.location.hostname.endsWith('localhost')) {
  posthog.init(POSTHOG_KEY, {
    api_host: 'https://eu.i.posthog.com',
    ui_host: 'https://eu.posthog.com',
    defaults: '2025-05-24',
    cookieless_mode: 'always',
    person_profiles: 'never',
    capture_pageview: 'history_change',
    capture_pageleave: true,
    capture_exceptions: true,
    capture_dead_clicks: true,
    capture_performance: { web_vitals: true },
    disable_session_recording: true,
    autocapture: true
  });
}
