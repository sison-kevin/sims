import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SaleComposer } from "@/components/sales/sale-composer";
import { listProducts, listSales } from "@/lib/store";

export default async function SalesPage() {
  const [products, sales] = await Promise.all([
    listProducts(),
    listSales(),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Point of sale</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add multiple products, compute totals automatically, and deduct stock in the same backend transaction.</p>
        </CardContent>
      </Card>

      <SaleComposer products={products} recentSales={sales.slice(0, 4)} />
    </div>
  );
}