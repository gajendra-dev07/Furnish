/**
 * /account/auth/callback
 * Handles the OAuth / magic-link / reset-link code exchange from Supabase.
 * Supabase sends the user here after email confirmation or password reset.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeNext } from "@/lib/auth/safeNext";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const cookieStore = await cookies();
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options);
              } catch {
                // Ignore if cookieStore is readonly in this context
              }
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
  }

  // Reset links only work in the browser that requested them (PKCE), so a
  // link opened in a mail app or on another device lands here.
  if (next.startsWith("/account/reset-password")) {
    return NextResponse.redirect(`${origin}/account/reset-password`);
  }

  return NextResponse.redirect(
    `${origin}/account/login?error=This+link+is+invalid+or+has+expired.+Please+try+again.`
  );
}
