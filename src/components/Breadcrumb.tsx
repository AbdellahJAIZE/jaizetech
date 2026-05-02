import { Link } from '@/i18n/routing';

type Props = { current: string };

export default function Breadcrumb({ current }: Props) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      <span className="sep">/</span>
      <span aria-current="page">{current}</span>
    </nav>
  );
}
