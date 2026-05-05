'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useTranslations } from 'next-intl';

export default function ContactForm() {
  const t = useTranslations('contact.form');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Move focus to success container so screen readers announce it
  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      company: String(fd.get('company') || ''),
      message: String(fd.get('message') || '')
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Request failed');
      setSubmitted(true);
    } catch (err) {
      setError(t('errorText'));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        ref={successRef}
        className="success-state"
        role="status"
        aria-live="polite"
        tabIndex={-1}
      >
        <div className="check" aria-hidden="true">✓</div>
        <h3>{t('successTitle')}</h3>
        <p>{t('successText')}</p>
      </div>
    );
  }

  const requiredMark = t('requiredMark');

  return (
    <form onSubmit={onSubmit} noValidate aria-describedby="cf-required-hint">
      <p id="cf-required-hint" className="muted-line" style={{ marginBottom: 12, fontSize: 13 }}>
        {t('requiredHint')}
      </p>
      <div className="field">
        <label htmlFor="cf-name">
          {t('name')} <span aria-hidden="true" style={{ color: 'var(--accent)' }}>*</span>
          <span className="sr-only"> ({requiredMark})</span>
        </label>
        <input id="cf-name" name="name" type="text" required autoComplete="name" aria-required="true" />
      </div>
      <div className="field">
        <label htmlFor="cf-email">
          {t('email')} <span aria-hidden="true" style={{ color: 'var(--accent)' }}>*</span>
          <span className="sr-only"> ({requiredMark})</span>
        </label>
        <input id="cf-email" name="email" type="email" required autoComplete="email" aria-required="true" />
      </div>
      <div className="field">
        <label htmlFor="cf-company">{t('company')}</label>
        <input id="cf-company" name="company" type="text" autoComplete="organization" />
      </div>
      <div className="field">
        <label htmlFor="cf-message">
          {t('message')} <span aria-hidden="true" style={{ color: 'var(--accent)' }}>*</span>
          <span className="sr-only"> ({requiredMark})</span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={6}
          required
          aria-required="true"
          placeholder={t('messagePlaceholder')}
        />
      </div>
      {error && (
        <p className="form-error" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? '…' : t('submit')}
        <span className="arrow" aria-hidden="true">→</span>
      </button>
    </form>
  );
}
