import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  useColorScheme,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import {
  useProducts,
  useProductByBarcode,
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
import { Colors } from "../../../constants/Colors";
import { formatCurrency } from "@/src/utils/format";

const log = new Logger("Scanner");

interface ProductItem {
  id: string;
  barcode: string;
  name: string;
  price: number;
  quantity: number;
}

interface ToastState {
  visible: boolean;
  message: string;
  productName: string | null;
  productPrice: string | null;
}

// Toast Component
interface ToastProps {
  message: string;
  visible: boolean;
  productName: string | null;
  productPrice: number | null;
}

const Toast: React.FC<ToastProps> = ({
  message,
  visible,
  productName,
  productPrice,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const colors = Colors.light;

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
          backgroundColor: colors.background,
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
        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
      </View>
      <View style={styles.toastContent}>
        <Text style={[styles.toastTitle, { color: colors.text }]}>
          {message}
        </Text>
        {productName && (
          <Text style={[styles.toastSubtitle, { color: colors.icon }]}>
            {productName} - {formatCurrency(productPrice)}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

interface ModalAction {
  text: string;
  primary: boolean;
  icon?: string;
  onPress: () => void;
}

interface ModalConfig {
  title: string;
  message: string;
  status: "success" | "warning" | "error";
  productName: string | null;
  productPrice: string | null;
  actions: ModalAction[];
}

const ScannerScreen = () => {
  const { checkout } = useLocalSearchParams();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanMode, setScanMode] = useState<"checkout" | "inventory">(
    checkout ? "checkout" : "inventory"
  );
  const [barcode, setBarcode] = useState<string | null>(null);
  const [manuallyChecking, setManuallyChecking] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Debounce scanning
  const [isScanning, setIsScanning] = useState(false);
  const [scanDebounceTimeout, setScanDebounceTimeout] =
    useState<NodeJS.Timeout | null>(null);

  // Toast state
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: "",
    productName: null,
    productPrice: null,
  });

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
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

  const colors = Colors.light;

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
        product = allProducts.find((p: ProductItem) => p.barcode === barcode);
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
      const foundProduct = allProducts.find(
        (p: ProductItem) => p.barcode === barcode
      );
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
  const showToast = (
    message: string,
    productName: string | null = null,
    productPrice: number | null = null
  ) => {
    setToast({
      visible: true,
      message,
      productName,
      productPrice: productPrice?.toString() ?? null,
    });
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
          showProductNotFoundModal();
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
              setIsScanning(false);
            }, 1000);
          } else {
            // Show out of stock modal
            showOutOfStockModal(productToUse);
          }
        } else if ((productError || !isLoadingProduct) && !manuallyChecking) {
          // Show product not found modal
          showProductNotFoundModal();
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
    // If already scanning or scanned, ignore new scans
    if (isScanning || scanned) return;

    // Set scanning state to true to prevent multiple scans
    setIsScanning(true);

    // Clear any existing timeout
    if (scanDebounceTimeout) {
      clearTimeout(scanDebounceTimeout);
    }

    log.info(`Scanned barcode: ${data} (type: ${type})`);
    setScanned(true);
    setBarcode(data);

    // Immediately refetch all products to get latest data
    refetchProducts();

    // Also try to check inventory manually
    checkInventory();

    // Set a timeout to reset the scanning state after a delay
    const timeout = setTimeout(() => {
      setIsScanning(false);
    }, 3000); // 3 seconds debounce

    setScanDebounceTimeout(timeout);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (scanDebounceTimeout) {
        clearTimeout(scanDebounceTimeout);
      }
    };
  }, [scanDebounceTimeout]);

  const handleScanAgain = () => {
    setScanned(false);
    setBarcode(null);
    setCurrentProductId(null);
    setIsScanning(false);
  };

  const toggleScanMode = useCallback(() => {
    setScanMode((prevMode) =>
      prevMode === "inventory" ? "checkout" : "inventory"
    );
    setScanned(false);
    setBarcode(null);
    setCurrentProductId(null);
    setIsScanning(false);
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

  // Update modal config for out of stock
  const showOutOfStockModal = (product: ProductItem) => {
    setModalConfig({
      title: "Out of Stock",
      message: "This product is currently out of stock.",
      status: "error",
      productName: product.name,
      productPrice: product.price.toString(),
      actions: [
        {
          text: "OK",
          primary: true,
          onPress: () => {
            setScanned(false);
            setBarcode(null);
            setIsScanning(false);
          },
        },
      ],
    });
    setModalVisible(true);
  };

  // Update modal config for product not found
  const showProductNotFoundModal = () => {
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
            setIsScanning(false);
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
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
          onBarcodeScanned={
            scanned || isScanning ? undefined : handleBarCodeScanned
          }
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
          productPrice={parseFloat(toast.productPrice || "0")}
        />
      </View>

      {/* Bottom action bar for manual entry or view cart */}
      <BottomActionBar scanMode={scanMode} onPress={handleManualEntry} />

      {/* Scanner Modal with updated colors */}
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
        colors={{
          text: colors.text,
          background: colors.background,
          primary: colors.primary,
          success: colors.success,
          error: colors.error,
          warning: colors.warning,
          icon: colors.icon,
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: Colors.light.text,
  },
  permissionButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 20,
  },
  permissionButtonText: {
    color: Colors.light.background,
    fontWeight: "bold",
    fontSize: 16,
  },
  toast: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: Colors.light.background,
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
    color: Colors.light.text,
  },
  toastSubtitle: {
    fontSize: 14,
    color: Colors.light.icon,
    marginTop: 2,
  },
});

export default ScannerScreen;
