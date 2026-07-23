import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  icon?: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[var(--p-gold)] text-[#1a1608] hover:bg-[#d9bc6b] disabled:bg-[var(--p-overlay)] disabled:text-[var(--p-text-muted)]",
  secondary:
    "bg-[var(--p-overlay)] text-[var(--p-text)] border border-[var(--p-border)] hover:bg-[#282830] disabled:text-[var(--p-text-muted)]",
  danger:
    "bg-transparent text-[var(--p-red)] border border-[rgba(248,81,73,0.4)] hover:bg-[rgba(248,81,73,0.1)] disabled:text-[var(--p-text-muted)] disabled:border-[var(--p-border)]",
  ghost:
    "bg-transparent text-[var(--p-text-secondary)] hover:text-[var(--p-text)] hover:bg-[var(--p-overlay)] disabled:text-[var(--p-text-muted)]",
};

export function Button({
  variant = "primary",
  loading = false,
  icon,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed",
        VARIANT_CLASSES[variant],
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
