"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type CommandContextValue = {
  search: string;
  setSearch: (value: string) => void;
};

const CommandContext = createContext<CommandContextValue | null>(null);

export function Command({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  const [search, setSearch] = useState("");
  const value = useMemo(() => ({ search, setSearch }), [search]);
  return <div className={cn("rounded-3xl border border-border bg-white/85 p-3 shadow-sm dark:bg-slate-950/40", className)}><CommandContext.Provider value={value}>{children}</CommandContext.Provider></div>;
}

export function CommandInput({ placeholder = "Search", className }: { placeholder?: string; className?: string }) {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error("CommandInput must be used within Command");
  }

  return <input value={context.search} onChange={(event) => context.setSearch(event.target.value)} placeholder={placeholder} className={cn("h-10 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]", className)} />;
}

export function CommandList({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("mt-3 max-h-72 space-y-1 overflow-auto", className)}>{children}</div>;
}

export function CommandEmpty({ children }: React.PropsWithChildren) {
  return <div className="rounded-2xl border border-dashed border-border px-3 py-6 text-center text-sm text-slate-500">{children}</div>;
}

export function CommandGroup({ heading, children }: React.PropsWithChildren<{ heading?: string }>) {
  return (
    <div className="space-y-2">
      {heading ? <div className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{heading}</div> : null}
      {children}
    </div>
  );
}

export function CommandItem({ children, onSelect, className }: React.PropsWithChildren<{ onSelect?: () => void; className?: string }>) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn("flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition hover:bg-black/[0.04] dark:hover:bg-white/[0.05]", className)}
    >
      {children}
    </button>
  );
}

export function useCommandSearch() {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error("useCommandSearch must be used within Command");
  }

  return context.search;
}