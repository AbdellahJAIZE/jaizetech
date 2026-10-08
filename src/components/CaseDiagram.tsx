// Data-driven architecture diagram for a case study.
// Each case in messages/*.json carries a `diagram`: zones (columns), nodes (boxes, one zone each) and edges.
// The layout is computed here, so adding a project never means hand-drawing SVG again.

export type DiagramNode = { id: string; zone: number; label: string; sub?: string; soft?: boolean };
export type DiagramData = {
  zones: string[];
  nodes: DiagramNode[];
  edges: Array<[string, string] | [string, string, 'soft']>;
  footer?: string;
  aria?: string;
};

type Props = { diagram?: DiagramData; size: 'small' | 'large' };

const BOX_W = 150;
const BOX_H = 46;
const ROW_H = 74;
const TOP = 34;

export default function CaseDiagram({ diagram, size }: Props) {
  if (!diagram || !diagram.zones?.length || !diagram.nodes?.length) {
    return <div className="case-diagram-fallback" aria-hidden="true" />;
  }
  const zones = diagram.zones;
  const cols = zones.length;
  const W = Math.max(420, cols * 180);
  const colW = W / cols;

  const perZone: DiagramNode[][] = zones.map((_, z) => diagram.nodes.filter((n) => n.zone === z));
  const maxRows = Math.max(...perZone.map((l) => l.length), 1);
  const bodyH = maxRows * ROW_H;
  const footerH = diagram.footer ? 30 : 10;
  const H = TOP + bodyH + footerH;

  const pos = new Map<string, { x: number; y: number }>();
  perZone.forEach((list, z) => {
    const offset = ((maxRows - list.length) * ROW_H) / 2;
    list.forEach((n, r) => pos.set(n.id, { x: colW * z + colW / 2, y: TOP + offset + r * ROW_H + ROW_H / 2 }));
  });

  const path = (a: string, b: string): string | null => {
    const A = pos.get(a);
    const B = pos.get(b);
    if (!A || !B) return null;
    if (A.x === B.x) {
      const down = B.y > A.y;
      return `M ${A.x} ${down ? A.y + BOX_H / 2 : A.y - BOX_H / 2} L ${B.x} ${down ? B.y - BOX_H / 2 : B.y + BOX_H / 2}`;
    }
    const dir = B.x > A.x ? 1 : -1;
    const ax = A.x + (dir * BOX_W) / 2;
    const bx = B.x - (dir * BOX_W) / 2;
    if (Math.abs(A.y - B.y) < 1) return `M ${ax} ${A.y} L ${bx} ${B.y}`;
    const mid = (ax + bx) / 2;
    return `M ${ax} ${A.y} H ${mid} V ${B.y} H ${bx}`;
  };

  const markerId = `arr-${size}`;
  const small = size === 'small';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={diagram.aria || diagram.footer || zones.join(', ')}
      className={small ? 'case-diagram-svg small' : 'case-diagram-svg'}
    >
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
      {zones.map((zname, z) => (
        <text key={zname + z} className="diag-zone" x={colW * z + colW / 2} y={16} textAnchor="middle">
          {zname}
        </text>
      ))}
      {diagram.edges.map((e, i) => {
        const d = path(e[0], e[1]);
        if (!d) return null;
        return <path key={i} d={d} className={e[2] === 'soft' ? 'diag-arr-soft' : 'diag-arr'} markerEnd={`url(#${markerId})`} />;
      })}
      {diagram.nodes.map((n) => {
        const p = pos.get(n.id)!;
        return (
          <g key={n.id}>
            <rect x={p.x - BOX_W / 2} y={p.y - BOX_H / 2} width={BOX_W} height={BOX_H} rx={6} className={n.soft ? 'diag-soft' : 'diag-box'} />
            <text className="diag-label" x={p.x} y={n.sub ? p.y - 2 : p.y + 4} textAnchor="middle">
              {n.label}
            </text>
            {n.sub && (
              <text className="diag-label-soft" x={p.x} y={p.y + 14} textAnchor="middle">
                {n.sub}
              </text>
            )}
          </g>
        );
      })}
      {diagram.footer && (
        <text className="diag-label-soft" x={W / 2} y={H - 10} textAnchor="middle">
          {diagram.footer}
        </text>
      )}
    </svg>
  );
}
