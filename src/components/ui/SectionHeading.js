"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./SectionHeading.module.css";

export default function SectionHeading({
  title,
  subtitle,
  badge,
  align = "center", // center, left
  className = "",
}) {
  const containerClass = `${styles.container} ${styles[align]} ${className}`;

  return (
    <motion.div 
      className={containerClass}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h2 
        className={styles.title}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {title}
      </motion.h2>

      {subtitle && <motion.p 
        className={styles.subtitle}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {subtitle}
      </motion.p>}
    </motion.div>
  );
}
