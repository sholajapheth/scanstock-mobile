import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * BottomActionBar - A component that displays the bottom action button
 * for either manual entry or view cart based on scan mode
 *
 * @param {Object} props
 * @param {string} props.scanMode - Current scan mode ('inventory' or 'checkout')
 * @param {Function} props.onPress - Function to call when button is pressed
 */
const BottomActionBar = ({
  scanMode,
  onPress,
}: {
  scanMode: string;
  onPress: () => void;
}) => {
  const buttonText = scanMode === "inventory" ? "Manual Entry" : "View Cart";
  const iconName = scanMode === "inventory" ? "create-outline" : "cart-outline";

  return (
    <View style={styles.bottomContainer}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons
          name={iconName}
          size={20}
          color="#fff"
          style={styles.buttonIcon}
        />
        <Text style={styles.actionButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  actionButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default BottomActionBar;
