import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useProducts } from "@/src/hooks/useProducts";
import { useSaleStatistics } from "@/src/hooks/useSales";
import { Product } from "@/src/hooks/useProducts";

const StatCard = ({
  title,
  value,
  icon,
  color,
  onPress,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    style={[styles.statCard, { borderColor: color }]}
    onPress={onPress}
  >
    <View style={[styles.iconContainer, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon as any} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </TouchableOpacity>
);

const Stats = () => {
  // Fetch products data
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();

  // Fetch sales statistics
  const { data: salesStats, isLoading: isLoadingSales } = useSaleStatistics();

  // Calculate stats
  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    (product: Product) =>
      product.quantity > 0 && product.quantity <= (product.reorderPoint || 2)
  ).length;
  const todaySales = salesStats?.today?.total || 0;
  const todayOrders = salesStats?.today?.count || 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Overview</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push("/(root)/activityhistory")}
        >
          <Text style={styles.viewAllText}>View Reports</Text>
          <Ionicons name="arrow-forward" size={16} color="#00A651" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon="cube-outline"
          color="#00A651"
          onPress={() => router.push("/inventory")}
        />
        <StatCard
          title="Low Stock"
          value={lowStockProducts}
          icon="alert-circle-outline"
          color="#F59E0B"
          onPress={() => router.push("/inventory?filter=low")}
        />
        <StatCard
          title="Today's Sales"
          value={`$${todaySales.toFixed(2)}`}
          icon="cash-outline"
          color="#3B82F6"
          onPress={() => router.push("/sales")}
        />
        <StatCard
          title="Orders"
          value={todayOrders}
          icon="cart-outline"
          color="#8B5CF6"
          onPress={() => router.push("/sales")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: "#00A651",
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    width: "47%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default Stats;
