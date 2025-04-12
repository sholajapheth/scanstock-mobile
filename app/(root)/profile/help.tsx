import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface HelpItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  action: () => void;
}

export default function HelpScreen() {
  const helpItems: HelpItem[] = [
    {
      id: "faq",
      title: "Frequently Asked Questions",
      icon: "help-circle-outline",
      action: () => {
        // Navigate to FAQ screen
        router.push("/(root)/profile/faq");
      },
    },
    {
      id: "email",
      title: "Contact Support",
      icon: "mail-outline",
      action: () => {
        Linking.openURL("mailto:support@scanstockpro.com");
      },
    },
    {
      id: "chat",
      title: "Live Chat",
      icon: "chatbubble-outline",
      action: () => {
        // Open live chat
        Linking.openURL("https://support.scanstockpro.com/chat");
      },
    },
    {
      id: "docs",
      title: "Documentation",
      icon: "document-text-outline",
      action: () => {
        Linking.openURL("https://docs.scanstockpro.com");
      },
    },
    {
      id: "feedback",
      title: "Send Feedback",
      icon: "star-outline",
      action: () => {
        Linking.openURL("mailto:feedback@scanstockpro.com");
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How can we help you?</Text>
          <Text style={styles.sectionDescription}>
            Choose an option below to get help with your account, app features,
            or report an issue.
          </Text>
        </View>

        <View style={styles.helpItems}>
          {helpItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.helpItem}
              onPress={item.action}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={24} color="#00A651" />
              </View>
              <View style={styles.helpItemContent}>
                <Text style={styles.helpItemTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>Contact Information</Text>
          <Text style={styles.contactText}>
            Email: support@scanstockpro.com
          </Text>
          <Text style={styles.contactText}>Phone: +1 (234) 567-890</Text>
          <Text style={styles.contactText}>
            Hours: Monday - Friday, 9AM - 6PM EST
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  helpItems: {
    marginBottom: 24,
  },
  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00A65115",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  helpItemContent: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  contactInfo: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
});
