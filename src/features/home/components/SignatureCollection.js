"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/shared/ProductCard";
import { products } from "@/constants";
import styles from "../home.module.css";

export default function SignatureCollection() {
  const [activeTab, setActiveTab] = useState("best-sellers");

  // Filter products for tabs
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 8);
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 8);
  const prepTools = products.filter((p) => p.category === "chopping-boards").slice(0, 8);

  const activeProducts =
    activeTab === "best-sellers" ? bestSellers :
    activeTab === "new-arrivals" ? newArrivals : prepTools;

  return (
    <section className={styles.signatureSection}>
      <div className="container">
        <div className={styles.signatureHeader}>
          <div className={styles.categoryHeader}>
            <motion.h2
              className={styles.categorySectionTitle}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Artisanal Signatures
            </motion.h2>
            <motion.p
              className={styles.categorySectionDesc}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Celebrate rich natural grains and functional shapes with our highly sought-after kitchen blocks and serving platters.
            </motion.p>
          </div>

          {/* Minimalist Tab Navigation */}
          <div className={styles.tabContainer}>
            {[
              { slug: "best-sellers", label: "Best Sellers" },
              { slug: "new-arrivals", label: "New Arrivals" },
              { slug: "prep-tools", label: "Prep Boards" }
            ].map((tab) => {
              const isActive = activeTab === tab.slug;
              return (
                <button
                  key={tab.slug}
                  onClick={() => setActiveTab(tab.slug)}
                  className={`${styles.tabBtn} ${isActive ? styles.activeTab : ""}`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabLine"
                      className={styles.activeTabLine}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Showroom Grid with Tab Change Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={styles.showroomGrid}
          >
            {/* Left/First Column: Hero Masterpiece */}
            {activeProducts[0] && (
              <div className={styles.heroItem}>
                <ProductCard product={activeProducts[0]} variant="featured" />
              </div>
            )}

            {/* Right Column: Complementary Duo */}
            <div className={styles.duoColumn}>
              {activeProducts[1] && (
                <div className={styles.duoItem}>
                  <ProductCard product={activeProducts[1]} />
                </div>
              )}
              {activeProducts[2] && (
                <div className={styles.duoItem}>
                  <ProductCard product={activeProducts[2]} />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
