"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function ProductForm({ product, categories }) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const fileInputRef = useRef(null);

  // ── Core fields ────────────────────────────────────────────
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [categoryId, setCategoryId] = useState(product?.category_id || "");
  const [price, setPrice] = useState(product?.price || "");
  const [originalPrice, setOriginalPrice] = useState(product?.original_price || "");
  const [description, setDescription] = useState(product?.description || "");
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [colors, setColors] = useState((product?.colors || []).join(", "));

  // ── Features: array of strings ─────────────────────────────
  const [features, setFeatures] = useState(
    (product?.features || []).join("\n")
  );

  // ── Specs: array of { label, value } ──────────────────────
  const [specs, setSpecs] = useState(
    product?.specs?.length
      ? product.specs
      : [{ label: "", value: "" }]
  );

  // ── Flags ──────────────────────────────────────────────────
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isBestSeller, setIsBestSeller] = useState(product?.is_best_seller ?? false);
  const [isNewArrival, setIsNewArrival] = useState(product?.is_new_arrival ?? false);

  // ── Images: each item is { url, position, file? } ─────────
  const [images, setImages] = useState(
    (product?.product_images || [])
      .sort((a, b) => a.position - b.position)
      .map((img) => ({ url: img.url, position: img.position }))
  );
  const [uploadingImages, setUploadingImages] = useState(false);

  // ── UI state ───────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auto-slug from name for new products
  useEffect(() => {
    if (!isEdit && name) {
      setSlug(slugify(name));
    }
  }, [name, isEdit]);

  // ── Spec helpers ───────────────────────────────────────────
  function addSpec() {
    setSpecs((prev) => [...prev, { label: "", value: "" }]);
  }

  function updateSpec(index, field, value) {
    setSpecs((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  function removeSpec(index) {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Image upload ───────────────────────────────────────────
  async function handleFileChange(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingImages(true);
    setError("");

    try {
      const uploaded = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = await res.json();

        if (!res.ok) throw new Error(json.error || "Upload failed");
        uploaded.push({ url: json.url, position: images.length + uploaded.length });
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, position: i })));
  }

  // ── Save ───────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !slug || !categoryId || !price) {
      setError("Name, slug, category and price are required.");
      return;
    }

    setSaving(true);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      category_id: categoryId,
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : null,
      description: description.trim(),
      features: features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
      specs: specs.filter((s) => s.label || s.value),
      colors: colors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      stock: Number(stock),
      is_active: isActive,
      is_best_seller: isBestSeller,
      is_new_arrival: isNewArrival,
      images: images.map((img, i) => ({ url: img.url, position: i })),
    };

    try {
      const url = isEdit
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save product");

      setSuccess(isEdit ? "Product updated!" : "Product created!");
      if (!isEdit) {
        setTimeout(() => router.push("/admin/products"), 800);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className={styles.formError}>{error}</div>}
      {success && <div className={styles.formSuccess}>{success}</div>}

      {/* ── Basic Info ───────────────────────────────── */}
      <div className={styles.formSection}>
        <div className={styles.formSectionTitle}>Basic Information</div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Product Name *</label>
            <input
              className={styles.formInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Helsinki Acacia Chopping Board"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Slug *{" "}
              <span className={styles.formLabelHint}>(used in URL)</span>
            </label>
            <input
              className={styles.formInput}
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="e.g. helsinki-acacia-board"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Category *</label>
            <select
              className={styles.formSelect}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Stock Quantity</label>
            <input
              className={styles.formInput}
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Price (₹) *</label>
            <input
              className={styles.formInput}
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="999"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Original Price (₹){" "}
              <span className={styles.formLabelHint}>(for discount display)</span>
            </label>
            <input
              className={styles.formInput}
              type="number"
              min="0"
              step="0.01"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="1299"
            />
          </div>

          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label className={styles.formLabel}>Description</label>
            <textarea
              className={styles.formTextarea}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product..."
            />
          </div>
        </div>
      </div>

      {/* ── Features ─────────────────────────────────── */}
      <div className={styles.formSection}>
        <div className={styles.formSectionTitle}>Features</div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Features{" "}
            <span className={styles.formLabelHint}>(one per line)</span>
          </label>
          <textarea
            className={styles.formTextarea}
            rows={5}
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            placeholder={"Food-safe mineral oil finish\nHand-wash only\nMade from sustainable Acacia wood"}
          />
        </div>
      </div>

      {/* ── Specs ────────────────────────────────────── */}
      <div className={styles.formSection}>
        <div className={styles.formSectionTitle}>Specifications</div>
        {specs.map((spec, i) => (
          <div key={i} className={styles.specRow}>
            <input
              className={styles.specInput}
              placeholder="Label (e.g. Material)"
              value={spec.label}
              onChange={(e) => updateSpec(i, "label", e.target.value)}
            />
            <input
              className={styles.specInput}
              placeholder="Value (e.g. Acacia Wood)"
              value={spec.value}
              onChange={(e) => updateSpec(i, "value", e.target.value)}
            />
            <button
              type="button"
              className={styles.btnSpecRemove}
              onClick={() => removeSpec(i)}
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" className={styles.btnSpecAdd} onClick={addSpec}>
          + Add Spec
        </button>
      </div>

      {/* ── Colours ──────────────────────────────────── */}
      <div className={styles.formSection}>
        <div className={styles.formSectionTitle}>Colours</div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Colour Labels{" "}
            <span className={styles.formLabelHint}>(comma-separated display labels)</span>
          </label>
          <input
            className={styles.formInput}
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            placeholder="Natural, Dark Walnut"
          />
        </div>
      </div>

      {/* ── Images ───────────────────────────────────── */}
      <div className={styles.formSection}>
        <div className={styles.formSectionTitle}>Images</div>

        <div
          className={styles.imageUploadArea}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            width="28"
            height="28"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className={styles.imageUploadText}>
            {uploadingImages
              ? "Uploading…"
              : "Click to upload images (JPEG, PNG, WebP)"}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            style={{ display: "none" }}
            onChange={handleFileChange}
            disabled={uploadingImages}
          />
        </div>

        {images.length > 0 && (
          <div className={styles.imagePreviewGrid}>
            {images.map((img, i) => (
              <div key={i} className={styles.imagePreviewItem}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={`Product image ${i + 1}`}
                  className={styles.imagePreviewImg}
                />
                <button
                  type="button"
                  className={styles.imagePreviewRemove}
                  onClick={() => removeImage(i)}
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Flags ────────────────────────────────────── */}
      <div className={styles.formSection}>
        <div className={styles.formSectionTitle}>Status & Labels</div>
        <div className={styles.checkboxRow}>
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="isActive" className={styles.checkboxLabel}>
            Active (visible in store)
          </label>
        </div>
        <div className={styles.checkboxRow}>
          <input
            type="checkbox"
            id="isBestSeller"
            checked={isBestSeller}
            onChange={(e) => setIsBestSeller(e.target.checked)}
          />
          <label htmlFor="isBestSeller" className={styles.checkboxLabel}>
            Mark as Best Seller
          </label>
        </div>
        <div className={styles.checkboxRow}>
          <input
            type="checkbox"
            id="isNewArrival"
            checked={isNewArrival}
            onChange={(e) => setIsNewArrival(e.target.checked)}
          />
          <label htmlFor="isNewArrival" className={styles.checkboxLabel}>
            Mark as New Arrival
          </label>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────── */}
      <div className={styles.formFooter}>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={saving || uploadingImages}
        >
          {saving ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
