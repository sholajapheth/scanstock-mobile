import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";
import { AuthContext } from "./AuthContext";

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
  date: string;
}

interface InventoryContextType {
  inventory: Product[];
  cart: CartItem[];
  isLoading: boolean;
  error: string | null;
  fetchInventory: () => Promise<void>;
  addProduct: (
    product: Omit<Product, "id">
  ) => Promise<{ success: boolean; product?: Product; message?: string }>;
  updateProduct: (
    productId: number,
    product: Partial<Product>
  ) => Promise<{ success: boolean; product?: Product; message?: string }>;
  deleteProduct: (
    productId: number
  ) => Promise<{ success: boolean; message?: string }>;
  generateBarcode: () => string;
  findProductByBarcode: (barcode: string) => Product | undefined;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartItemQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  checkout: (
    saleData: SaleData
  ) => Promise<{ success: boolean; sale?: any; message?: string }>;
}

interface InventoryProviderProps {
  children: ReactNode;
}

// Create inventory context
export const InventoryContext = createContext<InventoryContextType>(
  {} as InventoryContextType
);

// API base URL - update with your NestJS backend URL
const API_URL = "http://localhost:3000/api";

export const InventoryProvider: React.FC<InventoryProviderProps> = ({
  children,
}) => {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { userToken } = useContext(AuthContext);

  // Load inventory when token changes
  useEffect(() => {
    if (userToken) {
      fetchInventory();
      loadCart();
    }
  }, [userToken]);

  // Fetch inventory from API
  const fetchInventory = async () => {
    if (!userToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/products`);
      setInventory(response.data);
    } catch (error: any) {
      console.log("Fetch inventory error:", error);
      setError("Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  // Add product to inventory
  const addProduct = async (productData: Omit<Product, "id">) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/products`, productData);
      setInventory([...inventory, response.data]);
      return { success: true, product: response.data };
    } catch (error: any) {
      console.log("Add product error:", error);
      setError("Failed to add product");
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add product",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Update product in inventory
  const updateProduct = async (
    productId: number,
    productData: Partial<Product>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.patch(
        `${API_URL}/products/${productId}`,
        productData
      );
      setInventory(
        inventory.map((item) => (item.id === productId ? response.data : item))
      );
      return { success: true, product: response.data };
    } catch (error: any) {
      console.log("Update product error:", error);
      setError("Failed to update product");
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update product",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete product from inventory
  const deleteProduct = async (productId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_URL}/products/${productId}`);
      setInventory(inventory.filter((item) => item.id !== productId));
      return { success: true };
    } catch (error: any) {
      console.log("Delete product error:", error);
      setError("Failed to delete product");
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete product",
      };
    } finally {
      setIsLoading(false);
    }
  };

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
      console.log("Save cart error:", error);
    }
  };

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem("cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.log("Load cart error:", error);
    }
  };

  // Calculate cart total
  const getCartTotal = (): number => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Checkout - process sale and update inventory
  const checkout = async (saleData: SaleData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create sale record with items
      const sale = {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        ...saleData,
      };

      const response = await axios.post(`${API_URL}/sales`, sale);

      // Clear cart after successful checkout
      clearCart();

      // Refresh inventory to get updated quantities
      await fetchInventory();

      return { success: true, sale: response.data };
    } catch (error: any) {
      console.log("Checkout error:", error);
      setError("Checkout failed");
      return {
        success: false,
        message: error.response?.data?.message || "Checkout failed",
      };
    } finally {
      setIsLoading(false);
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
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};
