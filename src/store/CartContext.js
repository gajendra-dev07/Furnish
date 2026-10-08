"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { fetchProductsBySlugs } from "@/lib/supabase/queries";

const CartContext = createContext();

function slugOf(item) {
  return item?.product?.slug || item?.product?.id || null;
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cartNotification, setCartNotification] = useState(null);

  // Auto-dismiss popup notification after 3.2 seconds
  useEffect(() => {
    if (!cartNotification) return;
    const timer = setTimeout(() => {
      setCartNotification(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [cartNotification]);

  // The cart caches whole product objects, price included, in localStorage.
  // Re-read the live rows on load so a returning customer isn't shown a price
  // that changed while their cart sat there. Checkout recalculates from the
  // database anyway; this keeps the displayed price honest.
  async function refreshCartPrices(storedCart) {
    const slugs = [...new Set(storedCart.map(slugOf).filter(Boolean))];
    if (slugs.length === 0) return;

    try {
      const client = createClient();
      if (!client) return;

      const fresh = await fetchProductsBySlugs(client, slugs);
      if (fresh.length === 0) return;

      const bySlug = new Map(fresh.map((p) => [p.slug, p]));

      setCart((prevCart) => {
        let changed = false;
        const next = prevCart.map((item) => {
          const latest = bySlug.get(slugOf(item));
          if (!latest || latest.price === item.product.price) return item;
          changed = true;
          return { ...item, product: { ...item.product, ...latest } };
        });
        return changed ? next : prevCart;
      });
    } catch (err) {
      // A failed refresh only means the cached price stays on screen.
      console.error("Failed to refresh cart prices:", err);
    }
  }

  // Load cart & wishlist from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("furnish_cart");
      const storedWishlist = localStorage.getItem("furnish_wishlist");
      setTimeout(() => {
        const parsedCart = storedCart ? JSON.parse(storedCart) : [];
        if (storedCart) setCart(parsedCart);
        if (storedWishlist) {
          const parsed = JSON.parse(storedWishlist);
          const uniqueWishlist = [];
          const seenIds = new Set();
          parsed.forEach((item) => {
            const id = item.id || item;
            if (!seenIds.has(id)) {
              seenIds.add(id);
              uniqueWishlist.push(item);
            }
          });
          setWishlist(uniqueWishlist);
        }
        setIsLoaded(true);
        refreshCartPrices(parsedCart);
      }, 0);
    }
  }, []);

  // Cart and wishlist live in this browser, not the account, so clear them on
  // sign-out to keep them from showing up for the next person on the device.
  useEffect(() => {
    const client = createClient();
    if (!client) return;

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_OUT") return;
      setCart([]);
      setWishlist([]);
      localStorage.removeItem("furnish_cart");
      localStorage.removeItem("furnish_wishlist");
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save cart to LocalStorage when it changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("furnish_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // Save wishlist to LocalStorage when it changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("furnish_wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded]);

  const addToCart = (product, quantity = 1, color = "") => {
    // Normalise BEFORE comparing. The old code stored `color || colors[0]` but
    // matched on the raw `color`, so adding the same item twice never matched
    // an existing line and silently created a duplicate row instead.
    const selectedColor = color || product.colors?.[0] || null;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id && item.selectedColor === selectedColor
      );

      if (existingItemIndex > -1) {
        return prevCart.map((item, i) =>
          i === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevCart, { product, quantity, selectedColor }];
    });

    // Trigger elegant popup notification
    setCartNotification({
      product,
      quantity: quantity || 1,
      key: Date.now(),
    });
  };

  const removeFromCart = (productId, color) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.product.id === productId && item.selectedColor === color)
      )
    );
  };

  const updateCartQuantity = (productId, color, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, color);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && item.selectedColor === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product) => {
    setWishlist((prevWishlist) => {
      const isAlreadyIn = prevWishlist.some((item) => (item.id || item) === product.id);
      if (isAlreadyIn) {
        return prevWishlist.filter((item) => (item.id || item) !== product.id);
      }
      return [...prevWishlist, product];
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item.id || item) === productId);
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        cartSubtotal,
        cartCount,
        isLoaded,
      }}
    >
      {children}
      {cartNotification && (
        <aside className="cartToast" role="status" aria-live="polite">
          {cartNotification.product?.images?.[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cartNotification.product.images[0]}
              alt={cartNotification.product.name || "Product"}
              className="cartToastImg"
            />
          )}
          <div className="cartToastBody">
            <div className="cartToastHeader">
              <span className="cartToastCheck">✓</span>
              Added to cart
            </div>
            <div className="cartToastTitle">
              {cartNotification.product?.name}
            </div>
          </div>
          <Link
            href="/cart"
            className="cartToastBtn"
            onClick={() => setCartNotification(null)}
          >
            View Cart
          </Link>
          <button
            type="button"
            className="cartToastClose"
            onClick={() => setCartNotification(null)}
            aria-label="Close notification"
          >
            ✕
          </button>
        </aside>
      )}
    </CartContext.Provider>
  );
};


export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
