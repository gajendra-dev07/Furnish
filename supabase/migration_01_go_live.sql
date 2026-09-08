-- ============================================================
-- Migration 01 - go-live blockers
--
-- Run this ONCE in the Supabase SQL Editor, after schema.sql.
-- Safe to re-run: every statement is idempotent.
--
-- What it does:
--   1. Adds profiles.email (admin pages currently query a column
--      that does not exist and silently render empty)
--   2. Adds an is_admin() helper + admin read policies
--   3. Fixes the profiles UPDATE policy that blocks admins from
--      editing their own name/phone
--   4. Adds order review flags for stock problems
--   5. Adds confirm_order() - atomic status flip + stock decrement,
--      safe to call twice (browser verify AND webhook both call it)
-- ============================================================


-- === 1. PROFILES.EMAIL ======================================
-- /admin/customers and /admin/orders select profiles.email, which
-- has never existed. PostgREST returns 400 and both pages fall
-- through to their "no data" empty state.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill from auth.users
UPDATE public.profiles p
   SET email = u.email
  FROM auth.users u
 WHERE u.id = p.id
   AND p.email IS DISTINCT FROM u.email;

CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);

-- Keep email populated for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $fn$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    'customer'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
  RETURN NEW;
END;
$fn$;

-- Keep it in sync if the user later changes their email
CREATE OR REPLACE FUNCTION public.handle_user_email_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $fn$
BEGIN
  UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
CREATE TRIGGER on_auth_user_email_changed
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_user_email_change();


-- === 2. ADMIN HELPER + READ POLICIES ========================
-- SECURITY DEFINER so it can read profiles without tripping the
-- very RLS policies that call it (which would recurse).

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$fn$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Admins can read every profile / order / order_item.
-- Without these the admin dashboard counts are silently wrong:
-- profiles + orders RLS are owner-only, so "Customers" reads 0 and
-- "Orders" counts only the admin's own orders.

DROP POLICY IF EXISTS "profiles: admin can read all" ON public.profiles;
CREATE POLICY "profiles: admin can read all"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "orders: admin can read all" ON public.orders;
CREATE POLICY "orders: admin can read all"
  ON public.orders FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "orders: admin can update" ON public.orders;
CREATE POLICY "orders: admin can update"
  ON public.orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "order_items: admin can read all" ON public.order_items;
CREATE POLICY "order_items: admin can read all"
  ON public.order_items FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "products: admin can read all" ON public.products;
CREATE POLICY "products: admin can read all"
  ON public.products FOR SELECT
  USING (public.is_admin());


-- === 3. FIX THE PROFILE UPDATE POLICY =======================
-- The old policy was WITH CHECK (role = 'customer'), which blocks
-- self-promotion but ALSO blocks any admin from saving their own
-- name or phone. Correct rule: you may edit yourself, but you may
-- not change your own role.
--
-- my_role() must be SECURITY DEFINER. A bare subquery against
-- public.profiles inside a policy ON public.profiles re-triggers that
-- same policy and Postgres aborts with infinite recursion. Running as
-- the table owner sidesteps RLS and breaks the cycle.

CREATE OR REPLACE FUNCTION public.my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $fn$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$fn$;

REVOKE EXECUTE ON FUNCTION public.my_role() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.my_role() TO authenticated;

DROP POLICY IF EXISTS "profiles: owner can update" ON public.profiles;
CREATE POLICY "profiles: owner can update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = public.my_role());


-- === 4. ORDER REVIEW FLAGS ==================================
-- If stock ran out between payment and confirmation we still record
-- the order (the customer has paid) but flag it for a human.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS needs_review  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS review_reason TEXT;

CREATE INDEX IF NOT EXISTS orders_status_idx     ON public.orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);


-- === 5. confirm_order() =====================================
-- Called by BOTH the browser verify route and the Razorpay webhook.
-- Whichever arrives first does the work; the other is a no-op.
--
-- Runs in a single transaction, and takes a row lock on the order so
-- two concurrent confirmations cannot both decrement stock.
--
-- Deliberate business rule: a paid order is ALWAYS recorded. If stock
-- is short we clamp at zero and flag needs_review rather than raising,
-- because refusing the order would leave a paying customer with nothing.

CREATE OR REPLACE FUNCTION public.confirm_order(
  p_razorpay_order_id   TEXT,
  p_razorpay_payment_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  order_id          UUID,
  order_status      TEXT,
  order_total       NUMERIC,
  already_confirmed BOOLEAN,
  order_needs_review BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $fn$
DECLARE
  v_order    public.orders%ROWTYPE;
  v_item     RECORD;
  v_updated  INTEGER;
  v_short    TEXT[] := ARRAY[]::TEXT[];
  v_reason   TEXT;
BEGIN
  SELECT * INTO v_order
    FROM public.orders
   WHERE razorpay_order_id = p_razorpay_order_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No order found for razorpay_order_id %', p_razorpay_order_id
      USING ERRCODE = 'no_data_found';
  END IF;

  -- Already handled by the other caller - return unchanged.
  IF v_order.status <> 'pending' THEN
    RETURN QUERY SELECT v_order.id, v_order.status, v_order.total,
                        TRUE, v_order.needs_review;
    RETURN;
  END IF;

  FOR v_item IN
    SELECT oi.product_id, oi.quantity, oi.product_snapshot ->> 'name' AS name
      FROM public.order_items oi
     WHERE oi.order_id = v_order.id
  LOOP
    CONTINUE WHEN v_item.product_id IS NULL;

    UPDATE public.products
       SET stock = stock - v_item.quantity
     WHERE id = v_item.product_id
       AND stock >= v_item.quantity;

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    IF v_updated = 0 THEN
      -- Not enough stock: take what is left, flag for review.
      UPDATE public.products
         SET stock = 0
       WHERE id = v_item.product_id
         AND stock > 0;

      v_short := array_append(v_short, COALESCE(v_item.name, v_item.product_id::TEXT));
    END IF;
  END LOOP;

  IF array_length(v_short, 1) > 0 THEN
    v_reason := 'Insufficient stock at confirmation: ' || array_to_string(v_short, ', ');
  END IF;

  UPDATE public.orders
     SET status              = 'confirmed',
         razorpay_payment_id = COALESCE(p_razorpay_payment_id, razorpay_payment_id),
         needs_review        = (v_reason IS NOT NULL),
         review_reason       = v_reason,
         updated_at          = NOW()
   WHERE id = v_order.id;

  RETURN QUERY SELECT v_order.id, 'confirmed'::TEXT, v_order.total,
                      FALSE, (v_reason IS NOT NULL);
END;
$fn$;

REVOKE EXECUTE ON FUNCTION public.confirm_order(TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.confirm_order(TEXT, TEXT) FROM authenticated;
-- Only the service role (server routes) may confirm an order.
GRANT  EXECUTE ON FUNCTION public.confirm_order(TEXT, TEXT) TO service_role;
