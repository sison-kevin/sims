"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductRecord, SaleRecord } from "@/lib/domain";
import { formatCurrency } from "@/lib/format";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, useCommandSearch } from "../ui/command";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useToast } from "../ui/toast";
import { ArrowRight, PackageSearch, ShoppingCart } from "lucide-react";

type CartEntry = {
  product: ProductRecord;
  quantity: number;
};

export function SaleComposer({ products, recentSales }: { products: ProductRecord[]; recentSales: SaleRecord[] }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [customerName, setCustomerName] = useState("Walk-in customer");
  const [status, setStatus] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();

  const subtotal = useMemo(() => cart.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0), [cart]);

  const addProduct = (product: ProductRecord) => {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setCart((current) => current.filter((item) => item.product.id !== productId));
  };

  const submitSale = async () => {
    setStatus(null);
    if (!cart.length) {
      return;
    }

    const response = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: customerName,
        items: cart.map((entry) => ({ product_id: entry.product.id, quantity: entry.quantity })),
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      setStatus(payload?.error ?? "Unable to create sale");
      return;
    }

    setCart([]);
    setStatus("Sale completed and stock updated.");
    toast({ title: "Sale completed", description: `Processed ${customerName}.` });
    router.refresh();
    setConfirmOpen(false);
  };

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PackageSearch className="h-4 w-4" />Product search</CardTitle>
          </CardHeader>
          <CardContent>
            <Command>
              <CommandInput placeholder="Search by name, SKU, or barcode" />
              <ProductPicker products={products} onPick={addProduct} />
            </Command>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" />Cart summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status ? <div className="rounded-2xl border border-border bg-accent/10 px-4 py-3 text-sm">{status}</div> : null}
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
            </div>

            <div className="space-y-3">
              {cart.length ? cart.map((entry) => (
                <div key={entry.product.id} className="rounded-2xl border border-border/70 px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{entry.product.name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{entry.product.sku}</div>
                    </div>
                    <Badge>{formatCurrency(entry.product.price)}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Input
                      type="number"
                      value={entry.quantity}
                      min={1}
                      onChange={(event) => setCart((current) => current.map((item) => item.product.id === entry.product.id ? { ...item, quantity: Number(event.target.value) || 1 } : item))}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => removeItem(entry.product.id)}>Remove</Button>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-500">Your cart is empty.</p>}
            </div>

            <div className="rounded-2xl border border-border/70 px-4 py-3">
              <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="mt-2 flex items-center justify-between text-lg font-semibold"><span>Total</span><span>{formatCurrency(subtotal)}</span></div>
            </div>

            <Button className="w-full" onClick={() => setConfirmOpen(true)} disabled={!cart.length}>Checkout</Button>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent sales</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {recentSales.map((sale) => (
              <div key={sale.id} className="rounded-2xl border border-border/70 px-4 py-3">
                <div className="font-medium">{sale.sale_number}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{sale.customer_name}</div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge>{sale.items.length} items</Badge>
                  <span className="text-sm font-medium">{formatCurrency(sale.total)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm checkout</DialogTitle>
            <DialogDescription>
              This sale will deduct inventory, write a stock-out movement, and create an audit log entry.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
            Total amount: {formatCurrency(subtotal)}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Review cart</Button>
            <Button onClick={submitSale}><ArrowRight className="mr-2 h-4 w-4" />Complete sale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProductPicker({ products, onPick }: { products: ProductRecord[]; onPick: (product: ProductRecord) => void }) {
  const search = useCommandSearch();
  const filteredProducts = products.filter((product) => [product.name, product.sku, product.barcode].some((value) => value.toLowerCase().includes(search.toLowerCase())));

  return (
    <CommandList>
      <CommandGroup heading="Products">
        {filteredProducts.length ? filteredProducts.map((product) => (
          <CommandItem key={product.id} onSelect={() => onPick(product)}>
            <span>
              <span className="block font-medium">{product.name}</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">{product.sku} · {formatCurrency(product.price)}</span>
            </span>
            <Badge variant={product.stock_quantity <= product.reorder_level ? "destructive" : "secondary"}>{product.stock_quantity} stock</Badge>
          </CommandItem>
        )) : <CommandEmpty>No matching products.</CommandEmpty>}
      </CommandGroup>
    </CommandList>
  );
}
