"use client";

import React from "react";
import styles from "../contact.module.css";

export default function ContactInfo() {
  return (
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
          <strong>Support & Logistics:</strong>
          <br />
          <span className={styles.highlightText}>support@furnis.in</span>
        </p>
        <p className={styles.blockText} style={{ marginTop: "var(--space-xs)" }}>
          <strong>Architects & Trade Partners:</strong>
          <br />
          <span className={styles.highlightText}>trade@furnis.in</span>
        </p>
      </div>
    </div>
  );
}
