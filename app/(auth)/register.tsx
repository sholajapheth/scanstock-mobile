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
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone ||
      !company
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Simple email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
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
      // TODO: Implement API call to register
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
      Alert.alert(
        "Success",
        "Registration successful! Please login with your credentials.",
        [{ text: "OK", onPress: () => router.push("/(auth)/login") }]
      );
    } catch (error) {
      Alert.alert("Error", "Registration failed. Please try again.");
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>ScanStock Pro</Text>
            <Text style={styles.tagline}>Create your account</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#00A651"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#6B7280"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#00A651"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#00A651"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#6B7280"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="business-outline"
                size={20}
                color="#00A651"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Company Name"
                placeholderTextColor="#6B7280"
                value={company}
                onChangeText={setCompany}
                autoCapitalize="words"
              />
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
                placeholder="Password"
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
                placeholder="Confirm Password"
                placeholderTextColor="#6B7280"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              style={styles.loginLink}
            >
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={styles.loginTextBold}>Login</Text>
              </Text>
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
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
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
    paddingHorizontal: 20,
    paddingBottom: 40,
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
  input: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
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
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    color: "#4B5563",
    fontSize: 14,
  },
  loginTextBold: {
    fontWeight: "bold",
    color: "#00A651",
  },
});

export default RegisterScreen;
