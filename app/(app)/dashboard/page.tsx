import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DashboardCharts } from "@/components/dashboard/charts";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { getAlertProducts, getAnalyticsSeries, getDashboardMetrics, listAuditLogs, listProducts } from "@/lib/store";
import { formatCurrency } from "@/lib/format";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const series = await getAnalyticsSeries();
  const lowStock = await getAlertProducts();
  const products = await listProducts();
  const auditLogs = await listAuditLogs();
  const topProducts = products.slice(0, 5);
  const latestAuditLogs = auditLogs.slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">Inventory control tower</h2>
          <p className="max-w-3xl text-slate-500 dark:text-slate-400">
            Monitor products, sales, low-stock alerts, and movement patterns from one operational view.
          </p>
        </div>
        <div className="flex gap-3">
          <a href="/alerts" className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-transparent px-4 text-sm font-medium transition hover:bg-white/60 dark:hover:bg-white/5">
            Review alerts
          </a>
          <a href="/sales" className="inline-flex h-10 items-center justify-center rounded-xl bg-accent px-4 text-sm font-medium text-accent-foreground transition hover:brightness-95">
            Create sale
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Products" value={String(metrics.totalProducts)} description="Active SKUs in catalog." iconName="boxes" trend="+6.1% vs last week" />
        <MetricCard title="Total Sales" value={String(metrics.totalSales)} description="Completed transactions." iconName="dollar-sign" trend="+14.4% vs last week" />
        <MetricCard title="Low Stock Items" value={String(metrics.lowStockItems)} description="Products below reorder threshold." iconName="alert-triangle" trend="-2 items today" accent />
        <MetricCard title="Inventory Value" value={formatCurrency(metrics.inventoryValue)} description="Cost basis of on-hand stock." iconName="sparkles" trend="Stable" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <DashboardCharts series={series} />

          <Card>
            <CardHeader>
              <CardTitle>Catalog snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 lg:grid-cols-2 xl:grid-cols-5">
              {topProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-border/70 px-4 py-3">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{product.category}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant={product.stock_quantity <= product.reorder_level ? "destructive" : "secondary"}>
                      Stock {product.stock_quantity}
                    </Badge>
                    <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Low stock list</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStock.length ? lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">SKU {product.sku}</div>
                  </div>
                  <Badge variant={product.stock_quantity <= Math.max(3, Math.floor(product.reorder_level / 2)) ? "destructive" : "secondary"}>
                    {product.stock_quantity} / {product.reorder_level}
                  </Badge>
                </div>
              )) : <p className="text-sm text-slate-500">No low stock items.</p>}
            </CardContent>
          </Card>

          <RecentActivity logs={latestAuditLogs} />
        </div>
      </div>
    </div>
  );
}