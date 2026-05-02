'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';

export default function ContactForm() {
  const t = useTranslations('contact.form');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError('Could not send the message. Please email me directly at abdellah@jaizetech.nl.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="success-state">
        <div className="check" aria-hidden="true">✓</div>
        <h3>{t('successTitle')}</h3>
        <p>{t('successText')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="cf-name">{t('name')}</label>
        <input id="cf-name" name="name" type="text" required autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="cf-email">{t('email')}</label>
        <input id="cf-email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="cf-company">{t('company')}</label>
        <input id="cf-company" name="company" type="text" autoComplete="organization" />
      </div>
      <div className="field">
        <label htmlFor="cf-message">{t('message')}</label>
        <textarea
          id="cf-message"
          name="message"
          rows={6}
          required
          placeholder={t('messagePlaceholder')}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? '…' : t('submit')}
        <span className="arrow">→</span>
      </button>
    </form>
  );
}
