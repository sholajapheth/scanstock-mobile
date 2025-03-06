// src/components/dashboard/DashboardActivity.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { RecentActivity } from "./RecentActivity";

interface DashboardActivityProps {
  limit?: number;
}

export const DashboardActivity: React.FC<DashboardActivityProps> = ({
  limit = 5,
}) => {
  const router = useRouter();

  const handleViewAll = () => {
    router.push("/(root)/activityhistory");
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activityCardContainer}>
        <RecentActivity
          limit={limit}
          showHeader={false}
          onViewAll={handleViewAll}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  viewAllText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
  },
  activityCardContainer: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
});
