import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--p-border)] bg-[var(--p-surface)] shadow-[0_1px_0_rgba(255,255,255,0.02)_inset]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
