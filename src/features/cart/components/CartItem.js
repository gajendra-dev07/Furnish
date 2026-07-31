"use client";

import React from "react";
import styles from "../cart.module.css";

/**
 * CartItem renders a single item line in the shopping bag.
 * @param {object} props
 * @param {object} props.item - Cart item data.
 * @param {number} props.index - Index in the list (for key generation).
 * @param {function} props.onUpdateQty - Event handler to change quantity.
 * @param {function} props.onRemove - Event handler to delete the item.
 */
export default function CartItem({ item, index, onUpdateQty, onRemove }) {
  const { product, quantity, selectedColor } = item;

  return (
    <div className={styles.cartItem}>
      {/* Image */}
      <div className={styles.itemImageContainer}>
        {product.images && product.images.length > 0 && product.images[0] ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.images[0]}
            alt={product.name}
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
            {product.name ? product.name.charAt(0) : "W"}
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.itemInfo}>
        <h3 className={styles.itemName}>{product.name}</h3>
        <span className={styles.itemMeta}>Collection: {product.categoryName}</span>
        <span className={styles.itemMeta}>Selected Finish: {selectedColor}</span>
        <span className={styles.itemPrice}>
          ₹{product.price.toLocaleString()} each
        </span>

        {/* Actions Row */}
        <div className={styles.actionsRow}>
          {/* Qty Selector */}
          <div className={styles.qtySelector}>
            <button
              className={styles.qtyBtn}
              onClick={() => onUpdateQty(product.id, selectedColor, quantity - 1)}
              aria-label="Decrease quantity"
            >
              —
            </button>
            <span className={styles.qtyValue}>
              {quantity}
            </span>
            <button
              className={styles.qtyBtn}
              onClick={() => onUpdateQty(product.id, selectedColor, quantity + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            onClick={() => onRemove(product.id, selectedColor)}
            className={styles.removeBtn}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Subtotal right-align */}
      <div className={styles.itemTotal}>
        <span className={styles.totalPrice}>
          ₹{(product.price * quantity).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
