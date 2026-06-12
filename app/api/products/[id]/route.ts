import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { deleteProduct, updateProduct } from "@/lib/store";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const payload = await request.json().catch(() => null);

  try {
    const product = await updateProduct({ ...payload, id }, user);
    return NextResponse.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update product";
    const status = typeof error === "object" && error && "status" in error ? Number((error as { status?: number }).status) || 400 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const product = await deleteProduct(id, user);
    return NextResponse.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete product";
    const status = typeof error === "object" && error && "status" in error ? Number((error as { status?: number }).status) || 400 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}