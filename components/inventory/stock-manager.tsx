"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ProductRecord, StockMovementRecord } from "@/lib/domain";
import { stockMovementSchema, type StockMovementFormValues } from "@/lib/schemas";
import { formatCurrency } from "@/lib/format";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useToast } from "../ui/toast";
import { AlertTriangle, PlusCircle } from "lucide-react";

export function StockManager({ products, movements }: { products: ProductRecord[]; movements: StockMovementRecord[] }) {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase()?.includes(q) ||
        p.category?.toLowerCase()?.includes(q) ||
        p.barcode?.toLowerCase()?.includes(q)
      );
    });
  }, [products, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="w-full md:w-3/4">
          <h2 className="text-3xl font-semibold tracking-tight">Inventory</h2>
          <p className="text-slate-500 dark:text-slate-400">Record atomic stock movements and inspect the latest movement trail.</p>

          <div className="mt-3 w-full md:w-1/2">
            <Input placeholder="Search products, SKU, category or barcode" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <div className="flex-shrink-0">
          <Button onClick={() => { setSelectedProduct(products[0] ?? null); setOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" />Record movement</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {filteredProducts.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-4 rounded-2xl border border-border/70 bg-background/80 p-6 text-center text-slate-500">No products match your search.</div>
        ) : (
          filteredProducts.map((product) => (
          <Card key={product.id} className={product.stock_quantity <= product.reorder_level ? "border-red-200 dark:border-red-500/20" : undefined}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{product.name}</CardTitle>
                <Badge variant={product.stock_quantity <= product.reorder_level ? "destructive" : "secondary"}>{product.stock_quantity}</Badge>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{product.category}</div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Value</span>
                <span>{formatCurrency(product.price * product.stock_quantity)}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setSelectedProduct(product); setOpen(true); }}>Adjust</Button>
                <Button variant="secondary" size="sm" onClick={async () => {
                  const response = await fetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_id: product.id, type: "STOCK_IN", quantity: 1, reason: "Quick restock" }) });
                  if (!response.ok) {
                    const payload = await response.json().catch(() => null) as { error?: string } | null;
                    toast({ title: "Stock update failed", description: payload?.error ?? "Unable to update stock" });
                    return;
                  }

                  toast({ title: "Stock updated", description: `${product.name} increased by 1.` });
                  router.refresh();
                }}>
                  Quick in
                </Button>
              </div>
            </CardContent>
          </Card>
            ))) }
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movement log</CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => {
                const product = products.find((item) => item.id === movement.product_id);
                return (
                  <TableRow key={movement.id}>
                    <TableCell><Badge variant={movement.type === "STOCK_OUT" ? "destructive" : movement.type === "STOCK_IN" ? "secondary" : "outline"}>{movement.type}</Badge></TableCell>
                    <TableCell>{product?.name ?? movement.product_id}</TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell>{movement.reason}</TableCell>
                    <TableCell>{movement.balance_after}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <StockDialog
        open={open}
        onOpenChange={setOpen}
        product={selectedProduct}
        products={products}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

function StockDialog({
  open,
  onOpenChange,
  product,
  products,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductRecord | null;
  products: ProductRecord[];
  onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const stockMovementResolver = zodResolver(stockMovementSchema) as unknown as Resolver<StockMovementFormValues>;
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StockMovementFormValues>({
    resolver: stockMovementResolver,
    defaultValues: {
      product_id: product?.id ?? "",
      type: "STOCK_IN",
      quantity: 1,
      reason: "Manual adjustment",
    },
  });

  useEffect(() => {
    // When the selected `product` changes, reset the form so the product_id updates.
    reset({ product_id: product?.id ?? "", type: "STOCK_IN", quantity: 1, reason: "Manual adjustment" });
  }, [product, reset]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<StockMovementFormValues | null>(null);
  const { toast } = useToast();

  const submitMovement = async (values: StockMovementFormValues) => {
    setError(null);
    const response = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      setError(payload?.error ?? "Unable to record stock movement");
      return;
    }

    onOpenChange(false);
    setConfirmOpen(false);
    setPendingValues(null);
    toast({ title: "Stock movement saved", description: `${values.type} recorded for ${product?.name ?? "selected product"}.` });
    onSuccess();
  };

  const onSubmit = handleSubmit(async (values) => {
    setPendingValues(values);
    setConfirmOpen(true);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record movement</DialogTitle>
          <DialogDescription>{product ? `Adjust stock for ${product.name}.` : "Choose a product and movement type."}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          {error ? <div className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Product</label>
            <select {...register("product_id")} className="h-10 w-full rounded-xl border border-border bg-white/80 px-3 text-sm dark:bg-slate-950/40">
              <option value="">Select a product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.sku}</option>
              ))}
            </select>
            {errors.product_id ? <p className="text-xs text-red-500">{String(errors.product_id.message)}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Movement type</label>
            <select {...register("type")} className="h-10 w-full rounded-xl border border-border bg-white/80 px-3 text-sm dark:bg-slate-950/40">
              <option value="STOCK_IN">STOCK_IN</option>
              <option value="STOCK_OUT">STOCK_OUT</option>
              <option value="ADJUSTMENT">ADJUSTMENT</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity</label>
            <Input {...register("quantity")} type="number" step="1" />
            {errors.quantity ? <p className="text-xs text-red-500">{errors.quantity.message}</p> : null}
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <Input {...register("reason")} placeholder="Vendor receipt, cycle count, correction..." />
          </div>

          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save movement"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm stock adjustment</DialogTitle>
            <DialogDescription>
              {pendingValues ? `${pendingValues.type} of ${pendingValues.quantity} units will be written as an atomic inventory event.` : "Review this stock movement before saving."}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
            This will update the product balance and create an audit log entry.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Go back</Button>
            <Button onClick={async () => pendingValues && submitMovement(pendingValues)}><AlertTriangle className="mr-2 h-4 w-4" />Confirm adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}