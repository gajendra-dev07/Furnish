"use client";

import { useEffect } from "react";

/**
 * Custom hook to lock the body scroll (useful for overlays, mobile drawers).
 * @param {boolean} isLocked - True if scroll lock is active.
 */
export function useScrollLock(isLocked) {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isLocked]);
}
