export function StatusPill({ tone, children }: { tone: 'success' | 'warn' | 'neutral'; children: string }) {
  const tones = {
    success: 'bg-success/15 text-success ring-1 ring-success/25',
    warn: 'bg-warning/15 text-warning ring-1 ring-warning/25',
    neutral: 'bg-secondary/15 text-secondary ring-1 ring-secondary/25',
  } as const;

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}