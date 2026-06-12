import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const badgeStyles: Record<BadgeVariant, string> = {
  default: "bg-accent/15 text-accent",
  secondary: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  destructive: "bg-red-500/15 text-red-600 dark:text-red-400",
  outline: "border border-border bg-transparent text-foreground",
};

export function Badge({
  className,
  variant = "default",
  children,
}: React.PropsWithChildren<{ className?: string; variant?: BadgeVariant }>) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", badgeStyles[variant], className)}>{children}</span>;
}