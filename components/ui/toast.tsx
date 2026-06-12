"use client";

import { createContext, useContext, useMemo, useState } from "react";

type ToastMessage = { id: string; title: string; description?: string };

type ToastContextValue = {
  toasts: ToastMessage[];
  toast: (toast: Omit<ToastMessage, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: React.PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const value = useMemo(
    () => ({
      toasts,
      toast: (toast: Omit<ToastMessage, "id">) =>
        setToasts((current) => [...current, { ...toast, id: crypto.randomUUID() }]),
      dismiss: (id: string) => setToasts((current) => current.filter((toast) => toast.id !== id)),
    }),
    [toasts],
  );

  return <ToastContext.Provider value={value}>{children}<ToastViewport /></ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}

function ToastViewport() {
  const context = useContext(ToastContext);
  if (!context) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] space-y-2">
      {context.toasts.map((toast) => (
        <div key={toast.id} className="w-80 rounded-2xl border border-border bg-background p-4 shadow-2xl">
          <div className="font-medium">{toast.title}</div>
          {toast.description ? <div className="mt-1 text-sm text-slate-500">{toast.description}</div> : null}
          <button className="mt-3 text-sm font-medium text-accent" onClick={() => context.dismiss(toast.id)}>Dismiss</button>
        </div>
      ))}
    </div>
  );
}