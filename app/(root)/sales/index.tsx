// app/sales/index.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../src/lib/api-client";
import { formatCurrency, formatDate } from "../../../src/utils/format";

// Type definitions
interface Sale {
  id: number;
  orderNumber: string;
  customerId?: number;
  customerName?: string;
  date: string;
  total: number;
  paymentMethod: string;
  status: string;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

// API functions
const fetchSales = async (params = {}) => {
  const response = await apiClient.get("/sales", { params });
  return response.data;
};

export default function SalesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month
  const [statusFilter, setStatusFilter] = useState("all"); // all, completed, pending, cancelled
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  // Define query parameters
  const queryParams = {
    search: debouncedSearchQuery,
    dateFilter,
    status: statusFilter !== "all" ? statusFilter : undefined,
  };

  const {
    data: sales = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["sales", queryParams],
    queryFn: () => fetchSales(queryParams),
  });
  console.log("sales", JSON.stringify(sales, null, 2));

  const handleSalePress = (sale: any) => {
    router.push(`/sales/${sale.id}`);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterByDate = (filter: string) => {
    setDateFilter(filter);
  };

  const handleFilterByStatus = (status: string) => {
    setStatusFilter(status);
  };

  const handleCreateNewSale = () => {
    router.push("/checkout");
  };

  const renderSaleItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.saleCard}
      onPress={() => handleSalePress(item)}
    >
      <View style={styles.saleHeader}>
        <Text style={styles.orderNumber}>#{item.receiptNumber}</Text>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.saleDetails}>
        <View style={styles.saleInfo}>
          <Ionicons name="calendar-outline" size={16} color="#64748b" />
          <Text style={styles.saleInfoText}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.saleInfo}>
          <Ionicons name="person-outline" size={16} color="#64748b" />
          <Text style={styles.saleInfoText}>
            {item.customerName || "Walk-in customer"}
          </Text>
        </View>

        <View style={styles.saleInfo}>
          <Ionicons name="card-outline" size={16} color="#64748b" />
          <Text style={styles.saleInfoText}>{item.paymentMethod}</Text>
        </View>

        <View style={styles.saleInfo}>
          <Ionicons name="basket-outline" size={16} color="#64748b" />
          <Text style={styles.saleInfoText}>
            {item.items.length} {item.items.length === 1 ? "item" : "items"}
          </Text>
        </View>
      </View>

      <View style={styles.saleFooter}>
        <Text style={styles.saleTotal}>{formatCurrency(item.total)}</Text>
        <Ionicons name="chevron-forward" size={20} color="#64748b" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color="#94a3b8" />
      <Text style={styles.emptyText}>No sales found</Text>
      {searchQuery || dateFilter !== "all" || statusFilter !== "all" ? (
        <Text style={styles.emptySubtext}>
          Try adjusting your filters or search query
        </Text>
      ) : (
        <Text style={styles.emptySubtext}>
          Sales will appear here after you complete a checkout
        </Text>
      )}
      <TouchableOpacity
        style={styles.newSaleButton}
        onPress={handleCreateNewSale}
      >
        <Text style={styles.newSaleButtonText}>New Sale</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sales History</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={handleCreateNewSale}
        >
          <Ionicons name="add-circle-outline" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by order no., customer, date or status"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              dateFilter === "all" && styles.activeFilterChip,
            ]}
            onPress={() => handleFilterByDate("all")}
          >
            <Text
              style={[
                styles.filterChipText,
                dateFilter === "all" && styles.activeFilterChipText,
              ]}
            >
              All Time
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              dateFilter === "today" && styles.activeFilterChip,
            ]}
            onPress={() => handleFilterByDate("today")}
          >
            <Text
              style={[
                styles.filterChipText,
                dateFilter === "today" && styles.activeFilterChipText,
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              dateFilter === "week" && styles.activeFilterChip,
            ]}
            onPress={() => handleFilterByDate("week")}
          >
            <Text
              style={[
                styles.filterChipText,
                dateFilter === "week" && styles.activeFilterChipText,
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              dateFilter === "month" && styles.activeFilterChip,
            ]}
            onPress={() => handleFilterByDate("month")}
          >
            <Text
              style={[
                styles.filterChipText,
                dateFilter === "month" && styles.activeFilterChipText,
              ]}
            >
              This Month
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.statusFilterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              statusFilter === "all" && styles.activeFilterChip,
            ]}
            onPress={() => handleFilterByStatus("all")}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === "all" && styles.activeFilterChipText,
              ]}
            >
              All Status
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              statusFilter === "completed" && styles.activeFilterChip,
            ]}
            onPress={() => handleFilterByStatus("completed")}
          >
            <View style={[styles.statusDot, { backgroundColor: "#10b981" }]} />
            <Text
              style={[
                styles.filterChipText,
                statusFilter === "completed" && styles.activeFilterChipText,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              statusFilter === "pending" && styles.activeFilterChip,
            ]}
            onPress={() => handleFilterByStatus("pending")}
          >
            <View style={[styles.statusDot, { backgroundColor: "#f59e0b" }]} />
            <Text
              style={[
                styles.filterChipText,
                statusFilter === "pending" && styles.activeFilterChipText,
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              statusFilter === "cancelled" && styles.activeFilterChip,
            ]}
            onPress={() => handleFilterByStatus("cancelled")}
          >
            <View style={[styles.statusDot, { backgroundColor: "#ef4444" }]} />
            <Text
              style={[
                styles.filterChipText,
                statusFilter === "cancelled" && styles.activeFilterChipText,
              ]}
            >
              Cancelled
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading sales...</Text>
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load sales</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSaleItem}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={["#2563eb"]}
              tintColor="#2563eb"
            />
          }
        />
      )}
    </SafeAreaView>
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
  newButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#0f172a",
  },
  filterContainer: {
    paddingLeft: 16,
    paddingBottom: 8,
  },
  statusFilterContainer: {
    paddingLeft: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  filterScrollContent: {
    paddingRight: 16,
    paddingVertical: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: "#2563eb",
  },
  filterChipText: {
    fontSize: 14,
    color: "#64748b",
  },
  activeFilterChipText: {
    color: "#fff",
    fontWeight: "500",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  saleCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  saleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
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
  saleDetails: {
    marginBottom: 12,
  },
  saleInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  saleInfoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#1e293b",
  },
  saleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  saleTotal: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748b",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    color: "#64748b",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 20,
  },
  newSaleButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  newSaleButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
});
