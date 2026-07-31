import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Call at the top of any admin API route handler.
 * Returns { user, supabase } on success, or { error: NextResponse } on failure.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      supabase: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return {
      user: null,
      supabase: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user, supabase, error: null };
}
