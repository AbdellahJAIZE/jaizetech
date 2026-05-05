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
  const homePath = locale === routing.defaultLocale ? '/' : `/${locale}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t('defaultTitle'),
      template: '%s · Jaize Tech'
    },
    description: t('defaultDescription'),
    applicationName: 'Jaize Tech',
    authors: [{ name: 'Abdellah Jaize', url: 'https://jaizetech.nl/about' }],
    creator: 'Abdellah Jaize',
    publisher: 'Jaize Tech',
    keywords:
      locale === 'nl'
        ? [
            'AI software engineer Nederland',
            'freelance AI engineer',
            'productie AI',
            'AI-agenten',
            'RAG-assistent',
            'document-automatisering',
            'OCR pipeline',
            'LangGraph',
            'fractional CTO Nederland',
            'AI MVP',
            'Friesland'
          ]
        : [
            'AI software engineer Netherlands',
            'freelance AI engineer NL',
            'production AI',
            'AI agents',
            'RAG assistant',
            'document automation',
            'OCR pipeline',
            'LangGraph',
            'fractional CTO Netherlands',
            'AI MVP',
            'Dutch agritech AI'
          ],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1
      }
    },
    alternates: {
      canonical: homePath,
      languages: {
        nl: '/',
        en: '/en',
        'x-default': '/'
      }
    },
    openGraph: {
      type: 'website',
      url: `${siteUrl}${homePath}`,
      title: t('defaultTitle'),
      description: t('defaultDescription'),
      siteName: 'Jaize Tech',
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      alternateLocale: locale === 'nl' ? ['en_US'] : ['nl_NL'],
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: home('hero.headline'),
          type: 'image/png'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: t('defaultTitle'),
      description: t('defaultDescription'),
      site: '@JaizeAbdellah',
      creator: '@JaizeAbdellah',
      images: ['/og-image.png']
    },
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }]
    },
    manifest: '/site.webmanifest',
    themeColor: '#0E0E10',
    other: {
      'format-detection': 'telephone=no'
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
          <a href="#main" className="skip-link">
            {locale === 'nl' ? 'Direct naar inhoud' : 'Skip to content'}
          </a>
          <Header />
          <main id="main" tabIndex={-1}>{children}</main>
          <Footer />
          <RevealOnScroll />
        </NextIntlClientProvider>
        <SchemaJsonLd locale={locale} />
      </body>
    </html>
  );
}
