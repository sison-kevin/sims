import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { createUser, listUsers } from "@/lib/store";

export async function GET() {
  const actor = await requireSessionUser();
  if (actor.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await listUsers();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const actor = await requireSessionUser();
  if (!actor || actor.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const user = await createUser(body, { id: actor.id, name: actor.name });
    return NextResponse.json({ user }, { status: 201 });
  } catch (err: any) {
    const message = err?.message ?? "Unable to create user";
    const status = err?.status ?? 500;
    return NextResponse.json({ error: message }, { status });
  }
}
