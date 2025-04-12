import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "@/src/hooks/useAuth";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
}

export default function SubscriptionScreen() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("free");

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "Basic inventory tracking",
        "Up to 100 items",
        "1 user account",
        "Basic reports",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "$9.99",
      period: "monthly",
      features: [
        "Advanced inventory tracking",
        "Unlimited items",
        "Up to 5 user accounts",
        "Advanced analytics",
        "Priority support",
      ],
      isPopular: true,
    },
    {
      id: "business",
      name: "Business",
      price: "$19.99",
      period: "monthly",
      features: [
        "Everything in Pro",
        "Unlimited user accounts",
        "API access",
        "Custom branding",
        "Dedicated account manager",
      ],
    },
  ];

  const handleSubscribe = (planId: string) => {
    if (planId === currentPlan) {
      Alert.alert("Info", "You are already subscribed to this plan.");
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setCurrentPlan(planId);
      Alert.alert(
        "Success",
        `You have successfully subscribed to the ${
          subscriptionPlans.find((plan) => plan.id === planId)?.name
        } plan.`
      );
    }, 1500);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A651" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Select the plan that best fits your needs
        </Text>

        <View style={styles.plansContainer}>
          {subscriptionPlans.map((plan) => (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                plan.isPopular && styles.popularPlan,
                currentPlan === plan.id && styles.currentPlan,
              ]}
            >
              {plan.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>/{plan.period}</Text>
              </View>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#00A651"
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  currentPlan === plan.id && styles.currentPlanButton,
                ]}
                onPress={() => handleSubscribe(plan.id)}
                disabled={currentPlan === plan.id}
              >
                <Text style={styles.subscribeButtonText}>
                  {currentPlan === plan.id ? "Current Plan" : "Subscribe"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Subscription Information</Text>
          <Text style={styles.infoText}>
            • All subscriptions are automatically renewed unless canceled
          </Text>
          <Text style={styles.infoText}>
            • You can cancel your subscription at any time
          </Text>
          <Text style={styles.infoText}>
            • For any questions, please contact our support team
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  popularPlan: {
    borderColor: "#00A651",
    borderWidth: 2,
  },
  currentPlan: {
    borderColor: "#3B82F6",
    borderWidth: 2,
  },
  popularBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#00A651",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  planName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
  },
  planPeriod: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#4B5563",
  },
  subscribeButton: {
    backgroundColor: "#00A651",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  currentPlanButton: {
    backgroundColor: "#3B82F6",
  },
  subscribeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  infoSection: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 8,
  },
});
