"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/shared/ProductCard";
import Button from "@/components/ui/Button";
import { useCart } from "@/store/CartContext";
import MotionSection from "@/components/ui/MotionSection";
import styles from "../shop.module.css";

export default function ShopContent({ products = [], categories = [] }) {
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
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
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
        const matchesName = product.name?.toLowerCase().includes(query);
        const matchesDesc = product.description?.toLowerCase().includes(query);
        const matchesCat = product.categoryName?.toLowerCase().includes(query);
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

  const activeFilterCount = [
    selectedCategory !== "all",
    selectedPrice !== "all",
    showWishlistOnly,
  ].filter(Boolean).length;

  const categoryLabel =
    selectedCategory === "all"
      ? "All Products"
      : categories.find((c) => c.slug === selectedCategory)?.name || "Collection";

  return (
    <MotionSection as="main" className={`container ${styles.main}`} delay={0.2}>
      <div className={styles.layout}>
        {/* Filters — dropdown on mobile/tablet, sidebar on desktop */}
        <aside className={styles.sidebar}>
          <p className={styles.sidebarHeading}>Filters</p>
          <button
            type="button"
            className={styles.filtersToggle}
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="shop-filters-panel"
          >
            <span className={styles.filtersToggleLeft}>
              <span className={styles.filtersToggleLabel}>Filters</span>
              {activeFilterCount > 0 && (
                <span className={styles.filterBadge}>{activeFilterCount}</span>
              )}
              <span className={styles.filtersSummary}>{categoryLabel}</span>
            </span>
            <svg
              className={`${styles.filtersChevron} ${filtersOpen ? styles.filtersChevronOpen : ""}`}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          <div
            id="shop-filters-panel"
            className={`${styles.filtersPanel} ${filtersOpen ? styles.filtersPanelOpen : ""}`}
          >
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
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedCategory("all");
                    router.push("/shop");
                  }
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
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedCategory(cat.slug);
                      router.push(`/shop?category=${cat.slug}`);
                    }
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
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedPrice(opt.value);
                    }
                  }}
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
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    const val = !showWishlistOnly;
                    setShowWishlistOnly(val);
                    router.push(val ? "/shop?filter=wishlist" : "/shop");
                  }
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
          </div>

          <div
            className={`${styles.sidebarFooter} ${filtersOpen ? styles.sidebarFooterOpen : ""}`}
          >
            <Button
              variant="secondary"
              onClick={handleResetFilters}
              className={styles.clearBtn}
            >
              Clear Filters
            </Button>
          </div>
        </aside>

        {/* Content Area */}
        <section className={styles.content}>
          {/* Action Bar */}
          <div className={styles.actionBar}>
            <span className={styles.resultsCount}>
              {`Showing ${filteredProducts.length} piece${
                filteredProducts.length !== 1 ? "s" : ""
              }${searchQuery ? ` for "${searchQuery}"` : ""}`}
            </span>
            <div className={styles.sortRow}>
              <span className={styles.sortLabel}>Sort By:</span>
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

          {filteredProducts.length > 0 ? (
            <div className={styles.grid}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyBadge}>Coming Soon</span>
              <h3 className={styles.emptyTitle}>New Collection Arriving Soon</h3>
              <p className={styles.emptyText}>
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
