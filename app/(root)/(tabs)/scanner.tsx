import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import {
  useProducts,
  useProductByBarcode,
  Product,
} from "../../../src/hooks/useProducts";
import { useCart } from "../../../src/hooks/useCart";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { InventoryContext } from "../../../src/context/InventoryContext";
import { Logger } from "../../../src/utils/logger";
import { Audio } from "expo-av";
// Components
import {
  ScanModeToggle,
  ScannerOverlay,
  ScanButton,
  ScannerLoading,
  ScanInstructions,
  BottomActionBar,
} from "../../../components/scanner";
import ScannerModal from "../../../components/scanner/ScannerModal";
import { Ionicons } from "@expo/vector-icons";

const log = new Logger("Scanner");

// Toast Component
const Toast = ({ message, visible, productName, productPrice }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.toastIcon}>
        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
      </View>
      <View style={styles.toastContent}>
        <Text style={styles.toastTitle}>{message}</Text>
        {productName && (
          <Text style={styles.toastSubtitle}>
            {productName} - ${productPrice}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const ScannerScreen = () => {
  const { checkout } = useLocalSearchParams();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanMode, setScanMode] = useState(checkout ? "checkout" : "inventory");
  const [barcode, setBarcode] = useState(null);
  const [manuallyChecking, setManuallyChecking] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [sound, setSound] = useState(null);

  // Last scanned barcode to prevent duplicate scans
  const [lastScannedBarcode, setLastScannedBarcode] = useState(null);
  const [lastScannedTime, setLastScannedTime] = useState(0);

  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    productName: null,
    productPrice: null,
  });

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    status: "success",
    productName: null,
    productPrice: null,
    actions: [],
  });

  // Get inventory context for direct operations
  const inventoryContext = useContext(InventoryContext);

  // Get all products to ensure we have the latest data
  const { data: allProducts, refetch: refetchProducts } = useProducts();

  // Use the hook for API operations
  const {
    data: scannedProduct,
    isLoading: isLoadingProduct,
    error: productError,
    refetch: refetchProduct,
  } = useProductByBarcode(barcode);

  const { addToCart } = useCart();

  // Close modal handler
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // Refresh product list when screen is focused
  useFocusEffect(
    useCallback(() => {
      refetchProducts();
      // If we have a previously scanned product ID, refetch it
      if (currentProductId) {
        refetchProduct();
      }
    }, [refetchProducts, currentProductId, refetchProduct])
  );

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
      // First check local inventory using the most recent data
      let product = null;

      // Try to find the product in the latest fetched data
      if (allProducts && allProducts.length > 0) {
        product = allProducts.find((p) => p.barcode === barcode);
      }

      // If not found in allProducts, try the inventoryContext
      if (!product) {
        product = inventoryContext.findProductByBarcode(barcode);
      }

      // If still not found and we have a fetchProductByBarcode function, try API
      if (!product && inventoryContext.fetchProductByBarcode) {
        try {
          log.info(`Attempting to fetch product with barcode: ${barcode}`);
          const response = await inventoryContext.fetchProductByBarcode(
            barcode
          );
          if (response.success && response.data) {
            product = response.data;
            setCurrentProductId(product.id.toString());
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

  // Find product in local data first or use API result
  const findProductFromAllSources = useCallback(() => {
    if (!barcode) return null;

    // First check in allProducts (latest data)
    if (allProducts && allProducts.length > 0) {
      const foundProduct = allProducts.find((p) => p.barcode === barcode);
      if (foundProduct) return foundProduct;
    }

    // Then use the scanned product from API
    if (scannedProduct) return scannedProduct;

    // Finally, try inventoryContext
    if (inventoryContext) {
      return inventoryContext.findProductByBarcode(barcode);
    }

    return null;
  }, [barcode, allProducts, scannedProduct, inventoryContext]);

  // Load sound effect
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Play barcode scan sound
  const playBeepSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../../assets/sounds/barcode-beep.mp3")
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      log.error("Error playing sound:", error);
    }
  };

  // Show toast message
  const showToast = (message, productName = null, productPrice = null) => {
    setToast({
      visible: true,
      message,
      productName,
      productPrice,
    });

    // Auto hide toast after 3 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  useEffect(() => {
    if (!barcode || !scanned) return;

    const handleScannedProduct = async () => {
      // Play beep sound when barcode is scanned
      await playBeepSound();

      // Find product using all available sources
      const productToUse = findProductFromAllSources();

      if (scanMode === "inventory") {
        if (productToUse) {
          // Product exists, navigate to product detail
          router.navigate(`/(root)/product-detail/${productToUse.id}`);
          setBarcode(null);
          setCurrentProductId(productToUse.id);
        } else if ((productError || !isLoadingProduct) && !manuallyChecking) {
          // Product doesn't exist, show modal
          setModalConfig({
            title: "Product Not Found",
            message: "This product doesn't exist in your inventory.",
            status: "warning",
            productName: null,
            productPrice: null,
            actions: [
              {
                text: "Cancel",
                primary: false,
                onPress: () => {
                  setScanned(false);
                  setBarcode(null);
                },
              },
              {
                text: "Add Product",
                primary: true,
                onPress: () => {
                  router.navigate({
                    pathname: "/(root)/product-detail",
                    params: { barcode },
                  });
                  setBarcode(null);
                },
              },
            ],
          });
          setModalVisible(true);
        }
      } else if (scanMode === "checkout") {
        if (productToUse) {
          if (productToUse.quantity > 0) {
            addToCart(productToUse);

            // Show toast notification instead of modal
            showToast("Added to Cart", productToUse.name, productToUse.price);

            // Automatically reset scan after a short delay in checkout mode
            setTimeout(() => {
              setScanned(false);
              setBarcode(null);
            }, 1000);
          } else {
            // Show out of stock modal
            setModalConfig({
              title: "Out of Stock",
              message: "This product is currently out of stock.",
              status: "error",
              productName: productToUse.name,
              productPrice: productToUse.price,
              actions: [
                {
                  text: "OK",
                  primary: true,
                  onPress: () => {
                    setScanned(false);
                    setBarcode(null);
                  },
                },
              ],
            });
            setModalVisible(true);
          }
        } else if ((productError || !isLoadingProduct) && !manuallyChecking) {
          // Show product not found modal
          setModalConfig({
            title: "Product Not Found",
            message: "This product doesn't exist in your inventory.",
            status: "warning",
            productName: null,
            productPrice: null,
            actions: [
              {
                text: "Scan Again",
                primary: false,
                icon: "scan-outline",
                onPress: () => {
                  setScanned(false);
                  setBarcode(null);
                },
              },
              {
                text: "Add Product",
                primary: true,
                icon: "add-circle-outline",
                onPress: () => {
                  router.navigate({
                    pathname: "/(root)/product-detail",
                    params: { barcode },
                  });
                  setBarcode(null);
                },
              },
            ],
          });
          setModalVisible(true);
        }
      }
    };

    // Delay a bit to allow for API or context to fetch/process product
    const timeoutId = setTimeout(() => {
      handleScannedProduct();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [
    barcode,
    scanMode,
    scannedProduct,
    productError,
    isLoadingProduct,
    manuallyChecking,
    allProducts,
    findProductFromAllSources,
  ]);

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: any;
  }) => {
    // Prevent scanning the same barcode multiple times in a short period
    const now = Date.now();

    // Check if this is the same barcode and if it was scanned within the last 3 seconds
    if (data === lastScannedBarcode && now - lastScannedTime < 3000) {
      // Skip this scan - it's likely a duplicate
      return;
    }

    if (scanned) return;

    // Update last scanned info
    setLastScannedBarcode(data);
    setLastScannedTime(now);

    log.info(`Scanned barcode: ${data} (type: ${type})`);
    setScanned(true);
    setBarcode(data);

    // Immediately refetch all products to get latest data
    refetchProducts();

    // Also try to check inventory manually
    checkInventory();
  };

  const handleScanAgain = () => {
    setScanned(false);
    setBarcode(null);
    setCurrentProductId(null);
  };

  const toggleScanMode = useCallback(() => {
    setScanMode((prevMode) =>
      prevMode === "inventory" ? "checkout" : "inventory"
    );
    setScanned(false);
    setBarcode(null);
    setCurrentProductId(null);
  }, []);

  const handleManualEntry = useCallback(() => {
    if (scanMode === "inventory") {
      router.navigate({ pathname: "/(root)/product-detail" });
    } else {
      router.navigate({ pathname: "/(root)/checkout" });
    }
  }, [scanMode, router]);

  const renderProductImage = () => {
    return <Ionicons name="cube-outline" size={30} color="#64748b" />;
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => router.back()}
        >
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Scan mode toggle component */}
      <ScanModeToggle scanMode={scanMode} onToggle={toggleScanMode} />

      {/* Instructions */}
      <ScanInstructions scanMode={scanMode} />

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

        {/* Scanner overlay with scan area */}
        <ScannerOverlay />

        {/* Scan again button */}
        {scanned && !isLoadingProduct && !manuallyChecking && !modalVisible && (
          <ScanButton onPress={handleScanAgain} />
        )}

        {/* Loading indicator */}
        {(isLoadingProduct || manuallyChecking) && <ScannerLoading />}

        {/* Toast notification */}
        <Toast
          visible={toast.visible}
          message={toast.message}
          productName={toast.productName}
          productPrice={toast.productPrice}
        />
      </View>

      {/* Bottom action bar for manual entry or view cart */}
      <BottomActionBar scanMode={scanMode} onPress={handleManualEntry} />

      {/* Scanner Modal for results and actions */}
      <ScannerModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        status={modalConfig.status}
        productName={modalConfig.productName}
        productPrice={modalConfig.productPrice}
        productImage={modalConfig.productName ? renderProductImage() : null}
        actions={modalConfig.actions}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: StatusBar.currentHeight,
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  permissionText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#64748b",
  },
  permissionButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 20,
  },
  permissionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Toast styles
  toast: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastIcon: {
    marginRight: 12,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  toastSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
});

export default ScannerScreen;
