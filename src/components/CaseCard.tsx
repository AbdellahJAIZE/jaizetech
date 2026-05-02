import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

type Props = {
  index: number;
};

export default function CaseCard({ index }: Props) {
  const t = useTranslations('work');
  const home = useTranslations('home');

  const c = (t.raw('cases') as Array<{
    id: string;
    client: string;
    sector: string;
    year: string;
    role: string;
    summary?: string;
    challenge: string;
    stack: string[];
  }>)[index];

  return (
    <Link className="case-card" href={{ pathname: '/work', hash: c.id }}>
      <div className="case-thumb">
        <span className="thumb-label">case-0{index + 1} · {c.sector.split('·')[0].trim().toLowerCase()}</span>
      </div>
      <div className="body">
        <div className="meta">
          <span>{c.sector.split('·')[0].trim()}</span>
          <span className="dotsep" />
          <span>{c.year}</span>
        </div>
        <h3>{c.client}</h3>
        <p>{c.challenge}</p>
        <div className="tags">
          {c.stack.slice(0, 4).map((s) => (
            <span key={s} className="tag">{s}</span>
          ))}
        </div>
        <span className="read-more">{home('work.viewAll')} →</span>
      </div>
    </Link>
  );
}
