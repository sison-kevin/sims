import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireSessionUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function getExtension(file: File) {
  const fromName = file.name.split(".").pop()?.trim().toLowerCase();
  if (fromName && fromName.length <= 5) {
    return fromName;
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/avif":
      return "avif";
    default:
      return "png";
  }
}

export async function POST(request: Request) {
  const actor = await requireSessionUser();
  if (actor.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Missing Supabase admin environment variables" }, { status: 500 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid multipart form data" }, { status: 400 });
  }

  const fileEntry = formData.get("file");
  if (!(fileEntry instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!fileEntry.type || !ALLOWED_TYPES.has(fileEntry.type)) {
    return NextResponse.json({ error: "Unsupported image format" }, { status: 400 });
  }

  if (fileEntry.size > MAX_UPLOAD_SIZE) {
    return NextResponse.json({ error: "Avatar must be 5MB or smaller" }, { status: 400 });
  }

  const extension = getExtension(fileEntry);
  const storagePath = `avatars/${actor.id}/${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabaseAdmin.storage.from("profile").upload(storagePath, fileEntry, {
    contentType: fileEntry.type,
    upsert: true,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message ?? "Unable to upload avatar" }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from("profile").getPublicUrl(storagePath);
  return NextResponse.json({ avatarUrl: data.publicUrl, path: storagePath });
}
