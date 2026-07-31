"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to observe whether a selector target is intersecting the viewport.
 * Handles delay setups for client transitions and dynamic mounts.
 * @param {string} selector - Query selector target (e.g. '#hero-section').
 * @param {number} delay - Timeout offset to run query after render.
 * @returns {[boolean, boolean]} - [isIntersecting, elementExists]
 */
export function useElementIntersection(selector, delay = 100) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [elementExists, setElementExists] = useState(false);

  useEffect(() => {
    let observer = null;
    let timeoutId = null;

    const setupObserver = () => {
      const el = document.querySelector(selector);

      if (el) {
        setElementExists(true);
        // Default to intersecting when first located to prevent visual flash
        setIsIntersecting(true);

        observer = new IntersectionObserver(
          ([entry]) => {
            setIsIntersecting(entry.isIntersecting);
          },
          {
            threshold: 0,
            rootMargin: "0px",
          }
        );

        observer.observe(el);
      } else {
        setElementExists(false);
        setIsIntersecting(false);
      }
    };

    setupObserver();
    timeoutId = setTimeout(setupObserver, delay);

    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [selector, delay]);

  return [isIntersecting, elementExists];
}
