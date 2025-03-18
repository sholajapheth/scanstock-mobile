import React from "react";
import { View, Text, StyleSheet } from "react-native";

/**
 * ScanInstructions - A component that displays instructions based on scan mode
 *
 * @param {Object} props
 * @param {string} props.scanMode - Current scan mode ('inventory' or 'checkout')
 */
const ScanInstructions = ({ scanMode }: { scanMode: string }) => {
  const instructions =
    scanMode === "inventory"
      ? "Scan product barcode to view or add to inventory"
      : "Scan product barcode to add to cart";

  return (
    <View style={styles.instructionsContainer}>
      <Text style={styles.instructionsText}>{instructions}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  instructionsContainer: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  instructionsText: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
  },
});

export default ScanInstructions;
