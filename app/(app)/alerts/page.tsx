import { AlertsBoard } from "@/components/alerts/alerts-board";
import { listProducts } from "@/lib/store";

export default async function AlertsPage() {
  const products = await listProducts();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Alerts</h2>
        <p className="text-slate-500 dark:text-slate-400">Exception-first layout that surfaces critical and warning stock conditions ahead of safe inventory.</p>
      </div>

      <AlertsBoard products={products} />
    </div>
  );
}