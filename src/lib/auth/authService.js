/**
 * authService.js
 * Centralized authentication service that wraps all Supabase auth calls.
 * All auth pages consume this service — no page imports Supabase directly.
 */

import { createClient } from "@/lib/supabase/client";

// ─── helpers ────────────────────────────────────────────────────────────────

function getSupabase() {
  const supabase = createClient();
  if (!supabase) throw new Error("Auth is not configured.");
  return supabase;
}

/** Fetch the profiles row for a given userId */
async function fetchUserProfile(supabase, userId) {
  const { data } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", userId)
    .single();
  return data ?? null;
}

/** Return the correct post-login destination based on role */
async function resolveRedirect(supabase, user, fallback = "/") {
  const profile = await fetchUserProfile(supabase, user.id);
  return profile?.role === "admin" ? "/admin" : fallback;
}

// ─── public API ─────────────────────────────────────────────────────────────

/**
 * Sign in with email + password.
 * Returns { user, redirect } on success, or throws with a message.
 */
export async function signIn(email, password, next = "/") {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw new Error(friendlyError(error.message));

  const redirect = await resolveRedirect(supabase, data.user, next);
  return { user: data.user, redirect };
}


/**
 * Create a new account and immediately sign in the user.
 * Returns { user, redirect } on success, or throws with a message.
 */
export async function signUp(fullName, email, password, phone, next = "/") {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, password, phone }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to create account.");
  }

  // Immediately sign in so the user doesn't have to enter credentials again
  return await signIn(email, password, next);
}



/**
 * Send a password-reset email.
 * Always returns { sent: true } (Supabase never reveals whether the email exists).
 */
export async function sendPasswordReset(email) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/account/auth/callback?next=/account/reset-password`,
  });

  if (error) throw new Error(friendlyError(error.message));
  return { sent: true };
}

/**
 * Update the authenticated user's password.
 * Requires an active session (obtained via the reset link).
 * Returns { redirect } on success.
 */
export async function updatePassword(newPassword) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(friendlyError(error.message));

  // After a successful reset, figure out where to send the user
  const { data: userData } = await supabase.auth.getUser();
  const redirect = userData?.user
    ? await resolveRedirect(supabase, userData.user, "/account")
    : "/account/login";

  return { redirect };
}

/**
 * Check whether the current session is valid (used on the reset-password page
 * to verify the token has been exchanged before showing the form).
 */
export async function getSession() {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const supabase = getSupabase();
  await supabase.auth.signOut();
}

// ─── validation ─────────────────────────────────────────────────────────────

export const validation = {
  email(value) {
    if (!value.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
      return "Please enter a valid email address.";
    return null;
  },

  password(value) {
    if (!value) return "Password is required.";
    if (value.length < 8) return "Password must be at least 8 characters.";
    return null;
  },

  confirmPassword(password, confirm) {
    if (!confirm) return "Please confirm your password.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  },

  fullName(value) {
    if (!value.trim()) return "Name is required.";
    return null;
  },

  phone(value) {
    if (!value?.trim()) return "Mobile number is required.";
    const clean = value.replace(/\D/g, "");
    if (clean.length < 10) return "Please enter a valid 10-digit mobile number.";
    return null;
  },
};

// ─── private helpers ────────────────────────────────────────────────────────

/** Map raw Supabase error messages to user-friendly copy */
function friendlyError(msg) {
  if (!msg) return "Something went wrong. Please try again.";
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid email or password"))
    return "Invalid email or password.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email before signing in.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "An account with this email already exists.";
  if (m.includes("password should be"))
    return "Password must be at least 8 characters.";
  if (m.includes("rate limit"))
    return "Too many attempts. Please wait a moment and try again.";
  return msg;
}
