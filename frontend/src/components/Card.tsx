import type { PropsWithChildren } from 'react';

export function Card({ children }: PropsWithChildren) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-glow backdrop-blur-xl">
      {children}
    </section>
  );
}