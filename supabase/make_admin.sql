-- ============================================================
-- Promote a user to admin
-- Run this in Supabase SQL Editor after signing up.
-- Safe to re-run — uses UPSERT so it works even if no profile
-- row was created yet (e.g. signed up before schema was applied).
-- ============================================================

DO $$
DECLARE
  target_uid UUID;
BEGIN
  -- Find the user by email
  SELECT id INTO target_uid
  FROM auth.users
  WHERE email = 'ashok63755@gmail.com';

  IF target_uid IS NULL THEN
    RAISE EXCEPTION 'User with that email not found. Make sure you signed up first.';
  END IF;

  -- Create or update the profile row with admin role
  INSERT INTO public.profiles (id, role)
  VALUES (target_uid, 'admin')
  ON CONFLICT (id) DO UPDATE
    SET role = 'admin';

  RAISE NOTICE 'Success — user % is now admin.', target_uid;
END;
$$;

-- Verify:
SELECT p.id, u.email, p.role, p.full_name
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'admin';
