import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../../src/context/AuthContext";
import { InventoryContext } from "../../../src/context/InventoryContext";
import { useRouter } from "expo-router";

interface DashboardStats {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  cartItems: number;
}

const DashboardScreen = () => {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const { inventory, cart, isLoading, fetchInventory } =
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

  const QuickAction = ({
    icon,
    label,
    onPress,
    color = "#2563eb",
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={28} color="#fff" />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const StatCard = ({
    icon,
    label,
    value,
    color,
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: number;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Ionicons name={icon} size={32} color={color} />
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Welcome Section */}
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <QuickAction
              icon="barcode-outline"
              label="Scan"
              onPress={() => router.push("/(root)/(tabs)/scanner")}
            />
            <QuickAction
              icon="add-circle-outline"
              label="Add Product"
              onPress={() => router.push("/(auth)/product-detail")}
              color="#10b981"
            />
            <QuickAction
              icon="cart-outline"
              label="Checkout"
              onPress={() => router.push("/checkout")}
              color="#f59e0b"
            />
            <QuickAction
              icon="list-outline"
              label="Inventory"
              onPress={() => router.push("/inventory")}
              color="#8b5cf6"
            />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
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
              onPress={() => router.push("/inventory")}
            />
          </View>
          <View style={styles.statsContainer}>
            <StatCard
              icon="close-circle-outline"
              label="Out of Stock"
              value={stats.outOfStock}
              color="#ef4444"
              onPress={() => router.push("/inventory")}
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

        {/* Recent Activity (placeholder) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.recentActivityCard}>
            <Text style={styles.recentActivityEmptyText}>
              Recent sales and inventory changes will appear here.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 16,
  },
  headerSection: {
    backgroundColor: "#fff",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  welcomeText: {
    fontSize: 16,
    color: "#64748b",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  logoutButton: {
    padding: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickAction: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderColor: "#e2e8f0",
  },
  statInfo: {
    marginLeft: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  recentActivityCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  recentActivityEmptyText: {
    textAlign: "center",
    color: "#94a3b8",
    padding: 20,
  },
});

export default DashboardScreen;
