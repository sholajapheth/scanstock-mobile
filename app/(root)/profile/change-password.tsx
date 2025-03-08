// app/(root)/profile/password.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import apiClient from "../../../src/lib/api-client";

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordScreen = () => {
  const [formData, setFormData] = useState<PasswordChangeData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Password change mutation
  const changePassword = useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const response = await apiClient.post("/users/change-password", data);
      return response.data;
    },
    onSuccess: () => {
      Alert.alert("Success", "Your password has been successfully changed.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert(
        "Password Change Failed",
        error.response?.data?.message || "Failed to change password"
      );
    },
  });

  const handleSubmit = () => {
    // Validate form
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      Alert.alert(
        "Error",
        "New password must be different from current password"
      );
      return;
    }

    // Submit the password change
    changePassword.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change Password</Text>
            <View style={styles.headerRight} />
          </View>

          <View style={styles.content}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Password Security</Text>
              <Text style={styles.infoText}>
                Your password should be at least 6 characters long and include a
                mix of letters, numbers, and special characters for better
                security.
              </Text>
            </View>

            <View style={styles.formSection}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={formData.currentPassword}
                    onChangeText={(text) =>
                      setFormData({ ...formData, currentPassword: text })
                    }
                    secureTextEntry={!showPassword.current}
                    placeholder="Enter current password"
                  />
                  <TouchableOpacity
                    style={styles.visibilityToggle}
                    onPress={() => togglePasswordVisibility("current")}
                  >
                    <Ionicons
                      name={
                        showPassword.current ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={formData.newPassword}
                    onChangeText={(text) =>
                      setFormData({ ...formData, newPassword: text })
                    }
                    secureTextEntry={!showPassword.new}
                    placeholder="Enter new password"
                  />
                  <TouchableOpacity
                    style={styles.visibilityToggle}
                    onPress={() => togglePasswordVisibility("new")}
                  >
                    <Ionicons
                      name={
                        showPassword.new ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={formData.confirmPassword}
                    onChangeText={(text) =>
                      setFormData({ ...formData, confirmPassword: text })
                    }
                    secureTextEntry={!showPassword.confirm}
                    placeholder="Confirm new password"
                  />
                  <TouchableOpacity
                    style={styles.visibilityToggle}
                    onPress={() => togglePasswordVisibility("confirm")}
                  >
                    <Ionicons
                      name={
                        showPassword.confirm ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  infoBox: {
    backgroundColor: "#f1f9ff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#0f172a",
  },
  visibilityToggle: {
    paddingHorizontal: 12,
  },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ChangePasswordScreen;
