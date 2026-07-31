"use client";

import React from "react";
import Button from "@/components/ui/Button";
import styles from "../checkout.module.css";

export default function OrderSummary({ cart, cartSubtotal, tax, grandTotal, isSubmitting }) {
  return (
    <div className={styles.summaryPanel}>
      <h3 className={styles.summaryTitle}>Review Order</h3>

      {/* Item Lines */}
      <div className={styles.itemsSummary}>
        {cart.map((item, i) => (
          <div key={i} className={styles.summaryItem}>
            <span className={styles.itemName}>
              {item.product.name} <span style={{ color: "var(--color-secondary)", fontSize: "0.75rem" }}>x{item.quantity}</span>
            </span>
            <span className={styles.itemPrice}>
              ₹{(item.product.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.priceBreakdown}>
        <div className={styles.summaryItem} style={{ fontSize: "0.875rem" }}>
          <span>Subtotal</span>
          <span>₹{cartSubtotal.toLocaleString()}</span>
        </div>
        <div className={styles.summaryItem} style={{ fontSize: "0.875rem" }}>
          <span>Shipping & Handling</span>
          <span style={{ color: "var(--color-accent)", fontWeight: 500 }}>Free</span>
        </div>
        <div className={styles.summaryItem} style={{ fontSize: "0.875rem" }}>
          <span>GST (12%)</span>
          <span>₹{tax.toLocaleString()}</span>
        </div>
      </div>

      <div className={styles.totalRow}>
        <span>Order Total</span>
        <span>₹{grandTotal.toLocaleString()}</span>
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className={styles.submitBtn}
      >
        {isSubmitting ? "Processing Ledger..." : `Place Order of ₹${grandTotal.toLocaleString()}`}
      </Button>
    </div>
  );
}
