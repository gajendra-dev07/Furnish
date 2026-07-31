"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import ProductCard from "./ProductCard";
import styles from "./ProductSlider.module.css";

export default function ProductSlider({ title, products }) {
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const scrollAnimRef = useRef(null);
  const isHoveredRef = useRef(false);
  const [isHovered, setIsHovered] = useState(false);

  const N = products.length;

  // Clone products into [prev, main, next] to support infinite looping
  const extendedProducts = [
    ...products.map((p, i) => ({ ...p, uniqueKey: `${p.id}-prev-${i}` })),
    ...products.map((p, i) => ({ ...p, uniqueKey: `${p.id}-main-${i}` })),
    ...products.map((p, i) => ({ ...p, uniqueKey: `${p.id}-next-${i}` }))
  ];

  // Keep isHoveredRef in sync
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  const getItemWidth = useCallback(() => {
    const container = containerRef.current;
    if (!container || !container.children.length) return 0;
    const first = container.children[0];
    const second = container.children[1];
    if (!second) return first.getBoundingClientRect().width;
    return second.getBoundingClientRect().left - first.getBoundingClientRect().left;
  }, []);

  const smoothScrollTo = useCallback((targetLeft, duration = 800) => {
    const container = containerRef.current;
    if (!container) return;

    if (scrollAnimRef.current) {
      cancelAnimationFrame(scrollAnimRef.current);
      scrollAnimRef.current = null;
    }

    // Temporarily disable scroll snap so it doesn't fight the animation
    container.style.scrollSnapType = "none";

    const startLeft = container.scrollLeft;
    const distance = targetLeft - startLeft;
    if (Math.abs(distance) < 1) {
      container.style.scrollSnapType = "x mandatory";
      return;
    }

    const startTime = performance.now();

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      container.scrollLeft = startLeft + distance * eased;

      if (progress < 1) {
        scrollAnimRef.current = requestAnimationFrame(step);
      } else {
        container.scrollLeft = targetLeft;
        container.style.scrollSnapType = "x mandatory";
        scrollAnimRef.current = null;
      }
    };

    scrollAnimRef.current = requestAnimationFrame(step);
  }, []);

  const slideByOne = useCallback((direction) => {
    const container = containerRef.current;
    if (!container) return;
    const itemWidth = getItemWidth();
    if (itemWidth <= 0) return;

    // Cancel any in-flight animation first
    if (scrollAnimRef.current) {
      cancelAnimationFrame(scrollAnimRef.current);
      scrollAnimRef.current = null;
    }

    const currentScroll = container.scrollLeft;
    const targetLeft = currentScroll + direction * itemWidth;

    smoothScrollTo(targetLeft, 800);
  }, [getItemWidth, smoothScrollTo]);

  const handlePrev = useCallback(() => slideByOne(-1), [slideByOne]);
  const handleNext = useCallback(() => slideByOne(1), [slideByOne]);

  // Debounced boundary snap: when scrolling settles, teleport back to the
  // middle copy if we've drifted into the prev or next clone region.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        if (!containerRef.current) return;
        const c = containerRef.current;
        const itemWidth = getItemWidth();
        if (itemWidth <= 0) return;

        const mainStart = itemWidth * N;
        const mainEnd = itemWidth * 2 * N;
        const regionWidth = mainEnd - mainStart;

        if (c.scrollLeft >= mainEnd) {
          c.scrollLeft = c.scrollLeft - regionWidth;
        } else if (c.scrollLeft < mainStart) {
          c.scrollLeft = c.scrollLeft + regionWidth;
        }
      }, 200);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
    };
  }, [N, getItemWidth]);

  // Center scroll position on the main copy on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const init = () => {
      const itemWidth = getItemWidth();
      if (itemWidth > 0) {
        container.scrollLeft = itemWidth * N;
      } else {
        requestAnimationFrame(init);
      }
    };
    // Small delay to let layout settle
    requestAnimationFrame(init);
  }, [N, getItemWidth]);

  // Autoplay: slide every 2.5 seconds, paused on hover
  useEffect(() => {
    const interval = setInterval(() => {
      if (isHoveredRef.current) return;
      slideByOne(1);
    }, 2500);

    return () => clearInterval(interval);
  }, [slideByOne]);

  if (!products || products.length === 0) return null;

  return (
    <section className={styles.sliderSection}>
      <div className="container">
        <h2 className={styles.sliderTitle}>{title}</h2>

        <div
          className={styles.sliderWrapper}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div ref={containerRef} className={styles.scrollContainer}>
            {extendedProducts.map((product) => (
              <div key={product.uniqueKey} className={styles.sliderItem}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className={styles.navigation}>
          <button
            onClick={handlePrev}
            className={styles.navButton}
            aria-label="Previous slide"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className={styles.navButton}
            aria-label="Next slide"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
