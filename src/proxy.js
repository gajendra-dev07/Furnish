import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Auth pages that a logged-in user should be redirected away from
const AUTH_PAGES = [
  "/account/login",
  "/account/register",
  "/account/forgot-password",
  // Legacy paths — kept as redirects below, not here
];

// Protected account sub-routes (non-auth pages under /account/*).
// The (auth) route group pages are at these paths but have their own layout
// and must NOT require authentication.
const UNPROTECTED_ACCOUNT_PATHS = new Set([
  "/account/login",
  "/account/register",
  "/account/forgot-password",
  "/account/reset-password",
  "/account/auth",
]);

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // Skip auth checks if Supabase env vars aren't configured yet
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — must be called before any redirect logic
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Legacy /auth/* → redirect to new /account/* equivalents ──────────────
  if (pathname === "/auth/login") {
    const url = new URL("/account/login", request.url);
    const next = request.nextUrl.searchParams.get("next");
    if (next) url.searchParams.set("next", next);
    const err = request.nextUrl.searchParams.get("error");
    if (err) url.searchParams.set("error", err);
    return NextResponse.redirect(url);
  }
  if (pathname === "/auth/signup") {
    return NextResponse.redirect(new URL("/account/register", request.url));
  }
  if (pathname === "/auth/forgot-password") {
    return NextResponse.redirect(new URL("/account/forgot-password", request.url));
  }
  if (pathname === "/auth/reset-password") {
    return NextResponse.redirect(new URL("/account/reset-password", request.url));
  }
  if (pathname === "/auth/callback") {
    // Forward callback with all original query params to new path
    const newUrl = new URL("/account/auth/callback", request.url);
    request.nextUrl.searchParams.forEach((v, k) => newUrl.searchParams.set(k, v));
    return NextResponse.redirect(newUrl);
  }

  // ── Redirect logged-in users away from auth pages ────────────────────────
  if (user && AUTH_PAGES.some((p) => pathname === p)) {
    return NextResponse.redirect(new URL("/", request.url));
  }


  // ── Protect /account/* (except auth pages and callback) ──────────────────
  if (pathname.startsWith("/account")) {
    const isUnprotected = Array.from(UNPROTECTED_ACCOUNT_PATHS).some((p) =>
      pathname === p || pathname.startsWith(p + "/")
    );

    if (!isUnprotected && !user) {
      const loginUrl = new URL("/account/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Protect /admin/* ──────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/account/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify admin role via profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Attach the pathname as a request header so layouts can read it server-side
  supabaseResponse.headers.set("x-pathname", pathname);

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Run on all routes except static assets, images, and the Razorpay
    // webhook — that request carries no session cookies, so refreshing one
    // is pure latency on a call Razorpay will retry if we're slow.
    "/((?!_next/static|_next/image|favicon.ico|images/|api/razorpay/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
