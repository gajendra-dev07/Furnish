"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";

export default function TeamManager({ people: initialPeople, currentUserId }) {
  const router = useRouter();
  const [people, setPeople] = useState(initialPeople);
  const [busyId, setBusyId] = useState(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const admins = people.filter((p) => p.role === "admin");

  const matches = query.trim()
    ? people.filter((p) => {
        const q = query.trim().toLowerCase();
        return (
          p.role === "customer" &&
          ((p.email || "").toLowerCase().includes(q) ||
            (p.full_name || "").toLowerCase().includes(q))
        );
      })
    : [];

  async function setRole(person, role) {
    setBusyId(person.id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: person.id, role }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Could not update role");

      setPeople((prev) =>
        prev.map((p) => (p.id === person.id ? { ...p, role } : p))
      );
      setSuccess(
        role === "admin"
          ? `${person.email || person.full_name} is now an admin.`
          : `${person.email || person.full_name} is no longer an admin.`
      );
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {error && <div className={styles.formError}>{error}</div>}
      {success && <div className={styles.formSuccess}>{success}</div>}

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>
            Admins ({admins.length})
          </h2>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Admin since</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {admins.map((p) => {
              const isSelf = p.id === currentUserId;
              const isLast = admins.length <= 1;

              return (
                <tr key={p.id}>
                  <td>
                    <div className={styles.productName}>
                      {p.full_name || "—"}
                      {isSelf && (
                        <span
                          className={`${styles.badge} ${styles.badgeGrey}`}
                          style={{ marginLeft: "8px" }}
                        >
                          you
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{p.email || "—"}</td>
                  <td>
                    {new Date(p.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.btnDanger}
                      disabled={isSelf || isLast || busyId === p.id}
                      title={
                        isSelf
                          ? "You can't change your own role"
                          : isLast
                          ? "This is the last admin"
                          : "Remove admin access"
                      }
                      onClick={() => setRole(p, "customer")}
                    >
                      {busyId === p.id ? "Saving…" : "Revoke admin"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.formCard} style={{ marginTop: "20px" }}>
        <div className={styles.formSectionTitle}>Add an admin</div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="team-search">
            Find a customer
          </label>
          <input
            id="team-search"
            className={styles.formInput}
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className={styles.formLabelHint}>
            They need to have signed up first — admin access is granted to an
            existing account.
          </span>
        </div>

        {query.trim() && matches.length === 0 && (
          <p style={{ fontSize: "0.85rem", color: "#8a8078" }}>
            No customer matches “{query.trim()}”.
          </p>
        )}

        {matches.length > 0 && (
          <table className={styles.table}>
            <tbody>
              {matches.slice(0, 8).map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className={styles.productName}>
                      {p.full_name || "—"}
                    </div>
                    <div className={styles.productSlug}>{p.email}</div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      disabled={busyId === p.id}
                      onClick={() => setRole(p, "admin")}
                    >
                      {busyId === p.id ? "Saving…" : "Make admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
