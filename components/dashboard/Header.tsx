import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface User {
  name?: string;
  company?: string;
  avatar?: string;
}

interface HeaderProps {
  user?: User | null;
}

const Header = ({ user }: HeaderProps) => {
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerTop}>
        <View style={styles.userInfo}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{getTimeOfDay()},</Text>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
          </View>
          <Text style={styles.role}>{user?.company || "Company Name"}</Text>
        </View>

        <TouchableOpacity
          style={styles.userAvatarContainer}
          onPress={() => router.push("/(root)/profile")}
        >
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {(user?.name || "U")[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.notificationBadge}>
            <Ionicons name="notifications" size={16} color="#00A651" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push("/(root)/search")}
        >
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <Text style={styles.searchPlaceholder}>
            Search products, orders...
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push("/(root)/(tabs)/scanner")}
        >
          <Ionicons name="scan-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  userInfo: {
    flex: 1,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  greeting: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  role: {
    fontSize: 14,
    color: "#00A651",
    marginTop: 2,
  },
  userAvatarContainer: {
    position: "relative",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00A651",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchPlaceholder: {
    color: "#6B7280",
    fontSize: 14,
  },
  scanButton: {
    backgroundColor: "#00A651",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Header;
