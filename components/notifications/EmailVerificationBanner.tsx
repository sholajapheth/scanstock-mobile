import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmailVerificationBannerProps {
  onVerifyClick: () => void;
}

export const EmailVerificationBanner = ({
  onVerifyClick,
}: EmailVerificationBannerProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="warning-outline" size={20} color="#fff" />
        <Text style={styles.text}>
          Please verify your email address to access all features
        </Text>
      </View>
      <TouchableOpacity onPress={onVerifyClick} style={styles.button}>
        <Text style={styles.buttonText}>Verify Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f59e0b",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  text: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  button: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: "#f59e0b",
    fontWeight: "600",
    fontSize: 12,
  },
});
