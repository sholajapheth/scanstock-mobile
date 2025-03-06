// src/components/dashboard/RecentActivity.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useActivities } from "../../hooks/useActivities";
import { ActivityItem } from "../../services/activityService";

interface RecentActivityProps {
  limit?: number;
  showHeader?: boolean;
  onViewAll?: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  limit = 5,
  showHeader = true,
  onViewAll,
}) => {
  const router = useRouter();
  const { activities, isLoading, error, refresh, getRelativeTime } =
    useActivities({
      limit,
      useMockData: false, // Use mock data until API is ready
    });

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "sale":
        return <Ionicons name="cart" size={20} color="#16a34a" />;
      case "stock_increase":
        return <Ionicons name="arrow-up" size={20} color="#2563eb" />;
      case "stock_decrease":
        return <Ionicons name="arrow-down" size={20} color="#dc2626" />;
      case "product_added":
        return <Ionicons name="add-circle" size={20} color="#9333ea" />;
      case "product_updated":
        return <Ionicons name="pencil" size={20} color="#f59e0b" />;
      default:
        return (
          <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
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
      <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.emptyText}>Loading activity...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={24} color="#ef4444" />
          <Text style={styles.emptyText}>Failed to load activity</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar" size={24} color="#94a3b8" />
        <Text style={styles.emptyText}>No recent activity to display</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>Recent Activity</Text>
          {onViewAll && (
            <TouchableOpacity onPress={onViewAll}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={activities}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            colors={["#2563eb"]}
            tintColor="#2563eb"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          activities.length === 0 ? styles.emptyListContent : styles.listContent
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  viewAll: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 8,
  },
  emptyListContent: {
    flex: 1,
    minHeight: 180,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
    marginRight: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: "#1e293b",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: "#64748b",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#2563eb",
    borderRadius: 4,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
