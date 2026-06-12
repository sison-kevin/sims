import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductManager } from "@/components/products/product-manager";
import { getSessionUser } from "@/lib/auth";
import { listProductsWithStatus } from "@/lib/store";

export default async function ProductsPage() {
  const user = await getSessionUser();
  const products = await listProductsWithStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product operations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Admin and manager roles can create and maintain products. Staff users can view catalog state only.
          </p>
        </CardContent>
      </Card>

      <ProductManager products={products} canEdit={user?.role !== "staff"} />
    </div>
  );
}