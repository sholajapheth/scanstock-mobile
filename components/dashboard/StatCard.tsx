import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";

const StatCard = ({
  icon,
  label,
  value,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    style={[styles.statCard, { borderLeftColor: color }]}
    onPress={onPress}
    disabled={!onPress}
  >
    <Ionicons name={icon} size={32} color={color} />
    <View style={styles.statInfo}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </TouchableOpacity>
);

export default StatCard;

const styles = StyleSheet.create({
  statInfo: {
    marginLeft: 12,
    flex: 1,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    flexWrap: "wrap",
    width: "100%",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderColor: "#e2e8f0",
  },
});
