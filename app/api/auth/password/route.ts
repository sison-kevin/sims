import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { changeCurrentUserPassword } from "@/lib/store";

export async function POST(request: Request) {
  const actor = await requireSessionUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await changeCurrentUserPassword(actor.id, body);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Unable to change password" }, { status: error?.status ?? 500 });
  }
}