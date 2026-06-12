import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockManager } from "@/components/inventory/stock-manager";
import { listMovements, listProducts } from "@/lib/store";

export default async function InventoryPage() {
  const [products, movements] = await Promise.all([
    listProducts(),
    listMovements(),
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory operations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">Every adjustment writes a movement record and prevents negative stock balances.</p>
        </CardContent>
      </Card>

      <StockManager products={products} movements={movements.slice(0, 12)} />
    </div>
  );
}