import { NextResponse } from "next/server";
import { getAnalyticsSeries, listProducts, listSales } from "@/lib/store";

export async function GET() {
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
}