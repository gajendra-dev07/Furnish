"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signUp, validation } from "@/lib/auth/authService";
import { safeNext } from "@/lib/auth/safeNext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import styles from "@/app/account/(auth)/auth.module.css";

export default function AccountRegisterPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Suspense fallback={<div className={styles.card} />}>
          <RegisterForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const errs = {};
    const nameErr = validation.fullName(fullName);
    const emailErr = validation.email(email);
    const phoneErr = validation.phone(phone);
    const passErr = validation.password(password);
    const confirmErr = validation.confirmPassword(password, confirm);
    if (nameErr) errs.fullName = nameErr;
    if (emailErr) errs.email = emailErr;
    if (phoneErr) errs.phone = phoneErr;
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
      const { redirect } = await signUp(fullName, email, password, phone, next);
      window.location.href = redirect;
    } catch (err) {
      setFormError(err.message);
      setIsLoading(false);
    }
  }


  // ── Registration form ──────────────────────────────────────────────────────
  return (
        <div className={styles.card}>
          <div className={styles.heading}>
            <p className={styles.badge}>New account</p>
            <h1 className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>
              Join Furnis to track orders, save favourites, and checkout faster.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {formError && <p className={styles.errorMsg}>{formError}</p>}

            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: "" })); }}
                className="form-input"
                placeholder="Jane Smith"
                autoComplete="name"
                disabled={isLoading}
              />
              {errors.fullName && <p className={styles.errorMsg}>{errors.fullName}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                className="form-input"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLoading}
              />
              {errors.email && <p className={styles.errorMsg}>{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Mobile number</label>
              <input
                id="reg-phone"
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: "" })); }}
                className="form-input"
                placeholder="e.g. 9876543210"
                autoComplete="tel"
                disabled={isLoading}
              />
              {errors.phone && <p className={styles.errorMsg}>{errors.phone}</p>}
            </div>


            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
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
              <label className="form-label" htmlFor="reg-confirm">Confirm password</label>
              <input
                id="reg-confirm"
                type="password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: "" })); }}
                className="form-input"
                placeholder="Repeat your password"
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
              {isLoading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className={styles.switchText}>
            Already have an account?{" "}
            <Link
              href={next === "/" ? "/account/login" : `/account/login?next=${encodeURIComponent(next)}`}
              className={styles.switchLink}
            >
              Sign in
            </Link>
          </p>
        </div>
  );
}
