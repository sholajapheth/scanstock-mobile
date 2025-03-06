// src/hooks/useProductDetail.ts
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { Product, productService } from "../services/productService";

interface UseProductDetailProps {
  productId?: string | number | null;
  initialBarcode?: string;
  onSaveSuccess?: () => void;
}

export function useProductDetail({
  productId,
  initialBarcode,
  onSaveSuccess,
}: UseProductDetailProps) {
  const [product, setProduct] = useState<Product>({
    name: "",
    price: 0,
    barcode: initialBarcode || "",
    description: "",
    quantity: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] =
    useState<boolean>(false);
  const isNewProduct = !productId;

  // Load product data if editing an existing product
  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;

      setIsLoading(true);
      const result = await productService.fetchById(Number(productId));
      setIsLoading(false);

      if (result.success && result.data) {
        setProduct(result.data);
      } else {
        Alert.alert("Error", result.message || "Failed to load product");
      }
    }

    loadProduct();
  }, [productId]);

  // Generate barcode for new products if none provided
  useEffect(() => {
    if (isNewProduct && !initialBarcode) {
      handleGenerateBarcode();
    }
  }, [isNewProduct, initialBarcode]);

  const handleGenerateBarcode = () => {
    const newBarcode = productService.generateBarcode();
    setProduct((prev) => ({ ...prev, barcode: newBarcode }));
    return newBarcode;
  };

  const updateField = (field: keyof Product, value: any) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const validateProduct = (): boolean => {
    if (!product.name.trim()) {
      Alert.alert("Error", "Product name is required");
      return false;
    }

    if (product.price <= 0) {
      Alert.alert("Error", "Price must be greater than zero");
      return false;
    }

    if (!product.barcode) {
      Alert.alert("Error", "Barcode is required");
      return false;
    }

    return true;
  };

  const saveProduct = async (): Promise<boolean> => {
    if (!validateProduct()) return false;

    setIsLoading(true);

    try {
      let result;

      if (isNewProduct) {
        result = await productService.create(product);
      } else {
        result = await productService.update(Number(productId), product);
      }

      if (result.success) {
        onSaveSuccess?.();
        return true;
      } else {
        Alert.alert("Error", result.message || "Failed to save product");
        return false;
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Save product error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (): Promise<boolean> => {
    if (!productId) return false;

    setIsLoading(true);

    try {
      const result = await productService.delete(Number(productId));

      if (result.success) {
        setDeleteConfirmVisible(false);
        onSaveSuccess?.();
        return true;
      } else {
        Alert.alert("Error", result.message || "Failed to delete product");
        return false;
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Delete product error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    product,
    isLoading,
    isNewProduct,
    deleteConfirmVisible,
    setDeleteConfirmVisible,
    updateField,
    saveProduct,
    deleteProduct,
    handleGenerateBarcode,
  };
}
