"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import CountUp from "@/components/ui/count-up";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Boxes, DollarSign, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "boxes": Boxes,
  "dollar-sign": DollarSign,
  "alert-triangle": AlertTriangle,
  "sparkles": Sparkles,
  "arrow-up-right": ArrowUpRight,
  "arrow-down-right": ArrowDownRight,
};

export function MetricCard({
  title,
  value,
  description,
  accent = false,
  iconName,
  trend,
}: {
  title: string;
  value: string;
  description: string;
  accent?: boolean;
  iconName: string;
  trend: string;
}) {
  // Extract numeric value and determine if it's currency
  const isCurrency = value.includes("$");
  const numericValue = parseFloat(value.replace(/[$,]/g, "")) || 0;
  const isDecimal = !Number.isInteger(numericValue);

  const Icon = iconMap[iconName] || Boxes;

  return (
    <Card className={cn(accent && "border-accent/20 bg-accent/8") }>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
              <CardDescription>{title}</CardDescription>
            <CardTitle className="text-3xl tracking-tight tabular-nums">
              {isCurrency ? (
                <CountUp to={numericValue} duration={1400} decimals={isDecimal ? 2 : 0} prefix="$" />
              ) : (
                <CountUp to={numericValue} duration={1400} decimals={isDecimal ? 2 : 0} />
              )}
            </CardTitle>
          </div>
          <div className="rounded-2xl border border-border bg-white/80 p-2 text-accent shadow-sm dark:bg-slate-950/40">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", accent ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")}>{trend}</span>
        </div>
      </CardContent>
    </Card>
  );
}