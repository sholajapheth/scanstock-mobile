import React, { useState, useCallback } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useProducts, useSearchProducts } from "../../../src/hooks/useProducts";
import { router, useLocalSearchParams } from "expo-router";

// Custom hook to debounce search input
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const InventoryScreen = ({}) => {
  const { filter } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedFilter, setSelectedFilter] = useState(filter || "all"); // 'all', 'low', 'out'

  // Fetch products
  const {
    data: allProducts = [],
    isLoading: isLoadingProducts,
    refetch: refetchProducts,
  } = useProducts();
  // console.log("allProducts", allProducts);

  // Search products when query changes
  const { data: searchResults = [], isLoading: isSearching } =
    useSearchProducts(debouncedSearchQuery);

  // Determine which products to display
  const getDisplayedProducts = useCallback(() => {
    // If searching, show search results
    if (debouncedSearchQuery) {
      return searchResults;
    }

    // Otherwise filter by selected category
    switch (selectedFilter) {
      case "low":
        return allProducts.filter(
          (product) =>
            product.quantity > 0 &&
            (product.reorderPoint || 2) &&
            product.quantity <= (product.reorderPoint || 2)
        );
      case "out":
        return allProducts.filter((product) => product.quantity <= 0);
      case "all":
      default:
        return allProducts;
    }
  }, [debouncedSearchQuery, selectedFilter, allProducts, searchResults]);

  const displayedProducts = getDisplayedProducts();

  // Handle refresh
  const handleRefresh = () => {
    refetchProducts();
  };

  // Render product item
  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() =>
        router.navigate({
          pathname: `/(root)/product-detail/${item.id}`,
          params: { productId: item.id },
        })
      }
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productBarcode}>{item.barcode}</Text>
        {item.sku && <Text style={styles.productSku}>SKU: {item.sku}</Text>}
      </View>

      <View style={styles.productMetrics}>
        <Text style={styles.productPrice}>${item?.price}</Text>
        <View
          style={[
            styles.quantityBadge,
            item.quantity <= 0
              ? styles.outOfStock
              : item.reorderPoint && item.quantity <= item.reorderPoint
              ? styles.lowStock
              : styles.inStock,
          ]}
        >
          <Text style={styles.quantityText}>{item.quantity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {isLoadingProducts || isSearching ? (
        <ActivityIndicator size="large" color="#2563eb" />
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
            style={styles.addButton}
            onPress={() => router.navigate("/(root)/product-detail")}
          >
            <Text style={styles.addButtonText}>Add New Product</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#64748b"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or barcode"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === "all" && styles.activeFilterTab,
          ]}
          onPress={() => setSelectedFilter("all")}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === "all" && styles.activeFilterTabText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === "low" && styles.activeFilterTab,
          ]}
          onPress={() => setSelectedFilter("low")}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === "low" && styles.activeFilterTabText,
            ]}
          >
            Low Stock
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === "out" && styles.activeFilterTab,
          ]}
          onPress={() => setSelectedFilter("out")}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === "out" && styles.activeFilterTabText,
            ]}
          >
            Out of Stock
          </Text>
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <FlatList
        data={displayedProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingProducts && !isSearching}
            onRefresh={handleRefresh}
          />
        }
      />

      {/* Add Product FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.navigate("/(root)/product-detail")}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: StatusBar.currentHeight,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  filterTabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    alignItems: "center",
  },
  activeFilterTab: {
    borderBottomColor: "#2563eb",
  },
  filterTabText: {
    color: "#64748b",
    fontWeight: "500",
  },
  activeFilterTabText: {
    color: "#2563eb",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Space for FAB
    flexGrow: 1,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 4,
  },
  productBarcode: {
    fontSize: 14,
    color: "#64748b",
  },
  productSku: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  productMetrics: {
    alignItems: "flex-end",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 4,
  },
  quantityBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 30,
    alignItems: "center",
  },
  inStock: {
    backgroundColor: "#dcfce7",
  },
  lowStock: {
    backgroundColor: "#fef9c3",
  },
  outOfStock: {
    backgroundColor: "#fee2e2",
  },
  quantityText: {
    fontWeight: "500",
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    minHeight: 300,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
  addButton: {
    marginTop: 24,
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default InventoryScreen;
