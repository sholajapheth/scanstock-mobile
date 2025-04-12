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
import {
  useRequestPasswordReset,
  useResetPassword,
  useRequestOTP,
  useValidateOTP,
} from "@/src/hooks/useAuth";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: requestReset, isPending: isRequestingReset } =
    useRequestPasswordReset();
  const { mutate: resetPassword, isPending: isResettingPassword } =
    useResetPassword();
  const { mutate: requestOTP, isPending: isRequestingOTP } = useRequestOTP();
  const { mutate: validateOTP, isPending: isValidatingOTP } = useValidateOTP();

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    try {
      requestReset(email, {
        onSuccess: () => {
          setStep("otp");
          Alert.alert("Success", "OTP has been sent to your email");
        },
        onError: (error) => {
          Alert.alert("Error", error.message || "Failed to send OTP");
        },
      });
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP");
      return;
    }

    try {
      validateOTP(
        { email, otp },
        {
          onSuccess: () => {
            setStep("reset");
          },
          onError: (error) => {
            Alert.alert("Error", error.message || "Invalid OTP");
          },
        }
      );
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      Alert.alert("Error", "Please enter your new password");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    try {
      resetPassword(
        { email, otp, newPassword },
        {
          onSuccess: () => {
            Alert.alert("Success", "Password has been reset successfully");
            router.replace("/(auth)/login");
          },
          onError: (error) => {
            Alert.alert("Error", error.message || "Failed to reset password");
          },
        }
      );
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const handleResendOTP = async () => {
    try {
      requestOTP(email, {
        onSuccess: () => {
          Alert.alert("Success", "New OTP has been sent to your email");
        },
        onError: (error) => {
          Alert.alert("Error", error.message || "Failed to send OTP");
        },
      });
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
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
          <Text style={styles.tagline}>Reset Your Password</Text>
        </View>

        <View style={styles.formContainer}>
          {step === "email" && (
            <>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#00A651"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSendOTP}
                disabled={isRequestingReset}
              >
                {isRequestingReset ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === "otp" && (
            <>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="key-outline"
                  size={20}
                  color="#00A651"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter OTP"
                  placeholderTextColor="#6B7280"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleVerifyOTP}
                disabled={isValidatingOTP}
              >
                {isValidatingOTP ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
                disabled={isRequestingOTP}
              >
                {isRequestingOTP ? (
                  <ActivityIndicator color="#00A651" size="small" />
                ) : (
                  <Text style={styles.resendText}>Resend OTP</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === "reset" && (
            <>
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
                  value={newPassword}
                  onChangeText={setNewPassword}
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

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleResetPassword}
                disabled={isResettingPassword}
              >
                {isResettingPassword ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
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
    fontSize: 16,
    color: "#4B5563",
    marginTop: 8,
  },
  formContainer: {
    flex: 2,
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
    marginRight: 5,
  },
  submitButton: {
    backgroundColor: "#00A651",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  resendButton: {
    alignItems: "center",
    marginTop: 15,
  },
  resendText: {
    color: "#00A651",
    fontSize: 14,
  },
  backButton: {
    alignItems: "center",
    marginTop: 20,
  },
  backText: {
    color: "#4B5563",
    fontSize: 14,
  },
});

export default ForgotPasswordScreen;
