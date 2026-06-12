import { cn } from "@/lib/utils";

export function Label({ className, children, htmlFor }: React.PropsWithChildren<{ className?: string; htmlFor?: string }>) {
  return (
    <label htmlFor={htmlFor} className={cn("text-sm font-medium leading-none text-foreground", className)}>
      {children}
    </label>
  );
}