"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart & wishlist from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("furnish_cart");
      const storedWishlist = localStorage.getItem("furnish_wishlist");
      setTimeout(() => {
        if (storedCart) setCart(JSON.parse(storedCart));
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
      }, 0);
    }
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
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === color
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      }

      return [...prevCart, { product, quantity, selectedColor: color || product.colors[0] }];
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
