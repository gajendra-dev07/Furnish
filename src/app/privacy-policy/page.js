"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import styles from "./privacy.module.css";

const sections = [
  {
    num: "01",
    title: "Information We Collect",
    body: `We collect only what is necessary to serve you well. This includes your name, email address, phone number, and delivery address when you place an order or create an account. Payments are processed securely via Razorpay (PCI-DSS compliant) — we never store your card details. Messages you send through our contact form, WhatsApp, or email are retained to help us respond. We also collect anonymised usage data such as pages visited, time on site, and browser type through cookies and analytics tools.`,
  },
  {
    num: "02",
    title: "How We Use Your Information",
    body: `Your information is used to process and fulfil orders, send transactional emails (confirmations, invoices, dispatch notices), and respond to your enquiries. With your consent, we may send promotional updates — you can unsubscribe at any time. We also use aggregated data to improve our website and understand how visitors interact with it. We never use your data for purposes beyond what is described here.`,
  },
  {
    num: "03",
    title: "Sharing of Information",
    body: `We do not sell, rent, or trade your personal data. We share information only with the trusted third parties required to operate our business: Razorpay for payment processing, our shipping partners for delivery, and analytics providers who receive only anonymised data. We may disclose data if required by law or to protect the rights and safety of Furnis, our customers, or others.`,
  },
  {
    num: "04",
    title: "Cookies & Tracking",
    body: `We use cookies to keep your shopping cart active, remember your session, understand how the site is used, and — with your consent — serve relevant advertisements. Essential cookies are required for the site to function. Analytics and marketing cookies can be controlled through your browser settings. Disabling certain cookies may affect parts of the site.`,
  },
  {
    num: "05",
    title: "Data Security",
    body: `We use HTTPS encryption for all data in transit, strict internal access controls, and rely on Razorpay's PCI-DSS certified infrastructure for payment data. While we take every reasonable precaution, no electronic transmission is entirely risk-free. We act swiftly to address any suspected breach and will notify affected users where required by law.`,
  },
  {
    num: "06",
    title: "Your Rights",
    body: `Depending on your jurisdiction, you have the right to access the personal data we hold about you, request corrections, request deletion, and opt out of marketing at any time. To exercise any of these rights, email us at furnis.in@gmail.com. We aim to respond within 2 business days.`,
  },
  {
    num: "07",
    title: "Third-Party Links",
    body: `Our website links to platforms like Instagram and WhatsApp. We have no control over — and are not responsible for — the privacy practices of those external sites. We encourage you to read their privacy policies before sharing personal information with them.`,
  },
  {
    num: "08",
    title: "Children's Privacy",
    body: `Our services are not intended for children under 13. We do not knowingly collect personal data from minors. If you believe a child has submitted information to us, please contact us immediately and we will delete it promptly.`,
  },
  {
    num: "09",
    title: "Changes to This Policy",
    body: `We may revise this Privacy Policy periodically. When we do, we will update the "Last updated" date and, for significant changes, notify you via a site banner or email. Continued use of our site after a change constitutes acceptance of the updated policy.`,
  },
  {
    num: "10",
    title: "Contact Us",
    body: null,
    isContact: true,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>

        {/* ── Page Intro ── */}
        <div className={styles.intro}>
          <div className={`container ${styles.introInner}`}>
            <div className={styles.introDivider} />
            <div className={styles.introContent}>
              <div className={styles.introLeft}>
                <p className={styles.introEyebrow}>Legal · Privacy Policy</p>
                <h1 className={styles.introTitle}>Your data,<br/>handled with care.</h1>
              </div>
              <div className={styles.introRight}>
                <p className={styles.introBody}>
                  At Furnis, we believe transparency builds trust. This policy explains exactly what we collect, why we collect it, and how you stay in control. No jargon. No surprises.
                </p>
                <p className={styles.introDate}>Last updated: October 1, 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sections ── */}
        <div className={`container ${styles.content}`}>
          {sections.map((sec, i) => (
            <div key={i} className={styles.section} id={`section-${sec.num}`}>
              <div className={styles.sectionNum}>{sec.num}</div>
              <div className={styles.sectionMain}>
                <h2 className={styles.sectionTitle}>{sec.title}</h2>
                {sec.isContact ? (
                  <div className={styles.contactInline}>
                    <p className={styles.sectionBody}>Questions about this Privacy Policy? Reach out:</p>
                    <div className={styles.contactRow}>
                      <a href="mailto:furnis.in@gmail.com" className={styles.contactItem}>
                        <span className={styles.contactItemLabel}>Email</span>
                        <span className={styles.contactItemValue}>furnis.in@gmail.com</span>
                      </a>
                      <a href="https://wa.me/916375549637" className={styles.contactItem} target="_blank" rel="noopener noreferrer">
                        <span className={styles.contactItemLabel}>WhatsApp</span>
                        <span className={styles.contactItemValue}>+91 6375549637</span>
                      </a>
                      <a href="https://www.instagram.com/furnis.in/" className={styles.contactItem} target="_blank" rel="noopener noreferrer">
                        <span className={styles.contactItemLabel}>Instagram</span>
                        <span className={styles.contactItemValue}>@furnis.in</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className={styles.sectionBody}>{sec.body}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer bar ── */}
        <div className={styles.footerBar}>
          <div className={`container ${styles.footerBarInner}`}>
            <p className={styles.footerBarText}>© {new Date().getFullYear()} Furnis. All rights reserved.</p>
            <Link href="/terms-of-service" className={styles.footerBarLink}>Read our Terms of Service →</Link>
          </div>
        </div>

      </main>
      <Footer flush={true} />
    </>
  );
}
