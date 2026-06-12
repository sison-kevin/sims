import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";

const variantStyles: Record<ButtonVariant, string> = {
  default: "btn-default hover:brightness-95 shadow-sm",
  secondary: "btn-secondary hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100",
  outline: "btn-outline hover:bg-white/6 dark:hover:bg-white/4",
  ghost: "btn-ghost hover:bg-black/5 dark:hover:bg-white/8",
  destructive: "btn-destructive hover:brightness-95",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export function Button({ className, variant = "default", size = "md", asChild, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-11 px-5 text-base",
        className,
      )}
      {...props}
    />
  );
}