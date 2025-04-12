import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProducts, useSearchProducts } from "@/src/hooks/useProducts";
import { router, useLocalSearchParams } from "expo-router";
import { Product } from "@/src/hooks/useProducts";

// Custom hook to debounce search input
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

const ITEMS_PER_PAGE = 10;

const InventoryScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "low" | "out">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch all products
  const {
    data: allProducts = [],
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
  } = useProducts();

  // Fetch search results
  const { data: searchResults = [], isLoading: isLoadingSearch } =
    useSearchProducts(debouncedSearchQuery);

  // Get displayed products based on search and filter
  const getDisplayedProducts = useCallback(() => {
    const products = debouncedSearchQuery ? searchResults : allProducts;

    return products.filter((product: Product) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "low")
        return product.quantity <= (product.reorderPoint || 5);
      if (selectedFilter === "out") return product.quantity === 0;
      return true;
    });
  }, [debouncedSearchQuery, selectedFilter, allProducts, searchResults]);

  const displayedProducts = getDisplayedProducts();
  const totalPages = Math.ceil(displayedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = displayedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchProducts();
    setRefreshing(false);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Render product item
  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/(root)/product-detail/view/${item.id}`)}
    >
      <View style={styles.productImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="cube-outline" size={32} color="#94a3b8" />
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productBarcode}>{item.barcode}</Text>
        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>
            ${typeof item.price === "number" ? item.price.toFixed(2) : "0.00"}
          </Text>
          <View
            style={[
              styles.stockBadge,
              item.quantity === 0 && styles.stockBadgeOut,
              item.quantity > 0 &&
                item.quantity <= (item.reorderPoint || 5) &&
                styles.stockBadgeLow,
            ]}
          >
            <Text style={styles.stockText}>
              {item.quantity === 0
                ? "Out of Stock"
                : `${item.quantity} in stock`}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {isLoadingProducts || isLoadingSearch ? (
        <ActivityIndicator size="large" color="#00A651" />
      ) : (
        <>
          <Ionicons name="cube-outline" size={64} color="#94a3b8" />
          <Text style={styles.emptyText}>
            {debouncedSearchQuery
              ? "No products match your search"
              : selectedFilter !== "all"
              ? `No ${
                  selectedFilter === "low" ? "low stock" : "out of stock"
                } products found`
              : "No products in inventory"}
          </Text>
          <TouchableOpacity
            style={styles.addProductButton}
            onPress={() => router.push("/(root)/product-detail/new")}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.addProductButtonText}>Add Product</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={styles.paginationButton}
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentPage === 1 ? "#94a3b8" : "#00A651"}
          />
        </TouchableOpacity>
        <Text style={styles.paginationText}>
          Page {currentPage} of {totalPages}
        </Text>
        <TouchableOpacity
          style={styles.paginationButton}
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={currentPage === totalPages ? "#94a3b8" : "#00A651"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(root)/product-detail/new")}
        >
          <Ionicons name="add-circle-outline" size={24} color="#00A651" />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color="#64748b"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === "all" && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "all" && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === "low" && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter("low")}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "low" && styles.filterTextActive,
              ]}
            >
              Low Stock
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === "out" && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter("out")}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "out" && styles.filterTextActive,
              ]}
            >
              Out of Stock
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product List */}
      <FlatList
        data={paginatedProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {/* Pagination */}
      {renderPagination()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#0f172a",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  filterButtonActive: {
    backgroundColor: "#00A651",
  },
  filterText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  productBarcode: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00A651",
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },
  stockBadgeLow: {
    backgroundColor: "#fef3c7",
  },
  stockBadgeOut: {
    backgroundColor: "#fee2e2",
  },
  stockText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  addProductButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00A651",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addProductButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  paginationButton: {
    padding: 8,
  },
  paginationText: {
    fontSize: 14,
    color: "#64748b",
    marginHorizontal: 16,
  },
});

export default InventoryScreen;
