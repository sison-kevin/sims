import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-xl border border-border bg-[color:var(--color-card)] px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-[var(--ring)]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}