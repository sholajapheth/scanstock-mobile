import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import QuickAction from "./QuickAction";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const QuickActions = () => {
  return (
    <View key="quickActions" style={styles.section}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#00A651" />
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={["rgba(0, 166, 81, 0.05)", "rgba(0, 166, 81, 0.01)"]}
        style={styles.gradientContainer}
      >
        <View style={styles.quickActionsContainer}>
          <QuickAction
            icon="barcode-outline"
            label="Scan"
            onPress={() => router.push("/(root)/(tabs)/scanner")}
            color="#00A651"
          />
          <QuickAction
            icon="add-circle-outline"
            label="Add Product"
            onPress={() =>
              router.push({
                pathname: "/(root)/(tabs)/scanner",
                params: {
                  state: "inventory",
                },
              })
            }
            color="#10b981"
          />
          <QuickAction
            icon="cart-outline"
            label="Checkout"
            onPress={() => router.push("/(root)/checkout")}
            color="#f59e0b"
          />
          <QuickAction
            icon="list-outline"
            label="Inventory"
            onPress={() => router.push("/inventory")}
            color="#8b5cf6"
          />
          <QuickAction
            icon="receipt-outline"
            label="Sales"
            onPress={() => router.push("/sales")}
            color="#3B82F6"
          />
          <QuickAction
            icon="settings-outline"
            label="Settings"
            onPress={() => router.push("/management")}
            color="#2563eb"
          />
        </View>
      </LinearGradient>

      <TouchableOpacity
        style={styles.scanPromoButton}
        onPress={() => router.push("/(root)/(tabs)/scanner")}
      >
        <LinearGradient
          colors={["#00A651", "#008c44"]}
          style={styles.scanPromoGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="scan-outline" size={24} color="white" />
          <Text style={styles.scanPromoText}>Scan Now</Text>
          <View style={styles.scanArrowContainer}>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default QuickActions;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  section: {
    padding: 20,
    marginVertical: 8,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: "#00A651",
    fontWeight: "600",
    marginRight: 4,
  },
  gradientContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  scanPromoButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#00A651",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  scanPromoGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  scanPromoText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 12,
  },
  scanArrowContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
});
