import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { InventoryContext } from "../../src/context/InventoryContext";
import { router } from "expo-router";
import generateReceiptHTML from "../../src/components/receipt/ReceiptGenerator";
import ReceiptActionModal from "../../src/components/modals/ReceiptActionModal";
import { useBusiness } from "@/src/hooks/useBusiness";
import ScannerModal from "@/components/scanner/ScannerModal";
import { formatCurrency } from "@/src/utils/format";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

const CheckoutScreen: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    checkout,
    isLoading,
  } = useContext(InventoryContext);

  const { data: businessProfile } = useBusiness();

  const [checkoutModalVisible, setCheckoutModalVisible] =
    useState<boolean>(false);
  const [receiptActionsVisible, setReceiptActionsVisible] =
    useState<boolean>(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [processingReceipt, setProcessingReceipt] = useState<boolean>(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
  });

  // Confirmation modal state
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    title: "",
    message: "",
    status: "warning",
    actions: [],
  });

  const showConfirmModal = (config) => {
    setConfirmModalConfig(config);
    setConfirmModalVisible(true);
  };

  const handleRemoveItem = (productId: number) => {
    showConfirmModal({
      title: "Remove Item",
      message: "Are you sure you want to remove this item?",
      status: "warning",
      actions: [
        {
          text: "Cancel",
          primary: false,
          onPress: () => setConfirmModalVisible(false),
        },
        {
          text: "Remove",
          primary: true,
          destructive: true,
          onPress: () => {
            removeFromCart(productId);
            setConfirmModalVisible(false);
          },
        },
      ],
    });
  };

  const handleQuantityChange = (
    productId: number,
    change: number,
    currentQty: number
  ) => {
    const newQty = currentQty + change;
    if (newQty >= 1) {
      updateCartItemQuantity(productId, newQty);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showConfirmModal({
        title: "Empty Cart",
        message: "Your cart is empty. Please add items before checkout.",
        status: "error",
        actions: [
          {
            text: "OK",
            primary: true,
            onPress: () => setConfirmModalVisible(false),
          },
        ],
      });
      return;
    }

    setCheckoutModalVisible(true);
  };

  const handleConfirmCheckout = async () => {
    try {
      const result = await checkout({
        customerInfo,
        total: getCartTotal(),
      });

      if (result.data) {
        setCheckoutModalVisible(false);

        // Generate receipt but show options instead of immediately sharing
        await generateReceipt();

        setReceiptActionsVisible(true);
      } else {
        showConfirmModal({
          title: "Checkout Failed",
          message:
            result.message || "Failed to complete checkout. Please try again.",
          status: "error",
          actions: [
            {
              text: "OK",
              primary: true,
              onPress: () => setConfirmModalVisible(false),
            },
          ],
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showConfirmModal({
        title: "Checkout Error",
        message:
          error?.data?.message ||
          "An unexpected error occurred during checkout.",
        status: "error",
        actions: [
          {
            text: "OK",
            primary: true,
            onPress: () => setConfirmModalVisible(false),
          },
        ],
      });
    }
  };

  // Generate the receipt and store the file URL
  const generateReceipt = async () => {
    try {
      setProcessingReceipt(true);

      const html = generateReceiptHTML({
        cart,
        customerInfo,
        total: getCartTotal(),
        businessInfo: businessProfile || null,
      });

      const { uri } = await Print.printToFileAsync({ html });
      setReceiptUrl(uri);

      return uri;
    } catch (error) {
      console.error("Error generating receipt", error);
      showConfirmModal({
        title: "Receipt Error",
        message: "Failed to generate receipt. Please try again.",
        status: "error",
        actions: [
          {
            text: "OK",
            primary: true,
            onPress: () => setConfirmModalVisible(false),
          },
        ],
      });
      return null;
    } finally {
      setProcessingReceipt(false);
    }
  };

  // Handle download receipt to device
  const handleDownloadReceipt = async () => {
    try {
      if (!receiptUrl) {
        const newUri = await generateReceipt();
        if (!newUri) return;
      }

      // Define a filename with timestamp
      const timestamp = new Date().getTime();
      const fileName = `receipt_${timestamp}.pdf`;

      // Check platform
      if (Platform.OS === "android") {
        try {
          // Try to save to Android Downloads folder first
          const permissions =
            await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
              FileSystem.StorageAccessFramework.getUriForDirectoryInRoot(
                "Download"
              )
            );

          if (permissions.granted) {
            // User granted permission to save to Downloads
            const destinationUri =
              await FileSystem.StorageAccessFramework.createFileAsync(
                permissions.directoryUri,
                fileName,
                "application/pdf"
              );

            // Copy the file content
            const fileContent = await FileSystem.readAsStringAsync(
              receiptUrl!,
              {
                encoding: FileSystem.EncodingType.Base64,
              }
            );

            await FileSystem.writeAsStringAsync(destinationUri, fileContent, {
              encoding: FileSystem.EncodingType.Base64,
            });

            showConfirmModal({
              title: "Download Complete",
              message: "Receipt has been saved to your Downloads folder.",
              status: "success",
              actions: [
                {
                  text: "OK",
                  primary: true,
                  onPress: () => {
                    setConfirmModalVisible(false);
                    setReceiptActionsVisible(false);
                    clearCart();
                  },
                },
              ],
            });

            console.log("Receipt saved to Downloads:", fileName);
          } else {
            // Fallback to the app's documents directory
            await saveToAppDirectory();
          }
        } catch (error) {
          console.error("Error saving to Downloads:", error);
          // Fallback to the app's documents directory
          await saveToAppDirectory();
        }
      } else {
        // iOS - Save to app's documents directory
        await saveToAppDirectory();
      }
    } catch (error) {
      console.error("Download error:", error);
      showConfirmModal({
        title: "Download Failed",
        message: "Failed to download receipt. Please try again.",
        status: "error",
        actions: [
          {
            text: "OK",
            primary: true,
            onPress: () => setConfirmModalVisible(false),
          },
        ],
      });
    }
  };

  // Helper function to save to app's documents directory
  const saveToAppDirectory = async () => {
    const timestamp = new Date().getTime();
    const fileName = `receipt_${timestamp}.pdf`;
    const downloadPath = FileSystem.documentDirectory + fileName;

    // Copy the file to the documents directory
    await FileSystem.copyAsync({
      from: receiptUrl!,
      to: downloadPath,
    });

    showConfirmModal({
      title: "Download Complete",
      message:
        "Receipt has been saved. You can view it in the 'My Receipts' section.",
      status: "success",
      actions: [
        {
          text: "View Receipts",
          primary: true,
          onPress: () => {
            setConfirmModalVisible(false);
            setReceiptActionsVisible(false);
            clearCart();
            router.push("/management/receipts");
          },
        },
        {
          text: "OK",
          primary: false,
          onPress: () => {
            setConfirmModalVisible(false);
            setReceiptActionsVisible(false);
            clearCart();
          },
        },
      ],
    });

    console.log("Receipt saved to app directory:", downloadPath);
  };

  // Handle share receipt
  const handleShareReceipt = async () => {
    try {
      if (!receiptUrl) {
        const newUri = await generateReceipt();
        if (!newUri) return;
      }

      await Sharing.shareAsync(receiptUrl!, {
        mimeType: "application/pdf",
        dialogTitle: "Share Receipt",
        UTI: "com.adobe.pdf",
      });

      setReceiptActionsVisible(false);
      clearCart();
    } catch (error) {
      console.error("Sharing error:", error);
      showConfirmModal({
        title: "Sharing Failed",
        message: "Failed to share receipt. Please try again.",
        status: "error",
        actions: [
          {
            text: "OK",
            primary: true,
            onPress: () => setConfirmModalVisible(false),
          },
        ],
      });
    }
  };

  const handleClearCart = () => {
    showConfirmModal({
      title: "Clear Cart",
      message: "Are you sure you want to clear all items from your cart?",
      status: "warning",
      actions: [
        {
          text: "Cancel",
          primary: false,
          onPress: () => setConfirmModalVisible(false),
        },
        {
          text: "Clear",
          primary: true,
          destructive: true,
          onPress: () => {
            clearCart();
            setConfirmModalVisible(false);
          },
        },
      ],
    });
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
      </View>

      <View style={styles.itemActions}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, -1, item.quantity)}
          >
            <Ionicons name="remove" size={16} color="#64748b" />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, 1, item.quantity)}
          >
            <Ionicons name="add" size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        <Text style={styles.itemTotal}>
          {formatCurrency(item.price * item.quantity)}
        </Text>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={64} color="#94a3b8" />
      <Text style={styles.emptyText}>Your cart is empty</Text>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => {
          router.push({
            pathname: "/(root)/(tabs)/scanner",
            params: {
              checkout: "true",
            },
          });
        }}
      >
        <Text style={styles.scanButtonText}>Scan Products</Text>
      </TouchableOpacity>
    </View>
  );

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = getCartTotal();

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCartItem}
        ListEmptyComponent={renderEmptyCart}
        contentContainerStyle={styles.listContent}
      />

      {cart.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items:</Text>
            <Text style={styles.summaryValue}>{totalItems}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={handleClearCart}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.checkoutButton]}
              onPress={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.checkoutButtonText}>Checkout</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Checkout Modal */}
      <Modal
        visible={checkoutModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Checkout</Text>
              <TouchableOpacity onPress={() => setCheckoutModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Customer Information (Optional)
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Customer Name"
              value={customerInfo.name}
              onChangeText={(text) =>
                setCustomerInfo({ ...customerInfo, name: text })
              }
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Email"
              keyboardType="email-address"
              value={customerInfo.email}
              onChangeText={(text) =>
                setCustomerInfo({ ...customerInfo, email: text })
              }
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Phone"
              keyboardType="phone-pad"
              value={customerInfo.phone}
              onChangeText={(text) =>
                setCustomerInfo({ ...customerInfo, phone: text })
              }
            />

            <View style={styles.modalSummary}>
              <Text style={styles.modalSummaryTitle}>Order Summary</Text>
              <View style={styles.modalSummaryRow}>
                <Text>Items:</Text>
                <Text>{totalItems}</Text>
              </View>
              <View style={styles.modalSummaryRow}>
                <Text style={styles.modalSummaryTotal}>Total:</Text>
                <Text style={styles.modalSummaryTotal}>
                  {formatCurrency(totalAmount)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleConfirmCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.completeButtonText}>Complete Sale</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Receipt Actions Modal */}
      <ReceiptActionModal
        visible={receiptActionsVisible}
        onClose={() => {
          setReceiptActionsVisible(false);
          clearCart(); // Clear cart if user closes without downloading/sharing
        }}
        onDownload={handleDownloadReceipt}
        onShare={handleShareReceipt}
        isLoading={processingReceipt}
      />

      {/* Confirmation Modal - replacing Alert.alert() with our custom modal */}
      <ScannerModal
        visible={confirmModalVisible}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        status={confirmModalConfig.status}
        actions={confirmModalConfig.actions}
        onClose={() => setConfirmModalVisible(false)}
        productName={null}
        productPrice={null}
        productImage={null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: StatusBar.currentHeight,
  },
  listContent: {
    padding: 16,
    paddingBottom: 200, // Extra space for summary container
  },
  cartItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    color: "#64748b",
  },
  itemActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    paddingHorizontal: 8,
    minWidth: 30,
    textAlign: "center",
    fontSize: 16,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    marginVertical: 16,
  },
  scanButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  scanButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
  summaryContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#64748b",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563eb",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  clearButton: {
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  clearButtonText: {
    color: "#64748b",
    fontWeight: "500",
    fontSize: 16,
  },
  checkoutButton: {
    backgroundColor: "#2563eb",
    marginLeft: 8,
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  modalSummary: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 8,
    marginVertical: 20,
  },
  modalSummaryTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  modalSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalSummaryTotal: {
    fontWeight: "bold",
    fontSize: 18,
  },
  completeButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CheckoutScreen;
