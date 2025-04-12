import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, Href } from "expo-router";

interface ManagementOption {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  route:
    | "/(root)/management/categories"
    | "/(root)/management/business"
    | "/(root)/profile";
  color: string;
}

const managementOptions: ManagementOption[] = [
  {
    id: "categories",
    title: "Categories",
    icon: "pricetag-outline",
    description: "Manage product categories and subcategories",
    route: "/(root)/management/categories",
    color: "#4CAF50",
  },
  {
    id: "business",
    title: "Business Profile",
    icon: "business-outline",
    description: "Update your business information and settings",
    route: "/(root)/management/business",
    color: "#2196F3",
  },
  {
    id: "profile",
    title: "User Profile",
    icon: "person-outline",
    description: "Manage your personal account settings",
    route: "/(root)/profile",
    color: "#9C27B0",
  },
];

export default function ManagementScreen() {
  const renderItem = ({ item }: { item: ManagementOption }) => (
    <TouchableOpacity
      style={styles.optionCard}
      onPress={() => router.push(item.route)}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}
      >
        <Ionicons name={item.icon} size={24} color={item.color} />
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
      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Manage Your Business</Text>
          <Text style={styles.welcomeSubtitle}>
            Configure your business settings and preferences
          </Text>
        </View>

        <FlatList
          data={managementOptions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
    fontSize: 20,
    fontWeight: "600",
    color: "#0f172a",
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#64748b",
  },
  listContainer: {
    padding: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#64748b",
  },
});
