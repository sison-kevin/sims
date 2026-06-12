import { cn } from "@/lib/utils";

export function Table({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <table className={cn("w-full caption-bottom border-separate border-spacing-0 text-sm", className)}>{children}</table>;
}

export function TableHeader({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <thead className={cn("[&_tr]:border-b", className)}>{children}</thead>;
}

export function TableBody({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)}>{children}</tbody>;
}

export function TableRow({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <tr className={cn("border-b border-border/70 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]", className)}>{children}</tr>;
}

export function TableHead({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <th className={cn("h-11 px-4 text-left align-middle font-medium text-slate-500 dark:text-slate-400", className)}>{children}</th>;
}

export function TableCell({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <td className={cn("px-4 py-4 align-middle", className)}>{children}</td>;
}