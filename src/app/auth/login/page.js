"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import styles from "./login.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(urlError || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    // Check if the user is an admin and redirect accordingly
    if (data?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
        router.refresh();
        return;
      }
    }

    router.push(next);
    router.refresh();
  };

  return (
    <div className={styles.card}>
      <div className={styles.heading}>
        <p className={styles.badge}>Welcome back</p>
        <h1 className={styles.title}>Sign in to Furnish</h1>
        <p className={styles.subtitle}>
          Access your orders, saved addresses, and wishlist.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className="form-group">
          <label className="form-label">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className={styles.switchText}>
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className={styles.switchLink}>
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Suspense fallback={<div className={styles.card} />}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
