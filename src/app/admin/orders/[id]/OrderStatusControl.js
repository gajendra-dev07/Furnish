"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

const FLOW = ["confirmed", "processing", "shipped", "delivered"];

export default function OrderStatusControl({
  orderId,
  currentStatus,
  needsReview,
  reviewReason,
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const stageIndex = FLOW.indexOf(status);
  const nextStage = stageIndex > -1 ? FLOW[stageIndex + 1] : null;

  async function patch(body, successMessage) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Update failed");

      if (data.order?.status) setStatus(data.order.status);
      setSuccess(successMessage);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.formCard}>
      <div className={styles.formSectionTitle}>Fulfilment</div>

      {error && <div className={styles.formError}>{error}</div>}
      {success && <div className={styles.formSuccess}>{success}</div>}

      {needsReview && (
        <div className={styles.formError} role="alert">
          <strong>Needs review.</strong> {reviewReason}
          <div style={{ marginTop: "10px" }}>
            <button
              type="button"
              className={styles.btnSecondary}
              disabled={saving}
              onClick={() =>
                patch({ clearReview: true }, "Marked as reviewed.")
              }
            >
              Mark as resolved
            </button>
          </div>
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="order-status">
          Status
        </label>
        <select
          id="order-status"
          className={styles.formSelect}
          value={status}
          disabled={saving}
          onChange={(e) =>
            patch({ status: e.target.value }, `Status set to ${e.target.value}.`)
          }
        >
          {FLOW.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
          <option value="cancelled">Cancelled</option>
        </select>
        <span className={styles.formLabelHint}>
          The customer sees this on their Orders page.
        </span>
      </div>

      {nextStage && (
        <button
          type="button"
          className={styles.btnPrimary}
          disabled={saving}
          onClick={() =>
            patch({ status: nextStage }, `Order marked ${nextStage}.`)
          }
        >
          {saving ? "Saving…" : `Mark as ${nextStage}`}
        </button>
      )}

      {status === "cancelled" && (
        <p className={styles.formLabelHint} style={{ marginTop: "10px" }}>
          Cancelling here does not refund the payment — issue that from the
          Razorpay dashboard.
        </p>
      )}
    </div>
  );
}
