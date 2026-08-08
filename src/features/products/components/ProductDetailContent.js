"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/store/CartContext";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/shared/ProductCard";
import { createClient } from "@/lib/supabase/client";
import { fetchProductsByCategory } from "@/lib/supabase/queries";
import styles from "../productDetail.module.css";

export default function ProductDetailContent({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState([]);
  
  // Accordion Toggles
  const [openSections, setOpenSections] = useState({
    details: true,
    specs: false,
    care: false,
  });

  useEffect(() => {
    async function loadRelated() {
      try {
        const client = createClient();
        if (!client || !product.category) return;
        const list = await fetchProductsByCategory(client, product.category);
        setRelated(
          list.filter((p) => p.id !== product.id).slice(0, 4)
        );
      } catch (err) {
        console.error("Failed to load related products:", err);
      }
    }
    loadRelated();
  }, [product.category, product.id]);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleQtyChange = (type) => {
    if (type === "dec") {
      setQuantity((q) => (q > 1 ? q - 1 : 1));
    } else {
      setQuantity((q) => q + 1);
    }
  };

  const isFavorite = isInWishlist(product.id);

  return (
    <main className={`container ${styles.main}`}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop">Shop</Link>
        <span>/</span>
        <Link href={`/categories/${product.category}`}>{product.categoryName}</Link>
        <span>/</span>
        <span style={{ color: "var(--color-primary)" }}>{product.name}</span>
      </div>

      {/* Main Details Grid */}
      <div className={styles.grid}>
        {/* Left Column: Image Gallery */}
        <div className={styles.gallery}>
          {product.images && product.images.length > 0 && (product.images[activeImgIndex] || product.images[0]) ? (
            <>
              <div className={styles.mainImageContainer}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images[activeImgIndex] || product.images[0]}
                  alt={product.name}
                  className={styles.mainImage}
                />
              </div>
              {product.images.length > 1 && (
                <div className={styles.thumbnails}>
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImgIndex(index)}
                      className={`${styles.thumbnailBtn} ${
                        activeImgIndex === index ? styles.activeThumbnail : ""
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="Thumbnail view" className={styles.thumbnailImg} />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.mainImageContainer} style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              background: "linear-gradient(135deg, #1f1814 0%, #0e0b09 100%)", 
              minHeight: "400px", 
              border: "1px solid rgba(212, 175, 55, 0.1)",
              borderRadius: "var(--radius-sm)",
              width: "100%"
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#d4af37", marginBottom: "16px", opacity: 0.8 }}>
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span style={{ fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#a89f94" }}>
                Awaiting Craft Showcase
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Info & Buy Actions */}
        <div className={styles.infoPanel}>
          <span className={styles.category}>{product.categoryName}</span>
          <h1 className={styles.title}>{product.name}</h1>
          
          <div className={styles.priceContainer}>
            <span className={styles.price}>₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <p className={styles.description}>{product.description}</p>

          {/* Color swatches */}
          <div>
            <h4 className={styles.optionTitle}>Finish / Color: {selectedColor}</h4>
            <div className={styles.colorSwatches}>
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`${styles.colorBtn} ${
                    selectedColor === color ? styles.activeColor : ""
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Purchase Actions */}
          <div className={styles.purchaseActions}>
            {/* Quantity */}
            <div className={styles.qtyContainer}>
              <button
                className={styles.qtyBtn}
                onClick={() => handleQtyChange("dec")}
                aria-label="Decrease quantity"
              >
                —
              </button>
              <span className={styles.qtyVal}>{quantity}</span>
              <button
                className={styles.qtyBtn}
                onClick={() => handleQtyChange("inc")}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add to Cart */}
            <Button
              variant="primary"
              className={styles.cartBtn}
              onClick={() => addToCart(product, quantity, selectedColor)}
            >
              Add to Shopping Cart
            </Button>

            {/* Wishlist Toggle */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`${styles.wishlistBtn} ${isFavorite ? styles.inWishlist : ""}`}
              aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
              title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg width="20" height="20" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>

          {/* Accordion Specification Tabs */}
          <div className={styles.accordion}>
            {/* Item 1: Details */}
            <div className={`${styles.accordionItem} ${openSections.details ? styles.accordionOpen : ""}`}>
              <button className={styles.accordionHeader} onClick={() => toggleSection("details")}>
                <span>Product Features</span>
                <span className={styles.accordionIcon}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </span>
              </button>
              <div className={styles.accordionBody}>
                <ul className={styles.featureList}>
                  {product.features.map((feat, i) => (
                    <li key={i} className={styles.featureItem}>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Item 2: Specs */}
            <div className={`${styles.accordionItem} ${openSections.specs ? styles.accordionOpen : ""}`}>
              <button className={styles.accordionHeader} onClick={() => toggleSection("specs")}>
                <span>Dimensions & Details</span>
                <span className={styles.accordionIcon}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </span>
              </button>
              <div className={styles.accordionBody}>
                <table className={styles.specTable}>
                  <tbody>
                    {product.specs.map((spec, i) => (
                      <tr key={i} className={styles.specRow}>
                        <td className={styles.specKey}>{spec.key}</td>
                        <td className={styles.specVal}>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Item 3: Care & Delivery */}
            <div className={`${styles.accordionItem} ${openSections.care ? styles.accordionOpen : ""}`}>
              <button className={styles.accordionHeader} onClick={() => toggleSection("care")}>
                <span>Delivery & Care</span>
                <span className={styles.accordionIcon}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </span>
              </button>
              <div className={styles.accordionBody}>
                <p className={styles.description} style={{ fontSize: "0.8125rem" }}>
                  <strong>Artisanal Shipping:</strong> Free shipping across India. Safely packed in eco-friendly protective packaging. Items are delivered in 4–7 business days.
                  <br /><br />
                  <strong>Return Policy:</strong> 7-day hassle-free replacement if the product is damaged or defective during transit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {related.length > 0 && (
        <section className={styles.relatedProducts}>
          <h2 className={styles.relatedTitle}>Coordinating Designs</h2>
          <div className={styles.relatedGrid}>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
