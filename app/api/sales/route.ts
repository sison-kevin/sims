import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSale, listProducts, listSales } from "@/lib/store";

export async function GET() {
  const [sales, products] = await Promise.all([
    listSales(),
    listProducts(),
  ]);

  return NextResponse.json({ sales, products });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);

  try {
    const sale = await createSale(payload, user);
    return NextResponse.json({ sale }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create sale";
    const status = typeof error === "object" && error && "status" in error ? Number((error as { status?: number }).status) || 400 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}