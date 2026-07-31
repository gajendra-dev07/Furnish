"use client";

import React from "react";
import { motion } from "framer-motion";

export default function MotionSection({
  children,
  className = "",
  delay = 0.1,
  duration = 0.6,
  as = "div",
  ...props
}) {
  // Use static component references to prevent Next.js SSR build/prerendering errors
  // with dynamic proxy getter lookups like motion[as] in framer-motion v12.
  const Component = as === "main" ? motion.main : motion.div;
  
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </Component>
  );
}
