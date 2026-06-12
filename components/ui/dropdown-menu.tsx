"use client";

import { createContext, useContext, useMemo, useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type DropdownContextValue = { open: boolean; setOpen: (open: boolean) => void; anchorRef: React.RefObject<HTMLDivElement | null> };
const DropdownContext = createContext<DropdownContextValue | null>(null);

export function DropdownMenu({ children, open, onOpenChange }: React.PropsWithChildren<{ open?: boolean; onOpenChange?: (open: boolean) => void }>) {
  const [internalOpen, setInternalOpen] = useState(false);
  const currentOpen = open ?? internalOpen;
  const anchorRef = useRef<HTMLDivElement>(null);
  const setOpen = useCallback((value: boolean) => {
    setInternalOpen(value);
    onOpenChange?.(value);
  }, [onOpenChange]);
  const value = useMemo(() => ({ open: currentOpen, setOpen, anchorRef }), [currentOpen, setOpen]);
  // Render a positioned inline wrapper and expose its ref for portal positioning
  return (
    <DropdownContext.Provider value={value}>
      <div ref={anchorRef} className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ children }: React.PropsWithChildren) {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("DropdownMenuTrigger must be used within DropdownMenu");
  }

  return <span onClick={() => context.setOpen(!context.open)}>{children}</span>;
}

export function DropdownMenuContent({ className, align = "end", children }: React.PropsWithChildren<{ className?: string; align?: "start" | "end" }>) {
  const context = useContext(DropdownContext);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  useEffect(() => {
    const anchorEl = context?.anchorRef.current;
    if (!anchorEl) return;

    function update() {
      const rect = anchorEl!.getBoundingClientRect();
      const margin = 20;
      let top = Math.ceil(rect.bottom + margin);
      let left = Math.ceil(rect.left + 0);

      // if align=end, prefer aligning right edges
      if (align === "end" && menuRef.current) {
        const menuW = menuRef.current.offsetWidth || 240;
        left = Math.ceil(rect.right - menuW);
      }

      // adjust to keep within viewport horizontally
      const viewportW = window.innerWidth;
      const menuW = menuRef.current?.offsetWidth || 240;
      if (left + menuW > viewportW - margin) {
        left = Math.max(margin, viewportW - menuW - margin);
      }
      if (left < margin) left = margin;

      // adjust to keep within viewport vertically
      const viewportH = window.innerHeight;
      const menuH = menuRef.current?.offsetHeight || 0;
      if (top + menuH > viewportH - margin) {
        // try positioning above anchor if not enough space below
        const altTop = Math.ceil(rect.top - menuH - margin);
        if (altTop > margin) top = altTop; else top = Math.max(margin, viewportH - menuH - margin);
      }

      setCoords({ top, left });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [context?.anchorRef, align]);

  if (!context || !context.open) {
    return null;
  }

  const menu = (
    <div
      ref={menuRef}
      style={coords ? { position: "fixed", top: coords.top, left: coords.left } : { position: "fixed", visibility: "hidden" }}
      className={cn("z-50 rounded-2xl border border-border bg-background p-2 shadow-xl", "min-w-[220px] max-w-xs max-h-72 overflow-auto", className)}
    >
      {children}
      <button aria-label="Close dropdown" className="fixed inset-0 -z-10 cursor-default" onClick={() => context.setOpen(false)} />
    </div>
  );

  return typeof document !== "undefined" ? createPortal(menu, document.body) : null;
}

export function DropdownMenuItem({ className, children, onClick, danger }: React.PropsWithChildren<{ className?: string; onClick?: () => void; danger?: boolean }>) {
  const context = useContext(DropdownContext);
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.();
        context?.setOpen(false);
      }}
      className={cn("flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition hover:bg-black/[0.04] dark:hover:bg-white/[0.05]", danger && "text-red-600 dark:text-red-400", className)}
    >
      {children}
    </button>
  );
}