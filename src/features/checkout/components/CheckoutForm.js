"use client";

import React from "react";
import styles from "../checkout.module.css";

export default function CheckoutForm({ formData, handleInputChange }) {
  return (
    <div className={styles.formPanel}>
      {/* Shipping Address */}
      <div>
        <h3 className={styles.formTitle}>1. Shipping & Delivery</h3>
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
          <label className="form-label">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className={`${styles.inputGrid} ${styles.inputGrid2}`}>
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Zip Code</label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        <div className={`${styles.inputGrid} ${styles.inputGrid2}`}>
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
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div style={{ marginTop: "var(--space-xl)" }}>
        <h3 className={styles.formTitle}>2. Payment Method</h3>
        <div className="form-group">
          <label className="form-label">Credit Card Number</label>
          <input
            type="text"
            name="cardNumber"
            placeholder="4111 2222 3333 4444"
            value={formData.cardNumber}
            onChange={handleInputChange}
            className="form-input"
            maxLength="19"
            required
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
          <div className="form-group">
            <label className="form-label">Expiration Date</label>
            <input
              type="text"
              name="expiryDate"
              placeholder="MM/YY"
              value={formData.expiryDate}
              onChange={handleInputChange}
              className="form-input"
              maxLength="5"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Security Code (CVV)</label>
            <input
              type="password"
              name="cvv"
              placeholder="•••"
              value={formData.cvv}
              onChange={handleInputChange}
              className="form-input"
              maxLength="3"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}
