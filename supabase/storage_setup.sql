-- ─────────────────────────────────────────────────────────────
-- Supabase Storage — product-images bucket
-- Run this in: Supabase Dashboard → SQL Editor
--
-- NOTE: The bucket itself must be created manually first:
--   Supabase Dashboard → Storage → New Bucket
--   Name: product-images
--   Public bucket: YES (so image URLs work without auth tokens)
-- ─────────────────────────────────────────────────────────────

-- Allow admins to upload/update/delete via service role (already bypasses RLS)
-- Allow anyone to read public images (since bucket is public, no policy needed for SELECT)

-- Optional: restrict uploads to authenticated users only (belt-and-suspenders)
-- The service role in /api/admin/upload bypasses this anyway.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;
