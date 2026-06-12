"use client";

import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { ProductRecord } from "@/lib/domain";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function AlertsBoard({ products }: { products: ProductRecord[] }) {
  const critical = products.filter((product) => product.stock_quantity <= Math.max(3, Math.floor(product.reorder_level / 2)));
  const warning = products.filter((product) => product.stock_quantity <= product.reorder_level && product.stock_quantity > Math.max(3, Math.floor(product.reorder_level / 2)));
  const safe = products.filter((product) => product.stock_quantity > product.reorder_level);
  const [showSafe, setShowSafe] = useState(false);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-2">
        {critical.map((product) => (
          <Card key={product.id} className="border-red-200 bg-red-50/70 dark:border-red-500/20 dark:bg-red-500/10">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                  <AlertTriangle className="h-4 w-4" />
                  Critical alert
                </CardTitle>
                <Badge variant="destructive">CRITICAL</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-red-950 dark:text-red-50">{product.name}</div>
              <div className="mt-1 text-sm text-red-800 dark:text-red-200">Only {product.stock_quantity} units remain. Reorder level: {product.reorder_level}.</div>
            </CardContent>
          </Card>
        ))}
        {!critical.length ? (
          <Card className="xl:col-span-2">
            <CardContent className="flex items-center gap-3 p-6">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <div>
                <div className="font-medium">No critical items</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">The inventory is currently above the emergency threshold.</div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Low stock items</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">Needs attention before it becomes operationally urgent.</p>
          </div>
          <Badge variant="secondary">{warning.length} warning</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {warning.length ? warning.map((product) => (
            <div key={product.id} className="rounded-2xl border border-border/70 px-4 py-3">
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{product.sku}</div>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="secondary">LOW</Badge>
                <span className="text-sm font-medium">{product.stock_quantity} left</span>
              </div>
            </div>
          )) : <div className="text-sm text-slate-500">No warning-level items.</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Safe inventory</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">Hidden by default to keep the attention on exceptions.</p>
          </div>
          <Button variant="outline" onClick={() => setShowSafe((value) => !value)}>
            {showSafe ? "Hide safe inventory" : `Show safe inventory (${safe.length})`}
          </Button>
        </CardHeader>
        {showSafe ? (
          <CardContent className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {safe.length ? safe.map((product) => (
              <div key={product.id} className="rounded-2xl border border-border/70 px-4 py-3">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{product.category}</div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="secondary">SAFE</Badge>
                  <span className="text-sm font-medium">{product.stock_quantity} / {product.reorder_level}</span>
                </div>
              </div>
            )) : <div className="text-sm text-slate-500">No safe items to show.</div>}
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}