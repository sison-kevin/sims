"use client";

import { cn } from "@/lib/utils";

export function Switch({ checked, onCheckedChange, className, disabled }: { checked?: boolean; onCheckedChange?: (checked: boolean) => void; className?: string; disabled?: boolean }) {
  const currentChecked = checked ?? false;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={currentChecked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!currentChecked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full border border-border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50",
        currentChecked ? "bg-accent" : "bg-slate-300 dark:bg-slate-700",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          currentChecked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}