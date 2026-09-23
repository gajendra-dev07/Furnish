import React from "react";
import HomeContent from "@/features/home/components/HomeContent";
import { createClient } from "@/lib/supabase/server";
import { fetchAllProducts } from "@/lib/supabase/queries";

export default async function HomePage() {
  // Fetched on the server so the featured products are in the initial HTML
  // rather than appearing only after the browser runs a second request.
  const client = await createClient();
  const products = await fetchAllProducts(client);

  return <HomeContent products={products} />;
}
