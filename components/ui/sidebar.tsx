import { cn } from "@/lib/utils";

export function Sidebar({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <aside className={cn("flex h-full flex-col border-r border-border/70 bg-white/60 dark:bg-slate-950/50", className)}>{children}</aside>;
}

export function SidebarHeader({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("border-b border-border/70 p-6", className)}>{children}</div>;
}

export function SidebarContent({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("flex-1 overflow-y-auto p-4", className)}>{children}</div>;
}

export function SidebarFooter({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("border-t border-border/70 p-4", className)}>{children}</div>;
}

export function SidebarSection({ title, className, children }: React.PropsWithChildren<{ title?: string; className?: string }>) {
  return (
    <div className={cn("mb-5", className)}>
      {title ? (
        <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          {title}
        </div>
      ) : null}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export function SidebarLink({ href, active, disabled, className, children, ...props }: React.PropsWithChildren<React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; active?: boolean; disabled?: boolean }>) {
  return (
    <a
      href={disabled ? "#" : href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition",
        active ? "bg-accent text-accent-foreground shadow-sm" : "text-slate-600 hover:bg-black/[0.03] hover:text-foreground dark:text-slate-300 dark:hover:bg-white/[0.04]",
        disabled && "pointer-events-none opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}