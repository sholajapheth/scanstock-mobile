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
} from "react-native";
import { useLogin } from "../../src/hooks/useAuth";
import { router } from "expo-router";

const LoginScreen = () => {
  const [email, setEmail] = useState("user@example.com");
  const [password, setPassword] = useState("password123");

  const { mutate: login, isPending: isLoginPending } = useLogin(
    () => router.push("/(root)/(tabs)"),
    () =>
      Alert.alert("Login Failed", "Please check your credentials and try again")
  );

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    // Simple email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    login({ email, password });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>ScanStock Pro</Text>
          <Text style={styles.tagline}>
            Inventory Management for Small Business
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoginPending}
          >
            {isLoginPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.navigate("/(auth)/register")}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>
              Don't have an account?{" "}
              <Text style={styles.registerTextBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2563eb",
  },
  tagline: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 8,
  },
  formContainer: {
    flex: 2,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerLink: {
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    color: "#64748b",
    fontSize: 14,
  },
  registerTextBold: {
    fontWeight: "bold",
    color: "#2563eb",
  },
});

export default LoginScreen;
