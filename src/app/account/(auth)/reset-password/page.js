"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, updatePassword, validation } from "@/lib/auth/authService";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import styles from "@/app/account/(auth)/auth.module.css";

export default function AccountResetPasswordPage() {
  const router = useRouter();

  // "checking" → checking session | "ready" → show form | "invalid" → bad/expired token
  const [tokenState, setTokenState] = useState("checking");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Verify session on mount (the callback route exchanges the reset token first)
  useEffect(() => {
    getSession()
      .then((session) => setTokenState(session ? "ready" : "invalid"))
      .catch(() => setTokenState("invalid"));
  }, []);

  function validate() {
    const errs = {};
    const passErr = validation.password(password);
    const confirmErr = validation.confirmPassword(password, confirm);
    if (passErr) errs.password = passErr;
    if (confirmErr) errs.confirm = confirmErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { redirect } = await updatePassword(password);
      setIsSuccess(true);
      // Brief pause so user sees success, then redirect
      setTimeout(() => { router.push(redirect); router.refresh(); }, 1500);
    } catch (err) {
      setFormError(err.message);
      setIsLoading(false);
    }
  }

  // ── Checking session ───────────────────────────────────────────────────────
  if (tokenState === "checking") {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.heading}>
              <p className={styles.badge}>Account</p>
              <h1 className={styles.title}>Reset password</h1>
            </div>
            <p className={styles.subtitle} style={{ textAlign: "center" }}>
              Verifying your reset link…
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Invalid / expired token ────────────────────────────────────────────────
  if (tokenState === "invalid") {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.heading}>
              <p className={styles.badge}>Account</p>
              <h1 className={styles.title}>Link expired</h1>
              <p className={styles.subtitle}>
                This reset link is invalid or has expired.
              </p>
            </div>
            <p className={styles.switchText} style={{ marginTop: "1rem" }}>
              <Link href="/account/forgot-password" className={styles.switchLink}>
                Request a new reset link
              </Link>
              {" · "}
              <Link href="/account/login" className={styles.switchLink}>
                Sign in
              </Link>
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.heading}>
              <p className={styles.badge}>Account</p>
              <h1 className={styles.title}>Password updated</h1>
              <p className={styles.subtitle}>Redirecting you now…</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Reset password form ────────────────────────────────────────────────────
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.heading}>
            <p className={styles.badge}>Account</p>
            <h1 className={styles.title}>Choose a new password</h1>
            <p className={styles.subtitle}>
              Enter a new password for your Furnis account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {formError && <p className={styles.errorMsg}>{formError}</p>}

            <div className="form-group">
              <label className="form-label" htmlFor="reset-password">New password</label>
              <input
                id="reset-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                className="form-input"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                disabled={isLoading}
              />
              {errors.password && <p className={styles.errorMsg}>{errors.password}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reset-confirm">Confirm new password</label>
              <input
                id="reset-confirm"
                type="password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: "" })); }}
                className="form-input"
                placeholder="Repeat your new password"
                autoComplete="new-password"
                disabled={isLoading}
              />
              {errors.confirm && <p className={styles.errorMsg}>{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? "Saving…" : "Reset password"}
            </button>
          </form>

          <p className={styles.switchText}>
            <Link href="/account/forgot-password" className={styles.switchLink}>
              Request a new link
            </Link>
            {" · "}
            <Link href="/account/login" className={styles.switchLink}>
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
