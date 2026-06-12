"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

const docsNavItems = [
  { id: "intro", label: "Docs Home" },
  { id: "website-guide", label: "Website Guide" },
  { id: "api", label: "API & Integrations" },
  { id: "getting-started", label: "Getting started" },
  { id: "deployment", label: "Deployment" },
] as const;

const docsSectionShell =
  "rounded-[2rem] border border-border/70 bg-[color:var(--color-card)]/92 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8";

function DocsAnchorLink({
  id,
  label,
  active,
  onActivate,
}: {
  id: string;
  label: string;
  active?: boolean;
  onActivate?: (id: string) => void;
}) {
  return (
    <a
      href={`#${id}`}
      onClick={(event) => {
        event.preventDefault();
        window.history.pushState(null, "", `#${id}`);
        onActivate?.(id);
        document.dispatchEvent(new CustomEvent("docs:nav", { detail: `#${id}` }));
      }}
      aria-current={active ? "page" : undefined}
      className={`block rounded-xl px-3 py-2 text-sm transition ${
        active
          ? "bg-teal-500/10 text-teal-700 ring-1 ring-inset ring-teal-600/15 dark:text-teal-300"
          : "text-slate-600 hover:bg-black/[0.03] hover:text-foreground dark:text-slate-300 dark:hover:bg-white/[0.04]"
      }`}
    >
      {label}
    </a>
  );
}


const quickstartSteps = [
  "Create your workspace, sign in through the SIMS login portal, and confirm that your account has the correct role for setup tasks.",
  "Add products and SKUs, then organize them into categories and set accurate baseline stock levels before you start operating.",
  "Record inventory movements as they happen so stock counts stay current and low-stock alerts can notify the right people in real time.",
  "Track sales and analytics together so you can spot demand patterns, plan replenishment more accurately, and make faster decisions.",
  "Review audit logs and role access settings on a regular schedule to keep the workspace controlled, traceable, and compliant.",
];

// (kept minimal for docs page)

export default function DocsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_28%),var(--background)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.03)_0%,transparent_35%,rgba(15,118,110,0.06)_100%)] dark:bg-[linear-gradient(120deg,rgba(6,10,18,0.62)_0%,rgba(7,17,31,0.3)_45%,rgba(15,118,110,0.14)_100%)]" />

      <div className="relative z-10 mx-auto w-full max-w-none px-3 pb-20 pt-6 sm:px-4 lg:px-6">
        <header className="sticky top-4 z-40 mb-8 rounded-full border border-border/70 bg-[color:var(--color-card)]/90 px-4 py-3 shadow-[0_14px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-teal-600 dark:text-teal-300">SIMS</p>
              <p className="hidden text-xs text-slate-500 sm:block">Documentation</p>
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
          <Badge className="rounded-full border-teal-600/20 bg-teal-500/10 text-teal-700 dark:text-teal-300">Documentation hub</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">SIMS Website & Platform Documentation</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
            A clean reference for the website, platform flows, APIs, and deployment basics. Use the section navigation to jump between topics and keep the product story consistent.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-slate-600 dark:text-slate-300">Version 3.10.1</span>
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-slate-600 dark:text-slate-300">Website + Platform</span>
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-slate-600 dark:text-slate-300">Updated workflows</span>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-12 gap-6 lg:mt-8">
          <aside className="col-span-12 hidden md:sticky md:top-24 md:block md:col-span-3 lg:col-span-2">
            <nav className={`${docsSectionShell} space-y-4`}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Sections</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Jump to the area you need.</p>
              </div>
              <div className="space-y-1">
                {docsNavItems.map((item) => (
                  <DocsAnchorLink key={item.id} id={item.id} label={item.label} onActivate={() => undefined} />
                ))}
              </div>
            </nav>
          </aside>

          <article className="col-span-12 md:col-span-9 lg:col-span-7">
            <DocsContent />
          </article>

          <aside className="col-span-12 hidden sticky top-24 lg:col-span-3 lg:block">
            <div className={`${docsSectionShell} text-sm`}>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">On this page</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Core sections in reading order.</p>
              </div>
              <ul className="space-y-1">
                {docsNavItems.map((item) => (
                  <li key={item.id}>
                    <DocsAnchorLink id={item.id} label={item.label} />
                  </li>
                ))}
              </ul>
            </div>

            <div className={`${docsSectionShell} mt-6 text-sm text-slate-600 dark:text-slate-300`}>
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Related</p>
              </div>
              <ul className="space-y-2">
                <li><Link href="/pricing" className="transition hover:text-foreground">Pricing</Link></li>
                <li><Link href="/login" className="transition hover:text-foreground">Login</Link></li>
                <li><Link href="/docs" className="transition hover:text-foreground">Docs Home</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function DocsContent() {
  const [active, setActive] = useState<string>("intro");

  useEffect(() => {
    function setFromHash() {
      try {
        const h = (window.location.hash || "#intro").replace("#", "");
        setActive(h || "intro");
      } catch (e) {}
    }

    function onNav(e: any) {
      try {
        const d = e?.detail || window.location.hash || "#intro";
        const id = String(d).replace("#", "") || "intro";
        setActive(id);
      } catch (e) {}
    }

    setFromHash();
    window.addEventListener("hashchange", setFromHash);
    document.addEventListener("docs:nav", onNav as EventListener);
    return () => {
      window.removeEventListener("hashchange", setFromHash);
      document.removeEventListener("docs:nav", onNav as EventListener);
    };
  }, []);

  return (
    <div>
      <div className={`${docsSectionShell} mb-6`}>
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <Badge className="rounded-full border-teal-600/20 bg-teal-500/10 text-teal-700 dark:text-teal-300">Version 3.10.1</Badge>
          <span>Home</span>
          <span>›</span>
          <span>Documentation</span>
        </div>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-[2rem]">Overview</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          Click a topic in the sidebar to open the full content container for that topic. Each section is focused on website and platform features, with practical examples and recommended workflows.
        </p>
      </div>

      <div className={active === "intro" ? "block" : "hidden"} aria-hidden={active !== "intro"}>
        <div className={`${docsSectionShell} text-sm leading-7 text-slate-600 dark:text-slate-300`}>
          <p className="mb-4">
            SIMS is built for inventory-centric businesses that need one place to manage the website and the platform behind it. The documentation connects the public experience to the operational areas that matter most, including product catalog management, stock movements, sales capture, reporting, and administrative control.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-semibold text-foreground">Entities</p>
              <p className="mt-2 text-sm">The core records in SIMS are products, SKUs, locations, movements, sales, users, and roles. Understanding these entities makes every other workflow easier to follow.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-semibold text-foreground">Flows</p>
              <p className="mt-2 text-sm">Most work follows a simple flow: create the product, initialize stock, process adjustments or sales, and then reconcile the result against your records.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm font-semibold text-foreground">Security</p>
              <p className="mt-2 text-sm">Security relies on role-based access and tokenized API sessions so each user only sees and changes what they are allowed to handle.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={active === "website-guide" ? "block" : "hidden"} aria-hidden={active !== "website-guide"}>
        <div className={`${docsSectionShell} text-sm leading-7 text-slate-600 dark:text-slate-300`}>
          <p className="mb-4">This guide walks through the main areas of the public and authenticated website, explains what each area is for, and describes the kind of work users usually complete there.</p>

          <div className="space-y-5">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">
              <h3 className="text-lg font-semibold text-foreground">Dashboard</h3>
              <p className="mt-2">The Dashboard brings together the most important KPIs in one view, including inventory health, low-stock counts, weekly sales, and recent activity. Filters let managers narrow the timeline or workspace and move quickly into the relevant module when something needs attention.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">
              <h3 className="text-lg font-semibold text-foreground">Products</h3>
              <p className="mt-2">Products are organized by SKU and can include variants, attributes, and location-specific details. A consistent SKU scheme, along with clear categories, tags, and reorder points, keeps the catalog easy to search and maintain.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">
              <h3 className="text-lg font-semibold text-foreground">Inventory</h3>
              <p className="mt-2">Inventory pages let operators record movements, perform stock counts, and transfer stock between locations. Every movement creates an audit log entry with the actor, timestamp, and reason code so the history stays traceable.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">
              <h3 className="text-lg font-semibold text-foreground">Sales</h3>
              <p className="mt-2">Sales flows automatically decrement inventory and create transactional records. The Sales UI includes a composer for quick checkout, plus tools for associating payments and customers when the transaction needs more context.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">
              <h3 className="text-lg font-semibold text-foreground">Settings & Access</h3>
              <p className="mt-2">Admins can manage workspace-level settings, user roles, and integrations from a single place. Scoped tokens, audit logs, and regular role reviews help keep the workspace aligned with governance requirements.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={active === "api" ? "block" : "hidden"} aria-hidden={active !== "api"}>
        <div className={`${docsSectionShell} text-sm leading-7 text-slate-600 dark:text-slate-300`}>
          <p className="mb-4">The platform exposes REST endpoints under /api/*. Authentication uses bearer tokens issued for either a user session or a machine account, and all endpoints expect JSON payloads with standard HTTP status responses.</p>

          <div className="space-y-5">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">
              <h3 className="text-lg font-semibold text-foreground">Authentication</h3>
              <p className="mt-2">Use the /api/auth/login route to obtain a session token for a signed-in user. For long-lived machine integrations, create a machine token with restricted scopes so the integration only receives the access it needs.</p>
              <pre className="mt-4 overflow-x-auto rounded-2xl border border-border/70 bg-[color:var(--color-card)] px-4 py-3 text-xs text-slate-700 dark:text-slate-200"><code>Authorization: Bearer &lt;token&gt;</code></pre>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">
              <h3 className="text-lg font-semibold text-foreground">Example: list products</h3>
              <pre className="mt-4 overflow-x-auto rounded-2xl border border-border/70 bg-[color:var(--color-card)] px-4 py-3 text-xs text-slate-700 dark:text-slate-200"><code>curl -H "Authorization: Bearer &lt;token&gt;" https://your-domain.com/api/products</code></pre>
              <p className="mt-3">Sample response (200):</p>
              <pre className="mt-3 overflow-x-auto rounded-2xl border border-border/70 bg-[color:var(--color-card)] px-4 py-3 text-xs text-slate-700 dark:text-slate-200"><code>{`{
  "data": [
    { "id": "sku-001", "name": "Widget A", "quantity": 120 }
  ],
  "meta": { "total": 1 }
}`}</code></pre>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">
              <h3 className="text-lg font-semibold text-foreground">Webhooks</h3>
              <p className="mt-2">If you enable webhooks, the platform will POST to your configured endpoint when important events occur, such as sale.created, inventory.movement, and product.updated. Always verify request signatures and return a 2xx response to confirm that the event was received successfully.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={active === "getting-started" ? "block" : "hidden"} aria-hidden={active !== "getting-started"}>
        <div className={`${docsSectionShell} text-sm leading-7 text-slate-600 dark:text-slate-300`}>
          <p className="mb-4">Follow these practical steps to onboard a new workspace in a way that stays organized and easy to support later.</p>
          <ol className="space-y-3">
            {quickstartSteps.map((step, index) => (
              <li key={step} className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">
                <p className="text-sm font-semibold text-foreground">Step {index + 1}</p>
                <p className="mt-2">{step}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-2xl border border-border/70 bg-teal-500/5 p-4 text-slate-600 dark:text-slate-300">
            Tip: run a full stock count for the top 20 SKUs before enabling automatic replenishment workflows to avoid noisy alerts.
          </p>
        </div>
      </div>

      <div className={active === "deployment" ? "block" : "hidden"} aria-hidden={active !== "deployment"}>
        <div className={`${docsSectionShell} text-sm leading-7 text-slate-600 dark:text-slate-300`}>
          <p className="mb-4">Recommended deployment checklist for a reliable production rollout:</p>
          <ul className="space-y-3">
            <li className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">Use a managed platform such as Vercel or a container-based host, then run npm run build to confirm the app compiles cleanly before deployment.</li>
            <li className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">Make sure environment variables for the database, session secrets, and payment keys are configured in the host environment before traffic is routed to production.</li>
            <li className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">Prefer a managed Postgres instance and a dedicated secrets manager so sensitive values are stored and rotated safely.</li>
            <li className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">Enable TLS and configure a custom domain, then review your CORS and CSP policies so browser access remains secure and predictable.</li>
            <li className="rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">Run smoke tests for the most important flows, including login, product browsing, and checkout, before you consider the deployment complete.</li>
          </ul>
          <p className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-4 sm:p-5">For monitoring, capture errors and performance metrics from the start and create alerts for webhook failures, payment issues, or outages in critical API endpoints.</p>
        </div>
      </div>
    </div>
  );
}