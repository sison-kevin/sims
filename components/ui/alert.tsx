import { cn } from "@/lib/utils";

export function Alert({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-900 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-100", className)}>{children}</div>;
}

export function AlertTitle({ children }: React.PropsWithChildren) {
  return <div className="mb-1 font-semibold">{children}</div>;
}

export function AlertDescription({ children }: React.PropsWithChildren) {
  return <div className="text-sm opacity-90">{children}</div>;
}