"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "@/constants";
import StarRating from "@/components/ui/StarRating";
import styles from "../home.module.css";

export default function TestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-slide testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className={styles.testimonialSection}>
      <div className={styles.testimonialBackground}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {testimonials[activeTestimonial].image ? (
          <img
            src={testimonials[activeTestimonial].image}
            alt="Testimonial background"
            className={styles.testimonialBgImg}
          />
        ) : (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #181310 0%, #0d0907 100%)",
            opacity: 0.8
          }} />
        )}
        <div className={styles.testimonialBgOverlay} />
      </div>

      <div className="container">
        <div className={styles.testimonialSlider}>
          <StarRating
            rating={testimonials[activeTestimonial].stars}
            size={14}
            className={styles.stars}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className={styles.testimonialQuoteWrapper}
            >
              <p className={styles.quote}>
                &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
              </p>
              <div className={styles.author}>
                <h4 className={styles.authorName}>{testimonials[activeTestimonial].name}</h4>
                <span className={styles.authorTitle}>{testimonials[activeTestimonial].title}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Testimonial slider navigation dots */}
          <div className={styles.testimonialDots}>
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTestimonial(idx)}
                className={`${styles.dot} ${activeTestimonial === idx ? styles.activeDot : ""}`}
                aria-label={`Go to testimonial ${idx + 1}`}
                suppressHydrationWarning
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
