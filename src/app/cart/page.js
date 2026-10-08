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
        <Footer flush={true} />
      </>
    );
  }

  const grandTotal = cartSubtotal;


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
                  <Link href={`/products/${item.product.id}`} className={styles.itemImageContainer}>
                    {item.product.images && item.product.images.length > 0 && item.product.images[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className={styles.itemImg}
                      />
                    ) : (
                      <div className={styles.itemImgFallback}>
                        {item.product.name ? item.product.name.charAt(0) : "W"}
                      </div>
                    )}
                  </Link>

                  {/* Info & Controls */}
                  <div className={styles.itemInfo}>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemTitleGroup}>
                        <Link href={`/products/${item.product.id}`} className={styles.itemNameLink}>
                          <h3 className={styles.itemName}>{item.product.name}</h3>
                        </Link>
                        {item.product.categoryName && (
                          <span className={styles.itemCategory}>{item.product.categoryName}</span>
                        )}
                        {item.selectedColor && (
                          <span className={styles.itemMeta}>
                            Selected Finish: <strong>{item.selectedColor}</strong>
                          </span>
                        )}
                        <span className={styles.itemUnitPrice}>
                          ₹{item.product.price.toLocaleString()} each
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id, item.selectedColor)}
                        className={styles.removeBtn}
                        aria-label={`Remove ${item.product.name} from cart`}
                        title="Remove item"
                      >
                        <span className={styles.removeIcon} aria-hidden="true">✕</span>
                        <span className={styles.removeText}>Remove</span>
                      </button>
                    </div>

                    {/* Bottom Row: Stepper + Total Price */}
                    <div className={styles.itemFooter}>
                      <div className={styles.qtyStepper}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateCartQuantity(item.product.id, item.selectedColor, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          —
                        </button>
                        <span className={styles.qtyValue}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateCartQuantity(item.product.id, item.selectedColor, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className={styles.itemSubtotalBlock}>
                        <span className={styles.itemSubtotalLabel}>Total</span>
                        <span className={styles.itemSubtotalPrice}>
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
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

              <div className={styles.totalRow}>
                <span>Estimated total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>

              <p style={{ fontSize: "0.8rem", color: "var(--color-secondary)", marginTop: "6px", marginBottom: "16px", lineHeight: "1.4" }}>
                Tax included. Shipping and discounts calculated at checkout.
              </p>


              <Link href="/checkout">
                <Button variant="primary" className={styles.checkoutBtn}>
                  Proceed to Checkout
                </Button>
              </Link>

              <div className={styles.paymentBadges}>
                <span>🔒 Secure Checkout — UPI, Cards, Netbanking</span>
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
      <Footer flush={true} />
    </>
  );
}
