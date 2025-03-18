import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QuickAction from "./QuickAction";
import { router } from "expo-router";

const QuickActions = () => {
  return (
    <View key="quickActions" style={styles.section}>
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
          onPress={() => router.push("/(root)/product-detail")}
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
          color="#8b5cf6"
        />

        <QuickAction
          icon="settings-outline"
          label="Settings & Management"
          onPress={() => router.push("/management")}
          color="#2563eb"
        />
      </View>
    </View>
  );
};

export default QuickActions;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  section: {
    padding: 20,
  },
  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
