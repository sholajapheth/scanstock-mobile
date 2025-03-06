// src/screens/ActivityHistoryScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useActivities } from "@/src/hooks/useActivities";
import { ActivityItem } from "@/src/services/activityService";
import { useQueryClient } from "@tanstack/react-query";

const ACTIVITY_FILTERS = [
  { key: "all", label: "All" },
  { key: "sales", label: "Sales", types: ["sale"] },
  { key: "stock", label: "Stock", types: ["stock_increase", "stock_decrease"] },
  {
    key: "products",
    label: "Products",
    types: ["product_added", "product_updated"],
  },
];

const ActivityHistoryScreen = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");

  const queryClient = useQueryClient();

  // When this screen comes into focus, prefetch activities data
  useFocusEffect(
    React.useCallback(() => {
      // Prefetch activities data
      queryClient.prefetchQuery({
        queryKey: ["activities", null, 50],
        queryFn: async () => {
          // This will be handled by the useActivities hook
          return [];
        },
      });

      // Set status bar style for this screen
      StatusBar.setBarStyle("dark-content");

      return () => {
        // Clean up if needed
      };
    }, [queryClient])
  );

  const { activities, isLoading, error, refresh, getRelativeTime } =
    useActivities({
      limit: 50, // Show more on this screen
      useMockData: true,
    });

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "sale":
        return <Ionicons name="cart" size={24} color="#16a34a" />;
      case "stock_increase":
        return <Ionicons name="arrow-up" size={24} color="#2563eb" />;
      case "stock_decrease":
        return <Ionicons name="arrow-down" size={24} color="#dc2626" />;
      case "product_added":
        return <Ionicons name="add-circle" size={24} color="#9333ea" />;
      case "product_updated":
        return <Ionicons name="pencil" size={24} color="#f59e0b" />;
      default:
        return (
          <Ionicons name="ellipsis-horizontal" size={24} color="#6b7280" />
        );
    }
  };

  const handleItemPress = (item: ActivityItem) => {
    if (item.entityType === "product") {
      router.push(`/product-detail/${item.entityId}`);
    } else if (item.entityType === "sale") {
      router.push(`/sales/${item.entityId}`);
    }
  };

  const filterActivities = (activities: ActivityItem[]) => {
    if (activeFilter === "all") {
      return activities;
    }

    const filter = ACTIVITY_FILTERS.find((f) => f.key === activeFilter);
    if (!filter || !filter.types) return activities;

    return activities.filter((activity) =>
      filter.types?.includes(activity.type)
    );
  };

  const filteredActivities = filterActivities(activities);

  const renderItem = ({ item }: { item: ActivityItem }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.activityIconContainer}>
        {getActivityIcon(item.type)}
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityDescription}>{item.description}</Text>
        <Text style={styles.activityTime}>
          {getRelativeTime(item.timestamp)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.emptyText}>Loading activity history...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={40} color="#ef4444" />
          <Text style={styles.emptyText}>Failed to load activity history</Text>
          <Text style={styles.errorDetails}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refresh()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={40} color="#94a3b8" />
        <Text style={styles.emptyText}>No activity history found</Text>
        {activeFilter !== "all" && (
          <Text style={styles.emptySubtext}>
            Try changing the filter or check back later
          </Text>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#0f172a" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Activity History</Text>
      <View style={styles.headerRight} />
    </View>
  );

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <FlatList
        horizontal
        data={ACTIVITY_FILTERS}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === item.key && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter(item.key)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === item.key && styles.activeFilterText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {renderHeader()}
      {renderFilterTabs()}

      <FlatList
        data={filteredActivities}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => refresh()}
            colors={["#2563eb"]}
            tintColor="#2563eb"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredActivities.length === 0
            ? styles.emptyListContent
            : styles.listContent
        }
      />
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  headerRight: {
    width: 40, // Same width as backButton for alignment
  },
  filterContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: "#2563eb",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  activeFilterText: {
    color: "#fff",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flex: 1,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
    marginRight: 8,
  },
  activityDescription: {
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: "#64748b",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  errorDetails: {
    marginTop: 8,
    fontSize: 14,
    color: "#ef4444",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#2563eb",
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ActivityHistoryScreen;
