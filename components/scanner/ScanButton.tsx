import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

/**
 * ScanButton - A button that triggers rescanning after a successful scan
 *
 * @param {Object} props
 * @param {Function} props.onPress - Function to call when button is pressed
 */
const ScanButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity
      style={styles.scanAgainButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.scanAgainButtonText}>Scan Again</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  scanAgainButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  scanAgainButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ScanButton;
