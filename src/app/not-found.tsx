import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 · Jaize',
  description: 'Page not found.',
  robots: { index: false, follow: false }
};

export default function GlobalNotFound() {
  // Bilingual root-level 404 served by Cloudflare Pages for any unknown path
  // outside known locale segments. Keeps Header/Footer styling out for simplicity.
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          background: '#FAFAF7',
          color: '#0E0E10',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}
      >
        <main style={{ maxWidth: 560, textAlign: 'center' }}>
          <div
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
              fontSize: 12,
              letterSpacing: '0.08em',
              color: '#6B6B70',
              marginBottom: 24
            }}
          >
            404
          </div>
          <h1 style={{ fontSize: 32, lineHeight: 1.15, margin: '0 0 16px' }}>
            Page not found · Pagina niet gevonden
          </h1>
          <p style={{ color: '#6B6B70', marginBottom: 32 }}>
            The page you are looking for does not exist.
            <br />
            De pagina die je zoekt bestaat niet.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Plain anchors are intentional here. This 404 renders its own <html> outside
                the locale layout, so we cannot use the next-intl <Link>. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                display: 'inline-block',
                padding: '12px 20px',
                background: '#0E0E10',
                color: '#FAFAF7',
                textDecoration: 'none',
                borderRadius: 4,
                fontWeight: 600
              }}
            >
              Naar de homepage →
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/en"
              style={{
                display: 'inline-block',
                padding: '12px 20px',
                background: 'transparent',
                color: '#0E0E10',
                textDecoration: 'none',
                borderRadius: 4,
                fontWeight: 600,
                border: '1px solid #0E0E10'
              }}
            >
              Go to homepage →
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
