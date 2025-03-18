import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { Product, CreateProductData } from "./useProducts";

import { productService } from "../services/productService";
import { useUser } from "./useAuth";
import {
  deleteSupabaseFile,
  pickAndUploadImage,
} from "../utils/supabase-storage-utils";

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
  const { user } = useUser();
  const [product, setProduct] = useState<Product>({
    name: "",
    price: 0,
    barcode: initialBarcode || "",
    description: "",
    quantity: 0,
    imageUrl: "",
  });

  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] =
    useState<boolean>(false);
  const isNewProduct = !productId;

  // Load product data if editing an existing product
  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;

      setIsLoading(true);
      const result = await productService.getById(Number(productId));
      setIsLoading(false);

      if (result.data) {
        setProduct(result.data);
        setOriginalImageUrl(result.data.imageUrl || null);
      } else {
        Alert.alert("Error", result.message || "Failed to load product");
      }
    }

    loadProduct();
  }, [productId]);

  // Generate a unique barcode for new products
  const generateBarcode = () => {
    const timestamp = new Date().getTime().toString().slice(-10);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const newBarcode = `${timestamp}${random}`;

    setProduct((prev) => ({ ...prev, barcode: newBarcode }));
    return newBarcode;
  };

  // Pick and upload an image
  const handleImageUpload = async () => {
    try {
      // If there's an existing image, delete it first
      if (originalImageUrl) {
        await deleteSupabaseFile(originalImageUrl);
      }

      // Pick and upload new image
      const uploadedUrl = await pickAndUploadImage({
        fileType: "product",
        userId: user?.id,
      });

      if (uploadedUrl) {
        setProduct((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      }
    } catch (error) {
      JSON.stringify("error ", error);
      console.error("Image upload error:", error);
      Alert.alert("Error", "Failed to upload image");
    }
  };

  // Remove the current image
  const handleRemoveImage = async () => {
    try {
      // If there's an existing image, delete it
      if (originalImageUrl) {
        await deleteSupabaseFile(originalImageUrl);
      }

      // Clear image URL in product state
      setProduct((prev) => ({ ...prev, imageUrl: "" }));
    } catch (error) {
      console.error("Remove image error:", error);
      Alert.alert("Error", "Failed to remove image");
    }
  };

  const saveProduct = async (): Promise<boolean> => {
    // Form validation
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

    setIsLoading(true);

    try {
      let result;
      const productData: CreateProductData = {
        ...product,
        imageUrl: product.imageUrl || undefined,
      };

      if (isNewProduct) {
        result = await productService.create(productData);
      } else {
        result = await productService.update(Number(productId), productData);
      }

      if (result.data && result.data.id) {
        onSaveSuccess?.();
        return true;
      } else {
        Alert.alert("Error", result.message || "Failed to save product");
        return false;
      }
    } catch (error) {
      console.error("Save product error:", error);
      Alert.alert("Error", "An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (): Promise<boolean> => {
    if (!productId) return false;

    setIsLoading(true);

    try {
      // Delete product image if it exists
      if (originalImageUrl) {
        await deleteSupabaseFile(originalImageUrl);
      }

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
      console.error("Delete product error:", error);
      Alert.alert("Error", "An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    product,
    setProduct,
    isLoading,
    isNewProduct,
    deleteConfirmVisible,
    setDeleteConfirmVisible,
    saveProduct,
    deleteProduct,
    generateBarcode,
    handleImageUpload,
    handleRemoveImage,
  };
}
