"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to detect when the window scroll position exceeds a given threshold.
 * @param {number} threshold - Scroll threshold in pixels.
 * @returns {boolean} - True if scroll Y is greater than the threshold.
 */
export function useScrollThreshold(threshold = 20) {
  const [isPassed, setIsPassed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsPassed(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check on mount
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return isPassed;
}
