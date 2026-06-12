import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSessionUser } from "@/lib/auth";
import { getAlertProducts, getWorkspaceSettings } from "@/lib/store";

export default async function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const alerts = (await getAlertProducts()).slice(0, 3).map((product) => ({
    id: product.id,
    title: product.name,
    description: `${product.stock_quantity} of ${product.reorder_level} remaining`,
  }));

  const settings = await getWorkspaceSettings();

  return (
    <AppShell
      user={user}
      notifications={alerts}
      workspaceLogoUrl={settings.company.logoUrl}
      workspaceName={settings.company.companyName}
    >
      {children}
    </AppShell>
  );
}