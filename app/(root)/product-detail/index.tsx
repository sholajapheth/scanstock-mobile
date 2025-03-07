// src/screens/ProductDetailScreen.tsx
import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../../../src/hooks/useProducts";
import { Logger } from "../../../src/utils/logger";
import type { Product } from "../../../src/hooks/useProducts";
import { InventoryContext } from "../../../src/context/InventoryContext";
const log = new Logger("ProductDetailScreen");

const ProductDetailScreen = () => {
  const { productId, barcode: initialBarcode } = useLocalSearchParams();
  console.log("initialBarcode", initialBarcode);
  const router = useRouter();
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const { generateBarcode } = useContext(InventoryContext);

  // Query for fetching product data
  const { data: existingProduct, isLoading: isLoadingProduct } = useProduct(
    Number(productId)
  );

  // Mutations for CRUD operations
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  // Local state for form data
  const [formData, setFormData] = useState<Partial<Product>>({
    name: existingProduct?.name || "",
    price: existingProduct?.price || 0,
    quantity: existingProduct?.quantity || 0,
    description: existingProduct?.description || "",
    barcode: existingProduct?.barcode || initialBarcode || "",
  });

  const isNewProduct = !productId;
  const isLoading =
    isLoadingProduct ||
    createProduct.isPending ||
    updateProduct.isPending ||
    deleteProduct.isPending;

  // Update form field
  const updateField = (field: keyof Product, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Generate unique barcode
  const handleGenerateBarcode = () => {
    const newBarcode = generateBarcode();
    updateField("barcode", newBarcode);
  };

  // Save product
  const handleSave = async () => {
    log.info("Save button pressed");
    try {
      if (isNewProduct) {
        await createProduct.mutateAsync(formData);
        Alert.alert("Success", "Product created successfully");
      } else {
        await updateProduct.mutateAsync({
          id: productId as string,
          data: formData,
        });
        Alert.alert("Success", "Product updated successfully");
      }
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to save product"
      );
    }
  };

  // Handle product deletion
  const handleDelete = async () => {
    log.info("Delete button pressed");
    try {
      await deleteProduct.mutateAsync(productId as string);
      Alert.alert("Success", "Product deleted successfully");
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to delete product"
      );
    }
  };

  const DeleteConfirmation = () => (
    <View style={styles.deleteConfirmContainer}>
      <Text style={styles.deleteConfirmText}>
        Are you sure you want to delete this product?
      </Text>
      <View style={styles.deleteConfirmButtons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => setDeleteConfirmVisible(false)}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}

      <View style={styles.form}>
        {/* Product Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => updateField("name", text)}
            placeholder="Enter product name"
          />
        </View>

        {/* Price */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            value={formData.price?.toString()}
            onChangeText={(text) => updateField("price", parseFloat(text) || 0)}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>

        {/* Quantity */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={formData.quantity?.toString()}
            onChangeText={(text) =>
              updateField("quantity", parseInt(text) || 0)
            }
            keyboardType="number-pad"
            placeholder="0"
          />
        </View>

        {/* Barcode */}
        {isNewProduct && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Barcode</Text>
            <View style={styles.barcodeContainer}>
              <TextInput
                style={[styles.input, styles.barcodeInput]}
                value={formData.barcode}
                onChangeText={(text) => updateField("barcode", text)}
                placeholder="Enter barcode"
                editable={isNewProduct}
              />
              <TouchableOpacity
                style={styles.generateButton}
                onPress={handleGenerateBarcode}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => updateField("description", text)}
            placeholder="Enter product description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isNewProduct ? "Add Product" : "Update Product"}
          </Text>
        </TouchableOpacity>

        {/* Delete Button */}
        {!isNewProduct && (
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={() => setDeleteConfirmVisible(true)}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Delete Product</Text>
          </TouchableOpacity>
        )}
      </View>

      {deleteConfirmVisible && <DeleteConfirmation />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
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
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#2563eb",
  },
  cancelButton: {
    backgroundColor: "#94a3b8",
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteConfirmContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    padding: 16,
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
});
export default ProductDetailScreen;
