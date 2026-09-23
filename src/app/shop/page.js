import React, { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ShopContent from "@/features/products/components/ShopContent";
import { createClient } from "@/lib/supabase/server";
import { fetchAllProducts, fetchAllCategories } from "@/lib/supabase/queries";

export const metadata = {
  title: "Shop | Furnish",
  description:
    "Browse handcrafted Acacia and Mango wood kitchenware — chopping boards, serving platters and prep tools.",
};

export default async function ShopPage() {
  // Fetched here rather than in the browser so the catalog is in the HTML:
  // search engines and slow connections get products, not a loading message.
  const client = await createClient();
  const [products, categories] = await Promise.all([
    fetchAllProducts(client),
    fetchAllCategories(client),
  ]);

  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="container" style={{
          paddingTop: "calc(var(--header-height) + clamp(2rem, 6vw, 3.5rem))",
          paddingBottom: "clamp(3rem, 10vw, 11rem)",
          textAlign: "center",
          fontFamily: "var(--font-sans), sans-serif",
          color: "var(--color-secondary)",
          letterSpacing: "0.1em"
        }}>
          LOADING LUXURY CATALOG...
        </div>
      }>
        <ShopContent products={products} categories={categories} />
      </Suspense>
      <Footer />
    </>
  );
}
