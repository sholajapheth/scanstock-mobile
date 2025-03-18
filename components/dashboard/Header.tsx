import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { router } from "expo-router";

const Header = ({ user }: { user: any }) => {
  return (
    <View key="welcome" style={styles.headerSection}>
      <TouchableOpacity
        style={styles.userInfoContainer}
        onPress={() => router.push("/(root)/profile")}
      >
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>
            {user?.firstName || "User"} {user?.lastName || ""}
          </Text>
        </View>
        {user?.profilePicture ? (
          <Image
            source={{ uri: user.profilePicture }}
            style={styles.userAvatar}
          />
        ) : (
          <View style={styles.userInitials}>
            <Text style={styles.initialsText}>
              {user?.firstName?.charAt(0) || "U"}
              {user?.lastName?.charAt(0) || ""}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: "#fff",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: "#64748b",
  },
  userInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
