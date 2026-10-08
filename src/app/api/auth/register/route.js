import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { fullName, email, password, phone } = body;

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const admin = createAdminClient();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanPhone = phone?.trim() ? phone.trim() : null;

    // Check if user already exists
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Create user with email auto-confirmed so they can log in instantly
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: cleanName, phone: cleanPhone },
    });

    if (createError) {
      const msg = (createError.message || "").toLowerCase();
      const isDuplicate =
        msg.includes("already registered") ||
        msg.includes("already been registered") ||
        msg.includes("already exists");
      return NextResponse.json(
        { error: isDuplicate ? "An account with this email already exists. Please sign in." : (createError.message || "Failed to create account.") },
        { status: isDuplicate ? 409 : 400 }
      );
    }

    const user = created.user;

    // Ensure profile entry exists with phone number
    await admin.from("profiles").upsert({
      id: user.id,
      email: cleanEmail,
      full_name: cleanName,
      phone: cleanPhone,
      role: "customer",
    });


    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: cleanEmail,
      },
    });
  } catch (err) {
    console.error("[register API error]:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
