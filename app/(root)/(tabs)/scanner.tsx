import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Camera,
  CameraType,
  BarCodeScanningResult,
  CameraView,
} from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { InventoryContext } from "../../../src/context/InventoryContext";
import { useRouter } from "expo-router";

const ScannerScreen = () => {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanMode, setScanMode] = useState("inventory"); // 'inventory' or 'checkout'

  const { findProductByBarcode, addToCart, inventory, isLoading } =
    useContext(InventoryContext);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: BarCodeScanningResult) => {
    console.log(data);
    if (scanned) return;

    setScanned(true);

    if (scanMode === "inventory") {
      // Check if product exists in inventory
      const product = findProductByBarcode(data);

      if (product) {
        // Product exists, navigate to product detail
        router.push(`/product-detail/${product.id}`);
      } else {
        // Product doesn't exist, navigate to create new product
        router.push(`/product-detail?barcode=${data}`);
      }
    } else if (scanMode === "checkout") {
      // Find product for checkout
      const product = findProductByBarcode(data);

      if (product) {
        if (product.quantity > 0) {
          // Add to cart
          addToCart(product);
          Alert.alert(
            "Added to Cart",
            `${product.name} - $${product.price.toFixed(2)}`
          );
        } else {
          Alert.alert("Out of Stock", `${product.name} is out of stock!`);
        }
      } else {
        Alert.alert(
          "Product Not Found",
          "This barcode is not in your inventory"
        );
      }
    }
  };

  const toggleScanMode = () => {
    setScanMode(scanMode === "inventory" ? "checkout" : "inventory");
    setScanned(false);
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
    <View style={styles.container}>
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

        {scanned && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.scanAgainButtonText}>Scan Again</Text>
          </TouchableOpacity>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        )}
      </View>

      {/* Manual entry button */}
      <TouchableOpacity
        style={styles.manualEntryButton}
        onPress={() => {
          if (scanMode === "inventory") {
            router.push("/product-detail");
          } else {
            router.push("/inventory");
          }
        }}
      >
        <Text style={styles.manualEntryButtonText}>
          {scanMode === "inventory" ? "Manual Entry" : "View Cart"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    bottom: 30,
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  manualEntryButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  manualEntryButtonText: {
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ScannerScreen;
