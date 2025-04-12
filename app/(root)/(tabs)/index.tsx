import React from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
} from "react-native";

import { DashboardActivity } from "@/src/components/dashboard/DashboardActivity";
import { useUser } from "@/src/hooks/useAuth";
import QuickActions from "@/components/dashboard/QuickActions";
import Stats from "@/components/dashboard/Stats";
import Header from "@/components/dashboard/Header";
interface DashboardStats {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  cartItems: number;
}

const DashboardScreen = () => {
  const { user, isAuthenticated, isLoading: isUserLoading } = useUser();

  const renderDashboardContent = () => {
    return [
      // Welcome Section
      <Header user={user} />,

      // Stats
      <Stats />,
      // Quick Actions
      <QuickActions />,

      // Recent Activity
      <View
        key="activity"
        style={{
          paddingHorizontal: 10,
        }}
      >
        <DashboardActivity limit={5} />
      </View>,
    ];
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <FlatList
        data={renderDashboardContent()}
        ListFooterComponent={() => <View style={{ height: 100 }} />}
        renderItem={({ item }) => item}
        keyExtractor={(_, index) => index.toString()}
        style={styles.container}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: StatusBar.currentHeight,
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

  logoutButton: {
    padding: 8,
  },
});

export default DashboardScreen;
