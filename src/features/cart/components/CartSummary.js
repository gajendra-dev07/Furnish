"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import styles from "../cart.module.css";

/**
 * CartSummary renders the pricing totals panel.
 * @param {object} props
 * @param {number} props.subtotal - Subtotal amount.
 * @param {number} props.tax - Estimated GST tax amount.
 * @param {number} props.grandTotal - Total order amount.
 */
export default function CartSummary({ subtotal, tax, grandTotal }) {
  return (
    <div className={styles.summaryPanel}>
      <h3 className={styles.summaryTitle}>Order Summary</h3>

      <div className={styles.summaryRow}>
        <span>Subtotal</span>
        <span>₹{subtotal.toLocaleString()}</span>
      </div>

      <div className={styles.summaryRow}>
        <span>Shipping & Handling</span>
        <span style={{ color: "var(--color-accent)", fontWeight: 500 }}>Free</span>
      </div>

      <div className={styles.summaryRow}>
        <span>Estimated GST (12%)</span>
        <span>₹{tax.toLocaleString()}</span>
      </div>

      <div className={styles.totalRow}>
        <span>Total Amount</span>
        <span>₹{grandTotal.toLocaleString()}</span>
      </div>

      <Link href="/checkout">
        <Button variant="primary" className={styles.checkoutBtn}>
          Proceed to Checkout
        </Button>
      </Link>

      <div className={styles.paymentBadges}>
        <span>🔒 Secure Checkout — UPI, Cards, Netbanking, COD</span>
      </div>
    </div>
  );
}
