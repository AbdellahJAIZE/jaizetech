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
  tags: string[];
};

function Blog({ posts }: { posts: ReturnType<typeof getAllPosts> }) {
  const t = useTranslations('blog');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const dateLocale = locale === 'nl' ? 'nl-NL' : 'en-GB';
  const readPost = locale === 'nl' ? 'Lees post' : 'Read post';

  const items: PostListItem[] = posts.map((p) => ({
    slug: p.slug,
    title: p.frontmatter.title,
    description: p.frontmatter.description,
    published: p.frontmatter.published,
    minutes: p.frontmatter.readingMinutes ?? estimateReadingMinutes(p.contentMarkdown),
    tags: (p.frontmatter.tags ?? []).slice(0, 3)
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
          <div className="posts-grid">
            {items.map((p) => (
              <Link
                key={p.slug}
                className="post-card"
                href={`/blog/${p.slug}`}
                aria-label={`${readPost}: ${p.title}`}
              >
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <div className="post-tags">
                  {p.tags.map((tag) => <span key={tag} className="post-tag">{tag}</span>)}
                </div>
                <span className="post-meta">
                  {new Date(p.published).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
                  {' · '}{p.minutes} min
                </span>
                <span className="read-more">{readPost} <span aria-hidden="true">→</span></span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
