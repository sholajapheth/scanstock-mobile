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
import { useSaleStatistics } from "@/src/hooks/useSales";
import { Colors } from "@/constants/Colors";

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

  // Fetch sales statistics
  const { data: salesStats, isPending: isLoadingSales } = useSaleStatistics();

  console.log("salesStats", salesStats);

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
          <Ionicons
            name="calendar-outline"
            size={16}
            color={Colors.gray[500]}
          />
          <Text style={styles.saleInfoText}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.saleInfo}>
          <Ionicons name="person-outline" size={16} color={Colors.gray[500]} />
          <Text style={styles.saleInfoText}>
            {item.customerName || "Walk-in customer"}
          </Text>
        </View>

        <View style={styles.saleInfo}>
          <Ionicons name="card-outline" size={16} color={Colors.gray[500]} />
          <Text style={styles.saleInfoText}>{item.paymentMethod}</Text>
        </View>

        <View style={styles.saleInfo}>
          <Ionicons name="basket-outline" size={16} color={Colors.gray[500]} />
          <Text style={styles.saleInfoText}>
            {item.items.length} {item.items.length === 1 ? "item" : "items"}
          </Text>
        </View>
      </View>

      <View style={styles.saleFooter}>
        <Text style={styles.saleTotal}>{formatCurrency(item.total)}</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.gray[500]} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color={Colors.gray[400]} />
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
          <Ionicons name="arrow-back" size={24} color={Colors.slate[900]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sales History</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={handleCreateNewSale}
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={Colors.slate[900]}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="receipt-outline" size={24} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.statValue}>
              {isLoadingSales ? "..." : salesStats?.totalSales || 0}
            </Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="cash-outline" size={24} color={Colors.success} />
          </View>
          <View>
            <Text style={styles.statValue}>
              {isLoadingSales
                ? "..."
                : formatCurrency(salesStats?.totalRevenue || 0)}
            </Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by order no., customer, date or status"
            placeholderTextColor={Colors.gray[400]}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors.gray[400]}
              />
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
            <View
              style={[styles.statusDot, { backgroundColor: Colors.success }]}
            />
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
            <View
              style={[styles.statusDot, { backgroundColor: Colors.warning }]}
            />
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
            <View
              style={[styles.statusDot, { backgroundColor: Colors.danger }]}
            />
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
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading sales...</Text>
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={Colors.danger}
          />
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
              colors={[Colors.primary]}
              tintColor={Colors.primary}
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
      return { backgroundColor: Colors.success };
    case "pending":
      return { backgroundColor: Colors.warning };
    case "cancelled":
      return { backgroundColor: Colors.danger };
    default:
      return { backgroundColor: Colors.gray[500] };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.slate[50],
    marginTop: StatusBar.currentHeight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[200],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.slate[900],
  },
  backButton: {
    padding: 8,
  },
  newButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[200],
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.slate[50],
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.slate[200],
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.blue[50],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.slate[900],
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.slate[200],
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.slate[900],
  },
  filterContainer: {
    paddingLeft: 16,
    paddingBottom: 8,
  },
  statusFilterContainer: {
    paddingLeft: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate[200],
  },
  filterScrollContent: {
    paddingRight: 16,
    paddingVertical: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.slate[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  activeFilterChipText: {
    color: Colors.white,
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
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.slate[200],
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
    color: Colors.slate[900],
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: Colors.white,
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
    color: Colors.slate[800],
  },
  saleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
  },
  saleTotal: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.slate[900],
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
    color: Colors.gray[500],
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
    color: Colors.gray[500],
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
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
    color: Colors.gray[500],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: "center",
    marginBottom: 20,
  },
  newSaleButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  newSaleButtonText: {
    color: Colors.white,
    fontWeight: "500",
  },
});
