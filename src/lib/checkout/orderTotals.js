/** Matches the GST rate shown on the checkout UI. */
export const GST_RATE = 0.12;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return typeof value === "string" && UUID_RE.test(value);
}

function roundMoney(n) {
  return Math.round(Number(n) * 100) / 100;
}

/**
 * Resolve cart line items against live product rows in Supabase.
 * Never trusts client-sent prices — only quantity, color, and product identity.
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @param {Array<{ productId: string, quantity: number, selectedColor?: string }>} rawItems
 */
export async function buildPricedLineItems(client, rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error("Cart is empty");
  }

  const normalized = rawItems.map((item, index) => {
    const productId = item?.productId ?? item?.dbId ?? item?.id;
    const quantity = Number(item?.quantity);

    if (!productId || typeof productId !== "string") {
      throw new Error(`Item ${index + 1}: missing product id`);
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`Item ${index + 1}: invalid quantity`);
    }

    return {
      productId,
      quantity,
      selectedColor:
        typeof item?.selectedColor === "string" && item.selectedColor
          ? item.selectedColor
          : null,
    };
  });

  const uuids = [
    ...new Set(normalized.filter((i) => isUuid(i.productId)).map((i) => i.productId)),
  ];
  const slugs = [
    ...new Set(
      normalized.filter((i) => !isUuid(i.productId)).map((i) => i.productId)
    ),
  ];

  const select =
    "id, name, slug, price, stock, is_active, product_images(url, position)";

  const productsByKey = new Map();

  if (uuids.length > 0) {
    const { data, error } = await client
      .from("products")
      .select(select)
      .in("id", uuids)
      .eq("is_active", true);

    if (error) throw new Error(error.message);
    for (const p of data || []) {
      productsByKey.set(p.id, p);
      productsByKey.set(p.slug, p);
    }
  }

  if (slugs.length > 0) {
    const { data, error } = await client
      .from("products")
      .select(select)
      .in("slug", slugs)
      .eq("is_active", true);

    if (error) throw new Error(error.message);
    for (const p of data || []) {
      productsByKey.set(p.id, p);
      productsByKey.set(p.slug, p);
    }
  }

  const lineItems = [];

  for (const item of normalized) {
    const product = productsByKey.get(item.productId);
    if (!product) {
      throw new Error(`Product not found or unavailable: ${item.productId}`);
    }
    if (product.stock < item.quantity) {
      throw new Error(
        `"${product.name}" only has ${product.stock} in stock (requested ${item.quantity})`
      );
    }

    const images = (product.product_images || [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((img) => img.url);

    const unitPrice = roundMoney(product.price);

    lineItems.push({
      product_id: product.id,
      quantity: item.quantity,
      unit_price: unitPrice,
      selected_color: item.selectedColor,
      product_snapshot: {
        name: product.name,
        slug: product.slug,
        image_url: images[0] || null,
        price: unitPrice,
      },
    });
  }

  return lineItems;
}

/**
 * Compute subtotal, GST, grand total, and Razorpay amount (paise)
 * from server-priced line items.
 */
export function computeOrderTotals(lineItems) {
  const subtotal = roundMoney(
    lineItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  );
  const gst_amount = roundMoney(subtotal * GST_RATE);
  const total = roundMoney(subtotal + gst_amount);
  const amountPaise = Math.round(total * 100);

  if (!Number.isFinite(amountPaise) || amountPaise < 100) {
    // Razorpay minimum is typically ₹1.00
    throw new Error("Order total is too low to process payment");
  }

  return { subtotal, gst_amount, total, amountPaise };
}

export function validateShippingAddress(shipping) {
  if (!shipping || typeof shipping !== "object") {
    throw new Error("Shipping address is required");
  }

  const required = [
    "firstName",
    "lastName",
    "address",
    "city",
    "state",
    "zip",
    "email",
    "phone",
  ];

  for (const key of required) {
    if (!String(shipping[key] ?? "").trim()) {
      throw new Error(`Missing shipping field: ${key}`);
    }
  }

  return {
    firstName: String(shipping.firstName).trim(),
    lastName: String(shipping.lastName).trim(),
    address: String(shipping.address).trim(),
    city: String(shipping.city).trim(),
    state: String(shipping.state).trim(),
    zip: String(shipping.zip).trim(),
    email: String(shipping.email).trim(),
    phone: String(shipping.phone).trim(),
  };
}
