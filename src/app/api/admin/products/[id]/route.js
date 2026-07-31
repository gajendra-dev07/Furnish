import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

// PUT /api/admin/products/[id] — update product
export async function PUT(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const {
    name,
    slug,
    category_id,
    price,
    original_price,
    description,
    features,
    specs,
    colors,
    stock,
    is_active,
    is_best_seller,
    is_new_arrival,
    images, // full replacement array of { url, position }
  } = body;

  const admin = createAdminClient();

  const { data: product, error: updateErr } = await admin
    .from("products")
    .update({
      name,
      slug,
      category_id,
      price: Number(price),
      original_price: original_price ? Number(original_price) : null,
      description,
      features: features || [],
      specs: specs || [],
      colors: colors || [],
      stock: Number(stock) || 0,
      is_active: is_active ?? true,
      is_best_seller: is_best_seller ?? false,
      is_new_arrival: is_new_arrival ?? false,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Replace images: delete existing, re-insert
  if (images !== undefined) {
    await admin.from("product_images").delete().eq("product_id", id);

    if (images.length > 0) {
      await admin.from("product_images").insert(
        images.map((img, i) => ({
          product_id: id,
          url: img.url,
          position: img.position ?? i,
        }))
      );
    }
  }

  return NextResponse.json({ product });
}

// DELETE /api/admin/products/[id] — delete product + its images
export async function DELETE(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const admin = createAdminClient();

  // product_images rows are deleted via ON DELETE CASCADE in the schema
  const { error: deleteErr } = await admin
    .from("products")
    .delete()
    .eq("id", id);

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
