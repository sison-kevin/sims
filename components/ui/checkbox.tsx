"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Checkbox({ className, checked, defaultChecked, onCheckedChange, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { onCheckedChange?: (checked: boolean) => void }) {
  const currentChecked = typeof checked === "boolean" ? checked : Boolean(defaultChecked);

  return (
    <label className={cn("relative inline-flex h-5 w-5 cursor-pointer items-center justify-center", className)}>
      <input
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={(event) => onCheckedChange?.(event.target.checked)}
        className="peer sr-only"
        {...props}
      />
      <span className="absolute inset-0 rounded-[6px] border border-border bg-[color:var(--color-card)] shadow-sm transition peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ring)] peer-checked:border-accent peer-checked:bg-accent" />
      <Check className={cn("relative h-3.5 w-3.5 text-accent-foreground transition", currentChecked ? "scale-100 opacity-100" : "scale-0 opacity-0")} />
    </label>
  );
}