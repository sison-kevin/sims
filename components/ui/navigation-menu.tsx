"use client";

import { cn } from "@/lib/utils";

export function NavigationMenu({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <nav className={cn("relative", className)}>{children}</nav>;
}

export function NavigationMenuList({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <ul className={cn("flex items-center gap-1", className)}>{children}</ul>;
}

export function NavigationMenuItem({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <li className={cn("list-none", className)}>{children}</li>;
}

export function NavigationMenuLink({
  className,
  href = "#",
  children,
  onClick,
}: React.PropsWithChildren<{ className?: string; href?: string; onClick?: React.MouseEventHandler<HTMLAnchorElement> }>) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-slate-600 transition hover:bg-black/[0.04] hover:text-foreground dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white",
        className,
      )}
    >
      {children}
    </a>
  );
}
