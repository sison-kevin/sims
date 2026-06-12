"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({ defaultValue, value, onValueChange, children }: React.PropsWithChildren<{ defaultValue?: string; value?: string; onValueChange?: (value: string) => void }>) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const currentValue = value ?? internalValue;
  const contextValue = useMemo(
    () => ({
      value: currentValue,
      setValue: (nextValue: string) => {
        setInternalValue(nextValue);
        onValueChange?.(nextValue);
      },
    }),
    [currentValue, onValueChange],
  );

  return <TabsContext.Provider value={contextValue}>{children}</TabsContext.Provider>;
}

export function TabsList({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("inline-flex rounded-2xl border border-border bg-white/70 p-1 dark:bg-white/5", className)}>{children}</div>;
}

export function TabsTrigger({ value, className, children }: React.PropsWithChildren<{ value: string; className?: string }>) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }

  const active = context.value === value;
  return (
    <button
      type="button"
      onClick={() => context.setValue(value)}
      className={cn(
        "rounded-xl px-3 py-1.5 text-sm font-medium transition",
        active ? "bg-accent text-accent-foreground shadow-sm" : "text-slate-600 hover:text-foreground dark:text-slate-300",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }: React.PropsWithChildren<{ value: string; className?: string }>) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsContent must be used within Tabs");
  }

  if (context.value !== value) {
    return null;
  }

  return <div className={cn("mt-4", className)}>{children}</div>;
}