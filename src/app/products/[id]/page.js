import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductDetailContent from "@/features/products/components/ProductDetailContent";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { fetchProductBySlug } from "@/lib/supabase/queries";

export async function generateMetadata({ params }) {
  const { id: slug } = await params;
  const client = await createClient();
  const product = await fetchProductBySlug(client, slug);

  return {
    title: product ? `${product.name} | Furnish` : "Product Not Found | Furnish",
    description: product
      ? product.description
      : "Explore handcrafted wooden kitchenware.",
  };
}

export default async function ProductPage({ params }) {
  const { id: slug } = await params;
  const client = await createClient();
  const product = await fetchProductBySlug(client, slug);

  if (!product) {
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
            <h2
              className="heading-hero"
              style={{ fontSize: "2rem" }}
            >
              Product Not Found
            </h2>
            <p
              style={{
                marginBottom: "var(--space-lg)",
                color: "var(--color-secondary)",
              }}
            >
              The product you requested is currently unavailable.
            </p>
            <Link href="/shop">
              <Button variant="primary">Return to Catalog</Button>
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
      <ProductDetailContent product={product} />
      <Footer />
    </>
  );
}
