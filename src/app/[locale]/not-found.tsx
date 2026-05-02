import { Link } from '@/i18n/routing';

export default function NotFound() {
  return (
    <section className="page-hero">
      <div className="container-narrow">
        <span className="eyebrow">404</span>
        <h1>Page not found.</h1>
        <p className="lead">The page you were looking for doesn't exist.</p>
        <Link className="btn btn-primary" href="/">Take me home<span className="arrow">→</span></Link>
      </div>
    </section>
  );
}
