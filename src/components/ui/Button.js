import React from "react";
import styles from "./Button.module.css";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary", // primary, secondary, outline, text
  size = "md", // sm, md, lg
  className = "",
  disabled = false,
  ...props
}) {
  const buttonClass = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`;

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
