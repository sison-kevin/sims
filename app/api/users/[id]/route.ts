import { NextRequest, NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { deleteUserById, updateUserRole } from "@/lib/store";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const actor = await requireSessionUser();
  if (actor.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id } = await context.params;

  try {
    const payload = body as { role?: string };
    if (!payload.role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const user = await updateUserRole(id, payload.role, actor);
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Unable to update user" }, { status: error?.status ?? 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const actor = await requireSessionUser();
  if (actor.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const user = await deleteUserById(id, actor);
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Unable to delete user" }, { status: error?.status ?? 500 });
  }
}