import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

const base = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60';

export function Button({ children, className = '', ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={`${base} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}