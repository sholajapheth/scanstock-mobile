import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  useUser,
  useVerifyEmail,
  useResendVerificationCode,
} from "@/src/hooks/useAuth";

interface EmailVerificationModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const EmailVerificationModal = ({
  isVisible,
  onClose,
}: EmailVerificationModalProps) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const { user, refetchUser } = useUser();

  console.log("user", user);

  const verifyEmailMutation = useVerifyEmail();
  const resendCodeMutation = useResendVerificationCode();

  const handleVerification = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setError("");

    try {
      await verifyEmailMutation.mutateAsync({
        email: user?.email || "",
        otp,
      });

      await refetchUser();
      onClose();
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Verification failed. Please try again."
      );
    }
  };

  const handleResendCode = async () => {
    setError("");

    try {
      await resendCodeMutation.mutateAsync(user?.email || "");
      setError("New verification code sent to your email!");
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to resend code. Please try again."
      );
    }
  };

  const loading = verifyEmailMutation.isPending || resendCodeMutation.isPending;

  useEffect(() => {
    if (user?.isEmailVerified) {
      console.log("Email verified");
      onClose();
    } else {
      handleResendCode();
    }
  }, [user?.isEmailVerified]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.description}>
            Please enter the verification code sent to {user?.email}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit code"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerification}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify Email</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendCode}
            disabled={loading}
          >
            <Text style={styles.resendText}>Resend Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#16a34a",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 4,
  },
  verifyButton: {
    backgroundColor: "#16a34a",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resendButton: {
    padding: 10,
    alignItems: "center",
  },
  resendText: {
    color: "#16a34a",
    fontSize: 14,
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 10,
  },
});
