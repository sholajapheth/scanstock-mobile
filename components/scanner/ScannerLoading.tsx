import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

/**
 * ScannerLoading - A component that shows loading state during product lookup
 */
const ScannerLoading = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.loadingText}>Checking product...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#fff",
    fontSize: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});

export default ScannerLoading;
