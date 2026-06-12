"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Check, ShieldCheck } from "lucide-react";

type PlanKey = "starter" | "growth" | "scale";

const planInfo: Record<PlanKey, { name: string; price: string; summary: string }> = {
  starter: {
    name: "Starter",
    price: "$29/month",
    summary: "Ideal for small teams beginning inventory digitization.",
  },
  growth: {
    name: "Growth",
    price: "$99/month",
    summary: "Best for scaling stores with advanced analytics and audits.",
  },
  scale: {
    name: "Scale",
    price: "Custom",
    summary: "Enterprise-grade onboarding, security controls, and SLA coverage.",
  },
};

function normalizePlan(plan: string | null): PlanKey {
  if (plan === "growth" || plan === "scale") {
    return plan;
  }

  return "starter";
}

export function CheckoutPageClient() {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const planKey = normalizePlan(searchParams.get("plan"));
  const selectedPlan = useMemo(() => planInfo[planKey], [planKey]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_28%),var(--background)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.03)_0%,transparent_35%,rgba(15,118,110,0.06)_100%)] dark:bg-[linear-gradient(120deg,rgba(6,10,18,0.62)_0%,rgba(7,17,31,0.3)_45%,rgba(15,118,110,0.14)_100%)]" />

      <div className="relative z-10 mx-auto w-full max-w-none px-3 pb-20 pt-6 sm:px-4 lg:px-6">
        <header className="sticky top-4 z-40 mb-8 rounded-full border border-border/70 bg-[color:var(--color-card)]/90 px-4 py-3 shadow-[0_14px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-teal-600 dark:text-teal-300">SIMS</p>
              <p className="hidden text-xs text-slate-500 sm:block">Checkout</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/pricing"
                className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-medium transition hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
              >
                Back to Pricing
              </Link>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-accent),#14b8a6)] px-4 text-sm font-medium text-[color:var(--color-accent-foreground)] shadow-lg shadow-teal-500/25 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Login
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <Card className="rounded-3xl border-border/70 bg-[color:var(--color-card)]/92 lg:min-h-[calc(100vh-10rem)]">
            <CardHeader>
              <Badge className="w-fit rounded-full border-teal-600/20 bg-teal-500/10 text-teal-700 dark:text-teal-300">Subscribe to {selectedPlan.name}</Badge>
              <CardTitle className="mt-2 text-3xl">Personal details</CardTitle>
              <CardDescription>Complete your details to continue with secure subscription checkout.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                  }

                  setIsSubmitting(true);
                  window.location.assign(`/login?plan=${planKey}&checkout=1`);
                }}
              >
                <div className="rounded-2xl border border-border/70 bg-background/60 p-4 sm:p-5">
                  <p className="mb-4 text-sm font-semibold">Contact information</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" name="firstName" placeholder="John" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" name="lastName" placeholder="Doe" required />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Work email</Label>
                      <Input id="email" name="email" type="email" placeholder="you@company.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+63 9xx xxx xxxx" required />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/60 p-4 sm:p-5">
                  <p className="mb-4 text-sm font-semibold">Company and billing</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="company">Company</Label>
                      <Input id="company" name="company" placeholder="SIMS Retail Inc." required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select id="country" name="country" defaultValue="Philippines" required>
                        <option>Philippines</option>
                        <option>Singapore</option>
                        <option>Malaysia</option>
                        <option>Indonesia</option>
                        <option>United States</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Team size</Label>
                      <Select id="teamSize" name="teamSize" defaultValue="1-5" required>
                        <option>1-5</option>
                        <option>6-10</option>
                        <option>11-25</option>
                        <option>26-50</option>
                        <option>50+</option>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/60 p-4 sm:p-5">
                  <p className="mb-4 text-sm font-semibold">Payment preferences</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="billingCycle">Billing cycle</Label>
                      <Select id="billingCycle" name="billingCycle" defaultValue="Monthly" required>
                        <option>Monthly</option>
                        <option>Annual (save 18%)</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment method</Label>
                      <Select id="paymentMethod" name="paymentMethod" defaultValue="Credit / Debit Card" required>
                        <option>Credit / Debit Card</option>
                        <option>Bank Transfer</option>
                        <option>Invoice Billing</option>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="cardNumber">Card number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-border" />
                  <span>I confirm that my details are accurate and I agree to the billing terms and subscription policy.</span>
                </label>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-xl bg-[linear-gradient(135deg,var(--color-accent),#14b8a6)] text-[color:var(--color-accent-foreground)] shadow-lg shadow-teal-500/25"
                >
                  {isSubmitting ? "Redirecting..." : `Continue with ${selectedPlan.name} plan`}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/70 bg-[color:var(--color-card)]/92 lg:sticky lg:top-28">
            <CardHeader>
              <CardTitle className="text-2xl">Order summary</CardTitle>
              <CardDescription>Review your selected plan before continuing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-sm font-semibold">Selected plan</p>
                <p className="mt-1 text-2xl font-semibold">{selectedPlan.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedPlan.price}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{selectedPlan.summary}</p>
              </div>

              <Separator />

              <div className="space-y-3">
                {[
                  "Account setup assistance",
                  "Secure payment processing",
                  "Automated billing receipts",
                  "Onboarding checklist after login",
                ].map((line) => (
                  <div key={line} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="h-4 w-4 text-teal-600 dark:text-teal-300" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm text-slate-600 dark:text-slate-300">
                <p className="mb-1 font-medium">Security assurance</p>
                <p className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-300" />
                  All subscription details are transmitted over encrypted connections.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}