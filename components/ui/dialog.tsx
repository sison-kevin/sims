"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type DialogContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function Dialog({ open, onOpenChange, children }: React.PropsWithChildren<{ open?: boolean; onOpenChange?: (open: boolean) => void }>) {
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

  return <DialogContext.Provider value={contextValue}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ children }: React.PropsWithChildren) {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("DialogTrigger must be used within Dialog");
  }

  return <>{context.open ? null : <span onClick={() => context.setOpen(true)}>{children}</span>}</>;
}

export function DialogContent({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  const context = useContext(DialogContext);
  if (!context || !context.open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={() => context.setOpen(false)}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-2xl rounded-3xl border border-border bg-background p-6 shadow-2xl transition-transform duration-300",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("mb-4 flex flex-col gap-2", className)}>{children}</div>;
}

export function DialogTitle({ children }: React.PropsWithChildren) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}

export function DialogDescription({ children }: React.PropsWithChildren) {
  return <p className="text-sm text-slate-500 dark:text-slate-400">{children}</p>;
}

export function DialogFooter({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("mt-6 flex items-center justify-end gap-3", className)}>{children}</div>;
}