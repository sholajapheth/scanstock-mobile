import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api-client";
import { Logger } from "../utils/logger";
import { useUser } from "../hooks/useAuth";

// Define types
export interface Product {
  id: number;
  name: string;
  price: number;
  barcode: string;
  description: string;
  quantity: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface SaleData {
  customerInfo: CustomerInfo;
  total: number;
  // date: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

interface InventoryContextType {
  inventory: Product[];
  cart: CartItem[];
  isLoading: boolean;
  error: string | null;
  fetchInventory: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<ApiResponse<Product>>;
  updateProduct: (
    productId: number,
    product: Partial<Product>
  ) => Promise<ApiResponse<Product>>;
  deleteProduct: (productId: number) => Promise<ApiResponse>;
  generateBarcode: () => string;
  findProductByBarcode: (barcode: string) => Product | undefined;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartItemQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  checkout: (saleData: SaleData) => Promise<ApiResponse>;
  fetchProductByBarcode: (barcode: string) => Promise<ApiResponse<Product>>;
}

interface InventoryProviderProps {
  children: ReactNode;
}

// Create inventory context
export const InventoryContext = createContext<InventoryContextType>(
  {} as InventoryContextType
);

// Create logger for inventory context
const log = new Logger("Inventory");

export const InventoryProvider: React.FC<InventoryProviderProps> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { token: userToken } = useUser();
  const queryClient = useQueryClient();

  // Query for fetching inventory
  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      if (!userToken) return [];

      const response = await api.get("/products");
      if (response.data) {
        return response.data;
      } else {
        setError(response.message || "Failed to load inventory");
        log.error("Fetch inventory error:", response.message);
        return [];
      }
    },
    enabled: !!userToken, // Only run if we have a token
  });

  // Mutation for adding product
  const addProductMutation = useMutation({
    mutationFn: async (productData: Omit<Product, "id">) => {
      return api.post("/products", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  // Mutation for updating product
  const updateProductMutation = useMutation({
    mutationFn: async ({
      productId,
      productData,
    }: {
      productId: number;
      productData: Partial<Product>;
    }) => {
      return api.patch(`/products/${productId}`, productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  // Mutation for deleting product
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return api.delete(`/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  // Mutation for checkout
  const checkoutMutation = useMutation({
    mutationFn: async (saleData: SaleData) => {
      console.log("saleData", saleData);
      console.log("cart", cart);
      const sale = {
        items: cart.map((item) => ({
          productId: Number(item.id),
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
        total: saleData.total,
        customerInfo: saleData.customerInfo,
        // date: saleData.date,
      };

      return api.post("/sales", sale);
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });

  useEffect(() => {
    if (userToken) {
      loadCart();
    }
  }, [userToken]);

  // Generate a unique barcode for a product
  const generateBarcode = (): string => {
    const timestamp = new Date().getTime().toString().slice(-10);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `${timestamp}${random}`;
  };

  // Find product by barcode
  const findProductByBarcode = (barcode: string): Product | undefined => {
    return inventory.find((item) => item.barcode === barcode);
  };

  // Cart management
  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity }]);
    }

    saveCart();
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.id !== productId));
    saveCart();
  };

  const updateCartItemQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(
      cart.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
    saveCart();
  };

  const clearCart = () => {
    setCart([]);
    AsyncStorage.removeItem("cart");
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      log.error("Save cart error:", error);
    }
  };

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem("cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      log.error("Load cart error:", error);
    }
  };

  // Calculate cart total
  const getCartTotal = (): number => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Wrapper methods that expose the API response structure
  const addProduct = async (product: Omit<Product, "id">) => {
    log.info("Adding product:", product.name);
    return addProductMutation.mutateAsync(product);
  };

  const updateProduct = async (
    productId: number,
    product: Partial<Product>
  ) => {
    log.info("Updating product:", productId);
    return updateProductMutation.mutateAsync({
      productId,
      productData: product,
    });
  };

  const deleteProduct = async (productId: number) => {
    log.info("Deleting product:", productId);
    return deleteProductMutation.mutateAsync(productId);
  };

  const checkout = async (saleData: SaleData) => {
    log.info("saleData", saleData);
    log.info("Processing checkout with items:", cart.length);
    return checkoutMutation.mutateAsync(saleData);
  };

  const fetchInventory = async () => {
    log.info("Refreshing inventory");
    await queryClient.invalidateQueries({ queryKey: ["inventory"] });
  };

  const fetchProductByBarcode = async (
    barcode: string
  ): Promise<ApiResponse<Product>> => {
    log.info(`Fetching product by barcode: ${barcode}`);

    try {
      // First check if we already have this product in our local inventory cache
      const existingProduct = inventory.find(
        (item) => item.barcode === barcode
      );
      if (existingProduct) {
        log.info(`Found product in local inventory: ${existingProduct.name}`);
        return {
          success: true,
          data: existingProduct,
        };
      }

      // If not found locally, fetch from API
      const response = await api.get(`/products/barcode/${barcode}`);

      // If successful, update the inventory cache
      if (response.data) {
        log.info(`Fetched product from API: ${response.data.name}`);

        // Update local inventory cache
        queryClient.setQueryData(["inventory"], (oldData: Product[] = []) => {
          // If product is already in inventory, update it
          const productIndex = oldData.findIndex((p) => p.barcode === barcode);
          if (productIndex >= 0) {
            const updatedInventory = [...oldData];
            updatedInventory[productIndex] = response.data;
            return updatedInventory;
          }
          // Otherwise add it to inventory
          return [...oldData, response.data];
        });

        return response;
      }

      // If product not found in API
      log.warn(`Product not found with barcode: ${barcode}`);
      return {
        success: false,
        message: response.message || "Product not found",
      };
    } catch (error) {
      log.error(`Error fetching product by barcode ${barcode}:`, error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Error fetching product",
      };
    }
  };
  return (
    <InventoryContext.Provider
      value={{
        inventory,
        cart,
        isLoading,
        error,
        fetchInventory,
        addProduct,
        updateProduct,
        deleteProduct,
        generateBarcode,
        findProductByBarcode,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        getCartTotal,
        checkout,
        fetchProductByBarcode,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};
