import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import {
  Camera,
  CameraType,
  BarcodeScanningResult,
  CameraView,
} from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useProductByBarcode } from "../../../src/hooks/useProducts";
import { useCart } from "../../../src/hooks/useCart";
import { router, useLocalSearchParams } from "expo-router";
import { InventoryContext } from "../../../src/context/InventoryContext";
import { Logger } from "../../../src/utils/logger";

const log = new Logger("Scanner");

const ScannerScreen = () => {
  const { checkout } = useLocalSearchParams();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanMode, setScanMode] = useState(checkout ? "checkout" : "inventory"); // 'inventory' or 'checkout'
  const [barcode, setBarcode] = useState<string | null>(null);
  const [manuallyChecking, setManuallyChecking] = useState(false);

  // Get inventory context for direct operations
  const inventoryContext = useContext(InventoryContext);

  // Use the hook for API operations
  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = useProductByBarcode(barcode);

  const { addToCart } = useCart();

  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Manually check inventory when barcode is scanned
  const checkInventory = async () => {
    if (!barcode) return null;
    if (!inventoryContext) return null;

    setManuallyChecking(true);

    try {
      // First check local inventory
      let product = inventoryContext.findProductByBarcode(barcode);

      // If not found locally and we have a fetchProductByBarcode function, try it
      if (!product && inventoryContext.fetchProductByBarcode) {
        try {
          log.info(`Attempting to fetch product with barcode: ${barcode}`);
          const response = await inventoryContext.fetchProductByBarcode(
            barcode
          );
          if (response.success && response.data) {
            product = response.data;
          }
        } catch (error) {
          log.error(`Error fetching product by barcode: ${barcode}`, error);
        }
      }

      return product;
    } catch (error) {
      log.error(`Error checking inventory for barcode: ${barcode}`, error);
      return null;
    } finally {
      setManuallyChecking(false);
    }
  };

  // Handle product found or not found
  useEffect(() => {
    if (!barcode || !scanned) return;

    if (scanMode === "inventory") {
      if (product) {
        // Product exists, navigate to product detail
        router.navigate({
          pathname: "/(root)/product-detail",
          params: { productId: product.id },
        });
        setBarcode(null);
      } else if (productError || !isLoadingProduct) {
        // Product doesn't exist, navigate to create new product
        Alert.alert(
          "Product Not Found",
          "Would you like to add this product?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
                setScanned(false);
                setBarcode(null);
              },
            },
            {
              text: "Add Product",
              onPress: () => {
                router.navigate({
                  pathname: "/(root)/product-detail",
                  params: { barcode },
                });
                setBarcode(null);
              },
            },
          ]
        );
      }
    } else if (scanMode === "checkout") {
      if (product) {
        if (product.quantity > 0) {
          addToCart(product);
          Alert.alert("Added to Cart", `${product.name} - $${product.price}`, [
            {
              text: "OK",
              onPress: () => {
                setScanned(false);
                setBarcode(null);
              },
            },
          ]);
        } else {
          Alert.alert("Out of Stock", `${product.name} is out of stock!`, [
            {
              text: "OK",
              onPress: () => {
                setScanned(false);
                setBarcode(null);
              },
            },
          ]);
        }
      } else if (productError || !isLoadingProduct) {
        Alert.alert(
          "Product Not Found",
          "This product is not in your inventory.",
          [
            {
              text: "OK",
              onPress: () => {
                setScanned(false);
                setBarcode(null);
              },
            },
            {
              text: "Add Product",
              onPress: () => {
                router.navigate({
                  pathname: "/(root)/product-detail",
                  params: { barcode },
                });
                setBarcode(null);
              },
            },
          ]
        );
      }
    }
  }, [product, productError, barcode, scanMode, isLoadingProduct]);

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanned) return;
    log.info(`Scanned barcode: ${data} (type: ${type})`);
    setScanned(true);
    setBarcode(data);
  };

  const toggleScanMode = () => {
    setScanMode(scanMode === "inventory" ? "checkout" : "inventory");
    setScanned(false);
    setBarcode(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Scan mode toggle */}
      <View style={styles.modeToggleContainer}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            scanMode === "inventory" && styles.activeModeButton,
          ]}
          onPress={() => setScanMode("inventory")}
        >
          <Ionicons
            name="list-outline"
            size={20}
            color={scanMode === "inventory" ? "#fff" : "#2563eb"}
          />
          <Text
            style={[
              styles.modeButtonText,
              scanMode === "inventory" && styles.activeModeButtonText,
            ]}
          >
            Inventory
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            scanMode === "checkout" && styles.activeModeButton,
          ]}
          onPress={() => setScanMode("checkout")}
        >
          <Ionicons
            name="cart-outline"
            size={20}
            color={scanMode === "checkout" ? "#fff" : "#2563eb"}
          />
          <Text
            style={[
              styles.modeButtonText,
              scanMode === "checkout" && styles.activeModeButtonText,
            ]}
          >
            Checkout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mode instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          {scanMode === "inventory"
            ? "Scan product barcode to view or add to inventory"
            : "Scan product barcode to add to cart"}
        </Text>
      </View>

      {/* Camera scanner */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{
            barcodeTypes: [
              "upc_e",
              "upc_a",
              "ean13",
              "ean8",
              "code128",
              "code39",
              "code93",
              "codabar",
              "itf14",
              "qr",
              "datamatrix",
              "pdf417",
            ],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        {/* Scanner overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>

        {scanned && !isLoadingProduct && !manuallyChecking && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => {
              setScanned(false);
              setBarcode(null);
            }}
          >
            <Text style={styles.scanAgainButtonText}>Scan Again</Text>
          </TouchableOpacity>
        )}

        {(isLoadingProduct || manuallyChecking) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Checking product...</Text>
          </View>
        )}
      </View>

      {/* Manual entry button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.manualEntryButton}
          onPress={() => {
            if (scanMode === "inventory") {
              router.navigate({
                pathname: "/(root)/product-detail",
              });
            } else {
              router.navigate({
                pathname: "/(root)/checkout",
              });
            }
          }}
        >
          <Text style={styles.manualEntryButtonText}>
            {scanMode === "inventory" ? "Manual Entry" : "View Cart"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 30,
  },
  modeToggleContainer: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  activeModeButton: {
    backgroundColor: "#2563eb",
  },
  modeButtonText: {
    marginLeft: 4,
    color: "#2563eb",
    fontWeight: "500",
  },
  activeModeButtonText: {
    color: "#fff",
  },
  instructionsContainer: {
    padding: 16,
    alignItems: "center",
  },
  instructionsText: {
    color: "#64748b",
    fontSize: 14,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#2563eb",
    backgroundColor: "transparent",
  },
  scanAgainButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  scanAgainButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#fff",
    fontSize: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  manualEntryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  manualEntryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ScannerScreen;
