import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useToggleFavorite,
} from "../../../src/hooks/useProducts";
import { useCategories } from "../../../src/hooks/useCategories";
import { router, useLocalSearchParams } from "expo-router";

const ProductDetailScreen = () => {
  const { productId, barcode, id } = useLocalSearchParams();

  const isNewProduct = !id;

  // API hooks
  const { data: product, isLoading: isLoadingProduct } = useProduct(
    id ? parseInt(id as string) : 0
  );
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const toggleFavorite = useToggleFavorite();

  // Local state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    barcode: barcode || "",
    description: "",
    quantity: "0",
    categoryId: null,
    sku: "",
    reorderPoint: "",
    costPrice: "",
  });
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  // Initialize form with product data when available
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        barcode: product.barcode,
        description: product.description || "",
        quantity: product.quantity.toString(),
        categoryId: product.categoryId || null,
        sku: product.sku || "",
        reorderPoint: product.reorderPoint
          ? product.reorderPoint.toString()
          : "",
        costPrice: product.costPrice ? product.costPrice.toString() : "",
      });
    }
  }, [product]);

  // Generate a unique barcode for new products
  const generateBarcode = () => {
    const timestamp = new Date().getTime().toString().slice(-10);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const newBarcode = `${timestamp}${random}`;

    setFormData((prev) => ({ ...prev, barcode: newBarcode }));
  };

  // If it's a new product and no barcode was provided, generate one
  useEffect(() => {
    if (isNewProduct && !barcode) {
      generateBarcode();
    }
  }, [isNewProduct, barcode]);

  const handleSave = async () => {
    // Form validation
    if (!formData.name.trim()) {
      Alert.alert("Error", "Product name is required");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert("Error", "Price must be greater than zero");
      return;
    }

    if (!formData.barcode) {
      Alert.alert("Error", "Barcode is required");
      return;
    }

    // Prepare data for API
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      barcode: formData.barcode,
      description: formData.description,
      quantity: parseInt(formData.quantity) || 0,
      categoryId: formData.categoryId,
      sku: formData.sku || undefined,
      reorderPoint: formData.reorderPoint
        ? parseInt(formData.reorderPoint)
        : undefined,
      costPrice: formData.costPrice
        ? parseFloat(formData.costPrice)
        : undefined,
    };

    try {
      if (isNewProduct) {
        // Create new product
        await createProduct.mutateAsync(productData);
        Alert.alert("Success", "Product created successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        // Update existing product
        await updateProduct.mutateAsync({ id: productId, data: productData });
        Alert.alert("Success", "Product updated successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save product"
      );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(id ? parseInt(id as string) : 0);
      Alert.alert("Success", "Product deleted successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to delete product"
      );
    } finally {
      setDeleteConfirmVisible(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!productId) return;

    try {
      await toggleFavorite.mutateAsync(id ? parseInt(id as string) : 0);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update favorite status"
      );
    }
  };

  // Show loading state
  if (!isNewProduct && isLoadingProduct) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {(createProduct.isPending ||
        updateProduct.isPending ||
        deleteProduct.isPending) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isNewProduct ? "New Product" : "Edit Product"}
        </Text>

        {!isNewProduct && product && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={product.isFavorite ? "star" : "star-outline"}
              size={24}
              color={product.isFavorite ? "#f59e0b" : "#64748b"}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.form}>
        {/* Product Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, name: text }))
            }
            placeholder="Enter product name"
          />
        </View>

        {/* Price */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Price *</Text>
          <TextInput
            style={styles.input}
            value={formData.price}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, price: text }))
            }
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>

        {/* Quantity */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={formData.quantity}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, quantity: text }))
            }
            keyboardType="number-pad"
            placeholder="0"
          />
        </View>

        {/* Barcode */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Barcode *</Text>
          <View style={styles.barcodeContainer}>
            <TextInput
              style={[styles.input, styles.barcodeInput]}
              value={formData.barcode}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, barcode: text }))
              }
              placeholder="Enter barcode"
              editable={isNewProduct}
            />
            {isNewProduct && (
              <TouchableOpacity
                style={styles.generateButton}
                onPress={generateBarcode}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categorySelector}>
            <TouchableOpacity
              style={[
                styles.categoryOption,
                !formData.categoryId && styles.categoryOptionSelected,
              ]}
              onPress={() =>
                setFormData((prev) => ({ ...prev, categoryId: null }))
              }
            >
              <Text
                style={[
                  styles.categoryOptionText,
                  !formData.categoryId && styles.categoryOptionTextSelected,
                ]}
              >
                None
              </Text>
            </TouchableOpacity>

            {categories?.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  formData.categoryId === category.id &&
                    styles.categoryOptionSelected,
                  { borderLeftColor: category.color || "#e2e8f0" },
                ]}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, categoryId: category.id }))
                }
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    formData.categoryId === category.id &&
                      styles.categoryOptionTextSelected,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SKU */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>SKU (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.sku}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, sku: text }))
            }
            placeholder="Enter SKU"
          />
        </View>

        {/* Cost Price */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Cost Price (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.costPrice}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, costPrice: text }))
            }
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>

        {/* Reorder Point */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Reorder Point (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.reorderPoint}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, reorderPoint: text }))
            }
            keyboardType="number-pad"
            placeholder="Quantity at which to reorder"
          />
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, description: text }))
            }
            placeholder="Enter product description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={createProduct.isPending || updateProduct.isPending}
        >
          <Text style={styles.saveButtonText}>
            {isNewProduct ? "Add Product" : "Update Product"}
          </Text>
        </TouchableOpacity>

        {/* Delete Button (only for existing products) */}
        {!isNewProduct && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setDeleteConfirmVisible(true)}
            disabled={deleteProduct.isPending}
          >
            <Text style={styles.deleteButtonText}>Delete Product</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Delete Confirmation */}
      {deleteConfirmVisible && (
        <View style={styles.deleteConfirmContainer}>
          <Text style={styles.deleteConfirmText}>
            Are you sure you want to delete this product?
          </Text>
          <View style={styles.deleteConfirmButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setDeleteConfirmVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmDeleteButton}
              onPress={handleDelete}
              disabled={deleteProduct.isPending}
            >
              <Text style={styles.confirmDeleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  favoriteButton: {
    padding: 8,
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#1e293b",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  barcodeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  barcodeInput: {
    flex: 1,
  },
  generateButton: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  categorySelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  categoryOption: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderLeftWidth: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  categoryOptionSelected: {
    backgroundColor: "#dbeafe",
    borderColor: "#2563eb",
  },
  categoryOptionText: {
    color: "#64748b",
    fontSize: 14,
  },
  categoryOptionTextSelected: {
    color: "#2563eb",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#ef4444",
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteConfirmContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deleteConfirmText: {
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
  },
  deleteConfirmButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#64748b",
    fontWeight: "500",
    fontSize: 16,
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginLeft: 8,
  },
  confirmDeleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ProductDetailScreen;
