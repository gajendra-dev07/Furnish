"use client";

import React, { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ShopContent from "@/features/products/components/ShopContent";

export default function ShopPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <div className="container" style={{
          paddingTop: "180px", 
          paddingBottom: "180px", 
          textAlign: "center", 
          fontFamily: "var(--font-sans), sans-serif",
          color: "var(--color-secondary)",
          letterSpacing: "0.1em"
        }}>
          LOADING LUXURY CATALOG...
        </div>
      }>
        <ShopContent />
      </Suspense>
      <Footer />
    </>
  );
}
