import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import Breadcrumb from '@/components/Breadcrumb';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import WebPageSchema from '@/components/WebPageSchema';
import { pageAlternates, absoluteUrl } from '@/lib/seo';
import { routing } from '@/i18n/routing';
import { getPost, getAllSlugs, estimateReadingMinutes } from '@/lib/blog';

type RouteParams = { locale: string; slug: string };

export function generateStaticParams() {
  const params: RouteParams[] = [];
  for (const locale of routing.locales) {
    for (const slug of getAllSlugs(locale)) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(locale, slug);
  if (!post) return {};
  const { title, description, published, updated, ogImage } = post.frontmatter;
  const url = absoluteUrl(locale, `/blog/${slug}`);
  return {
    title,
    description,
    alternates: pageAlternates(locale, `/blog/${slug}`),
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      siteName: 'Jaize Tech',
      locale: locale === 'nl' ? 'nl_NL' : 'en_US',
      publishedTime: published,
      modifiedTime: updated || published,
      authors: ['Abdellah Jaize'],
      images: [{ url: ogImage || '/og-image.png', width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@JaizeAbdellah',
      creator: '@JaizeAbdellah',
      images: [ogImage || '/og-image.png']
    }
  };
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = getPost(locale, slug);
  if (!post) notFound();
  return <PostView slug={slug} html={post.contentHtml} frontmatter={post.frontmatter} markdown={post.contentMarkdown} />;
}

function PostView({
  slug,
  html,
  frontmatter,
  markdown
}: {
  slug: string;
  html: string;
  frontmatter: import('@/lib/blog').PostFrontmatter;
  markdown: string;
}) {
  const t = useTranslations('blog');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const minutes = frontmatter.readingMinutes ?? estimateReadingMinutes(markdown);
  const dateLocale = locale === 'nl' ? 'nl-NL' : 'en-GB';
  const publishedFormatted = new Date(frontmatter.published).toLocaleDateString(
    dateLocale,
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <article className="section">
      <div className="container-narrow">
        <Breadcrumb current={frontmatter.title} />
        <BreadcrumbSchema
          items={[
            { name: tNav('home'), url: absoluteUrl(locale, '/') },
            { name: t('breadcrumb'), url: absoluteUrl(locale, '/blog') },
            { name: frontmatter.title, url: absoluteUrl(locale, `/blog/${slug}`) }
          ]}
        />
        <WebPageSchema
          locale={locale}
          path={`/blog/${slug}`}
          name={frontmatter.title}
          description={frontmatter.description}
        />

        <header style={{ marginBottom: 32 }}>
          <h1>{frontmatter.title}</h1>
          <p className="muted-line" style={{ marginTop: 12 }}>
            {publishedFormatted} · {minutes} min
          </p>
          <p className="lead" style={{ marginTop: 24 }}>{frontmatter.description}</p>
        </header>

        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        <hr className="hr-rule" style={{ margin: '48px 0 24px' }} />

        <p className="muted-line">
          <Link href="/blog">← {t('breadcrumb')}</Link>
        </p>
      </div>
    </article>
  );
}
