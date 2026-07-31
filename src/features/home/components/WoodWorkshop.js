"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { woodData } from "@/constants";
import styles from "../home.module.css";

export default function WoodWorkshop() {
  const [activeWood, setActiveWood] = useState("acacia");

  return (
    <section className={styles.woodWorkshopSection}>
      <div className="container">
        <SectionHeading
          title="The Material Edit"
          subtitle="Thoughtfully sourced and hand-finished, our objects are shaped from select timbers chosen for their strength, natural patterns, and enduring design."
          align="center"
        />

        <div className={styles.workshopContainer}>
          {/* Left Column: Interactive State Detail */}
          <div className={styles.workshopInfo}>
            <div className={styles.workshopTabs}>
              {Object.keys(woodData).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveWood(key)}
                  className={`${styles.workshopTabBtn} ${activeWood === key ? styles.workshopTabActive : ""}`}
                >
                  {woodData[key].name.split(" ")[0]}
                  {activeWood === key && (
                    <motion.div
                      layoutId="activeWorkshopLine"
                      className={styles.workshopTabLine}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeWood}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className={styles.woodTitle}>{woodData[activeWood].name}</h3>
                <p className={styles.woodDesc}>{woodData[activeWood].desc}</p>

                <div className={styles.woodSpecsGrid}>
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Texture & Pattern</span>
                    <span className={styles.specValue}>{woodData[activeWood].grain}</span>
                  </div>
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Structural Character</span>
                    <span className={styles.specValue}>{woodData[activeWood].density}</span>
                  </div>
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Natural Resilience</span>
                    <span className={styles.specValue}>{woodData[activeWood].waterResist}</span>
                  </div>
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>Lifestyle Fit</span>
                    <span className={styles.specValue}>{woodData[activeWood].bestFor}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: High-Fidelity Grain Display */}
          <div className={styles.woodVisual}>
            <AnimatePresence mode="wait">
              {woodData[activeWood].image ? (
                <motion.img
                  key={activeWood}
                  src={woodData[activeWood].image}
                  alt={`${woodData[activeWood].name} grain close-up`}
                  className={styles.woodGrainZoom}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ) : (
                <motion.div
                  key={activeWood}
                  className={styles.woodGrainZoom}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, #2b2017 0%, #15100b 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "absolute",
                    top: 0,
                    left: 0
                  }}
                >
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" style={{ color: "#d4af37", opacity: 0.2 }}>
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
            <div className={styles.woodMaterialOverlay}>
              <h4 className={styles.woodMaterialName}>{woodData[activeWood].name}</h4>
              <span className={styles.woodMaterialTag}>{woodData[activeWood].tagline}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
