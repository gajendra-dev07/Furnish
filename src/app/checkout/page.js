"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SectionHeading from "@/components/ui/SectionHeading";
import MotionSection from "@/components/ui/MotionSection";
import Button from "@/components/ui/Button";
import { useCart } from "@/store/CartContext";
import styles from "@/features/checkout/checkout.module.css";

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart, isLoaded } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    email: "",
    phone: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate Payment and Order Processing
    setTimeout(() => {
      const randomOrderNumber = "FURNISH-" + Math.floor(100000 + Math.random() * 900000);
      setOrderNumber(randomOrderNumber);
      setOrderConfirmed(true);
      setIsSubmitting(false);
      clearCart();
    }, 1500);
  };

  if (!isLoaded) {
    return (
      <>
        <Header />
        <main className={`container ${styles.main}`}>
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            LOADING CHECKOUT DETAILS...
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const tax = cartSubtotal * 0.12;
  const grandTotal = cartSubtotal + tax;

  // Order Confirmed Screen
  if (orderConfirmed) {
    return (
      <>
        <Header />
        <MotionSection as="main" className={`container ${styles.main}`} delay={0.2}>
          <div className={styles.successPanel}>
            <div className={styles.successIcon}>
              <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <h2 className={styles.successTitle}>Order Placed Successfully</h2>
            <p className={styles.successText}>
              Thank you for choosing Furnish. Your order has been successfully placed. We will email your invoice and dispatch details within 24 hours.
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
        </MotionSection>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <MotionSection as="main" className={`container ${styles.main}`} delay={0.2}>
        <SectionHeading
          badge="Checkout Ledger"
          title="Complete Purchase"
          subtitle="Please fill in your shipping location and security payment details."
        />

        {cart.length > 0 ? (
          <form onSubmit={handlePlaceOrder} className={styles.grid}>
            {/* Form Column */}
            <div className={styles.formPanel}>
              {/* Shipping Address */}
              <div>
                <h3 className={styles.formTitle}>1. Shipping & Delivery</h3>
                <div className={`${styles.inputGrid} ${styles.inputGrid2}`}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className={`${styles.inputGrid} ${styles.inputGrid2}`}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Zip Code</label>
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={`${styles.inputGrid} ${styles.inputGrid2}`}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment — Razorpay will be wired here in Phase 5 */}
              <div style={{ marginTop: "var(--space-xl)" }}>
                <h3 className={styles.formTitle}>2. Payment</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--color-secondary)", padding: "var(--space-md)", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-sm)" }}>
                  Secure payment via Razorpay will open after you confirm your shipping details.
                </p>
              </div>
            </div>

            {/* Order Summary Column */}
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
          </form>
        ) : (
          <div className={styles.successPanel} style={{ maxWidth: "500px", margin: "40px auto" }}>
            <h3 className={styles.successTitle} style={{ fontSize: "1.5rem" }}>No active order</h3>
            <p className={styles.successText}>
              There are no items in your shopping bag. You must add items before checking out.
            </p>
            <Link href="/shop">
              <Button variant="primary">Return to Shop</Button>
            </Link>
          </div>
        )}
      </MotionSection>
      <Footer />
    </>
  );
}
