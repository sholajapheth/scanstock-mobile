import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please enter both password fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement API call to reset password
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
      Alert.alert(
        "Success",
        "Your password has been reset successfully. Please login with your new password.",
        [{ text: "OK", onPress: () => router.push("/(auth)/login") }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>ScanStock Pro</Text>
          <Text style={styles.tagline}>Create New Password</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.description}>
            Please create a new password for your account.
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#00A651"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.passwordInput}
              placeholder="New Password"
              placeholderTextColor="#6B7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.passwordVisibilityButton}
              onPress={togglePasswordVisibility}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#00A651"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#00A651"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm New Password"
              placeholderTextColor="#6B7280"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#00A651" />
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00A651",
  },
  tagline: {
    fontSize: 18,
    color: "#4B5563",
    marginTop: 8,
  },
  formContainer: {
    flex: 2,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  description: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#00A651",
    alignItems: "center",
  },
  inputIcon: {
    marginLeft: 15,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  passwordVisibilityButton: {
    padding: 10,
  },
  button: {
    backgroundColor: "#00A651",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  backText: {
    color: "#00A651",
    fontSize: 14,
    marginLeft: 8,
  },
});

export default ResetPasswordScreen;
