// app/receipt/[id].tsx
import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import apiClient from "@/src/lib/api-client";
import generateReceiptHTML from "@/src/components/receipt/ReceiptGenerator";

// Types for the order data
interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Order {
  id: number;
  orderNumber: string;
  customerId?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  date: string;
  total: number;
  paymentMethod: string;
  status: string;
  items: OrderItem[];
}

// API function to fetch the order
const fetchOrder = async (id: string) => {
  const response = await apiClient.get(`/sales/${id}`);
  return response.data;
};

export default function ReceiptScreen() {
  const { id } = useLocalSearchParams();
  const [receiptHtml, setReceiptHtml] = useState<string>("");

  // Fetch order data
  const {
    data: order,
    isLoading,
    isError,
  } = useQuery<Order>({
    queryKey: ["sales", id],
    queryFn: () => fetchOrder(id as string),
    enabled: !!id,
  });

  // Generate receipt HTML when order data is loaded
  useEffect(() => {
    if (order) {
      // Convert order items to cart items format
      const cartItems = order.items.map((item) => ({
        id: item.productId,
        name: item.productName,
        price: item.unitPrice,
        quantity: item.quantity,
      }));

      // Set up customer info
      const customerInfo = {
        name: order.customerName || "Walk-in Customer",
        email: order.customerEmail || "",
        phone: order.customerPhone || "",
      };

      // Generate HTML
      const html = generateReceiptHTML({
        cart: cartItems,
        customerInfo,
        total: order.total,
        businessName: "ScanStock Pro",
      });

      setReceiptHtml(html);
    }
  }, [order]);

  // Handle sharing receipt as PDF
  const handleShareReceipt = async () => {
    if (!receiptHtml) return;

    try {
      // Show loading indicator
      Alert.alert("Preparing receipt...", "Please wait a moment.");

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: receiptHtml,
        base64: false,
      });

      // Set up file name with timestamp
      const timestamp = Date.now();
      const fileUri = FileSystem.documentDirectory + `receipt_${timestamp}.pdf`;

      // Copy file to app's document directory
      await FileSystem.copyAsync({
        from: uri,
        to: fileUri,
      });

      // Share the file
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Receipt",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("Error sharing receipt:", error);
      Alert.alert("Error", "Failed to share receipt");
    }
  };

  // Handle saving receipt to device
  const handleSaveReceipt = async () => {
    if (!receiptHtml) return;

    try {
      // Show loading indicator
      Alert.alert("Saving receipt...", "Please wait a moment.");

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: receiptHtml,
        base64: false,
      });

      // Set up file name with timestamp
      const timestamp = Date.now();
      const fileUri = FileSystem.documentDirectory + `receipt_${timestamp}.pdf`;

      // Copy file to app's document directory
      await FileSystem.copyAsync({
        from: uri,
        to: fileUri,
      });

      Alert.alert(
        "Receipt Saved",
        "The receipt has been saved to your device. You can access it from the 'My Receipts' section."
      );
    } catch (error) {
      console.error("Error saving receipt:", error);
      Alert.alert("Error", "Failed to save receipt");
    }
  };

  // Handle printing the receipt
  const handlePrintReceipt = async () => {
    if (!receiptHtml) return;

    try {
      await Print.printAsync({
        html: receiptHtml,
      });
    } catch (error) {
      console.error("Error printing receipt:", error);
      Alert.alert("Error", "Failed to print receipt");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading receipt...</Text>
      </View>
    );
  }

  if (isError || !order) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load receipt</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receipt</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareReceipt}
        >
          <Ionicons name="share-outline" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {receiptHtml ? (
        <WebView
          source={{ html: receiptHtml }}
          style={styles.webView}
          originWhitelist={["*"]}
          scrollEnabled={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      ) : (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Generating receipt...</Text>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton]}
          onPress={handleSaveReceipt}
        >
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.printButton]}
          onPress={handlePrintReceipt}
        >
          <Ionicons name="print-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Print</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  webView: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  footer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
  },
  saveButton: {
    backgroundColor: "#2563eb",
  },
  printButton: {
    backgroundColor: "#475569",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748b",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748b",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
});
