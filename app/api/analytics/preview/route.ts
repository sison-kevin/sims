import { NextResponse } from "next/server";
import { getAnalyticsSeries, listProducts, listSales } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const fallbackPreview = {
  series: [
    { date: "2026-05-24", sales: 18500, stockIn: 42, stockOut: 18 },
    { date: "2026-05-25", sales: 22100, stockIn: 36, stockOut: 22 },
    { date: "2026-05-26", sales: 20800, stockIn: 48, stockOut: 19 },
    { date: "2026-05-27", sales: 26400, stockIn: 55, stockOut: 27 },
    { date: "2026-05-28", sales: 29100, stockIn: 61, stockOut: 24 },
    { date: "2026-05-29", sales: 27300, stockIn: 44, stockOut: 20 },
    { date: "2026-05-30", sales: 31800, stockIn: 67, stockOut: 29 },
  ],
  summary: {
    productCount: 148,
    saleCount: 86,
    revenue: 176000,
    lowStockCount: 12,
    stockIn: 353,
    stockOut: 159,
  },
};

export async function GET() {
  try {
    const series = await getAnalyticsSeries();
    const products = await listProducts();
    const sales = await listSales();

    const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const lowStockCount = products.filter((product) => product.stock_quantity <= product.reorder_level).length;

    return NextResponse.json({
      series,
      summary: {
        productCount: products.length,
        saleCount: sales.length,
        revenue,
        lowStockCount,
        stockIn: series.reduce((sum, point) => sum + point.stockIn, 0),
        stockOut: series.reduce((sum, point) => sum + point.stockOut, 0),
      },
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(fallbackPreview, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}