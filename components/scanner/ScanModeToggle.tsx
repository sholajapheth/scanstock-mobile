import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * ScanModeToggle - A toggle component to switch between inventory and checkout modes
 *
 * @param {Object} props
 * @param {string} props.scanMode - Current scan mode ('inventory' or 'checkout')
 * @param {Function} props.onToggle - Function to call when mode is toggled
 */
const ScanModeToggle = ({
  scanMode,
  onToggle,
}: {
  scanMode: string;
  onToggle: (mode: string) => void;
}) => {
  return (
    <View style={styles.modeToggleContainer}>
      <TouchableOpacity
        style={[
          styles.modeButton,
          scanMode === "inventory" && styles.activeModeButton,
        ]}
        onPress={() => onToggle("inventory")}
      >
        <Ionicons
          name="list-outline"
          size={20}
          color={scanMode === "inventory" ? "#fff" : "#2563eb"}
        />
        <Text
          style={[
            styles.modeButtonText,
            scanMode === "inventory" && styles.activeModeButtonText,
          ]}
        >
          Inventory
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.modeButton,
          scanMode === "checkout" && styles.activeModeButton,
        ]}
        onPress={() => onToggle("checkout")}
      >
        <Ionicons
          name="cart-outline"
          size={20}
          color={scanMode === "checkout" ? "#fff" : "#2563eb"}
        />
        <Text
          style={[
            styles.modeButtonText,
            scanMode === "checkout" && styles.activeModeButtonText,
          ]}
        >
          Checkout
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modeToggleContainer: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  activeModeButton: {
    backgroundColor: "#2563eb",
  },
  modeButtonText: {
    marginLeft: 4,
    color: "#2563eb",
    fontWeight: "500",
  },
  activeModeButtonText: {
    color: "#fff",
  },
});

export default ScanModeToggle;
