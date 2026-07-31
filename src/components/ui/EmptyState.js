import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import styles from "./EmptyState.module.css";

/**
 * Reusable EmptyState component for shop and cart list views.
 * @param {object} props
 * @param {string} props.title - Main headline.
 * @param {string} props.description - Supporting explanation text.
 * @param {string} [props.actionText] - Label for the call to action button.
 * @param {string} [props.actionLink] - Next.js Link href target.
 * @param {function} [props.onActionClick] - Click handler for custom buttons.
 * @param {string} [props.styleType='cart'] - Variant style type ('cart' | 'shop').
 */
export default function EmptyState({
  title,
  description,
  actionText,
  actionLink,
  onActionClick,
  styleType = "cart",
}) {
  const isCart = styleType === "cart";
  const stateClass = `${styles.emptyState} ${isCart ? styles.cartState : ""}`;
  const titleClass = isCart ? styles.cartTitle : styles.shopTitle;
  const textClass = isCart ? styles.cartText : styles.shopText;

  const renderButton = () => {
    if (!actionText) return null;

    if (actionLink) {
      return (
        <Link href={actionLink}>
          <Button variant="primary">{actionText}</Button>
        </Link>
      );
    }

    return (
      <Button variant="primary" onClick={onActionClick}>
        {actionText}
      </Button>
    );
  };

  return (
    <div className={stateClass}>
      <h3 className={titleClass}>{title}</h3>
      <p className={textClass}>{description}</p>
      {renderButton()}
    </div>
  );
}
