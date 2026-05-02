import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

type Props = {
  index: number;
};

export default function ServiceCard({ index }: Props) {
  const t = useTranslations('services');
  const home = useTranslations('home');

  const item = (t.raw('items') as Array<{
    id: string;
    name: string;
    price: string;
    duration: string;
    summary: string;
  }>)[index];

  return (
    <Link className="service-card" href={{ pathname: '/services', hash: item.id }}>
      <div className="top">
        <h3>{item.name}</h3>
        <div className="price-block">
          <span className="price">{item.price}</span>
          <span>{item.duration}</span>
        </div>
      </div>
      <p>{item.summary}</p>
      <span className="read-more">{home('services.viewAll')} →</span>
    </Link>
  );
}
