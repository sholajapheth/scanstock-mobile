import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSearchProducts } from "@/src/hooks/useProducts";
import { useSales } from "@/src/hooks/useSales";
import { Product } from "@/src/hooks/useProducts";
import { Sale } from "@/src/hooks/useSales";
import { format } from "date-fns";

type SearchResult = {
  type: "product" | "sale";
  data: Product | Sale;
};

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "products" | "sales"
  >("all");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch search results
  const { data: products = [], isLoading: isLoadingProducts } =
    useSearchProducts(searchQuery);

  console.log("products", products);

  const { data: sales = [], isLoading: isLoadingSales } = useSales();

  // Filter sales based on search query
  const filteredSales = sales.filter((sale: Sale) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      sale.receiptNumber?.toLowerCase().includes(searchLower) ||
      sale.customerName?.toLowerCase().includes(searchLower) ||
      sale.items?.some((item: { productName: string }) =>
        item.productName?.toLowerCase().includes(searchLower)
      )
    );
  });

  // Combine and format search results
  const searchResults: SearchResult[] = [
    ...(activeFilter !== "sales"
      ? products.map((p: Product) => ({ type: "product", data: p }))
      : []),
    ...(activeFilter !== "products"
      ? filteredSales.map((s: Sale) => ({ type: "sale", data: s }))
      : []),
  ];

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 500);
  }, []);

  const handleResultPress = (result: SearchResult) => {
    Keyboard.dismiss();
    if (result.type === "product") {
      router.push({
        pathname: "/(root)/product-detail/[id]",
        params: { id: (result.data as Product).id },
      });
    } else {
      router.push({
        pathname: "/(root)/sales/[id]",
        params: { id: (result.data as Sale).id },
      });
    }
  };

  const renderResultItem = ({ item }: { item: SearchResult }) => {
    if (item.type === "product") {
      const product = item.data as Product;
      return (
        <TouchableOpacity
          style={styles.resultItem}
          onPress={() => handleResultPress(item)}
        >
          <View style={styles.resultIcon}>
            <Ionicons name="cube-outline" size={24} color="#00A651" />
          </View>
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle}>{product.name}</Text>
            <Text style={styles.resultSubtitle}>
              Barcode: {product.barcode || "N/A"} • Stock:{" "}
              {product.quantity || 0}
            </Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      const sale = item.data as Sale;
      return (
        <TouchableOpacity
          style={styles.resultItem}
          onPress={() => handleResultPress(item)}
        >
          <View style={styles.resultIcon}>
            <Ionicons name="receipt-outline" size={24} color="#3B82F6" />
          </View>
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle}>
              Sale #{sale.receiptNumber || "N/A"}
            </Text>
            <Text style={styles.resultSubtitle}>
              {sale.createdAt
                ? format(new Date(sale.createdAt), "MMM d, yyyy")
                : "N/A"}{" "}
              • $
              {typeof sale.total === "number" ? sale.total.toFixed(2) : "0.00"}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={48} color="#9CA3AF" />
      <Text style={styles.emptyStateText}>
        {searchQuery.length > 0
          ? "No results found"
          : "Search for products or sales"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, sales..."
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setActiveFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "all" && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === "products" && styles.filterButtonActive,
          ]}
          onPress={() => setActiveFilter("products")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "products" && styles.filterTextActive,
            ]}
          >
            Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === "sales" && styles.filterButtonActive,
          ]}
          onPress={() => setActiveFilter("sales")}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === "sales" && styles.filterTextActive,
            ]}
          >
            Sales
          </Text>
        </TouchableOpacity>
      </View>

      {isLoadingProducts || isLoadingSales || isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A651" />
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderResultItem}
          keyExtractor={(item) =>
            `${item.type}-${
              item.type === "product"
                ? (item.data as Product).id
                : (item.data as Sale).id
            }`
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.resultsContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#1F2937",
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#00A651",
  },
  filterText: {
    fontSize: 14,
    color: "#6B7280",
  },
  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  resultsContainer: {
    padding: 16,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SearchScreen;
