"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type SheetContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const SheetContext = createContext<SheetContextValue | null>(null);

export function Sheet({ open, onOpenChange, children }: React.PropsWithChildren<{ open?: boolean; onOpenChange?: (open: boolean) => void }>) {
  const [internalOpen, setInternalOpen] = useState(false);
  const currentOpen = open ?? internalOpen;
  const contextValue = useMemo(
    () => ({
      open: currentOpen,
      setOpen: (value: boolean) => {
        setInternalOpen(value);
        onOpenChange?.(value);
      },
    }),
    [currentOpen, onOpenChange],
  );

  return <SheetContext.Provider value={contextValue}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ children }: React.PropsWithChildren) {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error("SheetTrigger must be used within Sheet");
  }

  return <span onClick={() => context.setOpen(true)}>{children}</span>;
}

export function SheetContent({ className, side = "left", children }: React.PropsWithChildren<{ className?: string; side?: "left" | "right" }>) {
  const context = useContext(SheetContext);
  if (!context || !context.open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close sheet"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={() => context.setOpen(false)}
      />
      <div
        className={cn(
          "absolute top-0 z-10 h-full w-[88vw] max-w-sm border-border bg-background p-0 shadow-2xl transition-transform duration-300",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("border-b border-border p-5", className)}>{children}</div>;
}

export function SheetTitle({ children }: React.PropsWithChildren) {
  return <h3 className="text-base font-semibold">{children}</h3>;
}

export function SheetDescription({ children }: React.PropsWithChildren) {
  return <p className="text-sm text-slate-500 dark:text-slate-400">{children}</p>;
}

export function SheetBody({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("p-4", className)}>{children}</div>;
}