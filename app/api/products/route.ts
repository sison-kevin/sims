import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createProduct, listCategories, listProductsWithStatus } from "@/lib/store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;
  const lowStockOnly = url.searchParams.get("lowStockOnly") === "1";

  const [products, categories] = await Promise.all([
    listProductsWithStatus({ query, category, lowStockOnly }),
    listCategories(),
  ]);

  return NextResponse.json({
    products,
    categories,
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  try {
    const product = await createProduct(payload, user);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create product";
    const status = typeof error === "object" && error && "status" in error ? Number((error as { status?: number }).status) || 400 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}