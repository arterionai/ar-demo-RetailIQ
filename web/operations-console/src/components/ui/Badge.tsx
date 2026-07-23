import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type BadgeTone = "neutral" | "blue" | "green" | "red" | "yellow" | "purple" | "gold";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-[var(--p-overlay)] text-[var(--p-text-secondary)] border-[var(--p-border)]",
  blue: "bg-[rgba(68,147,248,0.12)] text-[var(--p-blue)] border-[rgba(68,147,248,0.4)]",
  green: "bg-[rgba(63,185,80,0.12)] text-[var(--p-green)] border-[rgba(63,185,80,0.4)]",
  red: "bg-[rgba(248,81,73,0.12)] text-[var(--p-red)] border-[rgba(248,81,73,0.4)]",
  yellow: "bg-[rgba(210,153,34,0.14)] text-[var(--p-yellow)] border-[rgba(210,153,34,0.4)]",
  purple: "bg-[rgba(163,113,247,0.12)] text-[var(--p-purple)] border-[rgba(163,113,247,0.4)]",
  gold: "bg-[var(--p-gold-soft)] text-[var(--p-gold)] border-[rgba(201,169,79,0.4)]",
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  testId?: string;
  className?: string;
}

export function Badge({ tone = "neutral", children, testId, className }: BadgeProps) {
  return (
    <span
      data-testid={testId}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
