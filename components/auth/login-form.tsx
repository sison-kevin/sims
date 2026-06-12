"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { loginSchema } from "@/lib/schemas";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
// Separator removed — social sign-in buttons were removed per design

type LoginFormProps = {
  initialEmail?: string;
};

export function LoginForm({ initialEmail = "manager@sims.local" }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.input<typeof loginSchema>, unknown, z.output<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: initialEmail, password: "manager123", remember: true },
  });

  useEffect(() => {
    reset({ email: initialEmail, password: "manager123", remember: true });
  }, [initialEmail, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Login failed");
      return;
    }

    router.push(searchParams.get("next") ?? "/dashboard");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? (
        <Alert className="border-red-200/70 bg-red-50/90 dark:border-red-500/20 dark:bg-red-500/10">
          <AlertTitle>Authentication failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2.5">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input id="email" {...register("email")} type="email" placeholder="manager@sims.local" className="h-12 pl-10" />
        </div>
        {errors.email ? <p className="text-xs text-red-500">{errors.email.message}</p> : <p className="text-xs text-slate-500">Use your workspace email.</p>}
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="password"
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="h-12 px-10 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password ? <p className="text-xs text-red-500">{errors.password.message}</p> : <p className="text-xs text-slate-500">At least 6 characters.</p>}
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <Checkbox {...register("remember")} />
          <span>Remember me</span>
        </label>
        <a href="#" className="text-sm font-medium text-accent transition hover:opacity-80">
          Forgot password?
        </a>
      </div>

      <Button className="group h-12 w-full gap-2 rounded-xl bg-[linear-gradient(135deg,var(--color-accent),#14b8a6)] text-[color:var(--color-accent-foreground)] shadow-lg shadow-teal-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-500/30" disabled={isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
        {isSubmitting ? "Signing in..." : "Sign in to dashboard"}
      </Button>

      {/* Social sign-in removed per request */}
    </form>
  );
}