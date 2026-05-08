type Props = {
  type: string;
  size: 'small' | 'large';
};

export default function CaseDiagram({ type, size }: Props) {
  if (type === 'agritech' || type === 'inovaa') {
    return size === 'small' ? <AgritechSmall /> : <AgritechLarge />;
  }
  if (type === 'appistadium') {
    return size === 'small' ? <AppistadiumSmall /> : <AppistadiumLarge />;
  }
  return null;
}

const arrowMarker = (id: string) => (
  <defs>
    <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink)" />
    </marker>
  </defs>
);

function AgritechSmall() {
  return (
    <svg viewBox="0 0 420 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-label="Hybrid architecture: edge cameras send images via cloud sync to on-prem GPU inference and annotation UI, with PostgreSQL label store">
      {arrowMarker('a-arr-1')}

      {/* Top section labels */}
      <text className="diag-zone" x="50" y="14" textAnchor="middle">EDGE</text>
      <text className="diag-zone" x="148" y="14" textAnchor="middle">CLOUD</text>
      <text className="diag-zone" x="270" y="14" textAnchor="middle">ON-PREM</text>
      <text className="diag-zone" x="370" y="14" textAnchor="middle">UI</text>

      {/* Edge */}
      <rect className="diag-soft" x="10" y="46" width="80" height="42" rx="4" />
      <text className="diag-label" x="50" y="64" textAnchor="middle">Edge cams</text>
      <text className="diag-label-soft" x="50" y="78" textAnchor="middle">field input</text>

      {/* Cloud */}
      <rect className="diag-box" x="108" y="46" width="80" height="42" rx="4" />
      <text className="diag-label" x="148" y="64" textAnchor="middle">Cloud API</text>
      <text className="diag-label-soft" x="148" y="78" textAnchor="middle">sync</text>

      {/* On-prem GPU + API combined */}
      <rect className="diag-box" x="206" y="46" width="128" height="42" rx="4" />
      <text className="diag-label" x="270" y="64" textAnchor="middle">Triton + NestJS</text>
      <text className="diag-label-soft" x="270" y="78" textAnchor="middle">GPU inference · API</text>

      {/* UI */}
      <rect className="diag-box" x="338" y="46" width="78" height="42" rx="4" />
      <text className="diag-label" x="377" y="64" textAnchor="middle">Vue UI</text>
      <text className="diag-label-soft" x="377" y="78" textAnchor="middle">annotation</text>

      {/* PostgreSQL under on-prem */}
      <rect className="diag-soft" x="226" y="100" width="88" height="26" rx="4" />
      <text className="diag-label-soft" x="270" y="117" textAnchor="middle">PostgreSQL</text>

      {/* Arrows */}
      <path className="diag-arr" d="M 90 67 L 106 67" markerEnd="url(#a-arr-1)" />
      <path className="diag-arr" d="M 188 67 L 204 67" markerEnd="url(#a-arr-1)" />
      <path className="diag-arr" d="M 334 67 L 338 67" markerEnd="url(#a-arr-1)" />
      <path className="diag-arr-soft" d="M 270 88 L 270 100" />
    </svg>
  );
}

function AgritechLarge() {
  return (
    <svg viewBox="0 0 720 260" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-label="Hybrid distributed architecture: edge devices capture images, cloud orchestration syncs to on-prem GPU inference (Triton with ResNet and YOLO models) and NestJS API, feeding Vue annotation UI and PostgreSQL label store, deployed across hybrid on-prem and cloud infrastructure">
      {arrowMarker('a-arr-2')}

      {/* Zone labels */}
      <text className="diag-zone" x="80" y="20" textAnchor="middle">EDGE</text>
      <text className="diag-zone" x="240" y="20" textAnchor="middle">CLOUD</text>
      <text className="diag-zone" x="450" y="20" textAnchor="middle">ON-PREM</text>
      <text className="diag-zone" x="640" y="20" textAnchor="middle">CLIENT</text>

      {/* Edge */}
      <rect className="diag-soft" x="20" y="110" width="120" height="56" rx="4" />
      <text className="diag-label" x="80" y="135" textAnchor="middle">Edge devices</text>
      <text className="diag-label-soft" x="80" y="152" textAnchor="middle">field cameras</text>

      {/* Cloud */}
      <rect className="diag-box" x="180" y="110" width="120" height="56" rx="4" />
      <text className="diag-label" x="240" y="135" textAnchor="middle">Cloud API</text>
      <text className="diag-label-soft" x="240" y="152" textAnchor="middle">sync · WebSocket</text>

      {/* Model registry */}
      <rect className="diag-soft" x="340" y="40" width="140" height="40" rx="4" />
      <text className="diag-label" x="410" y="58" textAnchor="middle">Model registry</text>
      <text className="diag-label-soft" x="410" y="72" textAnchor="middle">ResNet · YOLO</text>

      {/* Triton */}
      <rect className="diag-box" x="340" y="110" width="140" height="56" rx="4" />
      <text className="diag-label" x="410" y="135" textAnchor="middle">NVIDIA Triton</text>
      <text className="diag-label-soft" x="410" y="152" textAnchor="middle">GPU inference</text>

      {/* NestJS API (slightly to the right and below to indicate coordination) */}
      <rect className="diag-box" x="340" y="186" width="140" height="44" rx="4" />
      <text className="diag-label" x="410" y="206" textAnchor="middle">NestJS API</text>
      <text className="diag-label-soft" x="410" y="220" textAnchor="middle">Orchestration · auth</text>

      {/* Vue UI */}
      <rect className="diag-box" x="540" y="92" width="160" height="50" rx="4" />
      <text className="diag-label" x="620" y="114" textAnchor="middle">Vue annotation UI</text>
      <text className="diag-label-soft" x="620" y="130" textAnchor="middle">Operator workflow</text>

      {/* PostgreSQL */}
      <rect className="diag-soft" x="540" y="162" width="160" height="50" rx="4" />
      <text className="diag-label" x="620" y="184" textAnchor="middle">PostgreSQL</text>
      <text className="diag-label-soft" x="620" y="200" textAnchor="middle">Label store · audit</text>

      {/* Arrows */}
      <path className="diag-arr" d="M 140 138 L 178 138" markerEnd="url(#a-arr-2)" />
      <path className="diag-arr" d="M 300 138 L 338 138" markerEnd="url(#a-arr-2)" />
      <path className="diag-arr-soft" d="M 410 80 L 410 110" />
      <path className="diag-arr-soft" d="M 410 166 L 410 186" />
      <path className="diag-arr" d="M 480 130 L 538 117" markerEnd="url(#a-arr-2)" />
      <path className="diag-arr-soft" d="M 480 208 L 538 187" />

      {/* Footer */}
      <text className="diag-label-soft" x="360" y="252" textAnchor="middle">Hybrid on-prem + cloud · GitLab CI/CD · Docker · Nginx · Synology backups</text>
    </svg>
  );
}

function AppistadiumSmall() {
  return (
    <svg viewBox="0 0 420 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-label="System architecture: React Native with Unity scenes and Next.js back-office connecting to NestJS API backed by MongoDB, AWS, and OAuth2">
      {arrowMarker('b-arr-1')}

      {/* Zone labels */}
      <text className="diag-zone" x="210" y="14" textAnchor="middle">CLIENT SURFACES</text>

      {/* Mobile */}
      <rect className="diag-box" x="20" y="22" width="120" height="40" rx="4" />
      <text className="diag-label" x="80" y="42" textAnchor="middle">React Native</text>
      <text className="diag-label-soft" x="80" y="56" textAnchor="middle">+ Unity scenes</text>

      {/* Web admin */}
      <rect className="diag-box" x="280" y="22" width="120" height="40" rx="4" />
      <text className="diag-label" x="340" y="42" textAnchor="middle">Next.js</text>
      <text className="diag-label-soft" x="340" y="56" textAnchor="middle">back-office</text>

      {/* API */}
      <rect className="diag-box" x="155" y="76" width="110" height="34" rx="4" />
      <text className="diag-label" x="210" y="96" textAnchor="middle">NestJS API</text>

      {/* Data layer */}
      <rect className="diag-soft" x="80" y="118" width="80" height="20" rx="4" />
      <text className="diag-label-soft" x="120" y="131" textAnchor="middle">MongoDB</text>
      <rect className="diag-soft" x="170" y="118" width="80" height="20" rx="4" />
      <text className="diag-label-soft" x="210" y="131" textAnchor="middle">OAuth2 · RBAC</text>
      <rect className="diag-soft" x="260" y="118" width="80" height="20" rx="4" />
      <text className="diag-label-soft" x="300" y="131" textAnchor="middle">AWS CI/CD</text>

      {/* Arrows */}
      <path className="diag-arr" d="M 80 62 L 180 76" markerEnd="url(#b-arr-1)" />
      <path className="diag-arr" d="M 340 62 L 240 76" markerEnd="url(#b-arr-1)" />
      <path className="diag-arr-soft" d="M 180 110 L 130 118" />
      <path className="diag-arr-soft" d="M 210 110 L 210 118" />
      <path className="diag-arr-soft" d="M 240 110 L 290 118" />
    </svg>
  );
}

function AppistadiumLarge() {
  return (
    <svg viewBox="0 0 720 260" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-label="Detailed system architecture: React Native with Unity scenes, Next.js back-office and public website connecting to NestJS API, with MongoDB, Firebase Auth and AWS CI/CD as supporting services">
      {arrowMarker('b-arr-2')}

      {/* Zone labels */}
      <text className="diag-zone" x="120" y="20" textAnchor="middle">MOBILE</text>
      <text className="diag-zone" x="360" y="20" textAnchor="middle">WEB</text>
      <text className="diag-zone" x="600" y="20" textAnchor="middle">PUBLIC</text>

      {/* Top row: clients */}
      <rect className="diag-box" x="40" y="40" width="160" height="60" rx="4" />
      <text className="diag-label" x="120" y="66" textAnchor="middle">React Native</text>
      <text className="diag-label-soft" x="120" y="84" textAnchor="middle">+ Unity scenes</text>

      <rect className="diag-box" x="280" y="40" width="160" height="60" rx="4" />
      <text className="diag-label" x="360" y="66" textAnchor="middle">Next.js</text>
      <text className="diag-label-soft" x="360" y="84" textAnchor="middle">back-office (RBAC)</text>

      <rect className="diag-box" x="520" y="40" width="160" height="60" rx="4" />
      <text className="diag-label" x="600" y="66" textAnchor="middle">Public website</text>
      <text className="diag-label-soft" x="600" y="84" textAnchor="middle">React + Next.js</text>

      {/* Mid: API */}
      <rect className="diag-box" x="240" y="130" width="240" height="54" rx="4" />
      <text className="diag-label" x="360" y="154" textAnchor="middle">NestJS API</text>
      <text className="diag-label-soft" x="360" y="170" textAnchor="middle">REST · OAuth2 · multi-platform auth</text>

      {/* Bottom: data + infra */}
      <rect className="diag-soft" x="80" y="200" width="170" height="38" rx="4" />
      <text className="diag-label" x="165" y="220" textAnchor="middle">MongoDB</text>
      <text className="diag-label-soft" x="165" y="232" textAnchor="middle">application data</text>

      <rect className="diag-soft" x="275" y="200" width="170" height="38" rx="4" />
      <text className="diag-label" x="360" y="220" textAnchor="middle">Firebase Auth</text>
      <text className="diag-label-soft" x="360" y="232" textAnchor="middle">identity</text>

      <rect className="diag-soft" x="470" y="200" width="170" height="38" rx="4" />
      <text className="diag-label" x="555" y="220" textAnchor="middle">AWS CI/CD</text>
      <text className="diag-label-soft" x="555" y="232" textAnchor="middle">build · deploy</text>

      {/* Arrows: client → API */}
      <path className="diag-arr" d="M 120 100 L 295 130" markerEnd="url(#b-arr-2)" />
      <path className="diag-arr" d="M 360 100 L 360 130" markerEnd="url(#b-arr-2)" />
      <path className="diag-arr" d="M 600 100 L 425 130" markerEnd="url(#b-arr-2)" />

      {/* Arrows: API → data layer */}
      <path className="diag-arr-soft" d="M 280 184 L 195 200" />
      <path className="diag-arr-soft" d="M 360 184 L 360 200" />
      <path className="diag-arr-soft" d="M 440 184 L 525 200" />

      {/* Footer */}
      <text className="diag-label-soft" x="360" y="254" textAnchor="middle">App Store + Google Play release · Hired and managed mobile + backend + cloud team</text>
    </svg>
  );
}
