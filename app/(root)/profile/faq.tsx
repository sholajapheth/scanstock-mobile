import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQAccordion = ({ item }: { item: FAQItem }) => {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const bodyHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity
        style={styles.questionContainer}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.questionText}>{item.question}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>
      <Animated.View style={[styles.answerContainer, { height: bodyHeight }]}>
        <Text style={styles.answerText}>{item.answer}</Text>
      </Animated.View>
    </View>
  );
};

export default function FAQScreen() {
  const faqItems: FAQItem[] = [
    {
      id: "1",
      question: "How do I scan products?",
      answer:
        "Open the scanner tab, point your camera at the product's barcode, and hold steady. The app will automatically detect and scan the barcode.",
    },
    {
      id: "2",
      question: "Can I manage multiple businesses?",
      answer:
        "Yes! You can manage multiple businesses by upgrading to our Business or Enterprise plan. Switch between businesses from your profile settings.",
    },
    {
      id: "3",
      question: "How do I export inventory reports?",
      answer:
        "Go to the Inventory tab, tap the export icon in the top right, select your preferred format (CSV/PDF), and choose a date range for the report.",
    },
    {
      id: "4",
      question: "What types of barcodes are supported?",
      answer:
        "We support all major barcode formats including UPC-A, UPC-E, EAN-13, EAN-8, Code 128, and QR codes.",
    },
    {
      id: "5",
      question: "How do I add custom categories?",
      answer:
        "Navigate to Management > Categories, tap the '+' button, enter the category name and optional description, then save.",
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
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <Text style={styles.sectionDescription}>
            Find answers to common questions about using ScanStock Pro.
          </Text>
        </View>

        <View style={styles.faqList}>
          {faqItems.map((item) => (
            <FAQAccordion key={item.id} item={item} />
          ))}
        </View>

        <View style={styles.moreHelp}>
          <Text style={styles.moreHelpTitle}>Still need help?</Text>
          <Text style={styles.moreHelpText}>
            Contact our support team for assistance with any other questions.
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => router.back()}
          >
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
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
  faqList: {
    marginBottom: 24,
  },
  accordionContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  answerContainer: {
    overflow: "hidden",
    paddingHorizontal: 16,
  },
  answerText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    paddingBottom: 16,
  },
  moreHelp: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  moreHelpTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  moreHelpText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: "#00A651",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
