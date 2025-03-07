import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const managementOptions = [
  {
    id: "categories",
    title: "Categories",
    icon: "pricetag-outline",
    description: "Manage product categories",
    route: "/management/categories",
  },
  {
    id: "receipts",
    title: "Receipts",
    icon: "receipt-outline",
    description: "Manage receipts",
    route: "/management/receipts",
  },
  // You can add more options here in the future:
  // { id: "users", title: "Users", icon: "people-outline", ... },
  // { id: "settings", title: "App Settings", icon: "settings-outline", ... },
];

export default function ManagementScreen() {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.optionCard}
      onPress={() => router.push(item.route)}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={24} color="#4b5563" />
      </View>
      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{item.title}</Text>
        <Text style={styles.optionDescription}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Management</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={managementOptions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#64748b",
  },
});
