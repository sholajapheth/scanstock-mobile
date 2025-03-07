// src/hooks/useCart.ts
import { useState, useEffect, useContext, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product } from "./useProducts";
import { InventoryContext } from "../context/InventoryContext";
import { Logger } from "../utils/logger";

export interface CartItem extends Product {
  quantity: number;
}

const log = new Logger("useCart");

export function useCart() {
  // Get inventory context to access inventory products and cart functions
  const inventoryContext = useContext(InventoryContext);

  // Local cart state that will be synchronized with InventoryContext
  const [localCart, setLocalCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Load cart from storage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem("cart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setLocalCart(parsedCart);

          // Also load into inventory context if available
          if (inventoryContext) {
            // Reset the inventory context cart first
            inventoryContext.clearCart();

            // Then add each item
            parsedCart.forEach((item: CartItem) => {
              // Find the product in inventory to ensure it's the latest version
              const inventoryProduct = inventoryContext.findProductByBarcode(
                item.barcode
              );

              if (inventoryProduct) {
                // Use the inventory product but keep the scanned quantity
                inventoryContext.addToCart(inventoryProduct, item.quantity);
              } else {
                // If product not in inventory yet (offline mode), use the stored item
                inventoryContext.addToCart(item, item.quantity);
              }
            });
          }
        }
      } catch (error) {
        log.error("Error loading cart:", error);
      } finally {
        setIsLoading(false);
        setInitialized(true);
      }
    };

    loadCart();
  }, []);

  // When inventory context cart changes, synchronize with local cart
  useEffect(() => {
    if (initialized && inventoryContext && inventoryContext.cart) {
      setLocalCart(inventoryContext.cart);
    }
  }, [initialized, inventoryContext?.cart]);

  // Save cart to storage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      if (!isLoading && inventoryContext) {
        try {
          // Always save the inventory context cart to ensure consistency
          await AsyncStorage.setItem(
            "cart",
            JSON.stringify(inventoryContext.cart)
          );
        } catch (error) {
          log.error("Error saving cart:", error);
        }
      }
    };

    saveCart();
  }, [inventoryContext?.cart, isLoading]);

  // Add product to cart
  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      if (inventoryContext) {
        // Find product in inventory to ensure it's up to date
        const inventoryProduct =
          inventoryContext.findProductByBarcode(product.barcode) || product;

        // Use inventory context method
        inventoryContext.addToCart(inventoryProduct, quantity);
      } else {
        // Fallback to local cart if context is not available (rare case)
        setLocalCart((prevCart) => {
          const existingItem = prevCart.find((item) => item.id === product.id);

          if (existingItem) {
            return prevCart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            return [...prevCart, { ...product, quantity }];
          }
        });
      }
    },
    [inventoryContext]
  );

  // Remove product from cart
  const removeFromCart = useCallback(
    (productId: number) => {
      if (inventoryContext) {
        inventoryContext.removeFromCart(productId);
      } else {
        setLocalCart((prevCart) =>
          prevCart.filter((item) => item.id !== productId)
        );
      }
    },
    [inventoryContext]
  );

  // Update product quantity in cart
  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      if (inventoryContext) {
        inventoryContext.updateCartItemQuantity(productId, quantity);
      } else {
        setLocalCart((prevCart) =>
          prevCart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          )
        );
      }
    },
    [inventoryContext, removeFromCart]
  );

  // Clear the cart
  const clearCart = useCallback(() => {
    if (inventoryContext) {
      inventoryContext.clearCart();
    } else {
      setLocalCart([]);
      AsyncStorage.removeItem("cart");
    }
  }, [inventoryContext]);

  // Calculate total price of items in cart
  const getCartTotal = useCallback(() => {
    const cartToUse = inventoryContext ? inventoryContext.cart : localCart;
    return cartToUse.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [inventoryContext, localCart]);

  // Get total number of items in cart
  const getItemCount = useCallback(() => {
    const cartToUse = inventoryContext ? inventoryContext.cart : localCart;
    return cartToUse.reduce((count, item) => count + item.quantity, 0);
  }, [inventoryContext, localCart]);

  // Return the cart from inventory context if available, otherwise use local cart
  const cart = inventoryContext ? inventoryContext.cart : localCart;

  return {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
  };
}
