import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { DashboardActivity } from "@/src/components/dashboard/DashboardActivity";
import { useUser } from "@/src/hooks/useAuth";
import QuickActions from "@/components/dashboard/QuickActions";
import Stats from "@/components/dashboard/Stats";
import Header from "@/components/dashboard/Header";
import { EmailVerificationModal } from "@/components/modals/EmailVerificationModal";
import { EmailVerificationBanner } from "@/components/notifications/EmailVerificationBanner";

const DashboardScreen = () => {
  const { user, isAuthenticated, isLoading: isUserLoading } = useUser();
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Check if we should show the verification modal
  useEffect(() => {
    const checkVerificationPrompt = async () => {
      if (user && !user.isEmailVerified) {
        const lastPrompt = await AsyncStorage.getItem("lastVerificationPrompt");
        if (lastPrompt) {
          const lastPromptDate = new Date(lastPrompt);
          const now = new Date();
          const hoursSinceLastPrompt =
            (now.getTime() - lastPromptDate.getTime()) / (1000 * 60 * 60);

          if (hoursSinceLastPrompt >= 24) {
            setShowVerificationModal(true);
            await AsyncStorage.setItem(
              "lastVerificationPrompt",
              now.toISOString()
            );
          }
        } else {
          setShowVerificationModal(true);
          await AsyncStorage.setItem(
            "lastVerificationPrompt",
            new Date().toISOString()
          );
        }
      }
    };

    checkVerificationPrompt();
  }, [user]);

  const handleVerificationClick = () => {
    setShowVerificationModal(true);
  };

  const renderDashboardContent = () => {
    const content = [
      // Welcome Section
      <Header key="header" user={user} />,

      // Stats
      <Stats key="stats" />,

      // Quick Actions
      <QuickActions key="quick-actions" />,

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

    // Insert verification banner after header if needed
    if (user && !user.isEmailVerified) {
      content.splice(
        1,
        0,
        <EmailVerificationBanner
          key="verification-banner"
          onVerifyClick={handleVerificationClick}
        />
      );
    }

    return content;
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

      <EmailVerificationModal
        isVisible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
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
