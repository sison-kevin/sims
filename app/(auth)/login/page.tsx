"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowRight,
  Bell,
  Boxes,
  Check,
  ChevronRight,
  CircleAlert,
  Globe,
  LayoutDashboard,
  LineChart,
  Menu,
  NotebookTabs,
  PlayCircle,
  ScanSearch,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { LoginThemeToggle } from "@/components/auth/login-theme-toggle";
import { readAppearancePreferences, type ThemeMode } from "@/lib/appearance";
import CountUp from "@/components/ui/count-up";

type AnalyticsSeriesPoint = {
  date: string;
  sales: number;
  stockIn: number;
  stockOut: number;
};

type PreviewPoint = {
  label: string;
  value: number;
};

type AnalyticsPreviewResponse = {
  series: AnalyticsSeriesPoint[];
  summary: {
    productCount: number;
    saleCount: number;
    revenue: number;
    lowStockCount: number;
    stockIn: number;
    stockOut: number;
  };
};

const demoAnalyticsPreview: AnalyticsPreviewResponse = {
  series: [
    { date: "2026-05-24", sales: 18500, stockIn: 42, stockOut: 18 },
    { date: "2026-05-25", sales: 22100, stockIn: 36, stockOut: 22 },
    { date: "2026-05-26", sales: 20800, stockIn: 48, stockOut: 19 },
    { date: "2026-05-27", sales: 26400, stockIn: 55, stockOut: 27 },
    { date: "2026-05-28", sales: 29100, stockIn: 61, stockOut: 24 },
    { date: "2026-05-29", sales: 27300, stockIn: 44, stockOut: 20 },
    { date: "2026-05-30", sales: 31800, stockIn: 67, stockOut: 29 },
  ],
  summary: {
    productCount: 148,
    saleCount: 86,
    revenue: 176000,
    lowStockCount: 12,
    stockIn: 353,
    stockOut: 159,
  },
};

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Analytics", href: "#analytics" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
];

const featureCards = [
  {
    icon: Boxes,
    title: "Smart Inventory Tracking",
    description: "Track SKU movement in real time with anomaly detection and predictive replenishment.",
    details: ["Live stock visibility across products and locations.", "Early warnings for unusual movement or drift.", "Controls designed for fast operational review."],
    ctaLabel: "Open dashboard preview",
    ctaHref: "#dashboard",
  },
  {
    icon: LineChart,
    title: "Real-Time Analytics",
    description: "Visualize revenue, stock velocity, and category performance from one live control center.",
    details: ["Monitor KPIs without leaving the workspace.", "Compare stock health, sales, and trend changes.", "Use analytics to guide replenishment decisions."],
    ctaLabel: "Jump to analytics",
    ctaHref: "#analytics",
  },
  {
    icon: NotebookTabs,
    title: "Audit Logs",
    description: "Maintain complete change history with actor context for compliance and accountability.",
    details: ["Track every meaningful operational change.", "Keep an audit trail for reviews and compliance.", "Pair log history with user and role visibility."],
    ctaLabel: "Read the docs",
    ctaHref: "/docs",
  },
  {
    icon: ShoppingCart,
    title: "Sales Monitoring",
    description: "Correlate sales trends with inventory behavior to reduce stockouts and dead stock.",
    details: ["See how sales affects stock in real time.", "Use order activity to anticipate replenishment.", "Support faster decisions with transaction context."],
    ctaLabel: "Explore pricing",
    ctaHref: "/pricing",
  },
  {
    icon: Users,
    title: "Multi-Role Access",
    description: "Create secure role-based workflows for operators, managers, and administrators.",
    details: ["Separate permissions by team responsibility.", "Keep admin actions visible and controlled.", "Scale access safely as your team grows."],
    ctaLabel: "See dashboard roles",
    ctaHref: "#dashboard",
  },
  {
    icon: CircleAlert,
    title: "Low Stock Alerts",
    description: "Trigger intelligent alerting before critical products hit risky thresholds.",
    details: ["Surface critical items before stockouts happen.", "Prioritize response by severity and quantity.", "Reduce emergency restocking with early action."],
    ctaLabel: "View alert workflow",
    ctaHref: "#analytics",
  },
];

const stats = [
  ["10k+", "products tracked"],
  ["500+", "businesses"],
  ["99.9%", "uptime"],
  ["24/7", "monitoring"],
];

type AnalyticsTab = "Sales" | "Inventory" | "Forecast" | "Alerts";

type AnalyticsPreview = {
  title: string;
  description: string;
  statLabel: string;
  statValue: string;
  statDelta: string;
  series: PreviewPoint[];
  notes: Array<{ label: string; value: string; tone: string }>;
};

const analyticsTabs: AnalyticsTab[] = ["Sales", "Inventory", "Forecast", "Alerts"];

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [heroEmail, setHeroEmail] = useState("");
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState<number | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [selectedAnalyticsTab, setSelectedAnalyticsTab] = useState<AnalyticsTab>("Sales");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsPreviewResponse | null>(demoAnalyticsPreview);
  const selectedPlan = searchParams.get("plan");
  const heroRef = useRef<HTMLElement | null>(null);
  const [heroStatsVisible, setHeroStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [trustStatsVisible, setTrustStatsVisible] = useState(false);

  const featuresRef = useRef<HTMLElement | null>(null);
  const [revealFeatures, setRevealFeatures] = useState(false);

  useEffect(() => {
    if (!featuresRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealFeatures(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.18 },
    );

    observer.observe(featuresRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHeroStatsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 },
    );

    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTrustStatsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.28 },
    );

    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncThemeMode = () => {
      setThemeMode(readAppearancePreferences().themeMode);
    };

    syncThemeMode();

    const observer = new MutationObserver(syncThemeMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics/preview", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = await response.json() as AnalyticsPreviewResponse;
        if (active) {
          setAnalyticsData(data);
        }
      } catch {
        if (active) {
          setAnalyticsData(demoAnalyticsPreview);
        }
      }
    };

    void loadAnalytics();

    return () => {
      active = false;
    };
  }, []);

  const isLightTheme = themeMode === "light";
  const selectedFeature = selectedFeatureIndex === null ? null : featureCards[selectedFeatureIndex];
  const analyticsPoints = analyticsData?.series ?? [
    { date: "Mon", sales: 14, stockIn: 10, stockOut: 3 },
    { date: "Tue", sales: 20, stockIn: 12, stockOut: 4 },
    { date: "Wed", sales: 18, stockIn: 11, stockOut: 5 },
    { date: "Thu", sales: 24, stockIn: 14, stockOut: 6 },
    { date: "Fri", sales: 30, stockIn: 15, stockOut: 7 },
    { date: "Sat", sales: 26, stockIn: 13, stockOut: 4 },
    { date: "Sun", sales: 32, stockIn: 16, stockOut: 5 },
  ];

  function formatPeso(value: number) {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);
  }

  function formatPreviewLabel(date: string) {
    if (date.includes("-")) {
      return date.slice(-5);
    }

    return date;
  }

  function buildAnalyticsPreview(tab: AnalyticsTab): AnalyticsPreview {
    const salesTotal = analyticsPoints.reduce((sum, point) => sum + point.sales, 0);
    const stockInTotal = analyticsPoints.reduce((sum, point) => sum + point.stockIn, 0);
    const stockOutTotal = analyticsPoints.reduce((sum, point) => sum + point.stockOut, 0);
    const peakPoint = analyticsPoints.reduce((best, point) => (point.sales > best.sales ? point : best), analyticsPoints[0]);
    const averageSales = salesTotal / Math.max(analyticsPoints.length, 1);
    const lowStockCount = analyticsData?.summary.lowStockCount ?? 0;

    if (tab === "Inventory") {
      return {
        title: "Stock health snapshot",
        description: "Live inventory pressure derived from the database.",
        statLabel: "Low stock items",
        statValue: `${lowStockCount} items`,
        statDelta: `${analyticsData?.summary.productCount ?? 0} products tracked`,
        series: analyticsPoints.map((point) => ({ label: formatPreviewLabel(point.date), value: point.stockIn + point.stockOut })),
        notes: [
          { label: "Stock in", value: String(stockInTotal), tone: "text-accent" },
          { label: "Stock out", value: String(stockOutTotal), tone: "text-teal-600 dark:text-teal-300" },
          { label: "Catalog size", value: String(analyticsData?.summary.productCount ?? 0), tone: "text-slate-700 dark:text-slate-200" },
        ],
      };
    }

    if (tab === "Forecast") {
      return {
        title: "Demand forecast",
        description: "Projection based on the live sales series in your database.",
        statLabel: "Projected orders",
        statValue: String(Math.round(averageSales * 1.18)),
        statDelta: `${formatPeso(averageSales)} avg. daily sales`,
        series: analyticsPoints.map((point) => ({ label: formatPreviewLabel(point.date), value: Math.max(point.sales, 1) })),
        notes: [
          { label: "Peak day", value: peakPoint.date, tone: "text-accent" },
          { label: "Confidence", value: analyticsPoints.length ? "Live data" : "No data", tone: "text-teal-600 dark:text-teal-300" },
          { label: "Suggested action", value: "Review replenishment", tone: "text-slate-700 dark:text-slate-200" },
        ],
      };
    }

    if (tab === "Alerts") {
      return {
        title: "Alert pressure",
        description: "Active risk signals derived from current product stock levels.",
        statLabel: "Open alerts",
        statValue: String(lowStockCount),
        statDelta: lowStockCount ? `${lowStockCount} items need attention` : "No active alerts",
        series: analyticsPoints.map((point) => ({ label: formatPreviewLabel(point.date), value: Math.max(point.stockOut, 1) })),
        notes: [
          { label: "Low stock", value: String(lowStockCount), tone: "text-red-500 dark:text-red-400" },
          { label: "Products", value: String(analyticsData?.summary.productCount ?? 0), tone: "text-teal-600 dark:text-teal-300" },
          { label: "Status", value: lowStockCount ? "Monitor now" : "Healthy", tone: "text-slate-700 dark:text-slate-200" },
        ],
      };
    }

    return {
      title: "Weekly sales pulse",
      description: "Live sales totals pulled from the database.",
      statLabel: "Revenue",
      statValue: formatPeso(analyticsData?.summary.revenue ?? salesTotal),
      statDelta: `${analyticsData?.summary.saleCount ?? 0} transactions recorded`,
      series: analyticsPoints.map((point) => ({ label: formatPreviewLabel(point.date), value: Math.max(point.sales, 1) })),
      notes: [
        { label: "Peak day", value: peakPoint.date, tone: "text-accent" },
        { label: "Average sale", value: formatPeso(averageSales), tone: "text-teal-600 dark:text-teal-300" },
        { label: "Orders", value: String(analyticsData?.summary.saleCount ?? 0), tone: "text-slate-700 dark:text-slate-200" },
      ],
    };
  }

  const selectedAnalytics = buildAnalyticsPreview(selectedAnalyticsTab);
  const chartPoints = selectedAnalytics.series;
  const chartWidth = 640;
  const chartHeight = 220;
  const chartPaddingX = 18;
  const chartPaddingY = 16;
  const chartMaxValue = Math.max(...chartPoints.map((point) => point.value), 1);
  const chartLinePoints = chartPoints
    .map((point, index) => {
      const x = chartPoints.length === 1
        ? chartWidth / 2
        : chartPaddingX + ((chartWidth - chartPaddingX * 2) * index) / Math.max(chartPoints.length - 1, 1);
      const y = chartHeight - chartPaddingY - ((chartHeight - chartPaddingY * 2) * point.value) / chartMaxValue;

      return `${x},${y}`;
    })
    .join(" ");

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);

    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.11),transparent_26%),var(--background)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.02)_0%,transparent_28%,rgba(15,118,110,0.06)_100%)] dark:bg-[linear-gradient(120deg,rgba(6,10,18,0.62)_0%,rgba(7,17,31,0.3)_45%,rgba(15,118,110,0.14)_100%)]" />
      <div className="pointer-events-none absolute -top-14 left-[10%] h-56 w-56 rounded-full bg-teal-300/25 blur-3xl dark:bg-teal-400/15" />
      <div className="pointer-events-none absolute right-[6%] top-[20%] h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-400/10" />

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="right" className="bg-[color:var(--color-card)] backdrop-blur-2xl">
          <SheetHeader className="space-y-1">
            <SheetTitle>SIMS Portfolio</SheetTitle>
            <SheetDescription>Navigate and access authentication actions.</SheetDescription>
          </SheetHeader>
          <SheetBody className="space-y-3">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(event) => {
                  if (item.href.startsWith("#")) {
                    event.preventDefault();
                    scrollToSection(item.href.slice(1));
                  }

                  setMobileNavOpen(false);
                }}
                className="block rounded-xl border border-border/60 px-4 py-3 text-sm font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
              >
                {item.label}
              </a>
            ))}
            <Separator className="my-2" />
            <Button variant="outline" className="h-11 w-full rounded-full" onClick={() => {
              setMobileNavOpen(false);
              setLoginOpen(true);
            }}>
              Login
            </Button>
          </SheetBody>
        </SheetContent>
      </Sheet>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-w-lg rounded-[1.8rem] border-border/70 bg-[color:var(--color-card)] p-0 shadow-[0_30px_120px_rgba(2,6,23,0.45)] backdrop-blur-2xl">
          <div className="rounded-[1.8rem] border border-white/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(255,255,255,0.32))] p-6 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.4),rgba(7,17,31,0.5))] sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-border/70 bg-[linear-gradient(135deg,rgba(15,118,110,0.18),rgba(45,212,191,0.24))]">
                  <AvatarFallback>SP</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">Welcome back</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to continue to your workspace.</p>
                </div>
              </div>
              <Badge className="rounded-full border-teal-600/20 bg-teal-500/10 text-teal-700 dark:text-teal-300">Secure Auth</Badge>
            </div>

            <LoginForm initialEmail={heroEmail} />

            <Separator className="my-6" />

            <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <p className="font-medium text-foreground">Demo credentials</p>
              <div className="rounded-xl border border-border/70 bg-black/[0.02] px-4 py-2 dark:bg-white/[0.03]">manager@sims.local / manager123</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative z-10 mx-auto w-full max-w-none px-3 pb-4 pt-4 sm:px-4 lg:px-6 lg:pb-6">
        <header className="sticky top-4 z-40 mb-10 rounded-full border border-border/70 bg-[color:var(--color-card)]/90 px-3 py-2 shadow-[0_14px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-5 motion-safe:animate-[sims-fade-down_700ms_ease-out_both]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-semibold text-teal-600 dark:text-teal-300">SIMS</p>
                <p className="hidden text-xs text-slate-500 sm:block">Retail operating system</p>
              </div>
            </div>

            {selectedPlan ? (
              <Badge className="hidden rounded-full border-teal-600/20 bg-teal-500/10 text-teal-700 dark:text-teal-300 md:inline-flex">
                Plan selected: {selectedPlan}
              </Badge>
            ) : null}

            <NavigationMenu className="hidden lg:block">
              <NavigationMenuList>
                {navLinks.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink
                      href={item.href}
                      onClick={(event) => {
                        if (!item.href.startsWith("#")) {
                          return;
                        }

                        event.preventDefault();
                        scrollToSection(item.href.slice(1));
                      }}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center gap-2">
              <LoginThemeToggle />
              <Button
                className="hidden rounded-full bg-[linear-gradient(135deg,var(--color-accent),#14b8a6)] px-4 text-sm text-[color:var(--color-accent-foreground)] shadow-lg shadow-teal-500/25 transition hover:-translate-y-0.5 hover:shadow-xl sm:inline-flex"
                onClick={() => setLoginOpen(true)}
              >
                Login
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 w-10 rounded-full p-0 lg:hidden"
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <section id="dashboard" ref={heroRef} className="login-hero-shell relative scroll-mt-28 overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.55))] p-6 shadow-[0_30px_120px_rgba(2,6,23,0.12)] backdrop-blur-xl dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.55),rgba(7,17,31,0.75))] sm:p-10 lg:p-14 motion-safe:animate-[sims-hero-rise_1000ms_cubic-bezier(0.16,1,0.3,1)_both]">
          <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="space-y-7 motion-safe:animate-[sims-hero-rise_1100ms_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:900ms] [animation-fill-mode:both]">
              <Badge className="rounded-full border-teal-700/15 bg-teal-500/10 px-4 py-1.5 text-teal-700 dark:text-teal-300">
                Built for modern retail teams
              </Badge>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Smart inventory management built for <span className="bg-[linear-gradient(135deg,#0f766e,#14b8a6)] bg-clip-text text-transparent">modern retail teams</span>.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                SIMS unifies inventory tracking, sales monitoring, analytics, audit logs, and role management so every team decision is data-driven and reliable.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={() => setLoginOpen(true)}
                  className="h-12 rounded-xl bg-[linear-gradient(135deg,var(--color-accent),#14b8a6)] px-6 text-[color:var(--color-accent-foreground)] shadow-lg shadow-teal-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Start Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <Input
                  className="h-11 rounded-xl"
                  placeholder="Enter your work email"
                  value={heroEmail}
                  onChange={(event) => setHeroEmail(event.target.value)}
                />
                <Button type="button" className="h-11 rounded-xl px-5" onClick={() => setLoginOpen(true)}>
                  Book walkthrough
                </Button>
              </div>
            </div>

            <TooltipProvider>
              {isLightTheme ? (
                <Card className="relative overflow-hidden rounded-[1.6rem] p-2 text-slate-800 bg-white motion-safe:animate-[sims-hero-slide-left_1200ms_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:1400ms] [animation-fill-mode:both]">
                  <div className="absolute inset-0 opacity-30 bg-gradient-to-tr from-teal-50 to-cyan-50" />
                  <CardContent className="relative grid gap-4 p-4 sm:p-5">
                    <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                      <div className="rounded-2xl border border-border/60 bg-white p-3">
                        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-500">Workspace</p>
                        <div className="space-y-2">
                          {[
                            [LayoutDashboard, "Dashboard"],
                            [Boxes, "Inventory"],
                            [LineChart, "Analytics"],
                            [Bell, "Alerts"],
                          ].map(([Icon, label], idx) => (
                            <div key={label as string} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${idx === 1 ? "bg-slate-100 text-slate-800" : "text-slate-600"}`}>
                              <Icon className="h-4 w-4 text-slate-500" />
                              <span>{label as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                          {[
                            ["Revenue", "$142.4k", "+18.2%"],
                            ["Stock health", "98.1%", "Stable"],
                            ["Orders", "3,684", "+9.4%"],
                          ].map(([title, value, meta]) => {
                            const raw = value as string;
                            let valueNode: React.ReactNode;
                            if (!heroStatsVisible) {
                              valueNode = raw;
                            } else if (raw === "24/7") {
                              valueNode = raw;
                            } else if (raw.includes("$")) {
                              const num = parseFloat(raw.replace(/[$,kK]/g, "")) || 0;
                              const suffix = /k/i.test(raw) ? "k" : "";
                              const decimals = raw.includes(".") ? 1 : 0;
                              valueNode = <CountUp to={num} decimals={decimals} prefix="$" suffix={suffix} />;
                            } else if (raw.includes("%")) {
                              const num = parseFloat(raw.replace(/[%]/g, "")) || 0;
                              const decimals = raw.includes(".") ? 1 : 0;
                              valueNode = <CountUp to={num} decimals={decimals} suffix="%" />;
                            } else if (/k\+$/i.test(raw)) {
                              const num = parseFloat(raw.replace(/[^\d.]/g, "")) || 0;
                              valueNode = <CountUp to={num} suffix="k+" />;
                            } else if (/\+$/.test(raw)) {
                              const num = parseFloat(raw.replace(/[^\d.]/g, "")) || 0;
                              valueNode = <CountUp to={num} suffix="+" />;
                            } else {
                              const num = parseInt(raw.replace(/,/g, ""), 10) || 0;
                              valueNode = <CountUp to={num} />;
                            }

                            return (
                              <div key={title as string} className="rounded-2xl border border-border/60 bg-[color:var(--color-card)] p-3">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{title as string}</p>
                                <p className="mt-2 text-xl font-semibold text-slate-800">{valueNode}</p>
                                <p className="text-xs text-teal-600">{meta as string}</p>
                              </div>
                            );
                          })}
                        </div>

                        <Tabs defaultValue="overview">
                          <TabsList className="bg-[color:var(--color-card)]">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-accent">Overview</TabsTrigger>
                            <TabsTrigger value="live" className="data-[state=active]:bg-accent">Live feed</TabsTrigger>
                            <TabsTrigger value="risk" className="data-[state=active]:bg-accent">Risk</TabsTrigger>
                          </TabsList>
                          <TabsContent value="overview" className="mt-3 space-y-3">
                            <div className="h-28 rounded-2xl border border-border/60 bg-white p-3">
                              <div className="flex h-full items-end gap-2">
                                {[20, 32, 28, 46, 38, 54, 62].map((height, idx) => (
                                  <div key={idx} className="flex-1 rounded-t-xl bg-gradient-to-t from-teal-300 to-teal-200" style={{ height: `${height}%` }} />
                                ))}
                              </div>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div className="rounded-xl border border-border/60 bg-white px-3 py-2 text-sm text-slate-600">Inventory accuracy at 99.3%</div>
                              <div className="rounded-xl border border-border/60 bg-white px-3 py-2 text-sm text-slate-600">41 low stock warnings resolved</div>
                            </div>
                          </TabsContent>
                          <TabsContent value="live" className="mt-3 space-y-2">
                            {[
                              "Blueberry Syrup stock adjusted by +40",
                              "Purchase order approved by Manager",
                              "Low stock alert triggered: Label Rolls",
                            ].map((entry) => (
                              <div key={entry} className="rounded-xl border border-border/60 bg-white px-3 py-2 text-sm text-slate-600">{entry}</div>
                            ))}
                          </TabsContent>
                          <TabsContent value="risk" className="mt-3 space-y-2">
                            {["Cold Brew Concentrate", "Ceremonial Matcha", "Cup Lids"].map((entry) => (
                              <div key={entry} className="flex items-center justify-between rounded-xl border border-border/60 bg-white px-3 py-2 text-sm">
                                <span className="text-slate-700">{entry}</span>
                                <Badge className="rounded-full border-amber-200/30 bg-amber-100 text-amber-700">Watchlist</Badge>
                              </div>
                            ))}
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>

                    <Tooltip>
                      <TooltipTrigger className="absolute right-4 top-4">
                        <Badge className="rounded-full border-teal-200/60 bg-teal-50 text-teal-700">Live telemetry</Badge>
                      </TooltipTrigger>
                      <TooltipContent>Data refreshes every 12 seconds.</TooltipContent>
                    </Tooltip>
                  </CardContent>
                </Card>
              ) : (
                <Card
                  className="login-hero-dashboard relative overflow-hidden rounded-[1.6rem] p-2 text-white motion-safe:animate-[sims-hero-slide-left_1200ms_cubic-bezier(0.16,1,0.3,1)_both] [animation-delay:1400ms] [animation-fill-mode:both]"
                  style={{
                    background: "linear-gradient(165deg, rgba(5,16,31,0.96), rgba(8,34,52,0.86))",
                    borderColor: "rgba(255,255,255,0.25)",
                    boxShadow: "0 30px 120px rgba(3,12,24,0.45)",
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.22),transparent_32%),radial-gradient(circle_at_20%_95%,rgba(34,211,238,0.2),transparent_30)]" />
                  <CardContent className="relative grid gap-4 p-4 sm:p-5">
                    <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                      <div className="login-hero-soft rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-white/50">Workspace</p>
                        <div className="space-y-2">
                          {[
                            [LayoutDashboard, "Dashboard"],
                            [Boxes, "Inventory"],
                            [LineChart, "Analytics"],
                            [Bell, "Alerts"],
                          ].map(([Icon, label], idx) => (
                            <div key={label as string} className={`login-hero-soft flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${idx === 1 ? "bg-white/15 text-white" : "text-white/70"}`}>
                              <Icon className="h-4 w-4" />
                              <span>{label as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                          {[
                            ["Revenue", "$142.4k", "+18.2%"],
                            ["Stock health", "98.1%", "Stable"],
                            ["Orders", "3,684", "+9.4%"],
                          ].map(([title, value, meta]) => {
                            const raw = value as string;
                            let valueNode: React.ReactNode;
                            if (!heroStatsVisible) {
                              valueNode = raw;
                            } else if (raw === "24/7") {
                              valueNode = raw;
                            } else if (raw.includes("$")) {
                              const num = parseFloat(raw.replace(/[$,kK]/g, "")) || 0;
                              const suffix = /k/i.test(raw) ? "k" : "";
                              const decimals = raw.includes(".") ? 1 : 0;
                              valueNode = <CountUp to={num} decimals={decimals} prefix="$" suffix={suffix} />;
                            } else if (raw.includes("%")) {
                              const num = parseFloat(raw.replace(/[%]/g, "")) || 0;
                              const decimals = raw.includes(".") ? 1 : 0;
                              valueNode = <CountUp to={num} decimals={decimals} suffix="%" />;
                            } else if (/k\+$/i.test(raw)) {
                              const num = parseFloat(raw.replace(/[^\d.]/g, "")) || 0;
                              valueNode = <CountUp to={num} suffix="k+" />;
                            } else if (/\+$/.test(raw)) {
                              const num = parseFloat(raw.replace(/[^\d.]/g, "")) || 0;
                              valueNode = <CountUp to={num} suffix="+" />;
                            } else {
                              const num = parseInt(raw.replace(/,/g, ""), 10) || 0;
                              valueNode = <CountUp to={num} />;
                            }

                            return (
                              <div key={title as string} className="login-hero-soft rounded-2xl border border-white/10 bg-white/10 p-3">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">{title as string}</p>
                                <p className="mt-2 text-xl font-semibold">{valueNode}</p>
                                <p className="text-xs text-teal-200">{meta as string}</p>
                              </div>
                            );
                          })}
                        </div>

                        <Tabs defaultValue="overview">
                          <TabsList className="login-hero-soft bg-white/10">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">Overview</TabsTrigger>
                            <TabsTrigger value="live" className="data-[state=active]:bg-white/20">Live feed</TabsTrigger>
                            <TabsTrigger value="risk" className="data-[state=active]:bg-white/20">Risk</TabsTrigger>
                          </TabsList>
                          <TabsContent value="overview" className="mt-3 space-y-3">
                            <div className="login-hero-soft h-28 rounded-2xl border border-white/10 bg-white/5 p-3">
                              <div className="flex h-full items-end gap-2">
                                {[20, 32, 28, 46, 38, 54, 62].map((height, idx) => (
                                  <div key={idx} className="flex-1 rounded-t-xl bg-[linear-gradient(180deg,rgba(45,212,191,0.96),rgba(20,184,166,0.25))]" style={{ height: `${height}%` }} />
                                ))}
                              </div>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div className="login-hero-soft rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-sm text-white/80">Inventory accuracy at 99.3%</div>
                              <div className="login-hero-soft rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-sm text-white/80">41 low stock warnings resolved</div>
                            </div>
                          </TabsContent>
                          <TabsContent value="live" className="mt-3 space-y-2">
                            {[
                              "Blueberry Syrup stock adjusted by +40",
                              "Purchase order approved by Manager",
                              "Low stock alert triggered: Label Rolls",
                            ].map((entry) => (
                              <div key={entry} className="login-hero-soft rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm text-white/80">{entry}</div>
                            ))}
                          </TabsContent>
                          <TabsContent value="risk" className="mt-3 space-y-2">
                            {["Cold Brew Concentrate", "Ceremonial Matcha", "Cup Lids"].map((entry) => (
                              <div key={entry} className="login-hero-soft flex items-center justify-between rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm">
                                <span>{entry}</span>
                                <Badge className="rounded-full border-amber-200/30 bg-amber-400/20 text-amber-100">Watchlist</Badge>
                              </div>
                            ))}
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>

                    <Tooltip>
                      <TooltipTrigger className="absolute right-4 top-4">
                        <Badge className="login-hero-soft rounded-full border-teal-300/20 bg-teal-300/20 text-teal-100">Live telemetry</Badge>
                      </TooltipTrigger>
                      <TooltipContent>Data refreshes every 12 seconds.</TooltipContent>
                    </Tooltip>
                  </CardContent>
                </Card>
              )}
            </TooltipProvider>
          </div>
        </section>

        <section className="hero-strip mt-20 overflow-hidden border-y border-border/60 bg-[linear-gradient(90deg,rgba(8,15,28,0.96),rgba(12,87,96,0.94),rgba(8,15,28,0.96))] text-white shadow-[0_18px_60px_rgba(2,6,23,0.16)] -mx-3 sm:-mx-4 lg:-mx-6">
          <div className="px-4 py-3 sm:px-6 sm:py-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-white/55">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
              Retail operations spotlight
            </div>
            <div className="overflow-hidden">
              <div className="hero-strip-track flex w-[200%] items-center gap-8 motion-safe:animate-[sims-marquee_18s_linear_infinite]">
                {[0, 1].map((loop) => (
                  <div key={loop} className="flex w-1/2 items-center justify-around gap-8 pr-8">
                    <p className="max-w-md text-sm font-medium leading-6 text-white/88 sm:text-base">
                      SIMS helps retail teams keep stock visible, sales moving, and decisions fast with one connected operations workspace.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-sm">
                      {[
                        "Inventory control",
                        "Sales intelligence",
                        "Audit readiness",
                        "Low stock alerts",
                      ].map((item) => (
                        <span key={`${loop}-${item}`} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" ref={featuresRef} className="mt-24 scroll-mt-28 motion-safe:animate-[sims-fade-up_800ms_ease-out_both] [animation-delay:120ms] [animation-fill-mode:both]">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Product capabilities</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Operations that scale with confidence.</h2>
            </div>
            <Badge className="rounded-full border-border/70 bg-background/80">6 core modules</Badge>
          </div>
          <div className="grid gap-4 gap-y-8 md:grid-cols-2 xl:grid-cols-3 mt-8">
            {featureCards.map((feature, index) => (
              <Card
                key={feature.title}
                style={{ transitionDelay: `${index * 140}ms` }}
                className={`group relative overflow-hidden rounded-3xl border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,255,255,0.68))] shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:bg-[linear-gradient(180deg,rgba(8,15,28,0.78),rgba(7,17,31,0.9))] transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)] ${revealFeatures ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(20,184,166,0.5),transparent)]" />
                <CardHeader className="pb-2">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-600/15 bg-[linear-gradient(135deg,rgba(15,118,110,0.18),rgba(45,212,191,0.25))] text-teal-700 shadow-sm dark:text-teal-300">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <Badge className="mb-3 w-fit rounded-full border-border/70 bg-background/70 text-[10px] uppercase tracking-[0.2em] text-slate-500">Module {String(index + 1).padStart(2, "0")}</Badge>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm leading-7">{feature.description}</CardDescription>
                  <button
                    type="button"
                    onClick={() => setSelectedFeatureIndex(index)}
                    className="inline-flex items-center rounded-full border border-teal-600/15 bg-teal-500/10 px-4 py-2 text-sm font-medium text-teal-800 transition group-hover:translate-x-0.5 hover:bg-teal-500/15 dark:text-teal-200"
                  >
                    Learn more <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Dialog open={selectedFeatureIndex !== null} onOpenChange={(open) => !open && setSelectedFeatureIndex(null)}>
          <DialogContent className="max-w-xl rounded-[2rem] border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.8))] p-0 shadow-[0_30px_120px_rgba(2,6,23,0.35)] backdrop-blur-2xl dark:bg-[linear-gradient(180deg,rgba(8,15,28,0.92),rgba(7,17,31,0.96))]">
            {selectedFeature ? (
              <div className="p-6 sm:p-8">
                <DialogHeader className="mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-600/15 bg-[linear-gradient(135deg,rgba(15,118,110,0.18),rgba(45,212,191,0.26))] text-teal-700 dark:text-teal-300">
                      <selectedFeature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogTitle>{selectedFeature.title}</DialogTitle>
                      <DialogDescription>Capability details and the next place to explore it.</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4">
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{selectedFeature.description}</p>
                  <div className="grid gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
                    {selectedFeature.details.map((detail) => (
                      <div key={detail} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-300" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-full sm:w-auto"
                    onClick={() => setSelectedFeatureIndex(null)}
                  >
                    Close
                  </Button>
                  <a
                    href={selectedFeature.ctaHref}
                    onClick={() => setSelectedFeatureIndex(null)}
                    className="inline-flex h-10 w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-accent),#14b8a6)] px-4 text-sm font-medium text-[color:var(--color-accent-foreground)] shadow-lg shadow-teal-500/25 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                  >
                    {selectedFeature.ctaLabel}
                  </a>
                </DialogFooter>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        <section id="analytics" className="mt-24 grid scroll-mt-28 gap-6 lg:grid-cols-[1fr_0.9fr] motion-safe:animate-[sims-fade-up_800ms_ease-out_both] [animation-delay:180ms] [animation-fill-mode:both]">
          <Card className="rounded-3xl border-border/70 bg-[color:var(--color-card)]/90">
            <CardHeader className="pb-1">
              <CardTitle className="text-2xl">Analytics preview</CardTitle>
              <CardDescription>Real-time KPI board with stock, sales, and risk snapshots.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-4">
                {analyticsTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSelectedAnalyticsTab(tab)}
                    className={[
                      "rounded-xl border px-3 py-2 text-left text-sm font-medium transition",
                      selectedAnalyticsTab === tab
                        ? "border-accent/40 bg-accent text-accent-foreground shadow-sm"
                        : "border-border/70 bg-background/70 text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.04]",
                    ].join(" ")}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{selectedAnalytics.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{selectedAnalytics.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-accent">{selectedAnalytics.statValue}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{selectedAnalytics.statLabel}</p>
                      <p className="text-[11px] font-medium text-teal-600 dark:text-teal-300">{selectedAnalytics.statDelta}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-52 w-full overflow-visible" role="img" aria-label={`${selectedAnalytics.title} line chart`}>
                      <defs>
                        <linearGradient id="loginAnalyticsFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {[0.25, 0.5, 0.75].map((ratio) => {
                        const y = chartPaddingY + (chartHeight - chartPaddingY * 2) * ratio;

                        return (
                          <line
                            key={ratio}
                            x1={chartPaddingX}
                            x2={chartWidth - chartPaddingX}
                            y1={y}
                            y2={y}
                            stroke="currentColor"
                            strokeOpacity="0.08"
                            strokeDasharray="4 4"
                          />
                        );
                      })}

                      {chartPoints.length > 0 ? (
                        <>
                          <path d={`M ${chartPaddingX} ${chartHeight - chartPaddingY} L ${chartLinePoints} L ${chartWidth - chartPaddingX} ${chartHeight - chartPaddingY} Z`} fill="url(#loginAnalyticsFill)" />
                          <polyline
                            points={chartLinePoints}
                            fill="none"
                            stroke="var(--color-accent)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {chartPoints.map((point, index) => {
                            const x = chartPoints.length === 1
                              ? chartWidth / 2
                              : chartPaddingX + ((chartWidth - chartPaddingX * 2) * index) / Math.max(chartPoints.length - 1, 1);
                            const y = chartHeight - chartPaddingY - ((chartHeight - chartPaddingY * 2) * point.value) / chartMaxValue;

                            return (
                              <g key={point.label}>
                                <circle cx={x} cy={y} r="4.5" fill="var(--background)" stroke="var(--color-accent)" strokeWidth="3" />
                                <text x={x} y={chartHeight - 2} textAnchor="middle" className="fill-slate-500 text-[10px] uppercase tracking-[0.18em]">
                                  {point.label}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      ) : null}
                    </svg>
                  </div>
                </div>
                <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-4">
                  {selectedAnalytics.notes.map((note) => (
                    <div key={note.label} className="rounded-xl border border-border/70 bg-background/80 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{note.label}</p>
                      <p className={["mt-1 text-sm font-semibold", note.tone].join(" ")}>{note.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div ref={statsRef}>
            <Card className="rounded-3xl border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(255,255,255,0.64))] dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.64),rgba(7,17,31,0.74))]">
              <CardHeader>
                <CardTitle className="text-2xl">Trusted by growth teams</CardTitle>
                <CardDescription>Modern infrastructure, resilient workflows, enterprise-grade reliability.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {stats.map(([value, label]) => {
                    const raw = value as string;
                    let statValue: React.ReactNode = raw;

                    if (trustStatsVisible && raw === "10k+") {
                      statValue = <CountUp to={10} suffix="k+" />;
                    } else if (trustStatsVisible && raw === "500+") {
                      statValue = <CountUp to={500} suffix="+" />;
                    } else if (trustStatsVisible && raw === "99.9%") {
                      statValue = <CountUp to={99.9} decimals={1} suffix="%" />;
                    }

                    return (
                      <div key={label as string} className="rounded-2xl border border-border/70 bg-background/80 px-3 py-4 text-center">
                        <p className="text-2xl font-semibold">{statValue}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{label as string}</p>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-5" />

                <div className="space-y-3">
                  {[
                    [ShieldCheck, "ISO-ready auditing"],
                    [Globe, "Global deployment edge"],
                    [ScanSearch, "Continuous anomaly checks"],
                  ].map(([Icon, text]) => (
                    <div key={text as string} className="flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-sm">
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-teal-600 dark:text-teal-300" />
                        {text as string}
                      </span>
                      <Check className="h-4 w-4 text-teal-600 dark:text-teal-300" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex -space-x-2">
                  {[
                    "AT",
                    "MX",
                    "LL",
                    "NV",
                  ].map((initials) => (
                    <Avatar key={initials} className="h-9 w-9 border border-background">
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <footer className="mt-14 rounded-3xl border border-border/70 bg-[color:var(--color-card)]/82 px-6 py-8 backdrop-blur">
          <div className="flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p>SIMS Portfolio. Inventory intelligence for modern operators.</p>
              <p>Developed by: k_sison</p>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground">Security</a>
              <a href="#" className="hover:text-foreground">Status</a>
              <a href="#" className="hover:text-foreground">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}