// The Jaize Tech mark: the favicon (dark tile, lowercase j, orange dot) next to the wordmark.
// Same shapes as src/app/icon.svg and the social cards, so the brand reads the same everywhere.
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="logo">
      <svg className="logo-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <rect width="64" height="64" rx="12" fill="#0E0E10" />
        <text x="32" y="48" textAnchor="middle" fontFamily="Inter, system-ui, -apple-system, sans-serif" fontWeight="600" fontSize="44" letterSpacing="-2" fill="#FAFAF7">j</text>
        <circle cx="44" cy="22" r="5" fill="#FF6B35" />
      </svg>
      <span className="logo-text">Jaize Tech</span>
    </span>
  );
}
