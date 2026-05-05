import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import WebPageSchema from '@/components/WebPageSchema';
import { Link } from '@/i18n/routing';
import { pageAlternates, absoluteUrl } from '@/lib/seo';
import { getAllPosts, estimateReadingMinutes } from '@/lib/blog';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const title = t('title');
  const description = t('description');
  const url = absoluteUrl(locale, '/blog');
  const hasPosts = getAllPosts(locale).length > 0;

  return {
    title,
    description,
    alternates: pageAlternates(locale, '/blog'),
    robots: { index: hasPosts, follow: true },
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

export default async function BlogPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const posts = getAllPosts(locale);
  return <Blog posts={posts} />;
}

type PostListItem = {
  slug: string;
  title: string;
  description: string;
  published: string;
  minutes: number;
};

function Blog({ posts }: { posts: ReturnType<typeof getAllPosts> }) {
  const t = useTranslations('blog');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const dateLocale = locale === 'nl' ? 'nl-NL' : 'en-GB';

  const items: PostListItem[] = posts.map((p) => ({
    slug: p.slug,
    title: p.frontmatter.title,
    description: p.frontmatter.description,
    published: p.frontmatter.published,
    minutes: p.frontmatter.readingMinutes ?? estimateReadingMinutes(p.contentMarkdown)
  }));

  return (
    <section className="section">
      <div className="container">
        <Breadcrumb current={t('breadcrumb')} />
        <BreadcrumbSchema
          items={[
            { name: tNav('home'), url: absoluteUrl(locale, '/') },
            { name: t('breadcrumb'), url: absoluteUrl(locale, '/blog') }
          ]}
        />
        <WebPageSchema locale={locale} path="/blog" name={t('title')} description={t('description')} />

        <header style={{ marginBottom: 48, maxWidth: 720 }}>
          <h1>{t('hero.headline')}</h1>
          <p className="lead" style={{ marginTop: 16 }}>{t('hero.lead')}</p>
        </header>

        {items.length === 0 ? (
          <div style={{ maxWidth: 720, margin: '64px auto' }}>
            <div className="subscribe-card">
              <p>{t('subscribeTitle')}</p>
              <Link href="/contact">{t('subscribeLink')}</Link>
            </div>
          </div>
        ) : (
          <ul className="post-list" style={{ listStyle: 'none', padding: 0, margin: 0, maxWidth: 760 }}>
            {items.map((p) => (
              <li key={p.slug} style={{ borderBottom: '1px solid var(--line)', padding: '24px 0' }}>
                <Link href={`/blog/${p.slug}`} style={{ display: 'block' }}>
                  <h2 style={{ fontSize: 24, marginBottom: 8 }}>{p.title}</h2>
                  <p style={{ color: 'var(--muted)', marginBottom: 8 }}>{p.description}</p>
                  <p className="muted-line" style={{ fontSize: 13 }}>
                    {new Date(p.published).toLocaleDateString(dateLocale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}{' '}
                    · {p.minutes} min
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
