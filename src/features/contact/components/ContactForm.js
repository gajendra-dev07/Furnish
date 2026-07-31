"use client";

import React from "react";
import Button from "@/components/ui/Button";
import styles from "../contact.module.css";

export default function ContactForm({
  formData,
  handleInputChange,
  handleSubmit,
  isSubmitting,
  submitted,
  setSubmitted,
}) {
  if (submitted) {
    return (
      <div className={styles.successCard}>
        <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: "var(--color-success)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
        <h3 className={styles.successTitle}>Inquiry Logged</h3>
        <p className={styles.successText}>
          Thank you, {formData.firstName}. We have received your query. Our design concierge will contact you by email or phone within 2 hours.
        </p>
        <Button variant="secondary" onClick={() => setSubmitted(false)}>
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formPanel}>
      <div className={`${styles.inputGrid} ${styles.inputGrid2}`}>
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Subject of Interest</label>
        <select
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          className="form-input"
          style={{ cursor: "pointer" }}
        >
          <option value="orders">Orders & White-Glove Shipping</option>
          <option value="bespoke">Bespoke / Custom Materials</option>
          <option value="trade">Trade Account / Interior Architects</option>
          <option value="press">Press & Media Inquiries</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Your Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          className={styles.formTextarea}
          placeholder="Describe your design specifications or question..."
          required
        ></textarea>
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className={styles.submitBtn}
      >
        {isSubmitting ? "Submitting Ledger..." : "Send Concierge Message"}
      </Button>
    </form>
  );
}
