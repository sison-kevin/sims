"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { productSchema, type ProductFormValues } from "@/lib/schemas";
import { formatCurrency } from "@/lib/format";
import type { ProductRecord } from "@/lib/domain";
import { useToast } from "../ui/toast";
import { ChevronDown, MoreHorizontal, Package2, Search, SquarePlus } from "lucide-react";

type ProductWithStatus = ProductRecord & { low_stock: boolean };

export function ProductManager({ products, canEdit }: { products: ProductWithStatus[]; canEdit: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithStatus | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductWithStatus | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = [product.name, product.sku, product.barcode].some((value) => value.toLowerCase().includes(query.toLowerCase()));
    const matchesCategory = category === "all" || product.category === category;
    const matchesStock = stockFilter === "all"
      || (stockFilter === "low" && product.low_stock)
      || (stockFilter === "critical" && product.stock_quantity <= Math.max(3, Math.floor(product.reorder_level / 2)))
      || (stockFilter === "ok" && !product.low_stock);

    return matchesQuery && matchesCategory && matchesStock;
  }), [products, query, category, stockFilter]);

  const categories = useMemo(() => Array.from(new Set(products.map((product) => product.category))).sort(), [products]);

  const defaultValues = useMemo<ProductFormValues>(() => ({
    id: editingProduct?.id,
    name: editingProduct?.name ?? "",
    sku: editingProduct?.sku ?? "",
    barcode: editingProduct?.barcode ?? "",
    category: editingProduct?.category ?? "",
    price: editingProduct?.price ?? 0,
    cost_price: editingProduct?.cost_price ?? 0,
    stock_quantity: editingProduct?.stock_quantity ?? 0,
    reorder_level: editingProduct?.reorder_level ?? 0,
  }), [editingProduct]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Products</h2>
          <p className="text-slate-500 dark:text-slate-400">Create, edit, and retire catalog items with inventory-safe validation.</p>
        </div>
        {canEdit ? <Button onClick={() => { setEditingProduct(null); setOpen(true); }}><SquarePlus className="mr-2 h-4 w-4" />Add product</Button> : null}
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-border bg-white/70 p-4 shadow-sm dark:bg-white/5 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, SKU, or barcode" className="pl-9" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" className="w-full justify-between lg:w-[180px]">
              Category
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setCategory("all")}>All categories</DropdownMenuItem>
            {categories.map((item) => <DropdownMenuItem key={item} onClick={() => setCategory(item)}>{item}</DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" className="w-full justify-between lg:w-[180px]">
              Stock status
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStockFilter("all")}>All stock</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStockFilter("ok")}>OK</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStockFilter("low")}>Low</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStockFilter("critical")}>Critical</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Catalog</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">Fast scanning grid with inline status badges and row actions.</p>
          </div>
          <Badge variant="secondary">{filteredProducts.length} items</Badge>
        </CardHeader>
        <CardContent className="overflow-hidden p-0">
          {filteredProducts.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{product.name}</div>
                      <div className="text-xs text-slate-500">SKU {product.sku} · {product.barcode}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.low_stock ? "destructive" : "secondary"}>{product.stock_quantity}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock_quantity <= Math.max(3, Math.floor(product.reorder_level / 2)) ? "destructive" : product.low_stock ? "outline" : "secondary"}>
                        {product.stock_quantity <= Math.max(3, Math.floor(product.reorder_level / 2)) ? "CRITICAL" : product.low_stock ? "LOW" : "OK"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {canEdit ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => { setEditingProduct(product); setOpen(true); }}>Edit product</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteTarget(product)} className="text-red-600 dark:text-red-400">Delete product</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : <Badge variant="outline">View only</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <Package2 className="h-10 w-10 text-slate-400" />
              <div className="text-base font-medium">No products match the current filters</div>
              <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">Clear the filters or add a new product to continue.</p>
              {canEdit ? <Button onClick={() => { setEditingProduct(null); setOpen(true); }}>Add product</Button> : null}
            </div>
          )}
        </CardContent>
      </Card>

      <ProductDialog
        key={editingProduct?.id ?? "new"}
        open={open}
        onOpenChange={setOpen}
        initialValues={defaultValues}
        onSuccess={(message) => {
          toast({ title: message, description: "Catalog has been updated." });
          router.refresh();
        }}
      />

      <DeleteProductDialog
        product={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(value) => !value && setDeleteTarget(null)}
        onDelete={async () => {
          if (!deleteTarget) {
            return;
          }

          const response = await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
          if (!response.ok) {
            const payload = await response.json().catch(() => null) as { error?: string } | null;
            toast({ title: "Delete failed", description: payload?.error ?? "Unable to delete product" });
            return;
          }

          toast({ title: "Product deleted", description: deleteTarget.name });
          setDeleteTarget(null);
          router.refresh();
        }}
      />
    </div>
  );
}

function ProductDialog({
  open,
  onOpenChange,
  initialValues,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: ProductFormValues;
  onSuccess: (message: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(initialValues.id);
  const productResolver = zodResolver(productSchema) as unknown as Resolver<ProductFormValues>;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProductFormValues>({
    resolver: productResolver,
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      reset(initialValues);
      setError(null);
    }
  }, [initialValues, open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const response = await fetch(isEditing ? `/api/products/${initialValues.id}` : "/api/products", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      setError(payload?.error ?? "Unable to save product");
      return;
    }

    onOpenChange(false);
    onSuccess(isEditing ? "Product updated" : "Product created");
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit product" : "New product"}</DialogTitle>
          <DialogDescription>All inventory mutations are validated server-side before commit.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          {error ? <div className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input {...register("name")} placeholder="Barista Espresso Beans" />
            {errors.name ? <p className="text-xs text-red-500">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">SKU</label>
            <Input {...register("sku")} placeholder="COF-ESP-250" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Barcode</label>
            <Input {...register("barcode")} placeholder="884500120011" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Input {...register("category")} placeholder="Beverages" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Price</label>
            <Input {...register("price")} type="number" step="0.01" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Cost price</label>
            <Input {...register("cost_price")} type="number" step="0.01" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Stock quantity</label>
            <Input {...register("stock_quantity")} type="number" step="1" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reorder level</label>
            <Input {...register("reorder_level")} type="number" step="1" />
          </div>

          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteProductDialog({
  product,
  open,
  onOpenChange,
  onDelete,
}: {
  product: ProductWithStatus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete product</DialogTitle>
          <DialogDescription>
            {product ? `${product.name} will be removed from the catalog.` : "This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-100">
          This will also remove the product from active selection flows.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onDelete}>Delete product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}