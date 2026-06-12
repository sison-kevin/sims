import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-border bg-[color:var(--color-card)] px-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-[color:var(--muted)] focus:border-accent focus:ring-2 focus:ring-[var(--ring)] dark:bg-[color:var(--color-card)]",
        className,
      )}
      {...props}
    />
  );
}