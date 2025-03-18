import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import StatCard from "./StatCard";
import { router } from "expo-router";
import { InventoryContext } from "@/src/context/InventoryContext";

interface DashboardStats {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  cartItems: number;
}
const Stats = () => {
  const { inventory, cart, fetchInventory, isLoading } =
    useContext(InventoryContext);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    cartItems: 0,
  });

  // Calculate dashboard stats
  useEffect(() => {
    if (inventory.length > 0) {
      const lowStockCount = inventory.filter(
        (item) => item.quantity > 0 && item.quantity < 5
      ).length;
      const outOfStockCount = inventory.filter(
        (item) => item.quantity <= 0
      ).length;

      setStats({
        totalProducts: inventory.length,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        cartItems: cart.length,
      });
    }
  }, [inventory, cart]);

  // Refresh inventory data when the screen focuses
  useEffect(() => {
    fetchInventory();
  }, []);

  // Skeleton loader component
  const StatsSkeleton = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Inventory Stats</Text>
      <View style={styles.statsContainer}>
        <View style={[styles.skeletonCard, { backgroundColor: "#e2e8f0" }]}>
          <ActivityIndicator size="small" color="#94a3b8" />
        </View>
        <View style={[styles.skeletonCard, { backgroundColor: "#e2e8f0" }]}>
          <ActivityIndicator size="small" color="#94a3b8" />
        </View>
      </View>
      <View style={styles.statsContainer}>
        <View style={[styles.skeletonCard, { backgroundColor: "#e2e8f0" }]}>
          <ActivityIndicator size="small" color="#94a3b8" />
        </View>
        <View style={[styles.skeletonCard, { backgroundColor: "#e2e8f0" }]}>
          <ActivityIndicator size="small" color="#94a3b8" />
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return <StatsSkeleton />;
  }

  return (
    // Stats
    <View key="stats" style={styles.section}>
      <Text style={styles.sectionTitle}>Inventory Stats</Text>
      <View style={styles.statsContainer}>
        <StatCard
          icon="cube-outline"
          label="Total Products"
          value={stats.totalProducts}
          color="#2563eb"
          onPress={() => router.push("/inventory")}
        />
        <StatCard
          icon="alert-circle-outline"
          label="Low Stock"
          value={stats.lowStock}
          color="#f59e0b"
          onPress={() =>
            router.push({
              pathname: "/(root)/(tabs)/inventory",
              params: {
                filter: "low",
              },
            })
          }
        />
      </View>
      <View style={styles.statsContainer}>
        <StatCard
          icon="close-circle-outline"
          label="Out of Stock"
          value={stats.outOfStock}
          color="#ef4444"
          onPress={() =>
            router.push({
              pathname: "/(root)/(tabs)/inventory",
              params: {
                filter: "out",
              },
            })
          }
        />
        <StatCard
          icon="cart-outline"
          label="Cart Items"
          value={stats.cartItems}
          color="#10b981"
          onPress={() => router.push("/checkout")}
        />
      </View>
    </View>
  );
};

export default Stats;

const styles = StyleSheet.create({
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  skeletonCard: {
    height: 100,
    width: "48%",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
