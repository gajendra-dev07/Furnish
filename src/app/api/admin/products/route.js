import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/admin/products — list all products with category + image count
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const admin = createAdminClient();
  const { data, error: dbErr } = await admin
    .from("products")
    .select(
      `
      id, name, slug, price, original_price, stock, is_active, is_best_seller, is_new_arrival,
      categories(name, slug),
      product_images(url, position)
    `
    )
    .order("created_at", { ascending: false });

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}

// POST /api/admin/products — create a new product
export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;

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
    images, // array of { url, position }
  } = body;

  if (!name || !slug || !category_id || !price) {
    return NextResponse.json(
      { error: "name, slug, category_id and price are required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: product, error: insertErr } = await admin
    .from("products")
    .insert({
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
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Insert images
  if (images && images.length > 0) {
    const { error: imgErr } = await admin.from("product_images").insert(
      images.map((img, i) => ({
        product_id: product.id,
        url: img.url,
        position: img.position ?? i,
      }))
    );
    if (imgErr) {
      console.error("Image insert error:", imgErr.message);
    }
  }

  return NextResponse.json({ product }, { status: 201 });
}
