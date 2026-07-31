-- ============================================================
-- FURNISH — Supabase Schema
-- Project: lhsrhyvaqfxchvgevtpq
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================


-- ─── EXTENSIONS ──────────────────────────────────────────────
-- uuid_generate_v4() as fallback (gen_random_uuid() is built-in on modern Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─── 1. PROFILES ─────────────────────────────────────────────
-- One row per auth.users entry. Created automatically by a trigger.
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'customer'
                   CHECK (role IN ('customer', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create a profile row whenever a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── 2. CATEGORIES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─── 3. PRODUCTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  category_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  price           NUMERIC(10,2) NOT NULL,
  original_price  NUMERIC(10,2),
  description     TEXT,
  features        TEXT[]    DEFAULT '{}',
  specs           JSONB     DEFAULT '[]',   -- [{key, value}, ...]
  stock           INTEGER   NOT NULL DEFAULT 0,
  colors          TEXT[]    DEFAULT '{}',
  is_active       BOOLEAN   NOT NULL DEFAULT TRUE,
  is_best_seller  BOOLEAN   NOT NULL DEFAULT FALSE,
  is_new_arrival  BOOLEAN   NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on every product change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;
CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─── 4. PRODUCT IMAGES ───────────────────────────────────────
-- Separate table so a product can have multiple ordered images.
-- url stores the Supabase Storage public URL (or /public path during migration).
CREATE TABLE IF NOT EXISTS public.product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  position    INTEGER NOT NULL DEFAULT 0,  -- 0 = primary image
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─── 5. ADDRESSES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label       TEXT NOT NULL DEFAULT 'Home',
  line1       TEXT NOT NULL,
  line2       TEXT,
  city        TEXT NOT NULL,
  state       TEXT NOT NULL,
  pincode     TEXT NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─── 6. ORDERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id),
  status              TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN (
                             'pending', 'confirmed', 'processing',
                             'shipped', 'delivered', 'cancelled'
                           )),
  subtotal            NUMERIC(10,2) NOT NULL,
  gst_amount          NUMERIC(10,2) NOT NULL,
  total               NUMERIC(10,2) NOT NULL,
  shipping_address    JSONB NOT NULL,         -- snapshot of address at order time
  razorpay_order_id   TEXT UNIQUE,
  razorpay_payment_id TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─── 7. ORDER ITEMS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id        UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity          INTEGER NOT NULL CHECK (quantity > 0),
  unit_price        NUMERIC(10,2) NOT NULL,
  selected_color    TEXT,
  product_snapshot  JSONB NOT NULL,  -- frozen {name, slug, image_url, price} at purchase time
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items  ENABLE ROW LEVEL SECURITY;


-- ── profiles ─────────────────────────────────────────────────
-- A user can only read and update their own profile.
-- Admins use the service role key (bypasses RLS entirely).

CREATE POLICY "profiles: owner can read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: owner can update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- prevent users from promoting themselves to admin
    role = 'customer'
  );


-- ── categories ───────────────────────────────────────────────
-- Public read. Writes only via service role (admin API routes).

CREATE POLICY "categories: public read"
  ON public.categories FOR SELECT
  USING (TRUE);


-- ── products ─────────────────────────────────────────────────
-- Public read of active products. Writes only via service role.

CREATE POLICY "products: public read active"
  ON public.products FOR SELECT
  USING (is_active = TRUE);


-- ── product_images ────────────────────────────────────────────
-- Public read. Writes only via service role.

CREATE POLICY "product_images: public read"
  ON public.product_images FOR SELECT
  USING (TRUE);


-- ── addresses ────────────────────────────────────────────────
-- Users can fully manage their own addresses.

CREATE POLICY "addresses: owner full access"
  ON public.addresses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ── orders ───────────────────────────────────────────────────
-- Users can create orders and read their own.
-- Status updates only happen server-side via service role.

CREATE POLICY "orders: owner can read"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "orders: owner can create"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ── order_items ──────────────────────────────────────────────
-- Users can read items belonging to their own orders.

CREATE POLICY "order_items: owner can read"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items: owner can create"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );


-- ============================================================
-- INDEXES (for common query patterns)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_category    ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug        ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id, position);
CREATE INDEX IF NOT EXISTS idx_orders_user          ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order    ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user       ON public.addresses(user_id);


-- ============================================================
-- SEED DATA — Categories & Products
-- (mirrors src/constants/productsData.js)
-- ============================================================

-- ── Categories ───────────────────────────────────────────────
INSERT INTO public.categories (name, slug, description, image_url) VALUES
  ('Chopping Boards',        'chopping-boards',   'Heavy-duty organic-edge cutting boards, end-grain blocks, and utility prep boards crafted for years of daily kitchen use.',          '/images/products/acacia-cutting-board.jpg'),
  ('Serving Platters',       'serving-trays',     'Bespoke Acacia platters, circular serving trays, cake stands, and snack bowls designed to elevate dining setups.',                 '/images/products/wall-shelf-1.jpg'),
  ('Kitchen Organizers',     'kitchen-organizers','Partitioned wooden cutlery holders, roti boxes, napkin stands, and countertop storage units shaped to organize your culinary hub.', '/images/products/chopping-board-v2.jpg'),
  ('Tableware & Sofa Accents','tableware-living',  'Acacia tea trivets, coaster sets, and flexible wrap-around sofa arm trays bringing natural wood warmth to living spaces.',           '/images/products/chopping-board-h1.jpg'),
  ('Wall Decor',             'wall-decor',        'Handcrafted wooden wall shelves, key holders, photo frames, and temple pieces to bring warmth and artisan character to your walls.','/images/products/wall-shelf-1.jpg')
ON CONFLICT (slug) DO NOTHING;


-- ── Products ─────────────────────────────────────────────────
-- We use a DO block so we can look up category UUIDs by slug.

DO $$
DECLARE
  cat_chopping    UUID;
  cat_serving     UUID;
  cat_kitchen     UUID;
  cat_tableware   UUID;
  cat_wall        UUID;

  pid UUID;
BEGIN
  SELECT id INTO cat_chopping  FROM public.categories WHERE slug = 'chopping-boards';
  SELECT id INTO cat_serving   FROM public.categories WHERE slug = 'serving-trays';
  SELECT id INTO cat_kitchen   FROM public.categories WHERE slug = 'kitchen-organizers';
  SELECT id INTO cat_tableware FROM public.categories WHERE slug = 'tableware-living';
  SELECT id INTO cat_wall      FROM public.categories WHERE slug = 'wall-decor';

  -- ── Chopping Boards ──────────────────────────────────────

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Acacia Classic Paddle Chopping Board', 'helsinki-acacia-board', cat_chopping,
    999, 1499,
    'A highly durable paddle chopping board crafted from single-block Acacia wood with a carved top handle for easy grip and hanging display.',
    ARRAY['Crafted from premium, sustainably sourced single-block Acacia wood','Finished with 100% food-safe organic oil and natural beeswax','Features an elegant cut-out handle for easy carrying and hanging storage','Gentle on high-end kitchen knives, preventing rapid dulling of blades'],
    '[{"key":"Dimensions","value":"Length 42cm, Width 23cm"},{"key":"Wood Type","value":"Acacia Wood"},{"key":"Weight","value":"1.2 kg"}]',
    25, ARRAY['Natural Acacia'], TRUE, FALSE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/acacia-cutting-board.jpg', 0),
      (pid, '/images/products/chopping-board-v1.jpg',    1);
  END IF;

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Horizontal Acacia Cutting Board', 'mika-acacia-board', cat_chopping,
    699, 999,
    'A sleek horizontal cutting board crafted from golden Acacia wood, featuring a side cut-out handle for effortless kitchen prep.',
    ARRAY['Single-block solid Acacia timber construction','Food-grade natural beeswax and linseed oil rub','Side cut-out handle for comfortable grip and hanging storage','Protects sharp knife edges during daily cutting'],
    '[{"key":"Dimensions","value":"Length 42cm, Width 21cm"},{"key":"Wood Type","value":"Acacia Wood"},{"key":"Weight","value":"0.9 kg"}]',
    50, ARRAY['Natural Golden'], FALSE, TRUE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/chopping-board-h1.jpg',  0),
      (pid, '/images/products/chopping-board-flat.jpg',1);
  END IF;

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Oslo Heavy-Duty Acacia Prep Board', 'oslo-acacia-prep-board', cat_chopping,
    1199, 1799,
    'A thick, heavy-duty block-style cutting board engineered for serious kitchen prep with side finger grips.',
    ARRAY['1.5-inch thick block construction for maximum stability','Carved side finger grooves for ergonomic lifting and cleaning','Heavy enough to stay firmly in place while slicing large vegetables','Pre-treated with heavy food-grade mineral oil baths'],
    '[{"key":"Dimensions","value":"16\" L x 12\" W x 1.5\" H"},{"key":"Wood Type","value":"End-grain style Acacia Wood"},{"key":"Weight","value":"2.4 kg"}]',
    12, ARRAY['Deep Walnut-Honey'], TRUE, FALSE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/chopping-board-v2.jpg',0),
      (pid, '/images/products/chopping-board-v1.jpg',1);
  END IF;

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Artisanal Organic Flat Cutting Board', 'artisanal-flat-board', cat_chopping,
    849, 1199,
    'A wide, low-profile cutting board hand-carved from solid Acacia wood with organic live-edge curves.',
    ARRAY['Smooth food-safe organic oil finish showcasing rich natural wood grains','Wide surface area ideal for slicing bread, cheese, and vegetables','Durable hardwood construction engineered to resist warping'],
    '[{"key":"Dimensions","value":"38cm L x 25cm W x 2cm H"},{"key":"Wood Type","value":"Solid Acacia Wood"},{"key":"Weight","value":"1.4 kg"}]',
    20, ARRAY['Warm Acacia Honey'], FALSE, TRUE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/chopping-board-flat.jpg',0),
      (pid, '/images/products/chopping-board-h1.jpg', 1);
  END IF;

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Artisan Cheese & Charcuterie Board', 'artisan-charcuterie-board', cat_chopping,
    1499, 1999,
    'An exquisite Acacia wood charcuterie and prep board, perfect for presenting cheeses, cured meats, fruits, and bread.',
    ARRAY['Wide serving area designed for charcuterie and cheese spreads','Integrated handle hole for effortless carrying','Pre-treated with food-safe organic mineral oil baths'],
    '[{"key":"Dimensions","value":"45cm L x 28cm W x 2cm H"},{"key":"Wood Type","value":"Premium Acacia Hardwood"},{"key":"Weight","value":"1.6 kg"}]',
    18, ARRAY['Smoked Amber'], TRUE, FALSE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/chopping-board-flat.jpg',0),
      (pid, '/images/products/acacia-cutting-board.jpg',1);
  END IF;

  -- ── Serving Platters ──────────────────────────────────────

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Oak Luxe Serving Tray', 'romper-acacia-tray', cat_serving,
    1499, 1999,
    'An elegant serving platter sculpted from premium Oak wood, featuring high borders and integrated handles for comfortable hosting.',
    ARRAY['Raised 1.2-inch border walls with carved integrated grip handles','Water-resistant organic sealer to prevent staining from coffee/wine spills','Sturdy, non-slip flat base suitable for bowls, mugs, or glasses','Lightweight yet extremely durable structure'],
    '[{"key":"Dimensions","value":"Length 35cm, Width 25cm, Height 8cm"},{"key":"Wood Type","value":"Oak Wood"},{"key":"Weight","value":"1.1 kg"}]',
    15, ARRAY['Natural Oak'], TRUE, FALSE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/wall-shelf-1.jpg', 0),
      (pid, '/images/products/photo-frame-1.jpg',1);
  END IF;

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Angled Handles Wooden Serving Platter', 'angled-handles-serving-tray', cat_serving,
    999, 1399,
    'A contemporary wooden serving tray with ergonomic carved handle cut-outs and a smooth moisture-resistant glaze.',
    ARRAY['Ergonomic handle cut-outs for effortless grip','Sturdy flat wooden base with water-resistant finish','Ideal for serving drinks, appetizers, and snacks'],
    '[{"key":"Dimensions","value":"38cm L x 24cm W x 5cm H"},{"key":"Wood Type","value":"Natural Hardwood"},{"key":"Weight","value":"0.9 kg"}]',
    22, ARRAY['Natural Wood'], FALSE, TRUE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/photo-frame-1.jpg',0),
      (pid, '/images/products/wall-shelf-1.jpg', 1);
  END IF;

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Footed Wooden Tea & Breakfast Tray', 'footed-tea-serving-tray', cat_serving,
    1299, 1699,
    'A handcrafted wooden serving tray with corner feet, designed for serving morning tea, coffee, biscuits, and breakfast.',
    ARRAY['Corner footed pegs elevate the tray elegantly off table surfaces','Raised perimeter border prevents mugs and saucers from slipping','Water-resistant protective oil sealer for easy wipe cleaning'],
    '[{"key":"Dimensions","value":"30cm L x 20cm W x 8cm H"},{"key":"Wood Type","value":"Solid Oak Wood"},{"key":"Weight","value":"1.0 kg"}]',
    30, ARRAY['Honey Oak'], FALSE, TRUE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/key-holder-1.jpg',   0),
      (pid, '/images/products/wooden-temple-1.jpg',1);
  END IF;

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Artisan Mango Wood Cake Stand', 'mango-wood-cake-stand', cat_serving,
    1799, 2499,
    'Make celebrations special with this rustic yet contemporary cake stand. Carved from Mango wood with a moisture-resistant food-safe glaze and a heavy pedestal stand.',
    ARRAY['Carved solid pedestal base with weighted foundation','Stunning natural Mango wood grains with unique light-gold variations','Ideal for displaying cakes, pastries, cheeses, or appetizers','Wipes clean in seconds'],
    '[{"key":"Dimensions","value":"10\" Diameter x 5.5\" H"},{"key":"Wood Type","value":"Premium Mango Wood"},{"key":"Weight","value":"1.1 kg"}]',
    10, ARRAY['Light Gold Mango'], TRUE, FALSE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/chopping-board-flat.jpg',0);
  END IF;

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Ember Serving Tray', 'mango-wood-salad-bowl', cat_serving,
    1099, 1499,
    'A rustic yet modern serving tray made of Oak wood, featuring integrated handles and a premium matte finish.',
    ARRAY['Hand-carved from select kiln-dried Oak wood','Premium moisture-resistant matte wax finish','Comfortable integrated handles for secure holding','Modern clean lines that highlight rich grain patterns'],
    '[{"key":"Dimensions","value":"Length 35cm, Width 25cm, Height 8cm"},{"key":"Wood Type","value":"Oak Wood"},{"key":"Weight","value":"1.0 kg"}]',
    20, ARRAY['Smoked Oak'], FALSE, FALSE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/wall-shelf-1.jpg', 0),
      (pid, '/images/products/photo-frame-1.jpg',1);
  END IF;

  -- ── Kitchen Organizers ────────────────────────────────────

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Traditional Acacia Roti Casserole Box', 'traditional-roti-casserole', cat_kitchen,
    1299, 1699,
    'An elegant solution to keep your rotis, chapatis, or breads warm and fresh. Handcrafted from beautiful Acacia wood with a snug-fitting lid.',
    ARRAY['Snug wood lid helps lock in steam and moisture naturally','Insulated interior space (recommend lining with a cloth napkin)','Vibrant wood grains match both traditional and modern table settings','Can also be used to serve tortillas, pita breads, or store snacks'],
    '[{"key":"Dimensions","value":"9\" Diameter x 4\" H"},{"key":"Wood Type","value":"Acacia Hardwood"},{"key":"Capacity","value":"Holds up to 15–20 flatbreads"}]',
    18, ARRAY['Smoked Amber'], TRUE, FALSE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/chopping-board-v1.jpg',0);
  END IF;

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Acacia Cutlery Holder & Organizer', 'acacia-cutlery-holder', cat_kitchen,
    799, 999,
    'Keep your kitchen counters organized with this partitioned wooden holder featuring 3 spacious compartments for forks, knives, and spoons.',
    ARRAY['Three separate storage compartments for clean organization','Sturdy weighted base prevents tipping even when fully loaded','Compact design takes minimal space on kitchen countertops','Can double as a desk organizer for pens and brushes'],
    '[{"key":"Dimensions","value":"8\" L x 4.5\" W x 6\" H"},{"key":"Wood Type","value":"Acacia Wood"},{"key":"Compartments","value":"3 partitioned slots"}]',
    40, ARRAY['Natural Grain'], FALSE, TRUE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/chopping-board-v2.jpg',0);
  END IF;

  -- ── Tableware & Sofa Accents ──────────────────────────────

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Premium Acacia Sofa Arm Tray', 'acacia-sofa-arm-tray', cat_tableware,
    899, 1199,
    'Flexible slatted wooden blocks joined by a high-grip felt backing that wraps snugly over any sofa armrest, providing a stable surface for your coffee or remote.',
    ARRAY['Flexible slatted design conforms easily to various armrest widths','Non-slip protective fabric backing prevents slipping and protects sofa fabrics','Spill-resistant protective coating makes cleanup extremely simple','Slim profile is easy to roll up and store when not in use'],
    '[{"key":"Dimensions","value":"16\" L x 10\" W x 0.35\" H"},{"key":"Wood Type","value":"Acacia Wood"},{"key":"Backing","value":"High-grip protective polyester felt"}]',
    30, ARRAY['Charcoal Ash','Warm Chestnut'], FALSE, TRUE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/chopping-board-h1.jpg',0);
  END IF;

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Minimalist Acacia Coasters (Set of 6)', 'acacia-coaster-set', cat_tableware,
    499, 699,
    'Six round Acacia wood coasters with a matching wood storage stand. Each coaster displays a beautiful cross-section of wood timber grain.',
    ARRAY['Includes 6 round coasters and 1 compact wooden organizer stand','Raised perimeter lip catches condensation droplets from cold glasses','Soft padded bottom dots prevent scratching on glass or wood surfaces','Heat-resistant to protect surfaces from hot coffee mugs'],
    '[{"key":"Dimensions","value":"Coaster: 3.8\" Diameter | Stand: 4.5\" L x 4.5\" W"},{"key":"Wood Type","value":"Acacia Wood"},{"key":"Pack Size","value":"6 Coasters + 1 Stand"}]',
    60, ARRAY['Chestnut Honey'], FALSE, FALSE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/chopping-board-h1.jpg',0);
  END IF;

  -- ── Wall Decor ────────────────────────────────────────────

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Artisan Wooden Key Holder', 'key-holder', cat_wall,
    699, 999,
    'A hand-crafted wooden key holder featuring high-quality metal hooks and a top shelf for small decor items, bringing warmth to your entryway.',
    ARRAY['Sleek and minimalist design suitable for any home entryway','Includes 5 sturdy antique bronze key hooks','Built-in display shelf for mail, plants, or small ornaments','Easy wall mounting setup with all hardware included'],
    '[{"key":"Dimensions","value":"30cm L x 12cm W x 10cm H"},{"key":"Material","value":"Solid Wood"},{"key":"Finish","value":"Natural wax finish"}]',
    15, ARRAY['Honey Brown'], FALSE, TRUE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/key-holder-1.jpg',0),
      (pid, '/images/products/key-holder-2.jpg',1),
      (pid, '/images/products/key-holder-3.jpg',2);
  END IF;

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Hand-carved Wooden Temple', 'wooden-temple', cat_wall,
    2499, 3499,
    'An architectural masterpiece for your home sanctuary. Hand-carved from solid wood with intricate details, providing a sacred and beautiful space for prayers.',
    ARRAY['Intricate hand-carved details by master artisans','Features a pull-out tray for incense or light offerings','Durable wall-mounting capability or tabletop placement','Finished with natural non-toxic lacquer'],
    '[{"key":"Dimensions","value":"45cm H x 30cm W x 20cm D"},{"key":"Material","value":"Premium Hardwood"},{"key":"Finish","value":"Teak brown polish"}]',
    8, ARRAY['Classic Teak'], FALSE, TRUE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/wooden-temple-1.jpg',0),
      (pid, '/images/products/wooden-temple-2.jpg',1),
      (pid, '/images/products/wooden-temple-3.jpg',2);
  END IF;

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Floating Wooden Wall Shelf', 'wall-shelf', cat_wall,
    899, 1299,
    'Elevate your room design with this floating wall shelf. Perfect for organizing books, displaying succulent planters, or styling decorative items.',
    ARRAY['Sturdy build with invisible metal wall brackets','Rich wood grain lines that showcase natural timber beauty','Perfect for bedrooms, living rooms, and kitchen spices','Eco-friendly timber sourcing and non-toxic clear finish'],
    '[{"key":"Dimensions","value":"60cm L x 15cm W x 4cm H"},{"key":"Material","value":"Premium Pine Wood"},{"key":"Capacity","value":"Holds up to 10 kg"}]',
    22, ARRAY['Natural Pine'], FALSE, TRUE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/wall-shelf-1.jpg',0),
      (pid, '/images/products/wall-shelf-2.jpg',1),
      (pid, '/images/products/wall-shelf-3.jpg',2);
  END IF;

  INSERT INTO public.products
    (name, slug, category_id, price, original_price, description, features, specs, stock, colors, is_best_seller, is_new_arrival)
  VALUES (
    'Premium Wooden Photo Frame', 'photo-frame', cat_wall,
    499, 799,
    'Frame your memories in natural warmth. Crafted from premium organic wood with a durable easel stand and wall mounting clips.',
    ARRAY['Suitable for both wall hanging and tabletop displays','Equipped with real high-transparency protective glass','Easy-open back panel for quick photo changes','Clean, timeless layout matches any decor style'],
    '[{"key":"Dimensions","value":"Fits 8\" x 10\" photographs"},{"key":"Material","value":"Natural Wood"},{"key":"Finish","value":"Oak wood polish"}]',
    45, ARRAY['Natural Oak'], FALSE, TRUE
  ) ON CONFLICT (slug) DO NOTHING RETURNING id INTO pid;
  IF pid IS NOT NULL THEN
    INSERT INTO public.product_images (product_id, url, position) VALUES
      (pid, '/images/products/photo-frame-1.jpg',0),
      (pid, '/images/products/photo-frame-2.jpg',1),
      (pid, '/images/products/photo-frame-3.jpg',2);
  END IF;

END $$;
