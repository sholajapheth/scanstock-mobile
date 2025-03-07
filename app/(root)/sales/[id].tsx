// File: /app/sales/[id].tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../src/lib/api-client";
import { formatCurrency } from "../../../src/utils/format";

// Type definitions
interface SaleItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Sale {
  id: number;
  orderNumber: string;
  customerId?: number;
  customerName?: string;
  date: string;
  total: number;
  paymentMethod: string;
  status: string;
  items: SaleItem[];
}

const fetchSale = async (id: string) => {
  const response = await apiClient.get(`/sales/${id}`);
  return response.data;
};

export default function SaleDetailsScreen() {
  // Get the sale ID from the route params
  const { id } = useLocalSearchParams();

  // Fetch the sale details
  const {
    data: sale,
    isLoading,
    isError,
  } = useQuery<Sale>({
    queryKey: ["sales", id],
    queryFn: () => fetchSale(id as string),
    enabled: !!id,
  });

  const handleShareSale = async () => {
    if (!sale) return;

    try {
      const message = `Sale Details\nOrder: ${
        sale.receiptNumber
      }\nDate: ${new Date(
        sale.date
      ).toLocaleDateString()}\nTotal: ${formatCurrency(
        sale.total
      )}\nCustomer: ${sale.customerName || "Walk-in Customer"}`;

      await Share.share({
        message,
        title: `Sale #${sale.receiptNumber}`,
      });
    } catch (error) {
      console.error("Error sharing sale:", error);
      Alert.alert("Error", "Failed to share sale details");
    }
  };

  const handleViewReceipt = () => {
    if (!sale) return;
    router.push(`/management/receipts/${sale.id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading sale details...</Text>
      </View>
    );
  }

  if (isError || !sale) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load sale details</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const saleDate = new Date(sale.createdAt);
  const formattedDate = saleDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = saleDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sale Details</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShareSale}>
          <Ionicons name="share-outline" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.orderNumber}>
                Order #{sale.receiptNumber}
              </Text>
              <Text style={styles.date}>
                {formattedDate} at {formattedTime}
              </Text>
            </View>
            <View style={[styles.statusBadge, getStatusStyle(sale.status)]}>
              <Text style={styles.statusText}>{sale.status}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.customerSection}>
            <Text style={styles.sectionTitle}>Customer</Text>
            <Text style={styles.customerName}>
              {sale.customerName || "Walk-in Customer"}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>Items</Text>
            {sale.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemQuantity}>
                    {item.quantity} x {formatCurrency(item.price)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatCurrency(item.subtotal)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(sale.total)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Method</Text>
              <Text style={styles.summaryValue}>{sale.paymentMethod}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(sale.total)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.receiptButton}
          onPress={handleViewReceipt}
        >
          <Ionicons name="receipt-outline" size={20} color="#fff" />
          <Text style={styles.receiptButtonText}>View Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Helper function to get status badge style based on status
const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return { backgroundColor: "#10b981" }; // Green
    case "pending":
      return { backgroundColor: "#f59e0b" }; // Yellow
    case "cancelled":
      return { backgroundColor: "#ef4444" }; // Red
    default:
      return { backgroundColor: "#6b7280" }; // Gray
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 30,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#64748b",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  customerSection: {
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    color: "#1e293b",
  },
  itemsSection: {
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#64748b",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0f172a",
  },
  summarySection: {
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  summaryValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  footer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  receiptButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  receiptButtonText: {
    color: "#fff",
    fontSize: 16,
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
