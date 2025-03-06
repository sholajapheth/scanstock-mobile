import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { InventoryContext } from "../../src/context/InventoryContext";

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

  const [checkoutModalVisible, setCheckoutModalVisible] =
    useState<boolean>(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
  });

  const handleRemoveItem = (productId: number) => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFromCart(productId),
      },
    ]);
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
      Alert.alert("Error", "Your cart is empty");
      return;
    }

    setCheckoutModalVisible(true);
  };

  const handleConfirmCheckout = async () => {
    try {
      const result = await checkout({
        customerInfo,
        total: getCartTotal(),
        // date: new Date().toISOString(),
      });

      if (result.success) {
        setCheckoutModalVisible(false);

        // Generate and share receipt
        await generateReceipt();

        Alert.alert(
          "Checkout Complete",
          "Sale has been processed successfully!",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", result.message || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const generateReceiptHTML = () => {
    const total = getCartTotal();
    const date = new Date().toLocaleString();

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { 
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
              color: #1e293b;
            }
            .header { 
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px dashed #cbd5e1;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin: 10px 0;
            }
            .date {
              color: #64748b;
              font-size: 14px;
            }
            .customer {
              margin: 15px 0;
              font-size: 14px;
            }
            .items {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .items th {
              text-align: left;
              color: #64748b;
              font-weight: normal;
              font-size: 14px;
              padding: 8px 4px;
              border-bottom: 1px solid #cbd5e1;
            }
            .items td {
              padding: 12px 4px;
              border-bottom: 1px solid #f1f5f9;
              font-size: 14px;
            }
            .qty {
              text-align: center;
            }
            .price {
              text-align: right;
            }
            .subtotal {
              text-align: right;
            }
            .summary {
              margin-top: 20px;
              text-align: right;
            }
            .total-row {
              font-size: 18px;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 14px;
              color: #64748b;
              padding-top: 15px;
              border-top: 1px dashed #cbd5e1;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">ScanStock Pro</div>
            <div class="date">${date}</div>
          </div>
          
          ${
            customerInfo.name
              ? `
          <div class="customer">
            <div>Customer: ${customerInfo.name}</div>
            ${
              customerInfo.email
                ? `<div>Email: ${customerInfo.email}</div>`
                : ""
            }
            ${
              customerInfo.phone
                ? `<div>Phone: ${customerInfo.phone}</div>`
                : ""
            }
          </div>
          `
              : ""
          }
          
          <table class="items">
            <thead>
              <tr>
                <th>Item</th>
                <th class="qty">Qty</th>
                <th class="price">Price</th>
                <th class="subtotal">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${cart
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td class="qty">${item.quantity}</td>
                  <td class="price">$${item.price}</td>
                  <td class="subtotal">$${(item.price * item.quantity).toFixed(
                    2
                  )}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="total-row">
              Total: $${total}
            </div>
          </div>
          
          <div class="footer">
            Thank you for your purchase!
          </div>
        </body>
      </html>
    `;
  };

  const generateReceipt = async () => {
    try {
      const html = generateReceiptHTML();
      const { uri } = await Print.printToFileAsync({ html });

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Receipt",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("Error generating receipt", error);
      Alert.alert("Error", "Failed to generate receipt");
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price}</Text>
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

        <Text style={styles.itemTotal}>${item.price * item.quantity}</Text>

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
      <TouchableOpacity style={styles.scanButton} onPress={() => {}}>
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
            <Text style={styles.summaryAmount}>${totalAmount}</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={() => {
                Alert.alert(
                  "Clear Cart",
                  "Are you sure you want to clear the cart?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Clear", style: "destructive", onPress: clearCart },
                  ]
                );
              }}
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
                <Text style={styles.modalSummaryTotal}>${totalAmount}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
