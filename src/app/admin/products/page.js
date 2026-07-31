import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import styles from "../admin.module.css";
import ProductsTable from "./ProductsTable";

export const metadata = { title: "Products | Admin – Furnish" };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: products } = await admin
    .from("products")
    .select(
      `
      id, name, slug, price, stock, is_active, is_best_seller, is_new_arrival,
      categories(name, slug),
      product_images(url, position)
    `
    )
    .order("created_at", { ascending: false });

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Products</h1>
          <p className={styles.pageSub}>
            {products?.length ?? 0} product{products?.length !== 1 ? "s" : ""}{" "}
            in your catalog
          </p>
        </div>
        <Link href="/admin/products/new" className={styles.btnPrimary}>
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      <div className={styles.pageContent}>
        <div className={styles.tableCard}>
          <ProductsTable products={products || []} />
        </div>
      </div>
    </>
  );
}
