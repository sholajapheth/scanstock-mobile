import React, { useState, useEffect, useContext } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { InventoryContext } from "@/src/context/InventoryContext";

interface Product {
  id?: number;
  name: string;
  price: number;
  barcode: string;
  description: string;
  quantity: number;
}

const ProductDetailScreen = () => {
  const { productId, barcode } = useLocalSearchParams();
  const router = useRouter();
  const isNewProduct = !productId;

  const [product, setProduct] = useState<Product>({
    name: "",
    price: 0,
    barcode: barcode?.toString() || "",
    description: "",
    quantity: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] =
    useState<boolean>(false);

  const {
    inventory,
    addProduct,
    updateProduct,
    deleteProduct,
    generateBarcode,
  } = useContext(InventoryContext);

  // Load product data if editing an existing product
  useEffect(() => {
    if (productId) {
      const existingProduct = inventory.find(
        (item) => item.id === Number(productId)
      );
      if (existingProduct) {
        setProduct(existingProduct);
      }
    }

    // If it's a new product and no barcode was provided, generate one
    if (isNewProduct && !barcode) {
      handleGenerateBarcode();
    }
  }, [productId, inventory]);

  const handleSave = async () => {
    // Validate form
    if (!product.name.trim()) {
      Alert.alert("Error", "Product name is required");
      return;
    }

    if (product.price <= 0) {
      Alert.alert("Error", "Price must be greater than zero");
      return;
    }

    if (!product.barcode) {
      Alert.alert("Error", "Barcode is required");
      return;
    }

    setIsLoading(true);

    try {
      let result;

      if (isNewProduct) {
        // Add new product
        result = await addProduct(product);
      } else {
        // Update existing product
        result = await updateProduct(Number(productId), product);
      }

      if (result.success) {
        router.back();
      } else {
        Alert.alert("Error", result.message || "Failed to save product");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Save product error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productId) return;

    setIsLoading(true);

    try {
      const result = await deleteProduct(Number(productId));

      if (result.success) {
        router.back();
      } else {
        Alert.alert("Error", result.message || "Failed to delete product");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Delete product error:", error);
    } finally {
      setIsLoading(false);
      setDeleteConfirmVisible(false);
    }
  };

  const handleGenerateBarcode = () => {
    const newBarcode = generateBarcode();
    setProduct({ ...product, barcode: newBarcode });
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
            value={product.name}
            onChangeText={(text) => setProduct({ ...product, name: text })}
            placeholder="Enter product name"
          />
        </View>

        {/* Price */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            value={product.price.toString()}
            onChangeText={(text) => {
              const price = parseFloat(text) || 0;
              setProduct({ ...product, price });
            }}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>

        {/* Quantity */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            value={product.quantity.toString()}
            onChangeText={(text) => {
              const quantity = parseInt(text) || 0;
              setProduct({ ...product, quantity });
            }}
            keyboardType="number-pad"
            placeholder="0"
          />
        </View>

        {/* Barcode */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Barcode</Text>
          <View style={styles.barcodeContainer}>
            <TextInput
              style={[styles.input, styles.barcodeInput]}
              value={product.barcode}
              onChangeText={(text) => setProduct({ ...product, barcode: text })}
              placeholder="Enter barcode"
              editable={isNewProduct}
            />
            {isNewProduct && (
              <TouchableOpacity
                style={styles.generateButton}
                onPress={handleGenerateBarcode}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Description */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={product.description}
            onChangeText={(text) =>
              setProduct({ ...product, description: text })
            }
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

        {/* Delete Button (only for existing products) */}
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
