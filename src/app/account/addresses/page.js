"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "../account.module.css";

const EMPTY_FORM = {
  label: "Home",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  is_default: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });

    setAddresses(data || []);
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");

    if (!form.line1 || !form.city || !form.state || !form.pincode) {
      setError("Address line 1, city, state and pincode are required.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If marking as default, unset others first
    if (form.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    const { error: dbErr } = await supabase.from("addresses").insert({
      user_id: user.id,
      label: form.label || "Home",
      line1: form.line1.trim(),
      line2: form.line2.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      is_default: form.is_default,
    });

    if (dbErr) {
      setError(dbErr.message);
      setSaving(false);
      return;
    }

    setForm(EMPTY_FORM);
    setShowForm(false);
    await loadAddresses();
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Remove this address?")) return;
    const supabase = createClient();
    await supabase.from("addresses").delete().eq("id", id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleSetDefault(id) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);

    await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id);

    await loadAddresses();
  }

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <>
      <h1 className={styles.pageTitle}>Saved Addresses</h1>
      <p className={styles.pageSub}>
        Manage your delivery addresses for faster checkout.
      </p>

      {/* Address cards */}
      {loading ? (
        <p style={{ color: "#9ca3af", fontSize: "0.83rem" }}>Loading…</p>
      ) : (
        <>
          {addresses.length > 0 ? (
            <div className={styles.addressGrid}>
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`${styles.addressCard} ${
                    addr.is_default ? styles.addressCardDefault : ""
                  }`}
                >
                  <p className={styles.addressLabel}>
                    {addr.label}
                    {addr.is_default && (
                      <span className={styles.defaultBadge}>Default</span>
                    )}
                  </p>
                  <p className={styles.addressText}>
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}
                    <br />
                    {addr.city}, {addr.state} – {addr.pincode}
                  </p>
                  <div className={styles.addressActions}>
                    {!addr.is_default && (
                      <button
                        className={styles.btnSecondary}
                        style={{ fontSize: "0.75rem", padding: "5px 10px" }}
                        onClick={() => handleSetDefault(addr.id)}
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      className={styles.btnDanger}
                      onClick={() => handleDelete(addr.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState} style={{ marginBottom: "20px" }}>
              <svg
                width="40"
                height="40"
                fill="none"
                stroke="#d1c4b8"
                strokeWidth="1"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className={styles.emptyStateTitle}>No saved addresses</p>
            </div>
          )}

          {/* Add address button / form */}
          {!showForm ? (
            <button
              className={styles.btnPrimary}
              onClick={() => setShowForm(true)}
            >
              + Add New Address
            </button>
          ) : (
            <div className={styles.card}>
              <p className={styles.cardTitle}>New Address</p>

              <form onSubmit={handleAdd}>
                {error && <div className={styles.formError}>{error}</div>}

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Label</label>
                    <select
                      className={styles.formInput}
                      value={form.label}
                      onChange={(e) => setField("label", e.target.value)}
                    >
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Pincode *</label>
                    <input
                      className={styles.formInput}
                      value={form.pincode}
                      onChange={(e) => setField("pincode", e.target.value)}
                      placeholder="110001"
                      maxLength={6}
                      required
                    />
                  </div>

                  <div
                    className={`${styles.formGroup} ${styles.formGroupFull}`}
                  >
                    <label className={styles.formLabel}>Address Line 1 *</label>
                    <input
                      className={styles.formInput}
                      value={form.line1}
                      onChange={(e) => setField("line1", e.target.value)}
                      placeholder="Flat / House No., Street"
                      required
                    />
                  </div>

                  <div
                    className={`${styles.formGroup} ${styles.formGroupFull}`}
                  >
                    <label className={styles.formLabel}>
                      Address Line 2{" "}
                      <span className={styles.formHint}>(optional)</span>
                    </label>
                    <input
                      className={styles.formInput}
                      value={form.line2}
                      onChange={(e) => setField("line2", e.target.value)}
                      placeholder="Landmark, Area"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>City *</label>
                    <input
                      className={styles.formInput}
                      value={form.city}
                      onChange={(e) => setField("city", e.target.value)}
                      placeholder="Mumbai"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>State *</label>
                    <input
                      className={styles.formInput}
                      value={form.state}
                      onChange={(e) => setField("state", e.target.value)}
                      placeholder="Maharashtra"
                      required
                    />
                  </div>

                  <div
                    className={`${styles.formGroup} ${styles.formGroupFull}`}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        fontSize: "0.83rem",
                        color: "#33383b",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.is_default}
                        onChange={(e) =>
                          setField("is_default", e.target.checked)
                        }
                        style={{ accentColor: "#2f4a44" }}
                      />
                      Set as default address
                    </label>
                  </div>
                </div>

                <div className={styles.formFooter} style={{ gap: "10px" }}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => {
                      setShowForm(false);
                      setForm(EMPTY_FORM);
                      setError("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </>
  );
}
