import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['nl', 'en'],
  defaultLocale: 'nl',
  localePrefix: {
    mode: 'as-needed'
  },
  pathnames: {
    '/': '/',
    '/services': {
      nl: '/diensten',
      en: '/services'
    },
    '/work': {
      nl: '/werk',
      en: '/work'
    },
    '/about': {
      nl: '/over',
      en: '/about'
    },
    '/blog': '/blog',
    '/blog/[slug]': '/blog/[slug]',
    '/contact': '/contact'
  }
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
