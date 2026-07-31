"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/store/CartContext";
import styles from "./ProductCard.module.css";

const materialMap = {
  "helsinki-acacia-board": "Acacia Wood",
  "mika-acacia-board": "Acacia Wood",
  "oslo-acacia-prep-board": "Acacia Wood",
  "artisanal-flat-board": "Acacia Wood",
  "artisan-charcuterie-board": "Acacia Hardwood",
  "romper-acacia-tray": "Oak Wood",
  "angled-handles-serving-tray": "Natural Hardwood",
  "footed-tea-serving-tray": "Solid Oak Wood"
};

export default function ProductCard({ product, variant = "default" }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.colors[0]);
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const materialTag = materialMap[product.id] || product.categoryName;
  const hasSecondImage = product.images && product.images.length > 1;
  const isFeatured = variant === "featured";

  return (
    <div className={`${styles.card} ${hasSecondImage ? styles.hasSecondImage : ""} ${isFeatured ? styles.featuredCard : ""}`}>
      {/* Image Wrap */}
      <Link href={`/products/${product.id}`} className={styles.imageLink}>
        <div className={styles.imageContainer}>
          {/* Badges */}
          {hasDiscount && <span className={styles.discountBadge}>Sale</span>}
          {product.isNewArrival && <span className={styles.newBadge}>New</span>}

          {/* Wishlist Trigger */}
          <button
            onClick={handleWishlistToggle}
            className={`${styles.wishlistBtn} ${inWishlist ? styles.activeWishlist : ""}`}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            suppressHydrationWarning
          >
            <svg
              width="16"
              height="16"
              fill={inWishlist ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>

          {/* Product Image or Premium Placeholder */}
          {product.images && product.images.length > 0 && product.images[0] ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[0]}
                alt={product.name}
                className={styles.image}
                loading="lazy"
              />

              {/* Product Image Secondary Detail (if exists) */}
              {hasSecondImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[1]}
                  alt={`${product.name} detail view`}
                  className={`${styles.image} ${styles.secondaryImage}`}
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className={styles.placeholderContainer}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={styles.placeholderIcon}>
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span className={styles.placeholderText}>Awaiting Craft Image</span>
            </div>
          )}

          {isFeatured && <div className={styles.gradientOverlay} />}

          {/* Showroom Add Action */}
          <button onClick={handleAddToCart} className={styles.quickAdd} suppressHydrationWarning>
            Discover &amp; Add
          </button>
        </div>
      </Link>

      {/* Detail Wrap */}
      <div className={styles.details}>
        <div className={styles.metaRow}>
          <span className={styles.category}>{product.categoryName}</span>
          {materialTag && <span className={styles.materialTag}>{materialTag}</span>}
        </div>
        
        <Link href={`/products/${product.id}`} className={styles.nameLink}>
          <h3 className={styles.name}>{product.name}</h3>
        </Link>

        {/* Product Specs (Dimensions, Material, Care) */}
        {product.specs && (
          <div className={styles.cardSpecs}>
            {product.specs.map((spec) => {
              if (["Dimensions", "Wood Type", "Material", "Care Instructions", "Care"].includes(spec.key)) {
                return (
                  <div key={spec.key} className={styles.cardSpecItem}>
                    <span className={styles.cardSpecLabel}>{spec.key}:</span>{" "}
                    <span className={styles.cardSpecValue}>{spec.value}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
        
        <div className={styles.priceContainer}>
          <span className={styles.price}>₹{product.price.toLocaleString()}</span>
          {hasDiscount && (
            <span className={styles.originalPrice}>
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
