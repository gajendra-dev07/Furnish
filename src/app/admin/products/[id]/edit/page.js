import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "../../../admin.module.css";
import ProductForm from "../../ProductForm";

export const metadata = { title: "Edit Product | Admin – Furnis" };

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    admin
      .from("products")
      .select("*, product_images(url, position)")
      .eq("id", id)
      .single(),
    admin.from("categories").select("id, name, slug").order("name"),
  ]);

  if (!product) notFound();

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Edit Product</h1>
          <p className={styles.pageSub}>{product.name}</p>
        </div>
        <Link href="/admin/products" className={styles.btnSecondary}>
          ← Back to Products
        </Link>
      </div>

      <div className={styles.pageContent}>
        <div className={styles.formCard}>
          <ProductForm product={product} categories={categories || []} />
        </div>
      </div>
    </>
  );
}
