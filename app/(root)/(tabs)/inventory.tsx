import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { InventoryContext } from "../../../src/context/InventoryContext";
import { Ionicons } from "@expo/vector-icons";

interface Product {
  id: number;
  name: string;
  price: number;
  barcode: string;
  description: string;
  quantity: number;
}

const InventoryScreen = () => {
  const router = useRouter();
  const { inventory, fetchInventory, isLoading } = useContext(InventoryContext);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredInventory, setFilteredInventory] = useState<Product[]>([]);

  useEffect(() => {
    // Filter inventory based on search query
    if (searchQuery.trim() === "") {
      setFilteredInventory(inventory);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = inventory.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.barcode.includes(query)
      );
      setFilteredInventory(filtered);
    }
  }, [inventory, searchQuery]);

  const handleRefresh = () => {
    fetchInventory();
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => router.push(`/product-detail/${item.id}`)}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productBarcode}>SKU: {item.barcode}</Text>
      </View>
      <View style={styles.productMetrics}>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        <View
          style={[
            styles.quantityBadge,
            item.quantity <= 0
              ? styles.outOfStock
              : item.quantity < 5
              ? styles.lowStock
              : styles.inStock,
          ]}
        >
          <Text style={styles.quantityText}>{item.quantity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <>
          <Ionicons name="cube-outline" size={64} color="#94a3b8" />
          <Text style={styles.emptyText}>
            {searchQuery.trim() !== ""
              ? "No products match your search"
              : "No products in inventory"}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/product-detail")}
          >
            <Text style={styles.addButtonText}>Add Your First Product</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
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

      {/* Inventory List */}
      <FlatList
        data={filteredInventory}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      />

      {/* Add Product FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/product-detail")}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  listContent: {
    padding: 16,
    paddingBottom: 80, // Add space for FAB
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
    marginRight: 10,
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
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginVertical: 16,
  },
  addButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#2563eb",
    width: 56,
    height: 56,
    borderRadius: 28,
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
