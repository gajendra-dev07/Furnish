"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "@/app/account/account.module.css";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setPhone(profile.phone || "");
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: dbErr } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() || null })
      .eq("id", user.id);

    if (dbErr) {
      setError(dbErr.message);
    } else {
      setSuccess("Profile updated successfully.");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <>
        <h1 className={styles.pageTitle}>Profile Settings</h1>
        <p className={styles.pageSub}>Loading…</p>
      </>
    );
  }

  return (
    <>
      <h1 className={styles.pageTitle}>Profile Settings</h1>
      <p className={styles.pageSub}>Update your name and contact details.</p>

      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          {error && <div className={styles.formError}>{error}</div>}
          {success && <div className={styles.formSuccess}>{success}</div>}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Name</label>
              <input
                className={styles.formInput}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone Number</label>
              <input
                className={styles.formInput}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                type="tel"
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>Email Address</label>
              <input
                className={styles.formInput}
                value={email}
                disabled
                type="email"
              />
              <span className={styles.formHint}>
                Email cannot be changed here. Contact support if needed.
              </span>
            </div>
          </div>

          <div className={styles.formFooter}>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
