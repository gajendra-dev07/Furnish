"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SectionHeading from "@/components/ui/SectionHeading";
import MotionSection from "@/components/ui/MotionSection";
import Button from "@/components/ui/Button";
import styles from "@/features/contact/contact.module.css";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "orders",
    message: "",
  });

  const validateEmail = (val) => {
    const clean = val.trim().toLowerCase();
    
    if (!clean.includes("@")) {
      return { valid: false, error: "Please enter a valid email address containing '@'." };
    }
    
    const parts = clean.split("@");
    const domain = parts[1] || "";
    
    if (!domain.includes(".")) {
      return { valid: false, error: "Invalid email domain. Top-level domain required (e.g. @gmail.com)." };
    }
    
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!regex.test(clean)) {
      return { valid: false, error: "Please enter a valid email address (e.g. name@example.com)." };
    }

    if (domain === "gmail" || domain === "gmail.co" || domain === "gmail.c" || domain === "gmai.com" || domain === "gmal.com") {
      return { valid: false, error: "Did you mean @gmail.com? Please check your email domain." };
    }
    if (domain === "yahoo" || domain === "yahoo.co" || domain === "yaho.com") {
      return { valid: false, error: "Did you mean @yahoo.com? Please check your email domain." };
    }
    if (domain === "hotmail" || domain === "hotmail.co") {
      return { valid: false, error: "Did you mean @hotmail.com? Please check your email domain." };
    }

    return { valid: true };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "email" && emailError) {
      setEmailError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const check = validateEmail(formData.email);
    if (!check.valid) {
      setEmailError(check.error);
      return;
    }

    setEmailError("");
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <>
      <Header />
      <MotionSection as="main" className={`container ${styles.main}`} delay={0.2}>
        <SectionHeading
          badge="Concierge Support"
          title="Get in Touch"
          subtitle="Have questions regarding bespoke materials, orders, or trade accounts? Contact our design concierge."
        />

        <div className={styles.grid}>
          {/* Info Blocks Column */}
          <div className={styles.infoColumn}>
            {/* Studio Address */}
            <div className={styles.infoBlock}>
              <h3 className={styles.blockTitle}>Design Studios</h3>
              <p className={styles.blockText}>
                <strong>New York Studio:</strong>
                <br />
                45 Greene Street, Soho
                <br />
                New York, NY 10013
              </p>
              <p className={styles.blockText} style={{ marginTop: "var(--space-xs)" }}>
                <strong>Los Angeles Studio:</strong>
                <br />
                8430 Melrose Avenue, West Hollywood
                <br />
                Los Angeles, CA 90069
              </p>
            </div>

            {/* Helpline Hours */}
            <div className={styles.infoBlock}>
              <h3 className={styles.blockTitle}>Helpline Schedules</h3>
              <p className={styles.blockText}>
                Our client services concierge is active during editorial studio hours:
              </p>
              <p className={styles.blockText} style={{ marginTop: "var(--space-xs)" }}>
                <strong>Monday — Friday:</strong> 9:00 AM – 6:00 PM EST
                <br />
                <strong>Saturday:</strong> 10:00 AM – 4:00 PM EST
                <br />
                <strong>Sunday:</strong> Closed
              </p>
            </div>

            {/* Direct Contacts */}
            <div className={styles.infoBlock}>
              <h3 className={styles.blockTitle}>Direct Inquiries</h3>
              <p className={styles.blockText}>
                <strong>WhatsApp Concierge:</strong>
                <br />
                <a
                  href="https://wa.me/916375549637?text=Hi%20Furnis%2C%20I%20have%20an%20inquiry%20regarding%20your%20products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.highlightText}
                  style={{ textDecoration: "underline", color: "var(--color-primary)" }}
                >
                  +91 6375549637 (Instant Chat)
                </a>
              </p>
              <p className={styles.blockText} style={{ marginTop: "var(--space-xs)" }}>
                <strong>Instagram:</strong>
                <br />
                <a
                  href="https://www.instagram.com/furnis.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.highlightText}
                  style={{ textDecoration: "underline", color: "var(--color-primary)" }}
                >
                  @furnis.in
                </a>
              </p>
              <p className={styles.blockText} style={{ marginTop: "var(--space-xs)" }}>
                <strong>Email:</strong>
                <br />
                <span className={styles.highlightText}>support@furnis.in</span>
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div>
            {submitted ? (
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
            ) : (
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
                    style={emailError ? { borderColor: "#d9534f" } : {}}
                    required
                  />
                  {emailError && (
                    <p style={{ color: "#d9534f", fontSize: "0.75rem", marginTop: "4px", fontWeight: "500" }}>
                      {emailError}
                    </p>
                  )}
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
            )}
          </div>
        </div>
      </MotionSection>
      <Footer />
    </>
  );
}
