"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type TooltipContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const TooltipContext = createContext<TooltipContextValue | null>(null);

export function TooltipProvider({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

export function Tooltip({ children }: React.PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const contextValue = useMemo(() => ({ open, setOpen }), [open]);
  return <TooltipContext.Provider value={contextValue}>{children}</TooltipContext.Provider>;
}

export function TooltipTrigger({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("TooltipTrigger must be used within Tooltip");
  }

  return (
    <span
      className={cn("inline-flex", className)}
      onMouseEnter={() => context.setOpen(true)}
      onMouseLeave={() => context.setOpen(false)}
      onFocus={() => context.setOpen(true)}
      onBlur={() => context.setOpen(false)}
    >
      {children}
    </span>
  );
}

export function TooltipContent({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  const context = useContext(TooltipContext);
  if (!context || !context.open) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded-xl border border-border/70 bg-background/95 px-3 py-1.5 text-xs text-foreground shadow-xl backdrop-blur",
        className,
      )}
      role="tooltip"
    >
      {children}
    </div>
  );
}
