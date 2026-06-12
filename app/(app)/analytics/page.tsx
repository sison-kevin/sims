import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardCharts } from "@/components/dashboard/charts";
import type { ProductRecord, SaleRecord } from "@/lib/domain";
import { getAnalyticsSeries, listProducts, listSales } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { Boxes, DollarSign, PackageCheck, TrendingUp } from "lucide-react";

export default async function AnalyticsPage() {
  const [series, products, sales] = await Promise.all([
    getAnalyticsSeries(),
    listProducts(),
    listSales(),
  ]);
  const topProducts = [...products].sort((left: ProductRecord, right: ProductRecord) => right.stock_quantity - left.stock_quantity).slice(0, 5);
  const byCategory = products.reduce<Record<string, number>>((acc: Record<string, number>, product: ProductRecord) => {
    acc[product.category] = (acc[product.category] ?? 0) + product.stock_quantity;
    return acc;
  }, {});
  const revenue = sales.reduce((sum: number, sale: SaleRecord) => sum + sale.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Analytics</h2>
        <p className="text-slate-500 dark:text-slate-400">Operational trends and category composition across the current catalog.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500"><Boxes className="h-4 w-4 text-accent" />Catalog size</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{products.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500"><DollarSign className="h-4 w-4 text-accent" />Revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{formatCurrency(revenue)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500"><PackageCheck className="h-4 w-4 text-accent" />Top stock</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{Math.max(...products.map((product: ProductRecord) => product.stock_quantity), 0)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500"><TrendingUp className="h-4 w-4 text-accent" />Transactions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{sales.length}</CardContent>
        </Card>
      </div>

      <DashboardCharts series={series} />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category stock distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(byCategory).map(([category, total]: [string, number]) => (
              <div key={category} className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3">
                <span>{category}</span>
                <span className="font-medium">{total} units</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3">
              <span>Total sales count</span>
              <span className="font-medium">{sales.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3">
              <span>Total revenue</span>
              <span className="font-medium">{formatCurrency(sales.reduce((sum: number, sale: SaleRecord) => sum + sale.total, 0))}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top products</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>
                    <Badge variant={product.stock_quantity <= product.reorder_level ? "destructive" : "secondary"}>
                      {product.stock_quantity <= product.reorder_level ? "Monitor" : "Healthy"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}