import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
import Link from "next/link";
import Button from "@/components/ui/Button";
import styles from "@/features/home/home.module.css";
import { createClient } from "@/lib/supabase/server";
import {
  fetchCategoryBySlug,
  fetchProductsByCategory,
} from "@/lib/supabase/queries";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const client = await createClient();
  const category = await fetchCategoryBySlug(client, slug);

  return {
    title: category
      ? `${category.name} Collection | Furnish`
      : "Collection Not Found | Furnish",
    description: category
      ? category.description
      : "Browse our handcrafted wooden kitchenware.",
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const client = await createClient();

  const [category, categoryProducts] = await Promise.all([
    fetchCategoryBySlug(client, slug),
    fetchProductsByCategory(client, slug),
  ]);

  if (!category) {
    return (
      <>
        <Header />
        <main
          style={{
            paddingTop: "180px",
            minHeight: "calc(100vh - 80px)",
            textAlign: "center",
          }}
        >
          <div className="container">
            <h2 className="heading-hero" style={{ fontSize: "2rem" }}>
              Collection Not Found
            </h2>
            <p
              style={{
                marginBottom: "var(--space-lg)",
                color: "var(--color-secondary)",
              }}
            >
              We could not find the collection you are looking for.
            </p>
            <Link href="/categories">
              <Button variant="primary">Return to Collections</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ paddingTop: "120px", minHeight: "calc(100vh - 80px)" }}>
        <div className="container">
          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2xs)",
              marginBottom: "var(--space-lg)",
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "0.75rem",
              color: "var(--color-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/categories">Collections</Link>
            <span>/</span>
            <span style={{ color: "var(--color-primary)" }}>
              {category.name}
            </span>
          </div>

          <SectionHeading
            badge="Collection"
            title={category.name}
            subtitle={category.description}
            align="left"
          />

          {categoryProducts.length > 0 ? (
            <div
              className={styles.productGrid}
              style={{ marginTop: "var(--space-xl)" }}
            >
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-3xl) 0",
                backgroundColor: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-xs)",
              }}
            >
              <p
                style={{
                  color: "var(--color-secondary)",
                  marginBottom: "var(--space-md)",
                }}
              >
                No products are currently available in this collection.
              </p>
              <Link href="/shop">
                <Button variant="primary">Browse All Products</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
