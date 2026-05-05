import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');

export type PostFrontmatter = {
  title: string;
  description: string;
  published: string; // YYYY-MM-DD
  updated?: string;
  tags?: string[];
  ogImage?: string;
  primaryService?: string;
  readingMinutes?: number;
};

export type Post = {
  slug: string;
  locale: string;
  frontmatter: PostFrontmatter;
  contentMarkdown: string;
  contentHtml: string;
};

function localeDir(locale: string) {
  return path.join(BLOG_DIR, locale);
}

export function getAllSlugs(locale: string): string[] {
  const dir = localeDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getPost(locale: string, slug: string): Post | null {
  const file = path.join(localeDir(locale), `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = matter(raw);
  const frontmatter = parsed.data as PostFrontmatter;
  const contentMarkdown = parsed.content;
  const contentHtml = marked.parse(contentMarkdown, { async: false }) as string;
  return { slug, locale, frontmatter, contentMarkdown, contentHtml };
}

export function getAllPosts(locale: string): Post[] {
  const slugs = getAllSlugs(locale);
  return slugs
    .map((slug) => getPost(locale, slug))
    .filter((p): p is Post => p !== null)
    .sort((a, b) =>
      a.frontmatter.published < b.frontmatter.published ? 1 : -1
    );
}

// Estimate reading time in minutes from markdown body (~200 wpm)
export function estimateReadingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
