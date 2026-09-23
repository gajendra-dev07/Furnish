"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SectionHeading from "@/components/ui/SectionHeading";
import MotionSection from "@/components/ui/MotionSection";
import Button from "@/components/ui/Button";
import { useCart } from "@/store/CartContext";
import { useAuth } from "@/store/AuthContext";
import { createClient } from "@/lib/supabase/client";
import styles from "@/features/checkout/checkout.module.css";

const NEW_ADDRESS = "new";

function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") };
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function cartPayload(cart) {
  return cart.map((item) => ({
    // Prefer DB UUID; fall back to slug (CartContext uses slug as product.id)
    productId: item.product.dbId || item.product.id,
    quantity: item.quantity,
    selectedColor: item.selectedColor || null,
  }));
}

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart, isLoaded } = useCart();
  const { user, profile, isAuthLoading } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(NEW_ADDRESS);
  const [appliedPrefill, setAppliedPrefill] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitLabel, setSubmitLabel] = useState("");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentError, setPaymentError] = useState("");

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

  // Fill in what we already know about the signed-in customer rather than
  // making them retype it. Anything they've already edited is left alone.
  // Applied during render rather than in an effect so the form never paints
  // blank for a frame once the profile resolves.
  const prefillKey = user
    ? `${user.id}|${profile?.full_name ?? ""}|${profile?.phone ?? ""}`
    : null;

  if (prefillKey && prefillKey !== appliedPrefill) {
    const { firstName, lastName } = splitName(profile?.full_name);
    setAppliedPrefill(prefillKey);
    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || firstName,
      lastName: prev.lastName || lastName,
      email: prev.email || user.email || "",
      phone: prev.phone || profile?.phone || "",
    }));
  }

  const applyAddress = useCallback((address) => {
    setFormData((prev) => ({
      ...prev,
      address: [address.line1, address.line2].filter(Boolean).join(", "),
      city: address.city || "",
      state: address.state || "",
      zip: address.pincode || "",
    }));
  }, []);

  // /account/addresses is a working address book that checkout used to ignore.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadAddresses() {
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true });

      if (cancelled || !data?.length) return;

      setAddresses(data);
      setSelectedAddressId(data[0].id);
      applyAddress(data[0]);
    }

    loadAddresses();
    return () => {
      cancelled = true;
    };
  }, [user, applyAddress]);

  const handleAddressSelect = (e) => {
    const value = e.target.value;
    setSelectedAddressId(value);

    if (value === NEW_ADDRESS) {
      setFormData((prev) => ({
        ...prev,
        address: "",
        city: "",
        state: "",
        zip: "",
      }));
      return;
    }

    const chosen = addresses.find((a) => String(a.id) === value);
    if (chosen) applyAddress(chosen);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPaymentError("");

    if (!user) {
      setPaymentError("Please sign in to place an order.");
      return;
    }

    if (!cart.length) {
      setPaymentError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);
    setSubmitLabel("Creating payment order...");

    try {
      const items = cartPayload(cart);

      // The shipping address goes up front now: create-order persists a
      // `pending` order so the webhook can confirm the payment even if this
      // browser never makes it back to /api/razorpay/verify.
      const createRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, shippingAddress: formData }),
      });
      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(createData.error || "Could not start payment");
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Could not load Razorpay Checkout. Please try again.");
      }

      setSubmitLabel("Waiting for payment...");

      const options = {
        key: createData.keyId,
        amount: createData.amount,
        currency: createData.currency || "INR",
        name: "Furnish",
        description: "Furniture order payment",
        order_id: createData.orderId,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: formData.address,
        },
        theme: {
          color: "#3d2c29",
        },
        handler: async function (response) {
          setSubmitLabel("Confirming payment...");
          setIsSubmitting(true);

          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(
                verifyData.error || "Payment verification failed"
              );
            }

            setOrderNumber(verifyData.orderNumber);
            setOrderConfirmed(true);
            clearCart();
          } catch (verifyErr) {
            setPaymentError(
              verifyErr.message ||
                "Payment was received but order confirmation failed. Please contact support with your payment ID."
            );
          } finally {
            setIsSubmitting(false);
            setSubmitLabel("");
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setSubmitLabel("");
            setPaymentError(
              "Payment was cancelled. Your cart is unchanged — you can try again."
            );
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setIsSubmitting(false);
        setSubmitLabel("");
        setPaymentError(
          response?.error?.description ||
            response?.error?.reason ||
            "Payment failed. Please try again."
        );
      });
      rzp.open();
    } catch (err) {
      setPaymentError(err.message || "Something went wrong starting payment");
      setIsSubmitting(false);
      setSubmitLabel("");
    }
  };

  if (!isLoaded || isAuthLoading) {
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
              {!user && (
                <div className={styles.errorMsg} role="alert">
                  You need to{" "}
                  <Link href="/auth/login?next=/checkout">sign in</Link> before
                  placing an order so we can save it to your account.
                </div>
              )}

              {paymentError && (
                <div className={styles.errorMsg} role="alert">
                  {paymentError}
                </div>
              )}

              {/* Shipping Address */}
              <div>
                <h3 className={styles.formTitle}>1. Shipping & Delivery</h3>

                {addresses.length > 0 && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="savedAddress">
                      Saved Addresses
                    </label>
                    <select
                      id="savedAddress"
                      value={selectedAddressId}
                      onChange={handleAddressSelect}
                      className="form-input"
                    >
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label ? `${a.label} — ` : ""}
                          {[a.line1, a.city, a.pincode].filter(Boolean).join(", ")}
                        </option>
                      ))}
                      <option value={NEW_ADDRESS}>Use a different address</option>
                    </select>
                  </div>
                )}

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

              {/* Payment */}
              <div style={{ marginTop: "var(--space-xl)" }}>
                <h3 className={styles.formTitle}>2. Payment</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--color-secondary)", padding: "var(--space-md)", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-sm)" }}>
                  Secure payment via Razorpay opens after you confirm shipping. UPI, cards, and netbanking are supported (test mode).
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
                disabled={isSubmitting || !user}
                className={styles.submitBtn}
              >
                {isSubmitting
                  ? submitLabel || "Processing Ledger..."
                  : `Place Order of ₹${grandTotal.toLocaleString()}`}
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
