import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { adjustStock, listMovements, listProducts } from "@/lib/store";

export async function GET() {
  const [movements, products] = await Promise.all([
    listMovements(),
    listProducts(),
  ]);

  return NextResponse.json({ movements, products });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);

  try {
    const movement = await adjustStock(payload, user);
    return NextResponse.json({ movement }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to adjust stock";
    const status = typeof error === "object" && error && "status" in error ? Number((error as { status?: number }).status) || 400 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}