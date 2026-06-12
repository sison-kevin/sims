"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/domain";
import { useEffect, useMemo, useState } from "react";
import { Bell, Boxes, ChartColumnBig, ChevronLeft, ChevronRight, ClipboardList, LayoutDashboard, LogOut, PackageSearch, Settings2, ShoppingCart, TriangleAlert, Users, Notebook } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarLink, SidebarSection } from "./ui/sidebar";
import { CommandPalette } from "./command-palette";

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: SessionUser["role"][];
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", description: "Executive overview", icon: LayoutDashboard, roles: ["admin", "manager", "staff"] },
  { href: "/products", label: "Products", description: "Catalog control", icon: PackageSearch, roles: ["admin", "manager"] },
  { href: "/inventory", label: "Inventory", description: "Stock operations", icon: Boxes, roles: ["admin", "manager", "staff"] },
  { href: "/sales", label: "Sales", description: "POS workflow", icon: ShoppingCart, roles: ["admin", "manager", "staff"] },
  { href: "/alerts", label: "Alerts", description: "Low stock response", icon: TriangleAlert, roles: ["admin", "manager", "staff"] },
  { href: "/analytics", label: "Analytics", description: "Trends and KPIs", icon: ChartColumnBig, roles: ["admin", "manager"] },
  { href: "/audit-logs", label: "Audit Logs", description: "Activity trail", icon: ClipboardList, roles: ["admin", "manager"] },
  { href: "/users", label: "Users", description: "Role administration", icon: Users, roles: ["admin"] },
  { href: "/settings", label: "Settings", description: "Workspace preferences", icon: Settings2, roles: ["admin", "manager", "staff"] },
];

const docsNavItems: NavItem[] = [
  { href: "/docs", label: "Docs", description: "Product documentation", icon: Notebook, roles: ["admin", "manager", "staff"] },
  { href: "/pricing", label: "Pricing", description: "Plans and billing", icon: ShoppingCart, roles: ["admin", "manager", "staff"] },
  { href: "/login", label: "Open platform", description: "Sign in", icon: Users, roles: ["admin", "manager", "staff"] },
];

const SIDEBAR_COLLAPSED_STORAGE_KEY = "sims-sidebar-collapsed";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function AppShell({
  user,
  notifications,
  workspaceLogoUrl,
  workspaceName,
  children,
}: React.PropsWithChildren<{ user: SessionUser; notifications: Array<{ id: string; title: string; description: string }>; workspaceLogoUrl?: string | null; workspaceName?: string }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarReady, setSidebarReady] = useState(false);

  useEffect(() => {
    const savedCollapsed = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
    queueMicrotask(() => {
      if (savedCollapsed !== null) {
        setCollapsed(savedCollapsed === "true");
      }

      setSidebarReady(true);
    });
  }, []);

  useEffect(() => {
    if (!sidebarReady) {
      return;
    }

    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(collapsed));
  }, [collapsed, sidebarReady]);

  const visibleNavItems = useMemo(() => {
    try {
      if (typeof pathname === "string" && pathname.startsWith("/docs")) {
        return docsNavItems.filter((item) => item.roles.includes(user.role));
      }
    } catch (e) {}

    return navItems.filter((item) => item.roles.includes(user.role));
  }, [pathname, user.role]);

  const activeItem = useMemo(() => visibleNavItems.find((item) => pathname === item.href), [pathname, visibleNavItems]);

  return (
    <div className="min-h-screen">
      <div className={cn("grid min-h-screen transition-[grid-template-columns] duration-300 lg:grid-cols-[280px_minmax(0,1fr)]", sidebarReady && collapsed && "lg:grid-cols-[88px_minmax(0,1fr)]") }>
        <div className="hidden lg:block">
          <Sidebar className={cn("sticky top-0 h-screen overflow-hidden transition-all duration-300", sidebarReady && collapsed && "items-center") }>
            <SidebarHeader className={cn(sidebarReady && collapsed && "px-3 py-5 text-center") }>
              <div className={cn("space-y-2", sidebarReady && collapsed && "flex flex-col items-center space-y-1") }>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">SIMS</div>
                {!sidebarReady || !collapsed ? (
                  <>
                    <div className="text-lg font-semibold">Inventory Command</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Retail operations dashboard</div>
                  </>
                ) : null}
              </div>
            </SidebarHeader>
              <SidebarContent className={cn(sidebarReady && collapsed && "px-2") }>
              <SidebarSection title={!sidebarReady || !collapsed ? "Workspace" : undefined} className={cn(sidebarReady && collapsed && "mb-4") }>
                {visibleNavItems.map((item) => (
                  <SidebarLink
                    key={item.href}
                    href={item.href}
                    active={pathname === item.href}
                    className={cn(sidebarReady && collapsed && "justify-center px-2")}
                    aria-label={item.label}
                    title={item.label}
                  >
                    <span className={cn("flex items-center gap-3", sidebarReady && collapsed && "justify-center gap-0") }>
                      <item.icon className="h-4 w-4" />
                      {!sidebarReady || !collapsed ? (
                        <span className="flex flex-col">
                          <span>{item.label}</span>
                          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{item.description}</span>
                        </span>
                      ) : null}
                    </span>
                  </SidebarLink>
                ))}
              </SidebarSection>
              {!sidebarReady || !collapsed ? (
                <div className="rounded-2xl border border-border bg-accent/10 p-4">
                  <div className="text-sm font-semibold text-foreground">Role</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline">{user.role}</Badge>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{user.email}</span>
                  </div>
                </div>
              ) : null}
            </SidebarContent>
            <SidebarFooter className={cn(sidebarReady && collapsed && "p-3") }>
              <div className={cn("flex gap-2", sidebarReady && collapsed && "flex-col") }>
                <Button
                  variant="outline"
                  className={cn(!sidebarReady || !collapsed ? "w-full" : "w-10", sidebarReady && collapsed && "justify-center px-0")}
                  onClick={() => setCollapsed((value) => !value)}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  {!sidebarReady || !collapsed ? "Collapse" : null}
                </Button>

                <Button
                  variant="outline"
                  className={cn(!sidebarReady || !collapsed ? "w-full" : "w-10", sidebarReady && collapsed && "justify-center px-0")}
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    router.push("/login");
                    router.refresh();
                  }}
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                  {!sidebarReady || !collapsed ? "Sign out" : null}
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>
        </div>

        <Sheet>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                  <div className="lg:hidden">
                    <SheetTrigger>
                      <Button variant="outline" size="sm">Menu</Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                      <SheetHeader>
                        <SheetTitle>SIMS Portfolio</SheetTitle>
                        <SheetDescription>Retail operations dashboard</SheetDescription>
                      </SheetHeader>
                      <SheetBody>
                        <div className="space-y-1">
                          {visibleNavItems.map((item) => (
                            <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition", pathname === item.href ? "bg-accent text-accent-foreground" : "hover:bg-black/[0.04]") }>
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          className="mt-6 w-full"
                          onClick={async () => {
                            await fetch("/api/auth/logout", { method: "POST" });
                            router.push("/login");
                            router.refresh();
                          }}
                        >
                          Sign out
                        </Button>
                      </SheetBody>
                    </SheetContent>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-2xl border border-border/70 bg-background/80">
                        <AvatarImage src={workspaceLogoUrl ?? undefined} alt={`${workspaceName ?? "Workspace"} logo`} />
                      </Avatar>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Smart Inventory</div>
                        <div className="flex items-center gap-4">
                          <h1 className="text-xl font-semibold">{activeItem?.label ?? "Dashboard"}</h1>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CommandPalette
                    userRole={user.role}
                    items={visibleNavItems.map((item) => ({
                      href: item.href,
                      label: item.label,
                      description: item.description,
                      roles: item.roles,
                    }))}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline" size="sm" className="relative">
                        <Bell className="h-4 w-4" />
                        <span className="sr-only">Notifications</span>
                        {notifications.length ? <Badge className="absolute -right-2 -top-2 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">{notifications.length}</Badge> : null}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {notifications.length ? notifications.map((notification) => (
                        <DropdownMenuItem key={notification.id}>
                          <span className="flex flex-col items-start">
                            <span className="font-medium">{notification.title}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{notification.description}</span>
                          </span>
                        </DropdownMenuItem>
                      )) : <DropdownMenuItem>No alerts right now</DropdownMenuItem>}
                      <DropdownMenuItem onClick={async () => router.push("/alerts")}>Open alerts</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    {user.name}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline" size="sm">{user.role}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>{user.email}</DropdownMenuItem>
                      <DropdownMenuItem onClick={async () => router.push("/dashboard")}>Go to dashboard</DropdownMenuItem>
                      <DropdownMenuItem danger onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST" });
                        router.push("/login");
                        router.refresh();
                      }}>
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>

            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">{children}</div>
            </main>
          </div>
        </Sheet>
      </div>
    </div>
  );
}