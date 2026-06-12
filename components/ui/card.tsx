import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn("glass-panel rounded-3xl border border-border/70", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("flex flex-col gap-1.5 p-6 pb-3", className)}>{children}</div>;
}

export function CardTitle({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <h3 className={cn("text-base font-semibold tracking-tight text-foreground", className)}>{children}</h3>;
}

export function CardDescription({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <p className={cn("text-sm text-[color:var(--muted-foreground)]", className)}>{children}</p>;
}

export function CardContent({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("p-6 pt-3", className)}>{children}</div>;
}

export function CardFooter({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("flex items-center gap-3 p-6 pt-0", className)}>{children}</div>;
}