"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import Button from "@/components/ui/Button";
import { heroImages, testimonials } from "@/constants";
import { media } from "@/constants/media";
import Link from "next/link";
import styles from "@/features/home/home.module.css";

export default function HomeContent({ products = [] }) {
  const [activeTab, setActiveTab] = useState("best-sellers");
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Parallax only on larger screens — on mobile it pulls CTAs off the hero image
  const { scrollY } = useScroll();
  const [allowParallax, setAllowParallax] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    const sync = () => setAllowParallax(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const bgY = useTransform(scrollY, [0, 1000], [0, 80]);
  const contentY = useTransform(scrollY, [0, 1000], [0, -30]);

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter products for tabs
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 8);
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 8);
  const prepTools = products.filter((p) => p.category === "chopping-boards").slice(0, 8);

  const activeProducts =
    activeTab === "best-sellers" ? bestSellers :
    activeTab === "new-arrivals" ? newArrivals : prepTools;


  // Auto-slide testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [testimonials.length]);


  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 100 }}
      >
        <Header />
      </motion.div>
      <main className={styles.main}>
        
        {/* 1. Full-screen Cinematic Hero Section */}
        <section id="hero-section" className={styles.hero}>
          <motion.div style={allowParallax ? { y: bgY } : undefined} className={styles.heroBackground}>
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
            <motion.div style={allowParallax ? { y: contentY } : undefined} className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                <div>
                  <motion.span
                    style={{ display: "block" }}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    Shaped by Nature,
                  </motion.span>
                </div>
                <div>
                  <motion.span
                    className={styles.italicTitle}
                    style={{ display: "block" }}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.1, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
                  >
                    Finished by Hand
                  </motion.span>
                </div>
              </h1>
              
              <motion.p 
                className={styles.heroText}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
              >
                Discover the warmth and premium beauty of organic Acacia and Mango wood kitchenware. Sculpted with love, food-safe, and designed to elevate your culinary experience.
              </motion.p>
              
              <motion.div 
                className={styles.heroActions}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
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
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 4. Signature Collection Showcase - Premium Horizontal Grid */}
        <section className={styles.signatureSection}>
          <div className="container">
            <div className={styles.signatureHeader}>
              <div className={styles.categoryHeader}>
                <motion.h2
                  className={styles.categorySectionTitle}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  Artisanal Signatures
                </motion.h2>
                <motion.p
                  className={styles.categorySectionDesc}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.65, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
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
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
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

        {/* Atmosphere — image + story (All4home-inspired) */}
        <section className={styles.atmosphereSection}>
          <div className={`container ${styles.atmosphereGrid}`}>
            <div className={styles.atmosphereMedia}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={media.heroTray2}
                alt="Handcrafted wooden serving tray styled for a calm kitchen"
                className={styles.atmosphereImage}
              />
            </div>
            <div className={styles.atmosphereCopy}>
              <p className={styles.atmosphereEyebrow}>Choose your own</p>
              <h2 className={styles.atmosphereTitle}>
                Your <em className={styles.atmosphereEm}>cosy</em> atmosphere
              </h2>
              <div className={styles.atmosphereRule} aria-hidden="true" />
              <p className={styles.atmosphereText}>
                Soft grain, warm tones, and pieces made for everyday rituals —
                from morning prep to evening hosting. Build a kitchen that feels
                calm, considered, and uniquely yours.
              </p>
              <Link href="/about" className={styles.atmosphereCta}>
                Read all
                <svg className={styles.atmosphereCtaIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Premium Testimonials Slider */}
        <section className={styles.testimonialSection}>
          <div className={`container ${styles.testimonialShell}`}>
            <div className={styles.testimonialCard}>
              <button
                type="button"
                className={`${styles.testimonialNav} ${styles.testimonialNavPrev}`}
                onClick={() =>
                  setActiveTestimonial(
                    (prev) => (prev - 1 + testimonials.length) % testimonials.length
                  )
                }
                aria-label="Previous testimonial"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              <div className={styles.testimonialInner}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTestimonial}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.45 }}
                    className={styles.testimonialQuoteWrapper}
                  >
                    <p className={styles.quoteLead}>
                      <span className={styles.quoteMark} aria-hidden="true">&ldquo;</span>
                      <span className={styles.quoteWord}>
                        {testimonials[activeTestimonial].highlight || "Loved"}
                      </span>
                      <span className={styles.quoteMark} aria-hidden="true">&rdquo;</span>
                    </p>
                    <p className={styles.quote}>
                      {testimonials[activeTestimonial].quote}
                    </p>
                    <div className={styles.author}>
                      <h4 className={styles.authorName}>
                        {testimonials[activeTestimonial].name}
                      </h4>
                      <span className={styles.authorTitle}>
                        {testimonials[activeTestimonial].title}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className={styles.testimonialDots}>
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveTestimonial(idx)}
                      className={`${styles.dot} ${activeTestimonial === idx ? styles.activeDot : ""}`}
                      aria-label={`Go to testimonial ${idx + 1}`}
                      suppressHydrationWarning
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                className={`${styles.testimonialNav} ${styles.testimonialNavNext}`}
                onClick={() =>
                  setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
                }
                aria-label="Next testimonial"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Promise / features row */}
        <section className={styles.featuresSection}>
          <div className={`container ${styles.featuresGrid}`}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon} aria-hidden="true">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.66-4.96 1.47-7.65a.75.75 0 00-.746-.68H5.272M7.5 14.25L5.106 5.272M16.5 21a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm-9 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Curated collections</h3>
              <p className={styles.featureText}>
                Boards, trays, and organizers grouped for real kitchens — not cluttered catalogs.
              </p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon} aria-hidden="true">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v-2.052a2.25 2.25 0 00-1.07-1.916l-6.75-3.966a2.25 2.25 0 00-2.36 0L4.07 7.282A2.25 2.25 0 003 9.198v2.052m18 0V15a2.25 2.25 0 01-2.25 2.25h-1.5V21l-3.75-3.75H9.75A2.25 2.25 0 017.5 15v-3.75m13.5 0h-3.75m-9.75 0H3" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Ready for daily use</h3>
              <p className={styles.featureText}>
                Food-safe finishes and sturdy builds meant for chopping, serving, and hosting — every day.
              </p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon} aria-hidden="true">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Only the best wood</h3>
              <p className={styles.featureText}>
                Acacia and mango selected for grain, durability, and a warm finish that ages beautifully.
              </p>
            </div>
          </div>
        </section>

        {/* Promo banner — split panel with product focal */}
        <section className={styles.promoBanner}>
          <div className={styles.promoBannerBg} aria-hidden="true" />
          <div className={styles.promoRibbon} aria-hidden="true">
            <svg viewBox="0 0 1200 280" preserveAspectRatio="none" fill="none">
              <path
                d="M-40 210 C180 40, 320 240, 520 120 S820 40, 1040 160 S1280 220, 1240 80"
                stroke="url(#promoRibbonGrad)"
                strokeWidth="18"
                strokeLinecap="round"
                opacity="0.55"
              />
              <path
                d="M-20 230 C220 70, 360 250, 560 140 S860 55, 1080 175 S1300 235, 1260 95"
                stroke="url(#promoRibbonGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.35"
              />
              <defs>
                <linearGradient id="promoRibbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C9A27A" />
                  <stop offset="45%" stopColor="#8E5E41" />
                  <stop offset="100%" stopColor="#B8895F" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className={`container ${styles.promoBannerInner}`}>
            <div className={styles.promoCopy}>
              <p className={styles.promoEyebrow}>Everyday ready</p>
              <h2 className={styles.promoTitle}>Shop the collection</h2>
              <div className={styles.promoRule} aria-hidden="true" />
              <p className={styles.promoText}>
                Boards, trays, and serving pieces curated for calm kitchens —
                pick a finish, find your grain, and bring warmth to the table.
              </p>
              <Link href="/shop" className={styles.promoCta}>
                Buy now
              </Link>
            </div>

            <div className={styles.promoVisual}>
              <div className={styles.promoImageStage}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.promoOakTray}
                  alt="Oak serving tray from the Furnish collection"
                  className={styles.promoImage}
                />
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
