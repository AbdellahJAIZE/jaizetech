import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return { title: t('title'), description: t('description') };
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

  return (
    <>
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
              <h3>{t('options.scheduleTitle')}</h3>
              <p>{t('options.scheduleLead')}</p>
              <div className="cal-buttons">
                <a
                  className="btn btn-primary"
                  href="https://www.cal.eu/jaize/15min?overlayCalendar=true"
                  target="_blank"
                  rel="noopener"
                >
                  {t('options.scheduleIntro')}<span className="arrow">→</span>
                </a>
                <a
                  className="btn btn-secondary"
                  href="https://www.cal.eu/jaize/30min?overlayCalendar=true"
                  target="_blank"
                  rel="noopener"
                >
                  {t('options.scheduleDeeper')}<span className="arrow">→</span>
                </a>
              </div>
            </div>

            <div className="contact-card">
              <h3>{t('options.messageTitle')}</h3>
              <p>{t('options.messageLead')}</p>
              <ContactForm />
            </div>
          </div>

          <p className="muted-line center">{t('trust')}</p>
          <p className="muted-line center">
            {t('directMailPrefix')}{' '}
            <a href={`mailto:${t('directMailAddress')}`}>{t('directMailAddress')}</a>
          </p>
        </div>
      </section>
    </>
  );
}
