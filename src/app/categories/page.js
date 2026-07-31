import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SectionHeading from "@/components/ui/SectionHeading";
import MotionSection from "@/components/ui/MotionSection";
import Link from "next/link";
import styles from "@/features/home/home.module.css";
import { createClient } from "@/lib/supabase/server";
import { fetchAllCategories } from "@/lib/supabase/queries";

export const metadata = {
  title: "Collections | Furnish",
  description:
    "Browse our handcrafted wooden kitchenware collections — chopping boards, serving platters, utensils and more.",
};

export default async function CategoriesPage() {
  const client = await createClient();
  const categories = await fetchAllCategories(client);

  return (
    <>
      <Header />
      <MotionSection
        as="main"
        className="container"
        delay={0.2}
        style={{ paddingTop: "120px", minHeight: "calc(100vh - 80px)" }}
      >
        <SectionHeading
          badge="Luxury Selections"
          title="Our Collections"
          subtitle="Explore our curated collections, shaped by nature and finished by hand."
        />
        <div
          className={styles.categoryGrid}
          style={{ marginTop: "var(--space-xl)" }}
        >
          {categories.map((cat, index) => (
            <div
              key={cat.slug}
              className={`${styles.gridCard} ${
                index === 0
                  ? styles.heroCard
                  : index === 1
                  ? styles.cardMediumFirst
                  : index === 2
                  ? styles.cardMediumSecond
                  : styles.cardWide
              }`}
            >
              <Link
                href={`/shop?category=${cat.slug}`}
                className={styles.categoryCard}
              >
                <div className={styles.categoryImgWrap}>
                  {cat.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className={styles.categoryImg}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        background:
                          "linear-gradient(135deg, #221c17 0%, #110d0a 100%)",
                        border: "1px solid rgba(212, 175, 55, 0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.75"
                        style={{ color: "#d4af37", opacity: 0.15 }}
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                  )}
                  <div className={styles.categoryCardOverlay} />
                </div>
                <div className={styles.categoryInfoOverlay}>
                  <span className={styles.categoryIndex}>
                    0{index + 1} &bull; {cat.count} Items
                  </span>
                  <h3 className={styles.categoryName}>
                    {cat.name}
                    <svg
                      className={styles.arrowIcon}
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                      />
                    </svg>
                  </h3>
                  <p className={styles.categoryCardDesc}>{cat.description}</p>
                  <span className={styles.exploreBadge}>Browse Collection</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </MotionSection>
      <Footer />
    </>
  );
}
