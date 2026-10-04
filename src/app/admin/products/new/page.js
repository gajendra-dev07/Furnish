import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import styles from "../../admin.module.css";
import ProductForm from "../ProductForm";

export const metadata = { title: "Add Product | Admin – Furnis" };

export default async function NewProductPage() {
  const admin = createAdminClient();
  const { data: categories } = await admin
    .from("categories")
    .select("id, name, slug")
    .order("name");

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Add Product</h1>
          <p className={styles.pageSub}>Create a new product in your catalog.</p>
        </div>
        <Link href="/admin/products" className={styles.btnSecondary}>
          ← Back to Products
        </Link>
      </div>

      <div className={styles.pageContent}>
        <div className={styles.formCard}>
          <ProductForm categories={categories || []} />
        </div>
      </div>
    </>
  );
}
