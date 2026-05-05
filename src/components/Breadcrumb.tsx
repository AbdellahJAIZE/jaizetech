import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

type Props = { current: string };

export default function Breadcrumb({ current }: Props) {
  const t = useTranslations('nav');
  return (
    <nav className="breadcrumb" aria-label={t('breadcrumbAria')}>
      <Link href="/">{t('home')}</Link>
      <span className="sep" aria-hidden="true">/</span>
      <span aria-current="page">{current}</span>
    </nav>
  );
}
