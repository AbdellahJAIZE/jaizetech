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
    <svg viewBox="0 0 420 130" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-label="System architecture diagram: camera input flowing through Triton inference, NestJS API, Vue annotation UI and PostgreSQL labels">
      {arrowMarker('a-arr-1')}
      <rect className="diag-soft" x="2" y="42" width="60" height="44" rx="4" />
      <text className="diag-label-soft" x="32" y="69" textAnchor="middle">Camera</text>
      <rect className="diag-box" x="82" y="42" width="80" height="44" rx="4" />
      <text className="diag-label" x="122" y="60" textAnchor="middle">Triton</text>
      <text className="diag-label-soft" x="122" y="76" textAnchor="middle">ResNet · YOLO</text>
      <rect className="diag-box" x="182" y="42" width="80" height="44" rx="4" />
      <text className="diag-label" x="222" y="60" textAnchor="middle">NestJS</text>
      <text className="diag-label-soft" x="222" y="76" textAnchor="middle">API</text>
      <rect className="diag-box" x="282" y="22" width="120" height="32" rx="4" />
      <text className="diag-label" x="342" y="42" textAnchor="middle">Vue annotation UI</text>
      <rect className="diag-soft" x="282" y="74" width="120" height="32" rx="4" />
      <text className="diag-label-soft" x="342" y="94" textAnchor="middle">PostgreSQL labels</text>
      <path className="diag-arr" d="M 62 64 L 80 64" markerEnd="url(#a-arr-1)" />
      <path className="diag-arr" d="M 162 64 L 180 64" markerEnd="url(#a-arr-1)" />
      <path className="diag-arr" d="M 262 60 L 282 38" markerEnd="url(#a-arr-1)" />
      <path className="diag-arr-soft" d="M 262 70 L 282 90" />
    </svg>
  );
}

function AgritechLarge() {
  return (
    <svg viewBox="0 0 680 220" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-label="Detailed system architecture: camera input, model registry feeding NVIDIA Triton GPU inference, NestJS API orchestration, Vue annotation UI and PostgreSQL label store, on hybrid on-prem and cloud infrastructure">
      {arrowMarker('a-arr-2')}
      <rect className="diag-soft" x="20" y="86" width="100" height="48" rx="4" />
      <text className="diag-label-soft" x="70" y="116" textAnchor="middle">Camera input</text>
      <rect className="diag-soft" x="160" y="20" width="120" height="40" rx="4" />
      <text className="diag-label" x="220" y="38" textAnchor="middle">Model registry</text>
      <text className="diag-label-soft" x="220" y="52" textAnchor="middle">ResNet · YOLO</text>
      <rect className="diag-box" x="160" y="86" width="120" height="48" rx="4" />
      <text className="diag-label" x="220" y="108" textAnchor="middle">NVIDIA Triton</text>
      <text className="diag-label-soft" x="220" y="122" textAnchor="middle">GPU inference</text>
      <rect className="diag-box" x="320" y="86" width="120" height="48" rx="4" />
      <text className="diag-label" x="380" y="108" textAnchor="middle">NestJS API</text>
      <text className="diag-label-soft" x="380" y="122" textAnchor="middle">Orchestration</text>
      <rect className="diag-box" x="480" y="40" width="180" height="42" rx="4" />
      <text className="diag-label" x="570" y="58" textAnchor="middle">Vue annotation UI</text>
      <text className="diag-label-soft" x="570" y="73" textAnchor="middle">Operator workflow</text>
      <rect className="diag-soft" x="480" y="138" width="180" height="42" rx="4" />
      <text className="diag-label" x="570" y="156" textAnchor="middle">PostgreSQL</text>
      <text className="diag-label-soft" x="570" y="171" textAnchor="middle">Label store · audit</text>
      <path className="diag-arr" d="M 120 110 L 158 110" markerEnd="url(#a-arr-2)" />
      <path className="diag-arr-soft" d="M 220 60 L 220 86" />
      <path className="diag-arr" d="M 280 110 L 318 110" markerEnd="url(#a-arr-2)" />
      <path className="diag-arr" d="M 440 100 L 478 64" markerEnd="url(#a-arr-2)" />
      <path className="diag-arr-soft" d="M 440 120 L 478 158" />
      <path className="diag-arr-soft" d="M 480 64 L 480 158" />
      <text className="diag-label-soft" x="340" y="210" textAnchor="middle">Hybrid on-prem + cloud · GitLab CI/CD · Docker · Nginx</text>
    </svg>
  );
}

function AppistadiumSmall() {
  return (
    <svg viewBox="0 0 420 130" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-label="System architecture: React Native mobile app with Unity scenes and Next.js back-office both connecting to NestJS API with MongoDB and AWS OAuth2">
      {arrowMarker('b-arr-1')}
      <rect className="diag-box" x="20" y="14" width="120" height="34" rx="4" />
      <text className="diag-label" x="80" y="30" textAnchor="middle">React Native</text>
      <text className="diag-label-soft" x="80" y="42" textAnchor="middle">+ Unity scenes</text>
      <rect className="diag-box" x="280" y="14" width="120" height="34" rx="4" />
      <text className="diag-label" x="340" y="30" textAnchor="middle">Next.js</text>
      <text className="diag-label-soft" x="340" y="42" textAnchor="middle">back-office</text>
      <rect className="diag-box" x="160" y="58" width="100" height="32" rx="4" />
      <text className="diag-label" x="210" y="78" textAnchor="middle">NestJS API</text>
      <rect className="diag-soft" x="100" y="100" width="100" height="22" rx="4" />
      <text className="diag-label-soft" x="150" y="115" textAnchor="middle">MongoDB</text>
      <rect className="diag-soft" x="220" y="100" width="100" height="22" rx="4" />
      <text className="diag-label-soft" x="270" y="115" textAnchor="middle">AWS · OAuth2</text>
      <path className="diag-arr" d="M 80 48 L 175 60" markerEnd="url(#b-arr-1)" />
      <path className="diag-arr" d="M 340 48 L 245 60" markerEnd="url(#b-arr-1)" />
      <path className="diag-arr-soft" d="M 200 90 L 150 100" />
      <path className="diag-arr-soft" d="M 230 90 L 280 100" />
    </svg>
  );
}

function AppistadiumLarge() {
  return (
    <svg viewBox="0 0 680 220" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-label="Detailed system architecture: React Native with Unity, Next.js back-office and public website on NestJS API with MongoDB, AWS CI/CD and Firebase OAuth2">
      {arrowMarker('b-arr-2')}
      <rect className="diag-box" x="40" y="30" width="160" height="56" rx="4" />
      <text className="diag-label" x="120" y="54" textAnchor="middle">React Native</text>
      <text className="diag-label-soft" x="120" y="70" textAnchor="middle">+ Unity scenes</text>
      <rect className="diag-box" x="260" y="30" width="160" height="56" rx="4" />
      <text className="diag-label" x="340" y="54" textAnchor="middle">Next.js</text>
      <text className="diag-label-soft" x="340" y="70" textAnchor="middle">back-office</text>
      <rect className="diag-box" x="480" y="30" width="160" height="56" rx="4" />
      <text className="diag-label" x="560" y="54" textAnchor="middle">Public website</text>
      <text className="diag-label-soft" x="560" y="70" textAnchor="middle">React + Next.js</text>
      <rect className="diag-box" x="240" y="116" width="200" height="48" rx="4" />
      <text className="diag-label" x="340" y="138" textAnchor="middle">NestJS API</text>
      <text className="diag-label-soft" x="340" y="152" textAnchor="middle">REST · OAuth2 · RBAC</text>
      <rect className="diag-soft" x="80" y="174" width="160" height="34" rx="4" />
      <text className="diag-label-soft" x="160" y="195" textAnchor="middle">MongoDB</text>
      <rect className="diag-soft" x="260" y="174" width="160" height="34" rx="4" />
      <text className="diag-label-soft" x="340" y="195" textAnchor="middle">Firebase Auth</text>
      <rect className="diag-soft" x="440" y="174" width="160" height="34" rx="4" />
      <text className="diag-label-soft" x="520" y="195" textAnchor="middle">AWS CI/CD</text>
      <path className="diag-arr" d="M 120 86 L 290 116" markerEnd="url(#b-arr-2)" />
      <path className="diag-arr" d="M 340 86 L 340 116" markerEnd="url(#b-arr-2)" />
      <path className="diag-arr" d="M 560 86 L 390 116" markerEnd="url(#b-arr-2)" />
      <path className="diag-arr-soft" d="M 280 164 L 200 174" />
      <path className="diag-arr-soft" d="M 340 164 L 340 174" />
      <path className="diag-arr-soft" d="M 400 164 L 480 174" />
    </svg>
  );
}
