export type ServiceTeaser = {
  id: string;
  hash: string;
  priceKey: string;
  durationKey: string;
};

export const SERVICE_TEASERS: ServiceTeaser[] = [
  { id: 'ai-audit', hash: 'audit', priceKey: '€3.500', durationKey: '1 week' },
  { id: 'mvp', hash: 'mvp', priceKey: '€18.000', durationKey: '4 weken' },
  { id: 'tech-lead', hash: 'lead', priceKey: '€12.000', durationKey: '4 weken' },
  { id: 'ai-pipeline', hash: 'pipeline', priceKey: '€25.000', durationKey: '6 weken' },
  { id: 'fractional-cto', hash: 'fcto', priceKey: '€5.000', durationKey: 'per maand' }
];
