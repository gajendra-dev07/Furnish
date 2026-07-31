import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// POST /api/admin/upload — upload a single image to Supabase Storage
export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP and GIF images are allowed" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop().toLowerCase();
  const filename = `products/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const admin = createAdminClient();

  const { data, error: uploadErr } = await admin.storage
    .from("product-images")
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("product-images").getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl });
}
