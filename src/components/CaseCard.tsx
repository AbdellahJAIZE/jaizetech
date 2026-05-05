import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

type Props = {
  index: number;
};

export default function CaseCard({ index }: Props) {
  const t = useTranslations('work');

  const c = (t.raw('cases') as Array<{
    id: string;
    client: string;
    sector: string;
    year: string;
    role: string;
    summary?: string;
    challenge?: string;
    stack: string[];
  }>)[index];

  const readCase = t('labels.readCase');
  const description = c.challenge || c.summary || '';

  return (
    <Link
      className="case-card"
      href={{ pathname: '/work', hash: c.id }}
      aria-label={`${readCase}: ${c.client}`}
    >
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
        <p>{description}</p>
        <div className="tags">
          {c.stack.slice(0, 4).map((s) => (
            <span key={s} className="tag">{s}</span>
          ))}
        </div>
        <span className="read-more">{readCase} <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}
