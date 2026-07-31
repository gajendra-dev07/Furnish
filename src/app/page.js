"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import ProductSlider from "@/components/shared/ProductSlider";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { heroImages, woodData, testimonials } from "@/constants";
import Link from "next/link";
import styles from "@/features/home/home.module.css";
import { createClient } from "@/lib/supabase/client";
import { fetchAllProducts } from "@/lib/supabase/queries";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("best-sellers");
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeWood, setActiveWood] = useState("acacia");
  const [allProducts, setAllProducts] = useState([]);

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

  // Fetch products from Supabase
  useEffect(() => {
    async function load() {
      try {
        const client = createClient();
        if (!client) return;
        const prods = await fetchAllProducts(client);
        setAllProducts(prods);
      } catch (err) {
        console.error("Failed to load homepage products:", err);
      }
    }
    load();
  }, []);

  // Filter products for tabs
  const bestSellers = allProducts.filter((p) => p.isBestSeller).slice(0, 8);
  const newArrivals = allProducts.filter((p) => p.isNewArrival).slice(0, 8);
  const prepTools = allProducts.filter((p) => p.category === "chopping-boards").slice(0, 8);

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
                <Link href="/about" className={styles.heroStoryLink}>
                  Our Artisan Legacy
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

        {/* 3. Wood Material & Grain Selection Workshop */}
        <section className={styles.woodWorkshopSection}>
          <div className="container">
            <SectionHeading
              title="Know Your Grain"
              subtitle="We build tools using specific woods. Choose a wood type below to explore its organic properties."
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
                        <span className={styles.specLabel}>Wood Grain Pattern</span>
                        <span className={styles.specValue}>{woodData[activeWood].grain}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Volumetric Density</span>
                        <span className={styles.specValue}>{woodData[activeWood].density}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Moisture Resistance</span>
                        <span className={styles.specValue}>{woodData[activeWood].waterResist}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Recommended Use</span>
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

        {/* Product Sliders & Infinite Ticker Section */}




        {/* 7. Premium Testimonials Slider */}
        <section className={styles.testimonialSection}>
          <div className={styles.testimonialBackground}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {testimonials[activeTestimonial]?.image ? (
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
              
              <div className={styles.stars}>
                {[...Array(testimonials[activeTestimonial].stars)].map((_, i) => (
                  <svg key={i} width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

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

      </main>
      <Footer />
    </>
  );
}
