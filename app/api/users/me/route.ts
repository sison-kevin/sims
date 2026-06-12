import { NextResponse } from "next/server";
import { issueSessionCookie, requireSessionUser } from "@/lib/auth";
import { updateCurrentUserProfile } from "@/lib/store";

export async function PATCH(request: Request) {
  const actor = await requireSessionUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const user = await updateCurrentUserProfile(actor.id, body);
    await issueSessionCookie({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Unable to update profile" }, { status: error?.status ?? 500 });
  }
}