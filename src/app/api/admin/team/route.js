import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const ROLES = ["admin", "customer"];

// GET /api/admin/team — everyone with a role, admins first
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const admin = createAdminClient();
  const { data, error: dbErr } = await admin
    .from("profiles")
    .select("id, full_name, email, phone, role, created_at")
    .order("role", { ascending: true })
    .order("created_at", { ascending: false });

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  return NextResponse.json({ people: data ?? [] });
}

/**
 * POST /api/admin/team — promote or demote someone.
 * Body: { userId, role: "admin" | "customer" }
 *
 * Two guards, both about not locking yourself out of your own store:
 *   - you cannot change your own role
 *   - you cannot remove the last remaining admin
 */
export async function POST(request) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const userId = body?.userId;
  const role = body?.role;

  if (!userId || !ROLES.includes(role)) {
    return NextResponse.json(
      { error: "userId and a valid role are required" },
      { status: 400 }
    );
  }

  if (userId === user.id) {
    return NextResponse.json(
      {
        error:
          "You can't change your own role. Ask another admin to do it for you.",
      },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: target, error: findErr } = await admin
    .from("profiles")
    .select("id, role, full_name, email")
    .eq("id", userId)
    .maybeSingle();

  if (findErr) {
    return NextResponse.json({ error: findErr.message }, { status: 500 });
  }
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.role === role) {
    return NextResponse.json({ person: target, unchanged: true });
  }

  if (target.role === "admin" && role === "customer") {
    const { count, error: countErr } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (countErr) {
      return NextResponse.json({ error: countErr.message }, { status: 500 });
    }
    if ((count ?? 0) <= 1) {
      return NextResponse.json(
        { error: "This is the last admin — promote someone else first." },
        { status: 409 }
      );
    }
  }

  const { data, error: updateErr } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select("id, full_name, email, phone, role, created_at")
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  console.log(
    `[team] ${user.id} set ${target.email || userId} to ${role}`
  );

  return NextResponse.json({ person: data });
}
