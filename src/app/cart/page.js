"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SectionHeading from "@/components/ui/SectionHeading";
import MotionSection from "@/components/ui/MotionSection";
import Button from "@/components/ui/Button";
import { useCart } from "@/store/CartContext";
import styles from "@/features/cart/cart.module.css";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    isLoaded
  } = useCart();

  if (!isLoaded) {
    return (
      <>
        <Header />
        <main className={`container ${styles.main}`}>
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            LOADING SHOPPING BAG...
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const tax = cartSubtotal * 0.12;
  const grandTotal = cartSubtotal + tax;

  return (
    <>
      <Header />
      <MotionSection as="main" className={`container ${styles.main}`} delay={0.2}>
        <SectionHeading
          badge="Shopping Bag"
          title="Review Your Order"
          subtitle="Review the items in your basket before proceeding to secure checkout."
        />

        {cart.length > 0 ? (
          <div className={styles.grid}>
            {/* Items Column */}
            <div className={styles.itemsList}>
              {cart.map((item, index) => (
                <div key={`${item.product.id}-${item.selectedColor}-${index}`} className={styles.cartItem}>
                  {/* Image */}
                  <div className={styles.itemImageContainer}>
                    {item.product.images && item.product.images.length > 0 && item.product.images[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className={styles.itemImg}
                      />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, #1f1814 0%, #0e0b09 100%)",
                        color: "#d4af37",
                        fontFamily: "var(--font-sans), sans-serif",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        letterSpacing: "0.05em",
                        border: "1px solid rgba(212, 175, 55, 0.1)",
                        borderRadius: "var(--radius-xs)",
                        aspectRatio: "1"
                      }}>
                        {item.product.name ? item.product.name.charAt(0) : "W"}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.product.name}</h3>
                    <span className={styles.itemMeta}>Collection: {item.product.categoryName}</span>
                    <span className={styles.itemMeta}>Selected Finish: {item.selectedColor}</span>
                    <span className={styles.itemPrice}>
                      ₹{item.product.price.toLocaleString()} each
                    </span>

                    {/* Actions Row */}
                    <div className={styles.actionsRow}>
                      {/* Qty Selector */}
                      <div 
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          border: "1px solid var(--color-border)", 
                          borderRadius: "var(--radius-xs)",
                          height: "32px",
                          backgroundColor: "var(--color-bg-primary)"
                        }}
                      >
                        <button
                          style={{ width: "30px", height: "100%", color: "var(--color-secondary)" }}
                          onClick={() => updateCartQuantity(item.product.id, item.selectedColor, item.quantity - 1)}
                        >
                          —
                        </button>
                        <span style={{ width: "30px", textAlign: "center", fontSize: "0.8125rem", fontFamily: "var(--font-sans)" }}>
                          {item.quantity}
                        </span>
                        <button
                          style={{ width: "30px", height: "100%", color: "var(--color-secondary)" }}
                          onClick={() => updateCartQuantity(item.product.id, item.selectedColor, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedColor)}
                        className={styles.removeBtn}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Subtotal right-align */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    minWidth: "80px"
                  }}>
                    <span style={{
                      fontFamily: "var(--font-sans), sans-serif",
                      fontWeight: 600,
                      fontSize: "1rem"
                    }}>
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Column */}
            <div className={styles.summaryPanel}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>
              
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{cartSubtotal.toLocaleString()}</span>
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
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>Your Shopping Bag is Empty</h3>
            <p className={styles.emptyText}>
              Explore our handcrafted kitchenware collections to find the perfect wooden chopping boards, platters, and organizers for your kitchen.
            </p>
            <Link href="/shop">
              <Button variant="primary">Explore Catalog</Button>
            </Link>
          </div>
        )}
      </MotionSection>
      <Footer />
    </>
  );
}
