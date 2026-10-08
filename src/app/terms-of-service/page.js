"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { contactEmail, businessAddressText, businessMapUrl } from "@/constants/contact";
import styles from "./terms.module.css";

const keyPoints = [
  { label: "Free Shipping", value: "All India, always" },
  { label: "Returns", value: "7 days from delivery" },
  { label: "Warranty", value: "6 months on all products" },
  { label: "Payments", value: "UPI · Cards · COD" },
];

const sections = [
  {
    num: "01",
    title: "Acceptance of Terms",
    body: "By visiting our website or placing an order, you confirm you are at least 18 years of age, have legal capacity to enter a binding contract, and agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use our services.",
  },
  {
    num: "02",
    title: "Products & Availability",
    body: "All Furnis products are handcrafted from natural materials — Acacia and Mango wood. Natural grain patterns, knots, and colour variations are inherent to the material and not defects. Images are representative; actual items may vary. We reserve the right to limit quantities, discontinue products, or correct pricing errors at any time.",
  },
  {
    num: "03",
    title: "Ordering & Payment",
    body: "Orders are subject to availability. Your confirmation email is an acknowledgement — not acceptance — of your order. We accept UPI (GPay, PhonePe, Paytm, BHIM), Credit & Debit Cards (Visa, Mastercard, RuPay), Net Banking, and Cash on Delivery at select pincodes. Payments are processed by Razorpay. We never store card or bank details.",
  },
  {
    num: "04",
    title: "Pricing & Taxes",
    body: "All prices are in Indian Rupees (₹) and include applicable GST unless stated otherwise. Prices may change without notice. We are not responsible for typographical errors and reserve the right to cancel orders placed at incorrect prices.",
  },
  {
    num: "05",
    title: "Shipping & Delivery",
    body: "We offer free shipping across all of India. Estimated delivery is 5–9 business days from dispatch. Delivery timelines may vary during festive seasons or due to courier delays beyond our control. We are not liable for delays resulting from incorrect addresses. A tracking number is shared via email or WhatsApp once dispatched.",
  },
  {
    num: "06",
    title: "Returns & Refunds",
    body: "Returns are accepted within 7 days of delivery for damaged or defective items only. Items must be unused, in original packaging, with proof of purchase. Natural wood variations and minor colour differences are not defects. COD orders are eligible for exchange or store credit — not cash refunds. Prepaid refunds are processed within 5–7 business days to the original payment method.",
  },
  {
    num: "07",
    title: "Product Warranty",
    body: "All Furnis kitchenware carries a 6-month warranty against manufacturing defects. This does not cover normal wear and tear, dishwasher damage, cracks from extreme temperatures, or natural wood variation. Regular oiling with food-safe mineral oil is recommended to extend longevity.",
  },
  {
    num: "08",
    title: "Intellectual Property",
    body: "All content on this website — including text, product images, logos, and graphics — is owned by Furnis and protected under applicable copyright law. Reproduction, distribution, or use without our express written permission is prohibited.",
  },
  {
    num: "09",
    title: "Prohibited Use",
    body: "You agree not to use the site for unlawful purposes, attempt unauthorised access to our systems, deploy automated scraping tools, submit false information, or impersonate Furnis or its team members.",
  },
  {
    num: "10",
    title: "Limitation of Liability",
    body: "To the fullest extent permitted by law, Furnis is not liable for indirect, incidental, or consequential damages. Our total liability for any claim is capped at the amount paid for the specific order giving rise to that claim.",
  },
  {
    num: "11",
    title: "Governing Law",
    body: "These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts of Rajasthan, India.",
  },
  {
    num: "12",
    title: "Contact",
    body: null,
    isContact: true,
  },
];

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className={styles.main}>

        {/* ── Dark Hero ── */}
        <div className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <h1 className={styles.heroTitle}>Clear terms.<br/>No fine print.</h1>
            <p className={styles.heroSub}>
              We&apos;ve written these so any customer can understand them.
              Last updated October 1, 2026.
            </p>
            <Link href="/privacy-policy" className={styles.heroLink}>
              Also read our Privacy Policy →
            </Link>
          </div>

          {/* Key Points strip inside hero */}
          <div className={styles.keyPoints}>
            <div className={`container ${styles.keyPointsInner}`}>
              {keyPoints.map((kp, i) => (
                <div key={i} className={styles.keyPoint}>
                  <span className={styles.keyPointLabel}>{kp.label}</span>
                  <span className={styles.keyPointValue}>{kp.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Two-column sections grid ── */}
        <div className={`container ${styles.grid}`}>
          {sections.map((sec, i) => (
            <div key={i} className={`${styles.card} ${sec.isContact ? styles.cardContact : ""}`}>
              <p className={styles.cardNum}>{sec.num}</p>
              <h2 className={styles.cardTitle}>{sec.title}</h2>
              {sec.isContact ? (
                <div className={styles.contactBlock}>
                  <p className={styles.cardBody}>Questions? We&apos;re happy to help:</p>
                  <div className={styles.contactLinks}>
                    <a href={`mailto:${contactEmail}`} className={styles.contactLink}>
                      <span className={styles.contactLinkLabel}>Email</span>
                      <span className={styles.contactLinkValue}>{contactEmail}</span>
                    </a>
                    <a href="https://wa.me/916375549637" className={styles.contactLink} target="_blank" rel="noopener noreferrer">
                      <span className={styles.contactLinkLabel}>WhatsApp</span>
                      <span className={styles.contactLinkValue}>+91 6375549637</span>
                    </a>
                    <a href="https://www.instagram.com/furnis.in/" className={styles.contactLink} target="_blank" rel="noopener noreferrer">
                      <span className={styles.contactLinkLabel}>Instagram</span>
                      <span className={styles.contactLinkValue}>@furnis.in</span>
                    </a>
                    <a href={businessMapUrl} className={styles.contactLink} target="_blank" rel="noopener noreferrer">
                      <span className={styles.contactLinkLabel}>Address</span>
                      <span className={styles.contactLinkValue}>{businessAddressText}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <p className={styles.cardBody}>{sec.body}</p>
              )}
            </div>
          ))}
        </div>

      </main>
      <Footer flush={true} />
    </>
  );
}
