import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations, getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RevealOnScroll from '@/components/RevealOnScroll';
import SchemaJsonLd from '@/components/SchemaJsonLd';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter'
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono'
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const home = await getTranslations({ locale, namespace: 'home' });
  const siteUrl = t('siteUrl');

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t('defaultTitle'),
      template: '%s · Jaize'
    },
    description: t('defaultDescription'),
    robots: { index: false, follow: false },
    alternates: {
      canonical: locale === 'nl' ? '/' : '/en',
      languages: {
        nl: '/',
        en: '/en'
      }
    },
    openGraph: {
      type: 'website',
      url: siteUrl,
      title: home('hero.headline'),
      description: home('hero.lead'),
      siteName: 'Jaize',
      locale: locale === 'nl' ? 'nl_NL' : 'en_US'
    },
    twitter: {
      card: 'summary_large_image',
      title: home('hero.headline'),
      description: home('hero.lead')
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${jetbrains.variable}`}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main>{children}</main>
          <Footer />
          <RevealOnScroll />
        </NextIntlClientProvider>
        <SchemaJsonLd locale={locale} />
      </body>
    </html>
  );
}
