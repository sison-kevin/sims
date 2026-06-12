import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, CircleDollarSign, CreditCard, Rocket, ShieldCheck, Users } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "For small teams starting inventory digitization.",
    features: ["2 users", "Core inventory tracking", "Low stock alerts", "Email support"],
    ctaHref: "/pricing/checkout?plan=starter",
  },
  {
    name: "Growth",
    price: "$99",
    period: "/month",
    description: "For scaling operations with advanced reporting.",
    features: ["10 users", "Realtime analytics", "Audit logs", "Priority support"],
    highlighted: true,
    ctaHref: "/pricing/checkout?plan=growth",
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    description: "For enterprise-grade controls and compliance.",
    features: ["Unlimited users", "SAML/SSO", "Dedicated onboarding", "SLA + security review"],
    ctaHref: "/pricing/checkout?plan=scale",
  },
];

const workflowSteps = [
  {
    icon: Users,
    title: "1. Pick Your Team Size",
    description: "Select the plan by expected active users and operational complexity.",
  },
  {
    icon: CircleDollarSign,
    title: "2. Estimate Monthly Cost",
    description: "Base subscription is fixed per plan. Any add-ons are shown before checkout.",
  },
  {
    icon: CreditCard,
    title: "3. Start Billing Securely",
    description: "Enter payment details, confirm billing cycle, and review tax before payment.",
  },
  {
    icon: Rocket,
    title: "4. Activate Workspace",
    description: "Your workspace is provisioned instantly and onboarding steps are unlocked.",
  },
];

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_28%),var(--background)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.03)_0%,transparent_35%,rgba(15,118,110,0.06)_100%)] dark:bg-[linear-gradient(120deg,rgba(6,10,18,0.62)_0%,rgba(7,17,31,0.3)_45%,rgba(15,118,110,0.14)_100%)]" />

      <div className="relative z-10 mx-auto w-full max-w-none px-3 pb-20 pt-6 sm:px-4 lg:px-6">
        <header className="sticky top-4 z-40 mb-10 rounded-full border border-border/70 bg-[color:var(--color-card)]/90 px-4 py-3 shadow-[0_14px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-teal-600 dark:text-teal-300">SIMS</p>
              <p className="hidden text-xs text-slate-500 sm:block">Pricing</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-medium transition hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
              >
                Back to Landing
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

        <section className="rounded-[2rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(255,255,255,0.62))] p-6 shadow-[0_30px_120px_rgba(2,6,23,0.12)] backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.58),rgba(7,17,31,0.75))] sm:p-10">
          <Badge className="rounded-full border-teal-600/20 bg-teal-500/10 text-teal-700 dark:text-teal-300">Transparent pricing workflow</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Pricing built for modern retail teams</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
            Choose a plan, preview your monthly cost, start billing securely, and launch your SIMS workspace in minutes.
          </p>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`rounded-3xl border-border/70 ${plan.highlighted ? "bg-[linear-gradient(180deg,rgba(20,184,166,0.14),rgba(255,255,255,0.88))] dark:bg-[linear-gradient(180deg,rgba(13,148,136,0.22),rgba(7,17,31,0.9))]" : "bg-[color:var(--color-card)]/90"}`}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold">{plan.price}<span className="text-base font-normal text-slate-500">{plan.period}</span></p>
                <ul className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-teal-600 dark:text-teal-300" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.ctaHref}
                  className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-accent),#14b8a6)] px-4 text-sm font-medium text-[color:var(--color-accent-foreground)] shadow-sm transition hover:brightness-95"
                >
                  Choose {plan.name}
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-12 rounded-3xl border border-border/70 bg-[color:var(--color-card)]/90 p-6 sm:p-8">
          <h2 className="text-3xl font-semibold tracking-tight">How pricing workflow works</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">A clear 4-step path from plan selection to activation.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflowSteps.map((step) => (
              <Card key={step.title} className="rounded-2xl border-border/70 bg-background/70">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,rgba(15,118,110,0.18),rgba(45,212,191,0.25))] text-teal-700 dark:text-teal-300">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-7">{step.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-8" />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-semibold">Billing model</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Fixed monthly subscription by plan. Annual billing available for discount.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-semibold">Trial policy</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">14-day trial on Starter and Growth. No long-term contract required.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-semibold">Security and compliance</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-300" />
                PCI-compliant payments with encrypted billing data.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
