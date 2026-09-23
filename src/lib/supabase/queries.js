// ─── Field selection used in every product query ─────────────
export const PRODUCT_SELECT = `
  *,
  categories(id, name, slug, description),
  product_images(url, position)
`;

// ─── Transforms a raw Supabase product row into the shape ─────
// that all UI components (ProductCard, ProductDetailContent) expect.
export function transformProduct(p) {
  const images = (p.product_images || [])
    .sort((a, b) => a.position - b.position)
    .map((img) => img.url);

  return {
    id: p.slug,          // slug used as the URL/cart identifier
    dbId: p.id,          // UUID kept for DB write operations
    name: p.name,
    slug: p.slug,
    category: p.categories?.slug || "",
    categoryName: p.categories?.name || "",
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : null,
    images,
    description: p.description || "",
    features: p.features || [],
    specs: Array.isArray(p.specs) ? p.specs : [],
    stock: p.stock || 0,
    colors: p.colors || [],
    isBestSeller: p.is_best_seller || false,
    isNewArrival: p.is_new_arrival || false,
  };
}

// ─── Transforms a raw Supabase category row ───────────────────
export function transformCategory(c, productCount = 0) {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description || "",
    image: c.image_url || null,
    count: productCount,
  };
}

// ─── Fetch all active products ────────────────────────────────
export async function fetchAllProducts(client) {
  const { data, error } = await client
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(transformProduct);
}

// ─── Fetch a single product by slug ──────────────────────────
export async function fetchProductBySlug(client, slug) {
  const { data, error } = await client
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return transformProduct(data);
}

// ─── Fetch several products by slug ──────────────────────────
export async function fetchProductsBySlugs(client, slugs) {
  if (!Array.isArray(slugs) || slugs.length === 0) return [];

  const { data, error } = await client
    .from("products")
    .select(PRODUCT_SELECT)
    .in("slug", slugs)
    .eq("is_active", true);

  if (error) throw error;
  return (data || []).map(transformProduct);
}

// ─── Fetch products for a specific category slug ──────────────
export async function fetchProductsByCategory(client, categorySlug) {
  // First resolve the category UUID
  const { data: cat } = await client
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (!cat) return [];

  const { data, error } = await client
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("category_id", cat.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(transformProduct);
}

// ─── Fetch all categories ─────────────────────────────────────
export async function fetchAllCategories(client) {
  // `categories` has no count column, so tally the live products per category.
  const [categories, products] = await Promise.all([
    client.from("categories").select("*").order("name"),
    client.from("products").select("category_id").eq("is_active", true),
  ]);

  if (categories.error) throw categories.error;
  if (products.error) throw products.error;

  const counts = new Map();
  for (const { category_id } of products.data || []) {
    counts.set(category_id, (counts.get(category_id) || 0) + 1);
  }

  return (categories.data || []).map((c) =>
    transformCategory(c, counts.get(c.id) || 0)
  );
}

// ─── Fetch a single category by slug ─────────────────────────
export async function fetchCategoryBySlug(client, slug) {
  const { data, error } = await client
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return transformCategory(data);
}
