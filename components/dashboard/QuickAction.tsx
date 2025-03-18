import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, StyleSheet, Text } from "react-native";

const QuickAction = ({
  icon,
  label,
  onPress,
  color = "#2563eb",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <Ionicons name={icon} size={28} color="#fff" />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  quickAction: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
});

export default QuickAction;
