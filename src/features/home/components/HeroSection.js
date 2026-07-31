"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { heroImages } from "@/constants";
import Button from "@/components/ui/Button";
import styles from "../home.module.css";

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Parallax layered depth values
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1000], [0, 80]);
  const contentY = useTransform(scrollY, [0, 1000], [0, -30]);

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero-section" className={styles.hero}>
      <motion.div style={{ y: bgY }} className={styles.heroBackground}>
        <AnimatePresence initial={false}>
          <motion.img
            key={currentImageIndex}
            src={heroImages[currentImageIndex]}
            alt="Luxury kitchenware showcase"
            className={styles.heroBgImg}
            initial={{ opacity: 0, scale: 1.03, x: -5, y: -5 }}
            animate={{ opacity: 1, scale: 1.00, x: 0, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.5, ease: "easeInOut" },
              scale: { duration: 5.2, ease: "linear" },
              x: { duration: 5.2, ease: "linear" },
              y: { duration: 5.2, ease: "linear" }
            }}
          />
        </AnimatePresence>
        <div className={styles.heroOverlay} />
      </motion.div>

      <div className={`container ${styles.heroContainer}`}>
        <motion.div style={{ y: contentY }} className={styles.heroContent}>
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{ display: "block" }}>Shaped by Nature,</span>
            <span className={styles.italicTitle} style={{ display: "block" }}>Finished by Hand</span>
          </motion.h1>

          <motion.p
            className={styles.heroText}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            Discover the warmth and premium beauty of organic Acacia and Mango wood kitchenware. Sculpted with love, food-safe, and designed to elevate your culinary experience.
          </motion.p>

          <motion.div
            className={styles.heroActions}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/shop">
              <motion.div whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}>
                <Button variant="primary" className={styles.heroCTA}>
                  <span>Explore Collection</span>
                  <svg className={styles.ctaArrow} width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
              </motion.div>
            </Link>
            <Link href="/about" className={styles.heroStoryLink}>
              Our Artisan Legacy
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
