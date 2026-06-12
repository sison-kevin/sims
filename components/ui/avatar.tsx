import { cn } from "@/lib/utils";
import Image from "next/image";

export function Avatar({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-border bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200", className)}>{children}</div>;
}

export function AvatarImage({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null;
  return <Image src={src} alt={alt} fill className="object-cover" sizes="48px" />;
}

export function AvatarFallback({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <span className={className}>{children}</span>;
}