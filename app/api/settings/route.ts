import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { getWorkspaceSettings, upsertWorkspaceSettings } from "@/lib/store";

export async function GET() {
  const actor = await requireSessionUser();
  if (actor.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await getWorkspaceSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
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

  try {
    const settings = await upsertWorkspaceSettings(body as never, actor);
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Unable to update settings" }, { status: error?.status ?? 500 });
  }
}