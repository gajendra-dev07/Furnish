"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/shared/ProductCard";
import Button from "@/components/ui/Button";
import { useCart } from "@/store/CartContext";
import MotionSection from "@/components/ui/MotionSection";
import { createClient } from "@/lib/supabase/client";
import { fetchAllProducts, fetchAllCategories } from "@/lib/supabase/queries";
import styles from "../shop.module.css";

export default function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { wishlist, isLoaded } = useCart();

  // Read URL params
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialFilter = searchParams.get("filter") || "";

  // Component State
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState("featured");
  const [showWishlistOnly, setShowWishlistOnly] = useState(
    initialFilter === "wishlist"
  );
  const [mounted, setMounted] = useState(false);

  // Data State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch products + categories from Supabase on mount
  useEffect(() => {
    async function load() {
      try {
        const client = createClient();
        if (!client) return;
        const [prods, cats] = await Promise.all([
          fetchAllProducts(client),
          fetchAllCategories(client),
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Sync state if URL changes
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "all");
    setSearchQuery(searchParams.get("search") || "");
    setShowWishlistOnly(searchParams.get("filter") === "wishlist");
  }, [searchParams]);

  // Handle resets
  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedPrice("all");
    setSearchQuery("");
    setSortBy("featured");
    setShowWishlistOnly(false);
    router.push("/shop");
  };

  // Filter & Sort Logic
  const filteredProducts = products
    .filter((product) => {
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesCat = product.categoryName.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) {
          return false;
        }
      }

      if (selectedPrice !== "all") {
        if (selectedPrice === "under-1000" && product.price >= 1000) return false;
        if (
          selectedPrice === "1000-2000" &&
          (product.price < 1000 || product.price > 2000)
        )
          return false;
        if (selectedPrice === "over-2000" && product.price <= 2000) return false;
      }

      if (showWishlistOnly) {
        const inWishlist = wishlist.some((w) => (w.id || w) === product.id);
        if (!inWishlist) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "newest") return 0; // already ordered by created_at desc
      return 0;
    });

  const priceOptions = [
    { label: "All Prices", value: "all" },
    { label: "Under ₹1,000", value: "under-1000" },
    { label: "₹1,000 – ₹2,000", value: "1000-2000" },
    { label: "Over ₹2,000", value: "over-2000" },
  ];

  return (
    <MotionSection as="main" className={`container ${styles.main}`} delay={0.2}>
      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {/* Category Filter */}
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Collection</h3>
            <div
              className={`${styles.filterOption} ${
                selectedCategory === "all" ? styles.activeOption : ""
              }`}
              onClick={() => {
                setSelectedCategory("all");
                router.push("/shop");
              }}
            >
              All Products
            </div>
            {categories.map((cat) => (
              <div
                key={cat.slug}
                className={`${styles.filterOption} ${
                  selectedCategory === cat.slug ? styles.activeOption : ""
                }`}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  router.push(`/shop?category=${cat.slug}`);
                }}
              >
                {cat.name}
              </div>
            ))}
          </div>

          {/* Price Filter */}
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Price Range</h3>
            {priceOptions.map((opt) => (
              <div
                key={opt.value}
                className={`${styles.filterOption} ${
                  selectedPrice === opt.value ? styles.activeOption : ""
                }`}
                onClick={() => setSelectedPrice(opt.value)}
              >
                <span className={styles.checkbox}>
                  {selectedPrice === opt.value && (
                    <svg
                      width="10"
                      height="10"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  )}
                </span>
                {opt.label}
              </div>
            ))}
          </div>

          {/* Wishlist Only Filter */}
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Favourites</h3>
            <div
              className={`${styles.filterOption} ${
                showWishlistOnly ? styles.activeOption : ""
              }`}
              onClick={() => {
                const val = !showWishlistOnly;
                setShowWishlistOnly(val);
                router.push(val ? "/shop?filter=wishlist" : "/shop");
              }}
            >
              <span className={styles.checkbox}>
                {showWishlistOnly && (
                  <svg
                    width="10"
                    height="10"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                )}
              </span>
              <span suppressHydrationWarning>
                Show Wishlist ({mounted && isLoaded ? wishlist.length : 0})
              </span>
            </div>
          </div>

          {/* Clear Button */}
          <Button
            variant="secondary"
            onClick={handleResetFilters}
            style={{ marginTop: "var(--space-sm)" }}
          >
            Clear Filters
          </Button>
        </aside>

        {/* Content Area */}
        <section className={styles.content}>
          {/* Action Bar */}
          <div className={styles.actionBar}>
            <span className={styles.resultsCount}>
              {loading
                ? "Loading products…"
                : `Showing ${filteredProducts.length} piece${
                    filteredProducts.length !== 1 ? "s" : ""
                  }${searchQuery ? ` for "${searchQuery}"` : ""}`}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
              }}
            >
              <span className={styles.resultsCount}>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div
              className={styles.grid}
              style={{ opacity: 0.4, pointerEvents: "none" }}
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "380px",
                    background: "var(--color-bg-secondary)",
                    borderRadius: "var(--radius-xs)",
                    border: "1px solid var(--color-border)",
                  }}
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={styles.grid}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  border: "1px solid #d4af37",
                  borderRadius: "4px",
                  color: "#96702e",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                COMING SOON
              </span>
              <h3 className={styles.emptyTitle}>New Collection Arriving Soon</h3>
              <p
                className={styles.emptyText}
                style={{
                  maxWidth: "480px",
                  margin: "0 auto 24px auto",
                  lineHeight: "1.6",
                }}
              >
                We are currently crafting new wooden pieces for this category.
                Check back soon or explore our available products below.
              </p>
              <Button variant="primary" onClick={handleResetFilters}>
                View All Products
              </Button>
            </div>
          )}
        </section>
      </div>
    </MotionSection>
  );
}
