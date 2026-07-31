"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";

export default function ProductsTable({ products: initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [deleting, setDeleting] = useState(null);
  const router = useRouter();

  async function handleDelete(product) {
    if (
      !confirm(
        `Delete "${product.name}"? This cannot be undone.`
      )
    )
      return;

    setDeleting(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Delete failed");
      }
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  }

  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <svg
          width="48"
          height="48"
          fill="none"
          stroke="#d1d5db"
          strokeWidth="1"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p className={styles.emptyStateTitle}>No products yet</p>
        <p style={{ fontSize: "0.82rem", color: "#9ca3af" }}>
          Add your first product to get started.
        </p>
      </div>
    );
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Image</th>
          <th>Product</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => {
          const thumb = product.product_images?.sort(
            (a, b) => a.position - b.position
          )[0];

          return (
            <tr key={product.id}>
              <td>
                {thumb ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={thumb.url}
                    alt={product.name}
                    className={styles.productThumb}
                  />
                ) : (
                  <div className={styles.productThumbPlaceholder}>IMG</div>
                )}
              </td>
              <td>
                <div className={styles.productName}>{product.name}</div>
                <div className={styles.productSlug}>{product.slug}</div>
              </td>
              <td>{product.categories?.name || "—"}</td>
              <td>₹{Number(product.price).toLocaleString("en-IN")}</td>
              <td>
                <span
                  className={`${styles.badge} ${
                    product.stock > 5
                      ? styles.badgeGreen
                      : product.stock > 0
                      ? styles.badgeAmber
                      : styles.badgeRed
                  }`}
                >
                  {product.stock}
                </span>
              </td>
              <td>
                <span
                  className={`${styles.badge} ${
                    product.is_active ? styles.badgeGreen : styles.badgeRed
                  }`}
                >
                  {product.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                <div className={styles.actions}>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className={`${styles.btnIcon} ${styles.btnEdit}`}
                  >
                    Edit
                  </Link>
                  <button
                    className={`${styles.btnIcon} ${styles.btnDelete}`}
                    onClick={() => handleDelete(product)}
                    disabled={deleting === product.id}
                  >
                    {deleting === product.id ? "…" : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
