"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import styles from "../login/login.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setError("Auth is not configured.");
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError(
          "This reset link is invalid or expired. Request a new one from the login page."
        );
        setReady(false);
        return;
      }
      setReady(true);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setIsLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
        router.refresh();
        return;
      }
    }

    router.push("/account");
    router.refresh();
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.heading}>
            <p className={styles.badge}>Account</p>
            <h1 className={styles.title}>Choose a new password</h1>
            <p className={styles.subtitle}>
              Enter a new password for your Furnish account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <p className={styles.errorMsg}>{error}</p>}

            <div className="form-group">
              <label className="form-label">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete="new-password"
                disabled={!ready}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete="new-password"
                disabled={!ready}
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading || !ready}
            >
              {isLoading ? "Saving..." : "Update password"}
            </button>
          </form>

          <p className={styles.switchText}>
            <Link href="/auth/forgot-password" className={styles.switchLink}>
              Request a new link
            </Link>
            {" · "}
            <Link href="/auth/login" className={styles.switchLink}>
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
