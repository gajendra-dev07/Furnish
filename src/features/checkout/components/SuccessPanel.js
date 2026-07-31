"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import styles from "../checkout.module.css";

export default function SuccessPanel({ orderNumber, formData }) {
  return (
    <div className={styles.successPanel}>
      <div className={styles.successIcon}>
        <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      </div>
      <h2 className={styles.successTitle}>Order Placed Successfully</h2>
      <p className={styles.successText}>
        Thank you for choosing Furnis. Your order has been successfully placed. We will email your invoice and dispatch details within 24 hours.
      </p>

      <div className={styles.receiptCard}>
        <div className={styles.receiptRow}>
          <strong>Order Reference:</strong>
          <span>{orderNumber}</span>
        </div>
        <div className={styles.receiptRow}>
          <strong>Delivery Address:</strong>
          <span>{formData.address}, {formData.city}</span>
        </div>
        <div className={styles.receiptRow}>
          <strong>Customer Name:</strong>
          <span>{formData.firstName} {formData.lastName}</span>
        </div>
        <div className={styles.receiptRow}>
          <strong>Email Contact:</strong>
          <span>{formData.email}</span>
        </div>
      </div>

      <Link href="/shop">
        <Button variant="primary">Continue Browsing</Button>
      </Link>
    </div>
  );
}
