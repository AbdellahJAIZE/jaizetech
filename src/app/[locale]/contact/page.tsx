import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import WebPageSchema from '@/components/WebPageSchema';
import { pageAlternates, absoluteUrl } from '@/lib/seo';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  const title = t('title');
  const description = t('description');
  const url = absoluteUrl(locale, '/contact');

  return {
    title,
    description,
    alternates: pageAlternates(locale, '/contact'),
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'Jaize Tech',
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@JaizeAbdellah',
      creator: '@JaizeAbdellah',
      images: ['/og-image.png']
    }
  };
}

export default async function ContactPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Contact />;
}

function Contact() {
  const t = useTranslations('contact');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const newTab = tNav('newTabSuffix');

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: tNav('home'), url: absoluteUrl(locale, '/') },
          { name: tNav('contact'), url: absoluteUrl(locale, '/contact') }
        ]}
      />
      <WebPageSchema locale={locale} path="/contact" name={t('title')} description={t('description')} />
      <section className="page-hero" style={{ borderBottom: 0 }}>
        <div className="container-narrow">
          <h1>{t('hero.headline')}</h1>
          <p className="lead">{t('hero.lead')}</p>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-card">
              <h2>{t('options.scheduleTitle')}</h2>
              <p>{t('options.scheduleLead')}</p>
              <div className="cal-buttons">
                <a
                  className="btn btn-primary"
                  href="https://www.cal.eu/jaize/15min?overlayCalendar=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t('options.scheduleIntro')} ${newTab}`}
                >
                  {t('options.scheduleIntro')}<span className="arrow" aria-hidden="true">→</span>
                </a>
                <a
                  className="btn btn-secondary"
                  href="https://www.cal.eu/jaize/30min?overlayCalendar=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t('options.scheduleDeeper')} ${newTab}`}
                >
                  {t('options.scheduleDeeper')}<span className="arrow" aria-hidden="true">→</span>
                </a>
              </div>
            </div>

            <div className="contact-card">
              <h2>{t('options.messageTitle')}</h2>
              <p>{t('options.messageLead')}</p>
              <ContactForm />
            </div>
          </div>

          <p className="muted-line center">{t('trust')}</p>
          <p className="muted-line center">
            {t('directMailPrefix')}{' '}
            <a href={`mailto:${t('directMailAddress')}`} style={{ borderBottom: '1px solid currentColor' }}>{t('directMailAddress')}</a>
          </p>
        </div>
      </section>
    </>
  );
}
